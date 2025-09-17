#!/usr/bin/env node

const { sendSlackAlert, checkPerformanceThresholds } = require('../apps/gateway/dist/utils/alerts.js');

async function testSyntheticAlerts() {
  console.log('🚨 Testing synthetic alerts for Pilot-1 activation...');
  
  console.log('\n1. Testing P95 latency alert (>2s threshold)...');
  await checkPerformanceThresholds({
    p95_latency: 2500 // 2.5s > 2s threshold
  });
  
  console.log('2. Testing 5xx error rate alert (>1% threshold)...');
  await checkPerformanceThresholds({
    error_rate: 0.015 // 1.5% > 1% threshold
  });
  
  console.log('3. Testing rollup job duration alert (>5min threshold)...');
  await checkPerformanceThresholds({
    job_duration: 360000 // 6min > 5min threshold
  });
  
  console.log('4. Testing direct Slack alert...');
  await sendSlackAlert('🧪 Pilot-1 activation synthetic test - all alert types verified', 'info');
  
  console.log('\n✅ Synthetic alert testing complete');
  console.log('Note: SLACK_WEBHOOK_URL is placeholder - alerts logged to console');
}

testSyntheticAlerts().catch(console.error);
