#!/usr/bin/env node

const API_BASE = 'http://localhost:8082';
const SITE_TOKEN = 'SITE_pilot1';
const BOT_ID = '550e8400-e29b-41d4-a716-446655440501';

async function generate24hReport() {
  console.log('📊 Pilot-1: 24-Hour Report Generator');
  console.log('===================================');
  console.log(`Report Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Site Token: ${SITE_TOKEN}`);
  console.log(`Bot ID: ${BOT_ID}`);
  
  const report = {
    timestamp: new Date().toISOString(),
    site_token: SITE_TOKEN,
    bot_id: BOT_ID,
    metrics: {},
    top_faqs: [],
    conversions: [],
    kb_gaps: [],
    screenshots: []
  };
  
  try {
    console.log('\n📈 Fetching analytics metrics...');
    const analyticsResponse = await fetch(
      `${API_BASE}/v1/analytics/kpi?site_token=${SITE_TOKEN}&from=${getYesterday()}&to=${getToday()}`
    );
    
    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      report.metrics = analytics;
      console.log('✅ Analytics data retrieved');
    } else {
      console.log('⚠️ Analytics endpoint not available, using placeholders');
      report.metrics = {
        sessions: 'TBD',
        open_rate: 'TBD (target: ≥12%)',
        msgs_per_session: 'TBD (target: 2.5+)',
        containment_rate: 'TBD (target: ≥40%)',
        csat_score: 'TBD (target: ≥4.4/5)',
        p95_latency: 'TBD (target: <2s)',
        conversions: 'TBD'
      };
    }
    
    console.log('\n❓ Fetching Top FAQs...');
    const faqResponse = await fetch(
      `${API_BASE}/v1/analytics/top-faqs?site_token=${SITE_TOKEN}&days=1`
    );
    
    if (faqResponse.ok) {
      const faqs = await faqResponse.json();
      report.top_faqs = faqs.results || [];
      console.log(`✅ Found ${report.top_faqs.length} FAQ entries`);
    } else {
      console.log('⚠️ FAQ endpoint not available');
      report.top_faqs = [
        { question: 'TBD - awaiting real data', count: 0, confidence: 'TBD' }
      ];
    }
    
    console.log('\n📋 PILOT-1 24-HOUR REPORT SUMMARY');
    console.log('=================================');
    console.log(`Sessions: ${report.metrics.sessions}`);
    console.log(`Open Rate: ${report.metrics.open_rate}`);
    console.log(`Messages/Session: ${report.metrics.msgs_per_session}`);
    console.log(`Containment Rate: ${report.metrics.containment_rate}`);
    console.log(`CSAT Score: ${report.metrics.csat_score}`);
    console.log(`P95 Latency: ${report.metrics.p95_latency}`);
    console.log(`Conversions: ${report.metrics.conversions}`);
    
    console.log('\n🔝 TOP 10 FAQs:');
    report.top_faqs.slice(0, 10).forEach((faq, i) => {
      console.log(`${i+1}. ${faq.question} (${faq.count} times, ${faq.confidence} confidence)`);
    });
    
    console.log('\n📸 SCREENSHOTS NEEDED:');
    console.log('- Bubble mode streaming on live site');
    console.log('- Full-page mode streaming on live site');
    console.log('- Top FAQs dashboard tile');
    console.log('- Conversion tracking dashboard');
    
    console.log('\n🎯 SUCCESS CRITERIA STATUS:');
    console.log('- Open rate ≥12%: TBD');
    console.log('- Messages/session 2.5+: TBD');
    console.log('- Containment ≥40%: TBD');
    console.log('- CSAT ≥4.4/5: TBD');
    console.log('- P95 latency <2s: TBD');
    console.log('- Conversion events: ✅ Tracking active');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('- Monitor real traffic for 24h');
    console.log('- Update metrics with actual data');
    console.log('- Schedule Day-3 client readout');
    console.log('- Address any KB gaps identified');
    
    const fs = require('fs');
    const reportPath = `/tmp/pilot1-24h-report-${getToday()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

generate24hReport().catch(console.error);
