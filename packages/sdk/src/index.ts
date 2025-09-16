import { RitzieConfig, ChatMessage, ChatResponse, AnalyticsEvent } from '@ritzie/types';

export class RitzieSDK {
  private config: RitzieConfig;
  private baseUrl: string;

  constructor(config: RitzieConfig) {
    this.config = config;
    this.baseUrl = config.assetsBase?.replace('/embeds', '') || 'https://api.ritzie.ai';
  }

  async searchKnowledge(query: string, k: number = 10) {
    const response = await fetch(`${this.baseUrl}/v1/knowledge/search?site_token=${this.config.siteToken}&q=${encodeURIComponent(query)}&k=${k}`);
    return response.json();
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('site_token', this.config.siteToken);

    const response = await fetch(`${this.baseUrl}/v1/knowledge/uploads`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  async crawlUrl(url: string, depth: number = 1, sitemap: boolean = false) {
    const response = await fetch(`${this.baseUrl}/v1/knowledge/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_token: this.config.siteToken,
        url,
        depth,
        sitemap
      })
    });
    return response.json();
  }

  async sendAnalytics(events: AnalyticsEvent[]) {
    const response = await fetch(`${this.baseUrl}/v1/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: this.config.siteToken.split('_')[1],
        site_id: this.config.siteToken.split('_')[2],
        bot_id: this.config.botId,
        visitor_id: this.config.visitorId || 'sdk_user',
        events
      })
    });
    return response.json();
  }

  async streamChat(message: string, onToken: (token: string) => void, onComplete: (data: any) => void) {
    const response = await fetch(`${this.baseUrl}/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_token: this.config.siteToken,
        bot_id: this.config.botId,
        visitor_id: this.config.visitorId || 'sdk_user',
        message
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              onToken(data.text);
            } else if (data.type === 'final') {
              onComplete(data);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  }
}

export * from '@ritzie/types';
