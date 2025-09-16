import { RitzieConfig, ChatMessage, ChatResponse, AnalyticsEvent, WidgetState, ThemeOverrides } from '@ritzie/types';

class ChatWidget {
  private config: RitzieConfig;
  private shadowRoot!: ShadowRoot;
  private container!: HTMLElement;
  private ws: WebSocket | null = null;
  private state: WidgetState = {
    isOpen: false,
    isMinimized: false,
    hasUnread: false,
    messageCount: 0
  };
  private eventQueue: AnalyticsEvent[] = [];
  private visitorId: string;
  private mode: 'bubble' | 'page' | 'disabled';

  constructor(config: RitzieConfig) {
    this.config = {
      assetsBase: 'https://cdn.ritzie.ai',
      telemetryBase: 'https://events.ritzie.ai',
      ...config
    };
    
    this.mode = (config as any).mode || 'bubble';
    this.visitorId = this.config.visitorId || this.generateVisitorId();
    
    if (this.mode === 'disabled') {
      return;
    }
    
    this.init();
    this.setupAPI();
  }

  private generateVisitorId(): string {
    return 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private async init() {
    this.createShadowDOM();
    await this.loadTheme();
    this.setupEventListeners();
    this.trackEvent('impression');
  }

  private createShadowDOM() {
    this.container = document.createElement('div');
    this.container.id = 'chat-widget';
    
    if (this.mode === 'page') {
      const mountSelector = (this.config as any).mount || '#ritzie-chat';
      const mountElement = document.querySelector(mountSelector);
      if (mountElement) {
        this.container = mountElement as HTMLElement;
        this.container.style.cssText = `
          width: 100%;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
      } else {
        console.error(`ChatWidget: Mount element "${mountSelector}" not found`);
        return;
      }
    } else {
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(this.container);
    }

    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.renderWidget();
  }

  private async loadTheme() {
    try {
      const themeId = this.config.theme || 'palantr';
      const themeHash = this.generateThemeHash();
      const themeUrl = `${this.config.assetsBase}/themes/${this.config.siteToken}/chat-ui.${themeHash}.css`;
      
      const response = await fetch(themeUrl);
      if (response.ok) {
        const css = await response.text();
        const style = document.createElement('style');
        style.textContent = css;
        this.shadowRoot.appendChild(style);
        
        this.applyThemeOverrides();
        
        if (this.config.themeMode && this.config.themeMode !== 'auto') {
          this.shadowRoot.host.setAttribute('data-theme', this.config.themeMode);
        }
      } else {
        this.applyDefaultStyles();
      }
    } catch (error) {
      console.warn('Failed to load theme, using defaults');
      this.applyDefaultStyles();
    }
  }

  private generateThemeHash(): string {
    return '13404c6a';
  }

  private applyDefaultStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .w_c { position: relative; }
      .w_btn {
        width: 60px; height: 60px; border-radius: 50%;
        background: #007bff; color: white; border: none;
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.2s;
      }
      .w_btn:hover { transform: scale(1.05); }
      .w_icon { width: 24px; height: 24px; }
      .w_panel {
        position: absolute; bottom: 70px; right: 0;
        width: 350px; height: 500px; background: white;
        border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .w_container {
        width: 100%; height: 100%; background: white;
        display: flex; flex-direction: column; overflow: hidden;
      }
      .w_header {
        padding: 16px; background: #007bff; color: white;
        display: flex; justify-content: space-between; align-items: center;
      }
      .w_title { font-weight: 600; }
      .w_close {
        background: none; border: none; color: white;
        font-size: 20px; cursor: pointer; padding: 0;
        width: 24px; height: 24px; display: flex;
        align-items: center; justify-content: center;
      }
      .w_messages {
        flex: 1; padding: 16px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 12px;
        background: #f8f9fa;
      }
      .w_input {
        padding: 16px; border-top: 1px solid #eee;
        display: flex; gap: 8px; background: white;
      }
      .w_input input {
        flex: 1; padding: 8px 12px; border: 1px solid #ddd;
        border-radius: 6px; outline: none;
      }
      .w_input button {
        padding: 8px 16px; background: #007bff; color: white;
        border: none; border-radius: 6px; cursor: pointer;
      }
      .msg { padding: 8px 12px; border-radius: 8px; max-width: 80%; }
      .msg.user { background: #007bff; color: white; align-self: flex-end; }
      .msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #e9ecef; }
    `;
    this.shadowRoot.appendChild(style);
  }

  private setupEventListeners() {
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    const closeBtn = this.shadowRoot.getElementById('close-btn');
    const sendBtn = this.shadowRoot.getElementById('send-btn');
    const messageInput = this.shadowRoot.getElementById('message-input') as HTMLInputElement;
    const chatPanel = this.shadowRoot.getElementById('chat-panel');

    toggleBtn?.addEventListener('click', () => {
      if (this.state.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    });

    closeBtn?.addEventListener('click', () => {
      this.closeChat();
    });

    sendBtn?.addEventListener('click', () => {
      this.sendMessage(messageInput.value);
    });

    messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage(messageInput.value);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        messageInput?.focus();
      }
    });

    if (this.mode === 'bubble') {
      toggleBtn?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isOpen) {
          this.closeChat();
        }
      });
    }
  }

  private openChat() {
    const chatPanel = this.shadowRoot.getElementById('chat-panel');
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    if (chatPanel) {
      chatPanel.style.display = 'flex';
      this.state.isOpen = true;
      this.state.hasUnread = false;
      toggleBtn?.setAttribute('aria-expanded', 'true');
      
      const messageInput = this.shadowRoot.getElementById('message-input') as HTMLInputElement;
      setTimeout(() => messageInput?.focus(), 100);
      
      this.connectWebSocket();
      this.trackEvent('open');
    }
  }

  private closeChat() {
    const chatPanel = this.shadowRoot.getElementById('chat-panel');
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    if (chatPanel) {
      chatPanel.style.display = 'none';
      this.state.isOpen = false;
      toggleBtn?.setAttribute('aria-expanded', 'false');
      toggleBtn?.focus();
      this.disconnectWebSocket();
      this.trackEvent('close');
    }
  }

  private connectWebSocket() {
    if (this.ws) return;

    const apiBase = this.config.assetsBase?.replace('/embeds', '').replace('cdn.', 'api.') || 'https://api.ritzie.ai';
    const wsUrl = `${apiBase.replace('https://', 'wss://').replace('http://', 'ws://')}/v1/chat/ws?site_token=${this.config.siteToken}&bot_id=${this.config.botId}&visitor_id=${this.visitorId}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const response: ChatResponse = JSON.parse(event.data);
      this.handleChatResponse(response);
    };

    this.ws.onclose = () => {
      this.ws = null;
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws = null;
    };
  }

  private disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private sendMessage(text: string) {
    if (!text.trim() || !this.ws) return;

    const messageInput = this.shadowRoot.getElementById('message-input') as HTMLInputElement;
    messageInput.value = '';

    this.addMessage(text, 'user');

    const message: ChatMessage = {
      type: 'user_message',
      text: text.trim()
    };

    this.ws.send(JSON.stringify(message));
    this.trackEvent('message_user', { text });
  }

  private handleChatResponse(response: ChatResponse) {
    if (response.type === 'token') {
      this.appendToLastBotMessage(response.text || '');
    } else if (response.type === 'final') {
      this.trackEvent('message_bot', {
        usage: response.usage,
        citations: response.citations?.length || 0
      });
    } else if (response.type === 'error') {
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  private addMessage(text: string, sender: 'user' | 'bot') {
    const messagesContainer = this.shadowRoot.getElementById('messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `rtz-msg rtz-${sender}`;
    messageDiv.textContent = text;
    messageDiv.setAttribute('role', sender === 'bot' ? 'status' : 'text');
    
    if (sender === 'bot') {
      messageDiv.setAttribute('aria-live', 'polite');
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (sender === 'bot') {
      this.state.messageCount++;
    }
  }

  private appendToLastBotMessage(text: string) {
    const messagesContainer = this.shadowRoot.getElementById('messages');
    if (!messagesContainer) return;

    let lastBotMessage = messagesContainer.querySelector('.rtz-msg.rtz-bot:last-child') as HTMLElement;
    
    if (!lastBotMessage) {
      lastBotMessage = document.createElement('div');
      lastBotMessage.className = 'rtz-msg rtz-bot';
      lastBotMessage.setAttribute('role', 'status');
      lastBotMessage.setAttribute('aria-live', 'polite');
      messagesContainer.appendChild(lastBotMessage);
    }

    lastBotMessage.textContent += text;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private trackEvent(type: string, payload?: any) {
    const event: AnalyticsEvent = {
      type: type as any,
      payload,
      ts: Math.floor(Date.now() / 1000)
    };

    this.eventQueue.push(event);

    if (this.eventQueue.length >= 5) {
      this.flushEvents();
    } else {
      setTimeout(() => this.flushEvents(), 2000);
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const apiBase = this.config.assetsBase?.replace('/embeds', '').replace('cdn.', 'api.') || 'https://api.ritzie.ai';
      await fetch(`${apiBase}/v1/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'ORG_demo',
          site_id: this.config.siteToken,
          bot_id: this.config.botId,
          visitor_id: this.visitorId,
          events
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
    }
  }

  private setupAPI() {
    if (window.RITZIE) {
      (window.RITZIE as any).api = {
        setMode: (mode: 'bubble' | 'page' | 'disabled') => {
          this.setMode(mode);
        },
        setThemeMode: (mode: 'light' | 'dark' | 'auto') => {
          this.setThemeMode(mode);
        },
        open: () => {
          if (this.mode === 'bubble') {
            this.openChat();
          }
        },
        close: () => {
          if (this.mode === 'bubble') {
            this.closeChat();
          }
        },
        trackPageView: (path: string) => {
          this.trackEvent('page_view', { path });
        }
      };
      console.log('Chat widget API initialized');
    } else {
      console.warn('window.RITZIE not found during API setup');
    }
  }

  private setMode(mode: 'bubble' | 'page' | 'disabled') {
    if (this.mode === mode) return;
    
    this.mode = mode;
    (this.config as any).mode = mode;
    
    if (mode === 'disabled') {
      this.container.remove();
      return;
    }
    
    this.container.remove();
    
    this.createShadowDOM();
    this.loadTheme();
    this.setupEventListeners();
  }

  private setThemeMode(mode: 'light' | 'dark' | 'auto') {
    this.config.themeMode = mode;
    
    if (mode === 'auto') {
      this.shadowRoot.host.removeAttribute('data-theme');
    } else {
      this.shadowRoot.host.setAttribute('data-theme', mode);
    }
  }

  private applyThemeOverrides() {
    if (!this.config.themeOverrides) return;
    
    const overrides = this.config.themeOverrides;
    const style = document.createElement('style');
    let css = ':host, .rtz {\n';
    
    if (overrides.brand?.accent) {
      css += `  --rtz-accent: ${overrides.brand.accent};\n`;
    }
    
    if (overrides.typography?.fontFamily) {
      css += `  --rtz-font: ${overrides.typography.fontFamily};\n`;
    }
    
    if (overrides.typography?.baseSize) {
      css += `  --rtz-font-size: ${overrides.typography.baseSize}px;\n`;
    }
    
    if (overrides.typography?.lineHeight) {
      css += `  --rtz-line-height: ${overrides.typography.lineHeight};\n`;
    }
    
    if (overrides.layout?.bubbleWidth) {
      css += `  --rtz-bubble-width: ${overrides.layout.bubbleWidth}px;\n`;
    }
    
    if (overrides.layout?.bubbleMaxHeightVh) {
      css += `  --rtz-bubble-max-height: ${overrides.layout.bubbleMaxHeightVh}vh;\n`;
    }
    
    if (overrides.colors?.light) {
      const light = overrides.colors.light;
      if (light.bg) css += `  --rtz-bg-light: ${light.bg};\n`;
      if (light.panel) css += `  --rtz-panel-light: ${light.panel};\n`;
      if (light.text) css += `  --rtz-text-light: ${light.text};\n`;
      if (light.muted) css += `  --rtz-muted-light: ${light.muted};\n`;
      if (light.divider) css += `  --rtz-divider-light: ${light.divider};\n`;
      if (light.chip) css += `  --rtz-chip-light: ${light.chip};\n`;
      if (light.input) css += `  --rtz-input-light: ${light.input};\n`;
    }
    
    if (overrides.colors?.dark) {
      const dark = overrides.colors.dark;
      if (dark.bg) css += `  --rtz-bg-dark: ${dark.bg};\n`;
      if (dark.panel) css += `  --rtz-panel-dark: ${dark.panel};\n`;
      if (dark.text) css += `  --rtz-text-dark: ${dark.text};\n`;
      if (dark.muted) css += `  --rtz-muted-dark: ${dark.muted};\n`;
      if (dark.divider) css += `  --rtz-divider-dark: ${dark.divider};\n`;
      if (dark.chip) css += `  --rtz-chip-dark: ${dark.chip};\n`;
      if (dark.input) css += `  --rtz-input-dark: ${dark.input};\n`;
    }
    
    css += '}\n';
    
    if (overrides.colors?.light) {
      css += ':host([data-theme="light"]), .rtz[data-theme="light"] {\n';
      const light = overrides.colors.light;
      if (light.bg) css += `  --rtz-bg: var(--rtz-bg-light);\n`;
      if (light.panel) css += `  --rtz-panel: var(--rtz-panel-light);\n`;
      if (light.text) css += `  --rtz-text: var(--rtz-text-light);\n`;
      if (light.muted) css += `  --rtz-muted: var(--rtz-muted-light);\n`;
      if (light.divider) css += `  --rtz-divider: var(--rtz-divider-light);\n`;
      if (light.chip) css += `  --rtz-chip: var(--rtz-chip-light);\n`;
      if (light.input) css += `  --rtz-input: var(--rtz-input-light);\n`;
      css += '}\n';
    }
    
    if (overrides.colors?.dark) {
      css += ':host([data-theme="dark"]), .rtz[data-theme="dark"] {\n';
      const dark = overrides.colors.dark;
      if (dark.bg) css += `  --rtz-bg: var(--rtz-bg-dark);\n`;
      if (dark.panel) css += `  --rtz-panel: var(--rtz-panel-dark);\n`;
      if (dark.text) css += `  --rtz-text: var(--rtz-text-dark);\n`;
      if (dark.muted) css += `  --rtz-muted: var(--rtz-muted-dark);\n`;
      if (dark.divider) css += `  --rtz-divider: var(--rtz-divider-dark);\n`;
      if (dark.chip) css += `  --rtz-chip: var(--rtz-chip-dark);\n`;
      if (dark.input) css += `  --rtz-input: var(--rtz-input-dark);\n`;
      css += '}\n';
    }
    
    style.textContent = css;
    this.shadowRoot.appendChild(style);
  }

  private renderWidget() {
    if (this.mode === 'page') {
      this.renderPageMode();
    } else {
      this.renderBubbleMode();
    }
  }

  private renderBubbleMode() {
    this.shadowRoot.innerHTML = `
      <div class="rtz">
        <a href="#message-input" class="rtz-skip-link">Skip to message input (Alt+/)</a>
        <button class="rtz-bubble" id="toggle-btn" aria-label="Open chat assistant" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        <div class="rtz-bubble-panel" id="chat-panel" style="display: none;" role="dialog" aria-labelledby="chat-title" aria-modal="true">
          <div class="rtz-panel">
            <div class="rtz-header">
              <span class="rtz-title" id="chat-title">Chat Assistant</span>
              <button class="rtz-close" id="close-btn" aria-label="Close chat">×</button>
            </div>
            <div class="rtz-messages" id="messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
            <div class="rtz-input">
              <input type="text" id="message-input" class="rtz-inputbox" placeholder="Type your message..." aria-label="Message input" />
              <button id="send-btn" class="rtz-send" aria-label="Send message">Send</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPageMode() {
    this.shadowRoot.innerHTML = `
      <div class="rtz rtz-page-container" role="main" aria-label="Chat assistant">
        <a href="#message-input" class="rtz-skip-link">Skip to message input (Alt+/)</a>
        <div class="rtz-panel">
          <div class="rtz-header">
            <span class="rtz-title" id="chat-title">Chat Assistant</span>
          </div>
          <div class="rtz-messages" id="messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
          <div class="rtz-input">
            <input type="text" id="message-input" class="rtz-inputbox" placeholder="Type your message..." aria-label="Message input" />
            <button id="send-btn" class="rtz-send" aria-label="Send message">Send</button>
          </div>
        </div>
      </div>
    `;
    
    this.state.isOpen = true;
    this.connectWebSocket();
    this.trackEvent('open');
  }
}

(function() {
  if (typeof window !== 'undefined' && window.RITZIE) {
    new ChatWidget(window.RITZIE);
  }
})();

export default ChatWidget;
