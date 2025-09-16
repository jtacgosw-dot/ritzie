
DELETE FROM events WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM messages WHERE convo_id IN (SELECT id FROM conversations WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102'));
DELETE FROM conversations WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM chunks WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM documents WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM bots WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM sites WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
DELETE FROM orgs WHERE id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');

INSERT INTO orgs (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'Pilot Org A - Palantr Professional'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Pilot Org B - Pastel Playful');

INSERT INTO sites (id, org_id, domain, site_token) VALUES 
  ('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440101', 'pilot-a.example.com', 'SITE_live_a'),
  ('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440102', 'pilot-b.example.com', 'SITE_live_b');

INSERT INTO bots (id, org_id, site_id, name, prompt, theme, layout_mode, theme_version, model) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440121', 
    '550e8400-e29b-41d4-a716-446655440101', 
    '550e8400-e29b-41d4-a716-446655440111', 
    'Palantr Professional Assistant', 
    'You are a professional assistant with a calm, authoritative tone. Provide clear, concise answers with confidence. Focus on efficiency and accuracy.',
    '{"id": "palantr"}',
    'bubble',
    '1.0.0',
    'gpt-4o-mini'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440122', 
    '550e8400-e29b-41d4-a716-446655440102', 
    '550e8400-e29b-41d4-a716-446655440112', 
    'Pastel Playful Assistant', 
    'You are a friendly, helpful assistant with a warm, approachable tone. Use encouraging language and be enthusiastic about helping users. Feel free to use appropriate emojis.',
    '{"id": "pastel-playful"}',
    'bubble',
    '1.0.0',
    'gpt-4o-mini'
  );

INSERT INTO documents (id, org_id, site_id, source, title, meta) VALUES 
  ('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440111', 'manual', 'Palantr Professional Services Guide', '{"type": "knowledge_base", "theme": "palantr"}'),
  ('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440112', 'manual', 'Pastel Playful Product FAQ', '{"type": "knowledge_base", "theme": "pastel-playful"}');

INSERT INTO chunks (doc_id, org_id, site_id, content, embedding, tokens, ord, meta) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440131', 
    '550e8400-e29b-41d4-a716-446655440101', 
    '550e8400-e29b-41d4-a716-446655440111', 
    'Our professional services include strategic consulting, technical implementation, and ongoing support. We maintain strict SLAs with 99.9% uptime guarantees and 24/7 enterprise support for mission-critical deployments.',
    '[0.1, 0.2, 0.3]', 
    52, 
    0, 
    '{"source": "professional_services", "theme": "palantr"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440132', 
    '550e8400-e29b-41d4-a716-446655440102', 
    '550e8400-e29b-41d4-a716-446655440112', 
    'We love helping you get the most out of our products! 🌟 Our friendly support team is available Monday-Friday 9 AM to 6 PM, and we typically respond within 2 hours. For urgent issues, just mention "urgent" in your message and we\'ll prioritize it!',
    '[0.7, 0.8, 0.9]', 
    48, 
    0, 
    '{"source": "support_faq", "theme": "pastel-playful"}'
  );

INSERT INTO events (org_id, site_id, bot_id, visitor_id, type, payload, ts) VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440121', 'pilot_a_visitor_1', 'impression', '{"theme": "palantr"}', NOW() - INTERVAL '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440121', 'pilot_a_visitor_1', 'open', '{"theme": "palantr"}', NOW() - INTERVAL '1 hour 55 minutes'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440121', 'pilot_a_visitor_1', 'message_user', '{"text": "What are your professional service offerings?", "theme": "palantr"}', NOW() - INTERVAL '1 hour 50 minutes'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440122', 'pilot_b_visitor_1', 'impression', '{"theme": "pastel-playful"}', NOW() - INTERVAL '1 hour 30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440122', 'pilot_b_visitor_1', 'open', '{"theme": "pastel-playful"}', NOW() - INTERVAL '1 hour 25 minutes'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440122', 'pilot_b_visitor_1', 'message_user', '{"text": "How can I get help with your products?", "theme": "pastel-playful"}', NOW() - INTERVAL '1 hour 20 minutes');

CREATE INDEX IF NOT EXISTS idx_pilot_events_org_site ON events (org_id, site_id, ts) WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');
CREATE INDEX IF NOT EXISTS idx_pilot_chunks_org_site ON chunks (org_id, site_id) WHERE org_id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102');

COMMIT;

SELECT 
  o.name as org_name,
  s.domain,
  s.site_token,
  b.name as bot_name,
  b.theme->>'id' as theme_id,
  b.layout_mode,
  b.id as bot_id
FROM orgs o
JOIN sites s ON o.id = s.org_id
JOIN bots b ON s.id = b.site_id
WHERE o.id IN ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102')
ORDER BY o.name;
