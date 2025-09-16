import { WebSocketServer } from "ws";
import { WS_CODES, checkTokenLimit, logUsage } from "./auth.js";
import { getLLM } from "./llm/index.js";

export function attachWS(server: any) {
  const wss = new WebSocketServer({ server, path: "/v1/chat/ws" });

  wss.on("connection", (socket, req) => {
    const qs = new URLSearchParams((req.url?.split("?")[1]) || "");
    const site_token = qs.get("site_token") || "";
    const bot_id = qs.get("bot_id") || "";
    const visitor_id = qs.get("visitor_id") || "anon";

    const validTokens = ["SITE_demo_site1", "SITE_demo_site2", "SITE_live"];
    const site = validTokens.includes(site_token) ? { 
      id: site_token, 
      org_id: site_token.startsWith("SITE_demo") ? "ORG_demo" : "ORG_live" 
    } : null;
    
    if (!site || !bot_id) {
      socket.close(WS_CODES.UNAUTHORIZED, "invalid_site_token_or_bot_id");
      return;
    }

    socket.send(JSON.stringify({ type: "open" }));

    socket.on("message", async (raw) => {
      const startTime = Date.now();
      let tokensOut = 0;
      
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "user_message" && msg.text) {
          const estimatedTokensIn = Math.ceil(msg.text.length / 4);
          const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || "800");
          
          if (!checkTokenLimit(site.org_id, estimatedTokensIn + maxTokens)) {
            socket.send(JSON.stringify({ 
              type: "error", 
              message: "Daily token limit reached" 
            }));
            return;
          }

          const llm = await getLLM();
          const model = process.env.CHAT_MODEL || "gpt-4o-mini";
          
          let retryCount = 0;
          const maxRetries = 2;
          
          while (retryCount <= maxRetries) {
            try {
              for await (const ev of llm.streamChat({ model, prompt: msg.text })) {
                if (ev.type === "token") {
                  socket.send(JSON.stringify({ type: "token", token: ev.text }));
                  tokensOut++;
                } else if (ev.type === "error") {
                  throw new Error(ev.text);
                }
              }
              break;
            } catch (error: any) {
              retryCount++;
              if (retryCount > maxRetries) {
                socket.send(JSON.stringify({ 
                  type: "error", 
                  message: "Service temporarily unavailable" 
                }));
                logUsage(site.org_id, site.id, bot_id, {
                  endpoint: "ws_chat",
                  latency: Date.now() - startTime,
                  tokensIn: estimatedTokensIn,
                  tokensOut,
                  error: "max_retries_exceeded"
                });
                return;
              }
              
              const backoffMs = 250 * Math.pow(2, retryCount - 1) + Math.random() * 1000;
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
          }
          
          socket.send(JSON.stringify({ 
            type: "final", 
            done: true, 
            usage: { tokens_in: estimatedTokensIn, tokens_out: tokensOut } 
          }));
          
          logUsage(site.org_id, site.id, bot_id, {
            endpoint: "ws_chat",
            latency: Date.now() - startTime,
            tokensIn: estimatedTokensIn,
            tokensOut
          });
        }
      } catch (error: any) {
        socket.send(JSON.stringify({ 
          type: "error", 
          message: "Invalid message format" 
        }));
        logUsage(site.org_id, site.id, bot_id, {
          endpoint: "ws_chat",
          latency: Date.now() - startTime,
          tokensIn: 0,
          tokensOut,
          error: error.message
        });
      }
    });

    socket.on("close", () => {
    });
  });
}
