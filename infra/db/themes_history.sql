CREATE TABLE themes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES bots(id) ON DELETE CASCADE,
  theme_version text NOT NULL,
  theme_data jsonb NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  rollback_reason text
);

CREATE INDEX idx_themes_history_bot_version ON themes_history(bot_id, theme_version);
CREATE INDEX idx_themes_history_created_at ON themes_history(created_at DESC);
