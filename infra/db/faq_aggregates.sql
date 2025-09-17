CREATE TABLE IF NOT EXISTS faq_aggregates (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  org_id uuid NOT NULL,
  site_id uuid NOT NULL,
  bot_id uuid,
  query_text text NOT NULL,
  cluster_id text,
  confidence_score numeric DEFAULT 0.0,
  has_citations boolean DEFAULT false,
  count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_aggregates_site_id ON faq_aggregates(site_id);
CREATE INDEX IF NOT EXISTS idx_faq_aggregates_cluster ON faq_aggregates(cluster_id);
CREATE INDEX IF NOT EXISTS idx_faq_aggregates_created_at ON faq_aggregates(created_at);
