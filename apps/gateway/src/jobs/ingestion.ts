import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { query } from '../utils/db.js';
import { generateEmbedding } from '../services/openai.js';
import pdf2pic from 'pdf2pic';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const ingestQueue = new Queue('ingest', { connection: redis });
export const crawlQueue = new Queue('crawl', { connection: redis });

interface IngestJobData {
  docId: string;
  orgId: string;
  siteId: string;
  fileBuffer?: Buffer;
  filename?: string;
  mimetype?: string;
  url?: string;
}

interface CrawlJobData {
  docId: string;
  orgId: string;
  siteId: string;
  url: string;
  depth: number;
  sitemap: boolean;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return "PDF content extraction temporarily disabled - please use text files";
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

function extractTextFromCSV(buffer: Buffer): string {
  const text = buffer.toString('utf-8');
  return text.split('\n').map(line => line.split(',').join(' | ')).join('\n');
}

function chunkText(text: string, maxTokens: number = 600): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    const estimatedTokens = (currentChunk + ' ' + trimmedSentence).length / 4;
    
    if (estimatedTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

export const ingestWorker = new Worker('ingest', async (job: Job<IngestJobData>) => {
  const { docId, orgId, siteId, fileBuffer, filename, mimetype, url } = job.data;
  
  try {
    let text = '';
    let title = filename || url || 'Unknown';
    
    if (fileBuffer && mimetype) {
      switch (mimetype) {
        case 'application/pdf':
          text = await extractTextFromPDF(fileBuffer);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await extractTextFromDOCX(fileBuffer);
          break;
        case 'text/plain':
          text = extractTextFromTXT(fileBuffer);
          break;
        case 'text/csv':
          text = extractTextFromCSV(fileBuffer);
          break;
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } else if (url) {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      title = $('title').text() || url;
      
      $('script, style, nav, header, footer, aside').remove();
      text = $('body').text().replace(/\s+/g, ' ').trim();
    }
    
    if (!text || text.length < 100) {
      throw new Error('Insufficient text content extracted');
    }
    
    await query(
      'UPDATE documents SET title = $1 WHERE id = $2',
      [title, docId]
    );
    
    const chunks = chunkText(text);
    
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const embeddings = await Promise.all(
        batch.map(chunk => generateEmbedding(chunk))
      );
      
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = embeddings[j];
        const tokens = Math.ceil(chunk.length / 4); // Rough estimation
        
        await query(
          `INSERT INTO chunks (doc_id, org_id, site_id, content, embedding, tokens, ord, meta)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            docId,
            orgId,
            siteId,
            chunk,
            JSON.stringify(embedding),
            tokens,
            i + j,
            JSON.stringify({ batch: Math.floor((i + j) / batchSize) })
          ]
        );
      }
      
      job.updateProgress(Math.round(((i + batch.length) / chunks.length) * 100));
    }
    
    console.log(`✅ Processed ${chunks.length} chunks for document ${docId}`);
    
  } catch (error) {
    console.error(`❌ Ingestion failed for document ${docId}:`, error);
    throw error;
  }
}, { connection: redis });

export const crawlWorker = new Worker('crawl', async (job: Job<CrawlJobData>) => {
  const { docId, orgId, siteId, url, depth, sitemap } = job.data;
  
  try {
    const urls = await crawlUrls(url, depth, sitemap);
    
    for (let i = 0; i < urls.length; i++) {
      const pageUrl = urls[i];
      
      await ingestQueue.add('ingest-url', {
        docId: `${docId}_page_${i}`,
        orgId,
        siteId,
        url: pageUrl
      });
      
      job.updateProgress(Math.round(((i + 1) / urls.length) * 100));
    }
    
    console.log(`✅ Queued ${urls.length} pages for crawl ${docId}`);
    
  } catch (error) {
    console.error(`❌ Crawl failed for ${docId}:`, error);
    throw error;
  }
}, { connection: redis });

async function crawlUrls(startUrl: string, depth: number, sitemap: boolean): Promise<string[]> {
  const urls = new Set<string>([startUrl]);
  const visited = new Set<string>();
  
  if (sitemap) {
    try {
      const sitemapUrl = new URL('/sitemap.xml', startUrl).toString();
      const response = await fetch(sitemapUrl);
      if (response.ok) {
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        $('url > loc').each((_, el) => {
          const url = $(el).text().trim();
          if (url) urls.add(url);
        });
      }
    } catch (error) {
      console.warn('Failed to fetch sitemap, falling back to crawling');
    }
  }
  
  if (depth > 1 && urls.size === 1) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(startUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => (a as HTMLAnchorElement).href);
      });
      
      const baseUrl = new URL(startUrl);
      for (const link of links) {
        try {
          const linkUrl = new URL(link);
          if (linkUrl.hostname === baseUrl.hostname && !visited.has(link)) {
            urls.add(link);
            if (urls.size >= 20) break; // Limit to 20 pages
          }
        } catch (e) {
        }
      }
    } finally {
      await browser.close();
    }
  }
  
  return Array.from(urls).slice(0, 20); // Limit to 20 pages max
}

export const analyticsWorker = new Worker('analytics-rollup', async (job: Job<{ date: string }>) => {
  const { date } = job.data;
  const rollupDate = new Date(date);
  
  try {
    await query(`
      INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
      SELECT org_id, site_id, bot_id, $1::date, 'sessions', COUNT(DISTINCT visitor_id)
      FROM events 
      WHERE DATE(ts) = $1::date AND type = 'open'
      GROUP BY org_id, site_id, bot_id
      ON CONFLICT (org_id, site_id, bot_id, date, metric) DO UPDATE SET value = EXCLUDED.value
    `, [rollupDate]);
    
    await query(`
      INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
      SELECT org_id, site_id, bot_id, $1::date, 'messages', COUNT(*)
      FROM events 
      WHERE DATE(ts) = $1::date AND type = 'message_user'
      GROUP BY org_id, site_id, bot_id
      ON CONFLICT (org_id, site_id, bot_id, date, metric) DO UPDATE SET value = EXCLUDED.value
    `, [rollupDate]);
    
    await query(`
      INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
      SELECT org_id, site_id, bot_id, $1::date, 'avg_rating', AVG((payload->>'score')::numeric)
      FROM events 
      WHERE DATE(ts) = $1::date AND type = 'rating' AND payload->>'score' IS NOT NULL
      GROUP BY org_id, site_id, bot_id
      ON CONFLICT (org_id, site_id, bot_id, date, metric) DO UPDATE SET value = EXCLUDED.value
    `, [rollupDate]);
    
    console.log(`✅ Analytics rollup completed for ${date}`);
    
  } catch (error) {
    console.error(`❌ Analytics rollup failed for ${date}:`, error);
    throw error;
  }
}, { connection: redis });

export function scheduleAnalyticsRollups() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  ingestQueue.add('analytics-rollup', 
    { date: yesterday.toISOString().split('T')[0] },
    { 
      repeat: { pattern: '0 1 * * *' }, // Daily at 1 AM
      removeOnComplete: 10,
      removeOnFail: 5
    }
  );
}
