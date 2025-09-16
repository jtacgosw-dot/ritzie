import { Router } from 'express';
import { WebSocketServer } from 'ws';
import { searchKnowledge, buildPromptWithContext } from '../services/retrieval.js';
import { streamChatCompletion } from '../services/openai.js';
import { extractSiteFromToken } from '../utils/auth.js';
import { query } from '../utils/db.js';
import { Server } from 'http';

const router: any = Router();

export function setupChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/v1/chat/ws'
  });

  wss.on('connection', async (socket, req) => {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const siteToken = url.searchParams.get('site_token');
      const botId = url.searchParams.get('bot_id');
      const visitorId = url.searchParams.get('visitor_id');

      if (!siteToken || !botId || !visitorId) {
        socket.close(1008, 'Missing required parameters');
        return;
      }

      const { org_id, site_id } = extractSiteFromToken(siteToken);
      
      const botResult = await query(
        'SELECT * FROM bots WHERE id = $1 AND org_id = $2 AND site_id = $3',
        [botId, org_id, site_id]
      );
      
      if (botResult.rows.length === 0) {
        socket.close(1008, 'Bot not found');
        return;
      }

      const bot = botResult.rows[0];

      socket.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'user_message') {
            const { text, context, metadata } = message;
            
            const searchResults = await searchKnowledge(text, org_id, site_id);
            
            const messages = buildPromptWithContext(text, searchResults, bot.prompt);
            
            await streamChatCompletion(
              messages,
              (token) => {
                socket.send(JSON.stringify({
                  type: 'token',
                  text: token
                }));
              },
              (usage) => {
                socket.send(JSON.stringify({
                  type: 'final',
                  citations: searchResults.slice(0, 3),
                  usage
                }));
              }
            );
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      socket.close(1011, 'Internal server error');
    }
  });
}

router.post('/stream', async (req: any, res: any) => {
  try {
    const { site_token, bot_id, visitor_id, message } = req.body;
    
    if (!site_token || !bot_id || !visitor_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { org_id, site_id } = extractSiteFromToken(site_token);
    
    const botResult = await query(
      'SELECT * FROM bots WHERE id = $1 AND org_id = $2 AND site_id = $3',
      [bot_id, org_id, site_id]
    );
    
    if (botResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const bot = botResult.rows[0];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const searchResults = await searchKnowledge(message, org_id, site_id);
    
    const messages = buildPromptWithContext(message, searchResults, bot.prompt);
    
    await streamChatCompletion(
      messages,
      (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', text: token })}\n\n`);
      },
      (usage) => {
        res.write(`data: ${JSON.stringify({ 
          type: 'final', 
          citations: searchResults.slice(0, 3),
          usage 
        })}\n\n`);
        res.end();
      }
    );

  } catch (error) {
    console.error('SSE stream error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

function enhancePromptWithPersonality(basePrompt: string, tone: string): string {
  const toneEnhancements = {
    calm_pro: "Maintain a calm, professional tone. Be direct and helpful without being overly casual.",
    friendly_helpful: "Be warm, friendly, and enthusiastic in your responses. Use a conversational tone that makes users feel welcome.",
    salesy_confident: "Be confident and persuasive. Highlight benefits and value propositions. Use action-oriented language.",
    playful_light: "Keep the tone light and playful. Use humor when appropriate and maintain an upbeat, energetic style."
  };
  
  const enhancement = toneEnhancements[tone as keyof typeof toneEnhancements] || toneEnhancements.calm_pro;
  return `${basePrompt}\n\nTone guidance: ${enhancement}`;
}

export default router;
