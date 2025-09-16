import { Request, Response } from "express";
import { getLLM } from "./llm/index.js";
import { checkTokenLimit, logUsage } from "./auth.js";

export function sseChat(req: Request, res: Response) {
  const { bot_id, message } = req.body || {};
  const site = (req as any).site;
  
  if (!bot_id) return res.status(400).json({ error: "missing_bot_id" });
  if (!message) return res.status(400).json({ error: "missing_message" });

  const startTime = Date.now();
  let tokensOut = 0;
  let fullResponse = "";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const ka = setInterval(() => send("ping", Date.now()), 15000);

  (async () => {
    send("open", { ok: true });

    const estimatedTokensIn = Math.ceil(message.length / 4);
    const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "800");
    
    if (!checkTokenLimit(site.org_id, estimatedTokensIn + maxTokens)) {
      send("error", { code: "token_limit_exceeded", message: "Daily token limit reached" });
      clearInterval(ka);
      res.end();
      return;
    }

    const llm = await getLLM();
    const model = process.env.CHAT_MODEL || "gpt-4o-mini";
    
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        for await (const ev of llm.streamChat({ model, prompt: message })) {
          if (ev.type === "token") {
            send("token", { token: ev.text });
            fullResponse += ev.text || "";
            tokensOut++;
          } else if (ev.type === "error") {
            throw new Error(ev.text);
          }
        }
        break;
      } catch (error: any) {
        retryCount++;
        if (retryCount > maxRetries) {
          send("error", { code: "llm_error", message: "Service temporarily unavailable" });
          logUsage(site.org_id, site.id, bot_id, {
            endpoint: "sse_chat",
            latency: Date.now() - startTime,
            tokensIn: estimatedTokensIn,
            tokensOut,
            error: "max_retries_exceeded"
          });
          clearInterval(ka);
          res.end();
          return;
        }
        
        const backoffMs = 250 * Math.pow(2, retryCount - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    send("final", { done: true, usage: { tokens_in: estimatedTokensIn, tokens_out: tokensOut } });
    
    logUsage(site.org_id, site.id, bot_id, {
      endpoint: "sse_chat",
      latency: Date.now() - startTime,
      tokensIn: estimatedTokensIn,
      tokensOut
    });
    
    clearInterval(ka);
    res.end();
  })().catch((err) => {
    send("error", { code: "server_error", message: "Internal server error" });
    logUsage(site.org_id, site.id, bot_id, {
      endpoint: "sse_chat",
      latency: Date.now() - startTime,
      tokensIn: Math.ceil(message.length / 4),
      tokensOut,
      error: err.message
    });
    clearInterval(ka);
    res.end();
  });

  req.on("close", () => {
    clearInterval(ka);
    try { res.end(); } catch {}
  });
}
