CREATE TABLE IF NOT EXISTS faq_aggregates (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id uuid NOT NULL,
  bot_id uuid NOT NULL,
  query_text text NOT NULL,
  cluster_id text NOT NULL,
  count integer DEFAULT 1,
  confidence_score float DEFAULT 0.8,
  has_citations boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  UNIQUE(site_id, cluster_id, created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_faq_aggregates_site_date ON faq_aggregates(site_id, created_at::date);
CREATE INDEX IF NOT EXISTS idx_faq_aggregates_cluster ON faq_aggregates(cluster_id);
CREATE INDEX IF NOT EXISTS idx_faq_aggregates_confidence ON faq_aggregates(confidence_score);

ALTER TABLE bots ADD COLUMN IF NOT EXISTS ab_test_enabled boolean DEFAULT false;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ab_variant_a jsonb;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS ab_variant_b jsonb;
