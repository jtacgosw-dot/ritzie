import { query } from '../utils/db.js';
import { AnalyticsEvent, BatchAnalyticsRequest } from '../types/index.js';

export async function ingestAnalyticsEvents(request: BatchAnalyticsRequest): Promise<void> {
  const { org_id, site_id, bot_id, visitor_id, events } = request;
  
  const orgUuidMap: Record<string, string> = {
    'ORG_demo': '550e8400-e29b-41d4-a716-446655440001'
  };
  const siteUuidMap: Record<string, string> = {
    'SITE_demo_site1': '550e8400-e29b-41d4-a716-446655440011'
  };
  const botUuidMap: Record<string, string> = {
    'BOT_demo_bot1': '550e8400-e29b-41d4-a716-446655440003'
  };
  
  const actualOrgId = orgUuidMap[org_id] || org_id;
  const actualSiteId = siteUuidMap[site_id] || site_id;
  const actualBotId = botUuidMap[bot_id] || bot_id;
  
  const values = events.map((event, idx) => {
    const paramOffset = idx * 7;
    return `($${paramOffset + 1}, $${paramOffset + 2}, $${paramOffset + 3}, $${paramOffset + 4}, $${paramOffset + 5}, $${paramOffset + 6}, $${paramOffset + 7})`;
  }).join(', ');
  
  const params = events.flatMap(event => [
    actualOrgId,
    actualSiteId,
    actualBotId,
    visitor_id,
    event.type,
    JSON.stringify(event.payload || {}),
    event.ts ? new Date(event.ts * 1000) : new Date()
  ]);
  
  const insertSql = `
    INSERT INTO events (org_id, site_id, bot_id, visitor_id, type, payload, ts)
    VALUES ${values}
  `;
  
  await query(insertSql, params);
}

export async function rollupAnalytics(date: Date): Promise<void> {
  const rollupQueries = [
    `INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
     SELECT org_id, site_id, bot_id, $1::date, 'sessions', COUNT(DISTINCT visitor_id)
     FROM events 
     WHERE DATE(ts) = $1::date AND type = 'open'
     GROUP BY org_id, site_id, bot_id`,
    
    `INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
     SELECT org_id, site_id, bot_id, $1::date, 'messages', COUNT(*)
     FROM events 
     WHERE DATE(ts) = $1::date AND type = 'message_user'
     GROUP BY org_id, site_id, bot_id`,
    
    `INSERT INTO event_aggregates (org_id, site_id, bot_id, date, metric, value)
     SELECT org_id, site_id, bot_id, $1::date, 'avg_rating', AVG((payload->>'score')::numeric)
     FROM events 
     WHERE DATE(ts) = $1::date AND type = 'rating' AND payload->>'score' IS NOT NULL
     GROUP BY org_id, site_id, bot_id`
  ];
  
  for (const sql of rollupQueries) {
    await query(sql, [date]);
  }
}
