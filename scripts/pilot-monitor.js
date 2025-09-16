#!/usr/bin/env node

const API_BASE = process.env.API_BASE || 'http://localhost:8080';
const SITE_ID = process.env.SITE_ID || 'SITE_live';

async function fetchKPIs(days = 7) {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const response = await fetch(`${API_BASE}/v1/analytics/kpi?site_id=${SITE_ID}&from=${from}&to=${to}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KPIs:', error);
    return null;
  }
}

async function fetchFAQs(limit = 20) {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/v1/analytics/faqs?site_id=${SITE_ID}&from=${from}&to=${to}&k=${limit}&clustered=true`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return null;
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    return false;
  }
}

function formatMetric(value, type = 'number') {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'duration':
      return `${value.toLocaleString()}ms`;
    case 'rating':
      return `${value.toFixed(1)}/5.0`;
    default:
      return value.toLocaleString();
  }
}

function getHealthStatus(kpis) {
  const issues = [];
  
  if (kpis.p95_latency_ms > 2000) {
    issues.push(`⚠️  High latency: ${formatMetric(kpis.p95_latency_ms, 'duration')} (target: <2s)`);
  }
  
  if (kpis.open_rate < 0.10) {
    issues.push(`⚠️  Low open rate: ${formatMetric(kpis.open_rate, 'percentage')} (target: >15%)`);
  }
  
  if (kpis.msgs_per_session < 2.0) {
    issues.push(`⚠️  Low engagement: ${formatMetric(kpis.msgs_per_session)} msgs/session (target: >2.5)`);
  }
  
  if (kpis.csat_score < 3.5) {
    issues.push(`⚠️  Low satisfaction: ${formatMetric(kpis.csat_score, 'rating')} (target: >4.0)`);
  }
  
  if (kpis.containment_rate < 0.60) {
    issues.push(`⚠️  Low containment: ${formatMetric(kpis.containment_rate, 'percentage')} (target: >70%)`);
  }
  
  return issues;
}

async function generateReport() {
  console.log('🚀 Ritzie Pilot Monitoring Report');
  console.log('=' .repeat(50));
  console.log(`Generated: ${new Date().toLocaleString()}`);
  console.log(`Site ID: ${SITE_ID}`);
  console.log('');

  const isHealthy = await checkHealth();
  console.log(`🏥 System Health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log('');

  const kpis = await fetchKPIs(7);
  if (kpis) {
    console.log('📊 7-Day Performance Metrics');
    console.log('-'.repeat(30));
    console.log(`Sessions: ${formatMetric(kpis.sessions)}`);
    console.log(`Open Rate: ${formatMetric(kpis.open_rate, 'percentage')}`);
    console.log(`Messages/Session: ${formatMetric(kpis.msgs_per_session)}`);
    console.log(`Avg Latency: ${formatMetric(kpis.avg_latency_ms, 'duration')}`);
    console.log(`P95 Latency: ${formatMetric(kpis.p95_latency_ms, 'duration')}`);
    console.log(`CSAT Score: ${formatMetric(kpis.csat_score, 'rating')}`);
    console.log(`Containment: ${formatMetric(kpis.containment_rate, 'percentage')}`);
    console.log(`Conversions: ${formatMetric(kpis.conversions)}`);
    console.log('');

    const issues = getHealthStatus(kpis);
    if (issues.length === 0) {
      console.log('✅ All metrics within target ranges');
    } else {
      console.log('⚠️  Performance Issues:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    console.log('');
  }

  const faqs = await fetchFAQs(10);
  if (faqs && faqs.faqs) {
    console.log('❓ Top 10 Frequently Asked Questions');
    console.log('-'.repeat(40));
    
    faqs.faqs.forEach((faq, index) => {
      const badges = [];
      if (faq.new_this_week) badges.push('🆕');
      if (faq.needs_kb) badges.push('📚');
      if (faq.confidence < 0.7) badges.push('⚠️');
      
      console.log(`${index + 1}. ${faq.query} (${faq.count}x) ${badges.join(' ')}`);
      if (faq.needs_kb) {
        console.log(`   → Needs knowledge base content (confidence: ${(faq.confidence * 100).toFixed(0)}%)`);
      }
    });
    
    console.log('');
    console.log('📈 FAQ Summary:');
    console.log(`   Total Queries: ${formatMetric(faqs.summary.total_queries)}`);
    console.log(`   Unique Topics: ${formatMetric(faqs.summary.unique_clusters)}`);
    console.log(`   Need KB Content: ${formatMetric(faqs.summary.needs_kb_count)}`);
    console.log(`   New This Week: ${formatMetric(faqs.summary.new_this_week)}`);
    console.log(`   Avg Confidence: ${formatMetric(faqs.summary.avg_confidence, 'percentage')}`);
    console.log('');
  }

  console.log('💡 Recommendations');
  console.log('-'.repeat(20));
  
  if (faqs && faqs.summary.needs_kb_count > 0) {
    console.log(`📚 Add knowledge content for ${faqs.summary.needs_kb_count} low-confidence topics`);
  }
  
  if (kpis && kpis.open_rate < 0.15) {
    console.log('🎯 Consider A/B testing widget placement or call-to-action text');
  }
  
  if (kpis && kpis.msgs_per_session < 2.5) {
    console.log('💬 Review conversation flow and add engaging follow-up questions');
  }
  
  if (kpis && kpis.p95_latency_ms > 2000) {
    console.log('⚡ Optimize response time - consider model tuning or caching');
  }
  
  console.log('');
  console.log('📧 Next Steps:');
  console.log('   1. Review FAQ gaps and add missing knowledge content');
  console.log('   2. Monitor user feedback and satisfaction scores');
  console.log('   3. Test different widget placements and messaging');
  console.log('   4. Schedule weekly review with stakeholders');
  console.log('');
  console.log('🔗 Dashboard: [DASHBOARD_URL]');
  console.log('📞 Support: support@ritzie.ai');
}

generateReport().catch(console.error);
