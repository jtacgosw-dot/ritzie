INSERT INTO orgs (id, name, created_at) VALUES 
  ('550e8400-e29b-41d4-a716-446655440301', 'Pilot-1 Organization', NOW());

INSERT INTO sites (id, org_id, domain, site_token, created_at) VALUES 
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 'pilot1.example.com', 'SITE_pilot1', NOW());

INSERT INTO bots (id, org_id, site_id, name, prompt, theme, layout_mode, theme_version, created_at) VALUES 
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', 
   'Pilot Assistant', 
   'You are a helpful AI assistant. Provide clear, professional responses based on the provided context. Maintain a calm, professional tone without using emojis.',
   '{"id": "palantr", "personality": {"tone": "calm_pro", "emoji": false}}',
   'bubble', '1.0.0', NOW());
