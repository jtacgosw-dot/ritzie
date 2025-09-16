export interface StreamToken { 
  type: "token" | "final" | "error"; 
  text?: string; 
}

export interface LLM {
  streamChat(args: { 
    model: string; 
    prompt: string; 
    tools?: any[]; 
  }): AsyncIterable<StreamToken>;
  
  embed(args: { 
    model: string; 
    input: string[] 
  }): Promise<number[][]>;
}

export async function getLLM(provider = process.env.LLM_PROVIDER || "openai"): Promise<LLM> {
  if (provider === "openai") {
    const { OpenAIAdapter } = await import("./openai.js");
    return new OpenAIAdapter();
  }
  throw new Error(`Unknown provider: ${provider}`);
}
