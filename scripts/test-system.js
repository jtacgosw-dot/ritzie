import { RitzieSDK } from '../packages/sdk/dist/index.js';

async function testSystem() {
  console.log('🧪 Testing Ritzie platform...');
  
  const config = {
    siteToken: 'SITE_demo_site1',
    botId: '550e8400-e29b-41d4-a716-446655440003',
    assetsBase: 'http://localhost:8080'
  };
  
  const sdk = new RitzieSDK(config);
  
  try {
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:8080/health');
    const health = await healthResponse.json();
    console.log('✓ Health check:', health);
    
    console.log('\n2. Testing knowledge search...');
    const searchResult = await sdk.searchKnowledge('business hours', 5);
    console.log('✓ Knowledge search:', searchResult);
    
    console.log('\n3. Testing analytics...');
    const analyticsResult = await sdk.sendAnalytics([
      { type: 'impression', ts: Date.now() },
      { type: 'open', ts: Date.now() + 1000 }
    ]);
    console.log('✓ Analytics:', analyticsResult);
    
    console.log('\n4. Testing chat stream...');
    let tokens = [];
    await sdk.streamChat(
      'What are your business hours?',
      (token) => tokens.push(token),
      (final) => console.log('✓ Chat complete:', { tokens: tokens.length, final })
    );
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSystem();
}

export default testSystem;
