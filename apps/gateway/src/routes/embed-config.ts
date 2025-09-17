import { Router } from 'express';
import { query } from '../utils/db.js';
import { requireSite } from '../auth.js';
import { ThemeConfig } from '@ritzie/types';
import { getVisitorVariant, ABTestConfig } from '../utils/ab-testing.js';
import fs from 'fs';
import path from 'path';

const router: Router = Router();

const BASE_THEME: ThemeConfig = {
  id: "base",
  name: "Base Theme",
  brand: {
    logoUrl: "",
    avatarUrl: "",
    accent: "#3B82F6"
  },
  colors: {
    light: {
      bg: "#FFFFFF",
      panel: "#FFFFFF",
      text: "#0B1220",
      muted: "#6B7280",
      divider: "rgba(0,0,0,.06)",
      chip: "#F3F4F6",
      input: "#F9FAFB"
    },
    dark: {
      bg: "#0B0F14",
      panel: "#0E131A",
      text: "#E6EAF0",
      muted: "#9AA3AF",
      divider: "rgba(255,255,255,.08)",
      chip: "#0F141B",
      input: "#11161E"
    }
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif",
    baseSize: 14,
    lineHeight: 1.45
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 16,
    pill: 999
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  shadow: {
    elevation: "0 10px 30px rgba(0,0,0,.18)"
  },
  layout: {
    mode: "bubble",
    bubbleWidth: 440,
    bubbleMaxHeightVh: 90,
    pageHeader: true,
    mountSelector: "#ritzie-chat"
  },
  motion: {
    curvePrimary: "cubic-bezier(.2,.8,.2,1)",
    durations: {
      micro: 120,
      content: 180,
      macro: 220,
      stagger: 40
    },
    reducedMotion: true
  },
  components: {
    message: {
      userBg: "accent",
      botBg: "chip"
    },
    chip: {
      bordered: true
    },
    button: {
      style: "subtle"
    }
  },
  personality: {
    tone: "calm_pro",
    emoji: false
  }
};

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

function loadThemePreset(themeId: string): ThemeConfig | null {
  try {
    const themePath = path.join(process.cwd(), '../../themes', `${themeId}.json`);
    console.log(`Attempting to load theme from: ${themePath}`);
    console.log(`File exists: ${fs.existsSync(themePath)}`);
    
    if (fs.existsSync(themePath)) {
      const themeData = JSON.parse(fs.readFileSync(themePath, 'utf8'));
      console.log(`Successfully parsed theme data for ${themeId}`);
      return themeData;
    }
  } catch (error) {
    console.warn(`Failed to load theme preset ${themeId}:`, error);
  }
  return null;
}

router.get('/', requireSite, async (req: any, res) => {
  try {
    const { site_id, bot_id } = req.site;
    
    const botResult = await query(
      'SELECT theme, theme_overrides, layout_mode, theme_version, ab_test_enabled, ab_variant_a, ab_variant_b FROM bots WHERE id = $1 AND site_id = $2',
      [bot_id, site_id]
    );
    
    if (botResult.rows.length === 0) {
      return res.status(401).json({ error: 'Bot not found' });
    }
    
    const bot = botResult.rows[0];
    const visitorId = req.query.visitor_id as string || 'anonymous';
    
    let finalLayoutMode = 'bubble';
    if (bot.layout_mode === 'disabled') {
      finalLayoutMode = 'disabled';
    } else if (bot.layout_mode && ['bubble', 'page'].includes(bot.layout_mode)) {
      finalLayoutMode = bot.layout_mode;
    } else {
      const abTestConfig = {
        enabled: bot.ab_test_enabled || false,
        variantA: bot.ab_variant_a || 'bubble',
        variantB: bot.ab_variant_b || 'page'
      };
      finalLayoutMode = getVisitorVariant(visitorId, abTestConfig);
    }

    let effectiveTheme = BASE_THEME;
    
    let themeId = 'base';
    if (bot.theme && typeof bot.theme === 'object' && bot.theme.id) {
      themeId = bot.theme.id;
    } else if (typeof bot.theme === 'string') {
      themeId = bot.theme;
    }
    
    console.log(`Loading theme preset for themeId: ${themeId}`);
    const preset = loadThemePreset(themeId);
    if (preset) {
      console.log(`Successfully loaded theme preset: ${preset.name}`);
      effectiveTheme = deepMerge(effectiveTheme, preset);
    } else {
      console.warn(`Failed to load theme preset: ${themeId}`);
    }
    
    if (bot.theme && typeof bot.theme === 'object') {
      effectiveTheme = deepMerge(effectiveTheme, bot.theme);
    }
    
    if (bot.theme_overrides) {
      effectiveTheme = deepMerge(effectiveTheme, bot.theme_overrides);
    }

    if (bot.layout_mode) {
      effectiveTheme.layout.mode = bot.layout_mode;
    }

    const config = {
      theme: effectiveTheme,
      themeId: themeId,
      themeVersion: bot.theme_version || '1.0.0',
      layoutMode: finalLayoutMode,
      runtimeFlags: {
        reducedMotionDefault: effectiveTheme.motion.reducedMotion,
        personalityTone: effectiveTheme.personality.tone,
        emojiEnabled: effectiveTheme.personality.emoji
      },
      assetsBase: process.env.ASSETS_CDN_BASE || 'https://cdn.ritzie.ai',
      telemetryBase: process.env.TELEMETRY_BASE || 'https://events.ritzie.ai'
    };
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching embed config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
