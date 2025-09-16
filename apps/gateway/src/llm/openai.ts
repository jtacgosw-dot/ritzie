import OpenAI from "openai";
import { LLM, StreamToken } from "./index.js";

export class OpenAIAdapter implements LLM {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  async *streamChat({ model, prompt }: { model: string; prompt: string; }): AsyncIterable<StreamToken> {
    try {
      const stream = await this.client.chat.completions.create({
        model,
        stream: true,
        messages: [{ role: "user", content: prompt }],
        max_tokens: +(process.env.LLM_MAX_TOKENS || 800),
        temperature: 0.2,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || "";
        if (delta) yield { type: "token", text: delta };
      }
      yield { type: "final" };
    } catch (error) {
      yield { type: "error", text: `LLM error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async embed({ model, input }: { model: string; input: string[] }) {
    const res = await this.client.embeddings.create({ model, input });
    return res.data.map(v => v.embedding as number[]);
  }
}
