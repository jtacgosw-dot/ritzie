import { getLLM } from '../apps/gateway/dist/llm/index.js';

async function run() {
  try {
    console.log('=== Embeddings Smoke Test ===');
    
    const llm = await getLLM();
    const model = process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small';
    const testInputs = [
      'Hello world',
      'This is a test document',
      'OpenAI embeddings are working'
    ];
    
    console.log(`Testing embeddings with model: ${model}`);
    console.log(`Input texts: ${testInputs.length} items`);
    
    const embeddings = await llm.embed({ model, input: testInputs });
    
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    embeddings.forEach((emb, i) => {
      console.log(`  Vector ${i}: length=${emb.length}, first 3 values=[${emb.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
    });
    
    console.log('✅ Embeddings smoke test passed!');
  } catch (error) {
    console.error('❌ Embeddings smoke test failed:', error.message);
    process.exit(1);
  }
}

run();
