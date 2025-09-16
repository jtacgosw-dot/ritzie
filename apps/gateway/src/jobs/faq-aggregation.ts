import { query } from '../utils/db.js';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface MessageCluster {
  id: string;
  queries: string[];
  centroid: string;
  confidence: number;
}

export async function runFaqAggregation() {
  console.log('[FAQ-AGGREGATION] Starting nightly FAQ aggregation job...');
  
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const messagesResult = await query(`
      SELECT DISTINCT
        m.content as query_text,
        c.site_id,
        c.bot_id,
        m.created_at,
        CASE WHEN m.meta->>'citations' IS NOT NULL THEN true ELSE false END as has_citations,
        CASE WHEN m.meta->>'confidence' IS NOT NULL THEN (m.meta->>'confidence')::float ELSE 0.8 END as confidence_score
      FROM messages m
      JOIN conversations c ON m.convo_id = c.id
      WHERE m.role = 'user' 
        AND m.created_at::date = $1
        AND LENGTH(m.content) > 10
        AND m.content NOT LIKE '%test%'
      ORDER BY m.created_at
    `, [yesterdayStr]);

    if (messagesResult.rows.length === 0) {
      console.log('[FAQ-AGGREGATION] No user messages found for clustering');
      return;
    }

    const messagesBySite = messagesResult.rows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.site_id]) acc[row.site_id] = [];
      acc[row.site_id].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [siteId, messages] of Object.entries(messagesBySite)) {
      console.log(`[FAQ-AGGREGATION] Processing ${messages.length} messages for site ${siteId}`);
      
      const clusters = await clusterQueries(messages.map((m: any) => m.query_text));
      
      for (const cluster of clusters) {
        const clusterMessages = messages.filter((m: any) => 
          cluster.queries.includes(m.query_text)
        );
        
        const avgConfidence = clusterMessages.reduce((sum, m) => sum + m.confidence_score, 0) / clusterMessages.length;
        const hasCitations = clusterMessages.some(m => m.has_citations);
        
        await query(`
          INSERT INTO faq_aggregates (
            site_id, bot_id, query_text, cluster_id, count, confidence_score, 
            has_citations, created_at, first_seen, last_seen
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (site_id, cluster_id, created_at::date) 
          DO UPDATE SET 
            count = faq_aggregates.count + EXCLUDED.count,
            confidence_score = (faq_aggregates.confidence_score + EXCLUDED.confidence_score) / 2,
            has_citations = faq_aggregates.has_citations OR EXCLUDED.has_citations,
            last_seen = GREATEST(faq_aggregates.last_seen, EXCLUDED.last_seen)
        `, [
          siteId,
          clusterMessages[0].bot_id,
          cluster.centroid,
          cluster.id,
          clusterMessages.length,
          avgConfidence,
          hasCitations,
          new Date(),
          clusterMessages[0].created_at,
          clusterMessages[clusterMessages.length - 1].created_at
        ]);
      }
    }
    
    console.log('[FAQ-AGGREGATION] Completed successfully');
  } catch (error) {
    console.error('[FAQ-AGGREGATION] Error:', error);
    throw error;
  }
}

async function clusterQueries(queries: string[]): Promise<MessageCluster[]> {
  if (queries.length === 0) return [];
  
  try {
    const uniqueQueries = [...new Set(queries)];
    
    if (uniqueQueries.length <= 5) {
      return uniqueQueries.map((query, index) => ({
        id: `cluster_${index + 1}`,
        queries: [query],
        centroid: query,
        confidence: 0.9
      }));
    }
    
    const embeddings = await Promise.all(
      uniqueQueries.map(async (query) => {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query
        });
        return {
          query,
          embedding: response.data[0].embedding
        };
      })
    );
    
    const clusters: MessageCluster[] = [];
    const processed = new Set<string>();
    
    for (const item of embeddings) {
      if (processed.has(item.query)) continue;
      
      const cluster: MessageCluster = {
        id: `cluster_${clusters.length + 1}`,
        queries: [item.query],
        centroid: item.query,
        confidence: 0.9
      };
      
      for (const other of embeddings) {
        if (other.query === item.query || processed.has(other.query)) continue;
        
        const similarity = cosineSimilarity(item.embedding, other.embedding);
        if (similarity > 0.75) {
          cluster.queries.push(other.query);
          processed.add(other.query);
        }
      }
      
      processed.add(item.query);
      clusters.push(cluster);
    }
    
    return clusters;
  } catch (error) {
    console.warn('[FAQ-AGGREGATION] Clustering failed, using simple grouping:', error);
    
    return queries.map((query, index) => ({
      id: `simple_${index + 1}`,
      queries: [query],
      centroid: query,
      confidence: 0.8
    }));
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
