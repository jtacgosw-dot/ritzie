import { Router, Request, Response } from 'express';
import multer from 'multer';
import { query } from '../utils/db.js';
import { extractSiteFromToken } from '../utils/auth.js';
import { searchKnowledge } from '../services/retrieval.js';

const router: any = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/uploads', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { site_token } = req.body;
    
    if (!site_token || !req.file) {
      return res.status(400).json({ error: 'Missing site_token or file' });
    }

    const { org_id, site_id } = extractSiteFromToken(site_token);
    
    const docResult = await query(
      `INSERT INTO documents (org_id, site_id, source, title, meta) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        org_id,
        site_id,
        'upload',
        req.file.originalname,
        JSON.stringify({
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        })
      ]
    );

    const docId = docResult.rows[0].id;

    
    res.json({
      doc_id: docId,
      queued: true,
      message: 'File uploaded and queued for processing'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/urls', async (req: Request, res: Response) => {
  try {
    const { site_token, url, depth = 1, sitemap = false } = req.body;
    
    if (!site_token || !url) {
      return res.status(400).json({ error: 'Missing site_token or url' });
    }

    const { org_id, site_id } = extractSiteFromToken(site_token);
    
    const docResult = await query(
      `INSERT INTO documents (org_id, site_id, source, title, meta) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        org_id,
        site_id,
        url,
        `Crawl: ${url}`,
        JSON.stringify({
          url,
          depth,
          sitemap,
          crawl_type: sitemap ? 'sitemap' : 'shallow'
        })
      ]
    );

    const docId = docResult.rows[0].id;

    
    res.json({
      doc_id: docId,
      queued: true,
      message: 'URL crawl queued for processing'
    });

  } catch (error) {
    console.error('URL crawl error:', error);
    res.status(500).json({ error: 'Failed to queue URL crawl' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { site_token, q, k = 10 } = req.query;
    
    if (!site_token || !q) {
      return res.status(400).json({ error: 'Missing site_token or query' });
    }

    const { org_id, site_id } = extractSiteFromToken(site_token as string);
    
    const results = await searchKnowledge(
      q as string,
      org_id,
      site_id,
      parseInt(k as string)
    );

    res.json({
      results: results.map(r => ({
        chunk_id: r.chunk_id,
        doc_id: r.doc_id,
        content: r.content.substring(0, 500), // Truncate for API response
        score: r.score,
        title: r.title,
        source: r.source
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search knowledge' });
  }
});

export default router;
