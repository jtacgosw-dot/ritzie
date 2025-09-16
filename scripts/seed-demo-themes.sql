
UPDATE bots 
SET theme = '{
  "id": "palantr",
  "name": "Palantr Minimal",
  "brand": {
    "logoUrl": "",
    "avatarUrl": "",
    "accent": "#3B82F6"
  },
  "colors": {
    "light": {
      "bg": "#FFFFFF",
      "panel": "#FFFFFF", 
      "text": "#0B1220",
      "muted": "#6B7280",
      "divider": "rgba(0,0,0,.06)",
      "chip": "#F3F4F6",
      "input": "#F9FAFB"
    },
    "dark": {
      "bg": "#0B0F14",
      "panel": "#0E131A",
      "text": "#E6EAF0", 
      "muted": "#9AA3AF",
      "divider": "rgba(255,255,255,.08)",
      "chip": "#0F141B",
      "input": "#11161E"
    }
  },
  "typography": {
    "fontFamily": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif",
    "baseSize": 14,
    "lineHeight": 1.45
  },
  "radius": {
    "sm": 10,
    "md": 14, 
    "lg": 16,
    "pill": 999
  },
  "space": {
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24
  },
  "shadow": {
    "elevation": "0 10px 30px rgba(0,0,0,.18)"
  },
  "layout": {
    "mode": "bubble",
    "bubbleWidth": 440,
    "bubbleMaxHeightVh": 90,
    "pageHeader": true,
    "mountSelector": "#ritzie-chat"
  },
  "motion": {
    "curvePrimary": "cubic-bezier(.2,.8,.2,1)",
    "durations": {
      "micro": 120,
      "content": 180,
      "macro": 220,
      "stagger": 40
    },
    "reducedMotion": true
  },
  "components": {
    "message": {
      "userBg": "accent",
      "botBg": "chip"
    },
    "chip": {
      "bordered": true
    },
    "button": {
      "style": "subtle"
    }
  },
  "personality": {
    "tone": "calm_pro",
    "emoji": false
  }
}'::jsonb,
theme_version = '1.0.0',
layout_mode = 'bubble'
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

INSERT INTO bots (id, org_id, site_id, name, prompt, theme, theme_version, layout_mode, model, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440011',
  'Pastel Playful Bot',
  'You are a friendly and helpful assistant. Be warm and conversational in your responses.',
  '{
    "id": "pastel-playful",
    "name": "Pastel Playful",
    "brand": {
      "logoUrl": "",
      "avatarUrl": "",
      "accent": "#A855F7"
    },
    "colors": {
      "light": {
        "bg": "#FEFCFF",
        "panel": "#FFFFFF",
        "text": "#1F1B24",
        "muted": "#6B7280",
        "divider": "rgba(168,85,247,.12)",
        "chip": "#F3F0FF",
        "input": "#FAFAFA"
      },
      "dark": {
        "bg": "#0F0A14",
        "panel": "#1A1625",
        "text": "#E8E3F0",
        "muted": "#A78BFA",
        "divider": "rgba(168,85,247,.20)",
        "chip": "#1E1B3A",
        "input": "#151218"
      }
    },
    "typography": {
      "fontFamily": "ui-rounded, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif",
      "baseSize": 15,
      "lineHeight": 1.5
    },
    "radius": {
      "sm": 12,
      "md": 16,
      "lg": 20,
      "pill": 999
    },
    "space": {
      "xs": 6,
      "sm": 10,
      "md": 14,
      "lg": 18,
      "xl": 26
    },
    "shadow": {
      "elevation": "0 8px 25px rgba(168,85,247,.15)"
    },
    "layout": {
      "mode": "bubble",
      "bubbleWidth": 460,
      "bubbleMaxHeightVh": 85,
      "pageHeader": true,
      "mountSelector": "#ritzie-chat"
    },
    "motion": {
      "curvePrimary": "cubic-bezier(.34,1.56,.64,1)",
      "durations": {
        "micro": 150,
        "content": 200,
        "macro": 250,
        "stagger": 50
      },
      "reducedMotion": false
    },
    "components": {
      "message": {
        "userBg": "accent",
        "botBg": "chip"
      },
      "chip": {
        "bordered": false
      },
      "button": {
        "style": "filled"
      }
    },
    "personality": {
      "tone": "friendly_helpful",
      "emoji": true
    }
  }'::jsonb,
  '1.0.0',
  'bubble',
  'gpt-4.1-mini',
  now()
);

INSERT INTO themes_history (bot_id, theme_data, theme_version, created_by, created_at)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440003',
  '{"theme": {"id": "palantr"}, "layoutMode": "bubble"}',
  '1.0.0',
  'system',
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440004', 
  '{"theme": {"id": "pastel-playful"}, "layoutMode": "bubble"}',
  '1.0.0',
  'system',
  now()
);
