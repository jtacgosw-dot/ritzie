import { getLLM } from '../apps/gateway/dist/llm/index.js';

async function run() {
  try {
    console.log('=== LLM Self Test ===');
    
    const provider = process.env.LLM_PROVIDER || 'openai';
    const model = process.env.CHAT_MODEL || 'gpt-4o-mini';
    
    console.log(`Testing provider: ${provider}`);
    console.log(`Testing model: ${model}`);
    
    const llm = await getLLM(provider);
    const prompt = 'Say "Hello from LLM test" in exactly those words.';
    
    console.log('Streaming chat response...');
    let tokenCount = 0;
    let fullResponse = '';
    
    for await (const token of llm.streamChat({ model, prompt })) {
      if (token.type === 'token') {
        process.stdout.write(token.text);
        fullResponse += token.text;
        tokenCount++;
      } else if (token.type === 'error') {
        throw new Error(`LLM error: ${token.text}`);
      } else if (token.type === 'final') {
        console.log('\n');
        break;
      }
    }
    
    console.log(`✅ Received ${tokenCount} tokens`);
    console.log(`✅ Full response: "${fullResponse.trim()}"`);
    console.log('✅ LLM self test passed!');
    
  } catch (error) {
    console.error('❌ LLM self test failed:', error.message);
    process.exit(1);
  }
}

run();
