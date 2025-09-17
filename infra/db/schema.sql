CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  domain text NOT NULL,
  site_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  name text,
  prompt text,
  theme jsonb,
  tools jsonb,
  model text DEFAULT 'gpt-4o-mini',
  theme_overrides jsonb,
  layout_mode text DEFAULT 'bubble' CHECK (layout_mode IN ('bubble', 'page', 'disabled')),
  theme_version text DEFAULT '1.0.0',
  ab_test_enabled boolean DEFAULT false,
  ab_variant_a text DEFAULT 'bubble',
  ab_variant_b text DEFAULT 'page',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  source text,
  title text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  org_id uuid,
  site_id uuid,
  content text,
  embedding vector(1536),
  tokens int,
  ord int,
  meta jsonb
);

CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  site_id uuid,
  bot_id uuid,
  visitor_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convo_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user','assistant','tool','system')),
  content text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE events (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  org_id uuid,
  site_id uuid,
  bot_id uuid,
  visitor_id text,
  type text,
  payload jsonb,
  ts timestamptz DEFAULT now()
);

CREATE TABLE event_aggregates (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  org_id uuid,
  site_id uuid,
  bot_id uuid,
  date date,
  metric text,
  value numeric
);

CREATE INDEX idx_chunks_org_site ON chunks(org_id, site_id);
CREATE INDEX idx_conversations_org_site ON conversations(org_id, site_id);
CREATE INDEX idx_events_org_site_ts ON events(org_id, site_id, ts);
CREATE INDEX idx_event_aggregates_org_site_date ON event_aggregates(org_id, site_id, date);
