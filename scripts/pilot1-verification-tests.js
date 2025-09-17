#!/usr/bin/env node


const PILOT1_CONFIG = {
  siteToken: 'SITE_pilot1',
  botId: '550e8400-e29b-41d4-a716-446655440501',
  apiBase: 'http://localhost:8082'
};

async function testEmbedConfig() {
  console.log('🧪 Testing Pilot-1 embed config...');
  
  try {
    const response = await fetch(
      `${PILOT1_CONFIG.apiBase}/v1/embed-config?site_token=${PILOT1_CONFIG.siteToken}&bot_id=${PILOT1_CONFIG.botId}&visitor_id=test_visitor`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    
    console.log('✅ Embed config loaded successfully');
    console.log(`   Theme: ${config.theme?.id || 'default'}`);
    console.log(`   Layout Mode: ${config.layoutMode}`);
    console.log(`   Personality Tone: ${config.theme?.personality?.tone}`);
    console.log(`   Emoji Enabled: ${config.theme?.personality?.emoji}`);
    
    if (config.theme?.personality?.tone !== 'calm_pro') {
      console.log('⚠️  Warning: Expected calm_pro tone');
    }
    
    if (config.theme?.personality?.emoji !== false) {
      console.log('⚠️  Warning: Expected emoji disabled');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Embed config test failed:', error.message);
    return false;
  }
}

async function testInvalidToken() {
  console.log('🧪 Testing invalid token rejection...');
  
  try {
    const response = await fetch(
      `${PILOT1_CONFIG.apiBase}/v1/embed-config?site_token=INVALID_TOKEN&bot_id=${PILOT1_CONFIG.botId}`
    );
    
    if (response.status === 401) {
      console.log('✅ Invalid token correctly rejected (401)');
      return true;
    } else {
      console.log(`❌ Expected 401, got ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid token test failed:', error.message);
    return false;
  }
}

async function testKnowledgeSearch() {
  console.log('🧪 Testing knowledge search...');
  
  try {
    const response = await fetch(
      `${PILOT1_CONFIG.apiBase}/v1/knowledge/search?site_token=${PILOT1_CONFIG.siteToken}&q=help&k=5`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const results = await response.json();
    
    console.log('✅ Knowledge search working');
    console.log(`   Results: ${results.results?.length || 0} chunks found`);
    
    return true;
  } catch (error) {
    console.log('❌ Knowledge search test failed:', error.message);
    return false;
  }
}

async function testAnalyticsIngestion() {
  console.log('🧪 Testing analytics ingestion...');
  
  try {
    const testEvents = [
      {
        type: 'impression',
        ts: Date.now(),
        visitor_id: 'test_visitor',
        theme_version: '1.0.0',
        layout_mode: 'bubble'
      },
      {
        type: 'conversion',
        ts: Date.now(),
        visitor_id: 'test_visitor',
        payload: { cta_type: 'talk_to_sales' },
        utm_source: 'test',
        utm_medium: 'pilot',
        utm_campaign: 'verification'
      }
    ];
    
    const response = await fetch(`${PILOT1_CONFIG.apiBase}/v1/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteToken: PILOT1_CONFIG.siteToken,
        botId: PILOT1_CONFIG.botId,
        events: testEvents
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Analytics ingestion working');
    console.log(`   Processed: ${result.processed} events`);
    
    return true;
  } catch (error) {
    console.log('❌ Analytics ingestion test failed:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('🧪 Testing health endpoint...');
  
  try {
    const response = await fetch(`${PILOT1_CONFIG.apiBase}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const health = await response.json();
    
    if (health.ok) {
      console.log('✅ Health endpoint responding correctly');
      return true;
    } else {
      console.log('❌ Health endpoint reports unhealthy');
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running Pilot-1 verification tests...\n');
  
  const tests = [
    testHealthEndpoint,
    testEmbedConfig,
    testInvalidToken,
    testKnowledgeSearch,
    testAnalyticsIngestion
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log('');
  }
  
  console.log(`📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Pilot-1 is ready for deployment.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, PILOT1_CONFIG };
