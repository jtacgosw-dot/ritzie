import { query } from '../utils/db.js';
import { generateEmbedding } from './openai.js';

export interface SearchResult {
  chunk_id: string;
  doc_id: string;
  content: string;
  score: number;
  title?: string;
  source?: string;
}

export async function searchKnowledge(
  searchQuery: string,
  orgId: string,
  siteId: string,
  k: number = 8
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(searchQuery);
    
    const searchSql = `
      SELECT 
        c.id as chunk_id,
        c.doc_id,
        c.content,
        d.title,
        d.source,
        1 - (c.embedding <=> $1::vector) as score
      FROM chunks c
      JOIN documents d ON c.doc_id = d.id
      WHERE c.org_id = $2 AND c.site_id = $3
      ORDER BY c.embedding <=> $1::vector
      LIMIT $4
    `;
    
    const result = await query(searchSql, [
      JSON.stringify(queryEmbedding),
      orgId,
      siteId,
      k
    ]);
    
    return result.rows.map(row => ({
      chunk_id: row.chunk_id,
      doc_id: row.doc_id,
      content: row.content,
      score: row.score,
      title: row.title,
      source: row.source
    }));
  } catch (error) {
    console.warn('Embedding generation failed, falling back to text search:', error instanceof Error ? error.message : String(error));
    
    const fallbackSql = `
      SELECT 
        c.id as chunk_id,
        c.doc_id,
        c.content,
        d.title,
        d.source,
        0.5 as score
      FROM chunks c
      JOIN documents d ON c.doc_id = d.id
      WHERE c.org_id = $1 AND c.site_id = $2
        AND (c.content ILIKE $3 OR d.title ILIKE $3)
      ORDER BY d.created_at DESC
      LIMIT $4
    `;
    
    const result = await query(fallbackSql, [
      orgId,
      siteId,
      `%${searchQuery}%`,
      k
    ]);
    
    return result.rows.map(row => ({
      chunk_id: row.chunk_id,
      doc_id: row.doc_id,
      content: row.content,
      score: row.score,
      title: row.title,
      source: row.source
    }));
  }
}

export function buildPromptWithContext(
  userMessage: string,
  searchResults: SearchResult[],
  botPrompt?: string
): Array<{ role: string; content: string }> {
  const systemPrompt = botPrompt || `You are a helpful assistant. Only answer using the provided context.
- Cite sources when possible.
- If the context doesn't contain relevant information, politely say you don't have that information.
- Be concise and helpful.`;

  const contextSection = searchResults.length > 0 
    ? `CONTEXT:\n${searchResults.map((result, idx) => 
        `[${idx + 1}] ${result.content} (Source: ${result.title || result.source || 'Unknown'})`
      ).join('\n\n')}\n\n`
    : '';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${contextSection}USER QUESTION:\n${userMessage}` }
  ];

  return messages;
}
