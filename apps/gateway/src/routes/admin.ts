import { Router, Request, Response } from 'express';
import { query } from '../utils/db.js';
import { ThemeConfig } from '@ritzie/types';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
// import sharp from 'sharp'; // Optional image optimization

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

function requireStaff(req: Request, res: Response, next: any) {
  const staffToken = req.headers['x-staff-token'] as string;
  if (staffToken !== process.env.STAFF_TOKEN) {
    return res.status(401).json({ error: 'Staff access required' });
  }
  next();
}

router.get('/bots', requireStaff, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, theme, theme_overrides, layout_mode, theme_version FROM bots ORDER BY created_at DESC'
    );
    res.json({ bots: result.rows });
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bots/:botId/theme', requireStaff, async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const result = await query(
      'SELECT theme, theme_overrides, layout_mode, theme_version FROM bots WHERE id = $1',
      [botId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    const bot = result.rows[0];
    res.json({
      theme: bot.theme,
      themeOverrides: bot.theme_overrides,
      layoutMode: bot.layout_mode,
      themeVersion: bot.theme_version
    });
  } catch (error) {
    console.error('Error fetching bot theme:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/bots/:botId/theme', requireStaff, async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { theme, themeOverrides, layoutMode } = req.body;
    
    const currentVersion = await query(
      'SELECT theme_version FROM bots WHERE id = $1',
      [botId]
    );
    
    if (currentVersion.rows.length === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    const oldVersion = currentVersion.rows[0].theme_version || '1.0.0';
    const versionParts = oldVersion.split('.').map(Number);
    versionParts[2]++;
    const newVersion = versionParts.join('.');
    
    await query(
      'INSERT INTO themes_history (bot_id, theme_data, theme_version, created_by) VALUES ($1, $2, $3, $4)',
      [botId, JSON.stringify({ theme, themeOverrides, layoutMode }), oldVersion, 'admin']
    );
    
    await query(
      'UPDATE bots SET theme = $1, theme_overrides = $2, layout_mode = $3, theme_version = $4 WHERE id = $5',
      [theme, themeOverrides, layoutMode, newVersion, botId]
    );
    
    res.json({ success: true, newVersion });
  } catch (error) {
    console.error('Error updating bot theme:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bots/:botId/theme/history', requireStaff, async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const result = await query(
      'SELECT theme_version, created_at, created_by FROM themes_history WHERE bot_id = $1 ORDER BY created_at DESC LIMIT 10',
      [botId]
    );
    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching theme history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bots/:botId/theme/rollback', requireStaff, async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { version } = req.body;
    
    const historyResult = await query(
      'SELECT theme_data FROM themes_history WHERE bot_id = $1 AND theme_version = $2',
      [botId, version]
    );
    
    if (historyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Theme version not found' });
    }
    
    const themeData = historyResult.rows[0].theme_data;
    
    await query(
      'UPDATE bots SET theme = $1, theme_overrides = $2, layout_mode = $3, theme_version = $4 WHERE id = $5',
      [themeData.theme, themeData.themeOverrides, themeData.layoutMode, version, botId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error rolling back theme:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bots/:botId/theme/ab-test', requireStaff, async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { enabled, variantA, variantB } = req.body;
    
    await query(
      'UPDATE bots SET ab_test_enabled = $1, ab_variant_a = $2, ab_variant_b = $3 WHERE id = $4',
      [enabled, variantA, variantB, botId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting A/B test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload-asset', requireStaff, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${req.file.mimetype.split('/')[1]}`;
    const filepath = path.join(process.cwd(), 'public/assets', filename);
    
    await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
    await fs.promises.writeFile(filepath, req.file.buffer);
    
    const url = `/assets/${filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

router.get('/theme-presets', requireStaff, async (req: Request, res: Response) => {
  try {
    const themesDir = path.join(process.cwd(), '../../themes');
    const files = await fs.promises.readdir(themesDir);
    const presets: Array<{id: string, name: string, description: string}> = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const themeData = JSON.parse(
          await fs.promises.readFile(path.join(themesDir, file), 'utf8')
        );
        presets.push({
          id: file.replace('.json', ''),
          name: themeData.name,
          description: themeData.description || ''
        });
      }
    }
    
    res.json({ presets });
  } catch (error) {
    console.error('Error fetching theme presets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
