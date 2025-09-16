import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (apiKey.includes('test') || apiKey.includes('placeholder') || apiKey.length < 20) {
    throw new Error('Test API key detected - embedding generation not available');
  }
  
  const response = await openai.embeddings.create({
    model: process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string) => void,
  onComplete: (usage?: any) => void
) {
  const stream = await openai.chat.completions.create({
    model: process.env.CHAT_MODEL || 'gpt-4o-mini',
    messages: messages as any,
    stream: true,
  });

  let fullResponse = '';
  
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullResponse += delta;
      onToken(delta);
    }
    
    if (chunk.choices[0]?.finish_reason) {
      onComplete(chunk.usage);
    }
  }
}
