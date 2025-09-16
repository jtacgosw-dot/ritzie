
INSERT INTO orgs (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Corp'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Green Corp');

INSERT INTO sites (id, org_id, domain, site_token) VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'demo.example.com', 'SITE_demo_site1'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'green.example.com', 'SITE_demo_site2');

INSERT INTO bots (id, org_id, site_id, name, prompt, theme, model) VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Demo Assistant', 'You are a helpful assistant for Demo Corp. Answer questions about our services and help users with their inquiries.', '{"primaryColor": "#007bff", "fontFamily": "Inter"}', 'gpt-4o-mini'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'Green Assistant', 'You are a helpful assistant for Green Corp, a sustainable technology company. Focus on eco-friendly solutions and green technology.', '{"primaryColor": "#28a745", "fontFamily": "Roboto"}', 'gpt-4o-mini');

INSERT INTO documents (id, org_id, site_id, source, title, meta) VALUES 
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'manual', 'Demo Corp Services Guide', '{"type": "knowledge_base"}'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'manual', 'Green Technology FAQ', '{"type": "knowledge_base"}');

INSERT INTO chunks (doc_id, org_id, site_id, content, embedding, tokens, ord, meta) VALUES 
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Demo Corp offers comprehensive business solutions including consulting, software development, and technical support. Our business hours are Monday through Friday, 9 AM to 6 PM EST. We provide 24/7 emergency support for enterprise clients.', '[0.1, 0.2, 0.3]', 45, 0, '{"source": "services_guide"}'),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Our pricing starts at $99/month for basic plans and scales up to enterprise solutions. We offer free trials for all new customers. Contact our sales team for custom pricing on large deployments.', '[0.4, 0.5, 0.6]', 38, 1, '{"source": "pricing_guide"}'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'Green Corp specializes in sustainable technology solutions that reduce environmental impact. Our solar panel systems can reduce energy costs by up to 80%. We also offer electric vehicle charging stations and smart home automation.', '[0.7, 0.8, 0.9]', 42, 0, '{"source": "green_tech_faq"}'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'All Green Corp products come with a 10-year warranty and carbon-neutral shipping. We plant one tree for every product sold. Our installation team is certified in sustainable practices and uses eco-friendly materials.', '[0.1, 0.9, 0.5]', 40, 1, '{"source": "warranty_info"}');

CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);
CREATE INDEX IF NOT EXISTS idx_events_org_site ON events (org_id, site_id, ts);
CREATE INDEX IF NOT EXISTS idx_messages_convo ON messages (convo_id, created_at);

INSERT INTO events (org_id, site_id, bot_id, visitor_id, type, payload, ts) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'v_demo123', 'impression', '{}', NOW() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'v_demo123', 'open', '{}', NOW() - INTERVAL '55 minutes'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'v_demo123', 'message_user', '{"text": "What are your business hours?"}', NOW() - INTERVAL '50 minutes'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'v_green456', 'impression', '{}', NOW() - INTERVAL '30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'v_green456', 'open', '{}', NOW() - INTERVAL '25 minutes');

COMMIT;
