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
      assetsBase: 'https://cdn.example.com',
      telemetryBase: 'https://events.example.com',
      ...config
    };
    
    this.mode = (config as any).mode || 'bubble';
    this.visitorId = this.config.visitorId || this.generateVisitorId();
    
    console.log('ChatWidget initialized with config:', this.config);
    console.log('Mode:', this.mode);
    
    if (this.mode === 'disabled') {
      console.log('Widget disabled, not initializing');
      return;
    }
    
    (window as any).CHATBOT_INSTANCE = this;
    
    this.init();
    this.setupAPI();
  }

  private generateVisitorId(): string {
    return 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private async init() {
    this.createShadowDOM();
    await this.loadTheme();
    setTimeout(() => {
      this.setupEventListeners();
    }, 100);
    this.trackEvent('impression');
  }

  private async createShadowDOM() {
    console.log('Creating shadow DOM for mode:', this.mode);
    this.container = document.createElement('div');
    this.container.id = 'chat-widget';
    this.container.setAttribute('data-chatbot-container', 'true');
    
    if (this.mode === 'page') {
      const mountSelector = (this.config as any).mount || '#chat-widget';
      console.log('Looking for mount element:', mountSelector);
      const mountElement = document.querySelector(mountSelector);
      if (mountElement) {
        console.log('Mount element found:', mountElement);
        this.container = mountElement as HTMLElement;
        this.container.setAttribute('data-chatbot-container', 'true');
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
      console.log('Appending bubble container to body');
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(this.container);
      console.log('Container appended to body:', this.container);
    }

    console.log('Creating shadow root...');
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    console.log('Shadow root created:', this.shadowRoot);
    
    await this.loadTheme();
    this.renderWidget();
    console.log('Widget rendered');
  }

  private async loadTheme() {
    try {
      const apiBase = (this.config as any).apiBase || this.config.assetsBase;
      
      let fetchUrl = `${apiBase}/v1/embed-config?site_token=${this.config.siteToken}&bot_id=${this.config.botId}`;
      let fetchOptions: RequestInit = {};
      
      if (apiBase.includes('@')) {
        const urlParts = apiBase.split('@');
        if (urlParts.length === 2) {
          const credentials = urlParts[0].split('://')[1];
          const cleanBase = `${urlParts[0].split('://')[0]}://${urlParts[1]}`;
          fetchUrl = `${cleanBase}/v1/embed-config?site_token=${this.config.siteToken}&bot_id=${this.config.botId}`;
          
          if (credentials.includes(':')) {
            const [username, password] = credentials.split(':');
            fetchOptions.headers = {
              'Authorization': `Basic ${btoa(`${username}:${password}`)}`
            };
          }
        }
      }
      
      console.log('Fetching embed config from:', fetchUrl.replace(/user:[^@]+@/, 'user:***@'));
      const configResponse = await fetch(fetchUrl, fetchOptions);
      
      if (configResponse.ok) {
        const embedConfig = await configResponse.json();
        console.log('Loaded embed config:', embedConfig);
        
        if (embedConfig.theme) {
          console.log('Using theme from embed config, generating CSS...');
          const css = this.generateThemeCSS(embedConfig.theme);
          const style = document.createElement('style');
          style.textContent = css;
          this.shadowRoot.appendChild(style);
          
          this.applyThemeOverrides();
          
          if (this.config.themeMode && this.config.themeMode !== 'auto') {
            this.shadowRoot.host.setAttribute('data-theme', this.config.themeMode);
          }
          return;
        }
        
        if (embedConfig.theme) {
          console.log('Generating CSS from theme config:', embedConfig.theme);
          const css = this.generateThemeCSS(embedConfig.theme);
          const style = document.createElement('style');
          style.textContent = css;
          this.shadowRoot.appendChild(style);
          
          this.applyThemeOverrides();
          
          if (this.config.themeMode && this.config.themeMode !== 'auto') {
            this.shadowRoot.host.setAttribute('data-theme', this.config.themeMode);
          }
          return;
        }
      } else {
        console.warn('Embed config API failed, status:', configResponse.status);
      }
      
      console.log('Falling back to Palantr theme generation');
      const palantrTheme = {
        id: 'palantr',
        colors: {
          light: { bg: '#F8FAFC', panel: '#FFFFFF', text: '#0B1220', muted: '#6B7280', divider: 'rgba(0,0,0,.06)', chip: '#F3F4F6', input: '#F9FAFB' },
          dark: { bg: '#0B0F14', panel: '#0E131A', text: '#E6EAF0', muted: '#9AA3AF', divider: 'rgba(255,255,255,.08)', chip: '#0F141B', input: '#11161E' }
        },
        brand: { accent: '#3B82F6' },
        radius: { sm: 10, md: 14, lg: 16, pill: 999 },
        space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        typography: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', baseSize: 14, lineHeight: 1.45 },
        layout: { bubbleWidth: 440, bubbleMaxHeightVh: 90 },
        shadow: { elevation: '0 10px 30px rgba(0,0,0,.18)' },
        motion: { curvePrimary: 'cubic-bezier(.2,.8,.2,1)', durations: { content: 180, macro: 200 } }
      };
      
      console.log('Generating Palantr theme CSS');
      const css = this.generateThemeCSS(palantrTheme);
      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
      
      this.applyThemeOverrides();
      
      if (this.config.themeMode && this.config.themeMode !== 'auto') {
        this.shadowRoot.host.setAttribute('data-theme', this.config.themeMode);
      }
    } catch (error) {
      console.error('Theme loading failed completely, using Palantr fallback:', error);
      
      const palantrTheme = {
        id: 'palantr',
        colors: {
          light: { bg: '#F8FAFC', panel: '#FFFFFF', text: '#0B1220', muted: '#6B7280', divider: 'rgba(0,0,0,.06)', chip: '#F3F4F6', input: '#F9FAFB' },
          dark: { bg: '#0B0F14', panel: '#0E131A', text: '#E6EAF0', muted: '#9AA3AF', divider: 'rgba(255,255,255,.08)', chip: '#0F141B', input: '#11161E' }
        },
        brand: { accent: '#3B82F6' },
        radius: { sm: 10, md: 14, lg: 16, pill: 999 },
        space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        typography: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', baseSize: 14, lineHeight: 1.45 },
        layout: { bubbleWidth: 440, bubbleMaxHeightVh: 90 },
        shadow: { elevation: '0 10px 30px rgba(0,0,0,.18)' },
        motion: { curvePrimary: 'cubic-bezier(.2,.8,.2,1)', durations: { content: 180, macro: 200 } }
      };
      
      const css = this.generateThemeCSS(palantrTheme);
      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
      
      this.applyThemeOverrides();
    }
  }

  private generateThemeHash(): string {
    return '13404c6a';
  }

  private generateThemeCSS(theme: any): string {
    const colors = theme.colors || {};
    const typography = theme.typography || {};
    const radius = theme.radius || {};
    const space = theme.space || {};
    const layout = theme.layout || {};
    const shadow = theme.shadow || {};
    const motion = theme.motion || {};
    
    return `
      :host {
        --rtz-font: ${typography.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
        --rtz-font-size: ${typography.baseSize || 14}px;
        --rtz-line-height: ${typography.lineHeight || 1.45};
        
        --rtz-bg-light: ${colors.light?.bg || '#F8FAFC'};
        --rtz-panel-light: ${colors.light?.panel || '#FFFFFF'};
        --rtz-text-light: ${colors.light?.text || '#0B1220'};
        --rtz-muted-light: ${colors.light?.muted || '#6B7280'};
        --rtz-divider-light: ${colors.light?.divider || 'rgba(0,0,0,.06)'};
        --rtz-chip-light: ${colors.light?.chip || '#F3F4F6'};
        --rtz-input-light: ${colors.light?.input || '#F9FAFB'};
        
        --rtz-bg-dark: ${colors.dark?.bg || '#0B0F14'};
        --rtz-panel-dark: ${colors.dark?.panel || '#0E131A'};
        --rtz-text-dark: ${colors.dark?.text || '#E6EAF0'};
        --rtz-muted-dark: ${colors.dark?.muted || '#9AA3AF'};
        --rtz-divider-dark: ${colors.dark?.divider || 'rgba(255,255,255,.08)'};
        --rtz-chip-dark: ${colors.dark?.chip || '#0F141B'};
        --rtz-input-dark: ${colors.dark?.input || '#11161E'};
        
        --rtz-accent: ${theme.brand?.accent || '#3B82F6'};
        --rtz-radius-sm: ${radius.sm || 10}px;
        --rtz-radius-md: ${radius.md || 14}px;
        --rtz-radius-lg: ${radius.lg || 16}px;
        --rtz-radius-pill: ${radius.pill || 999}px;
        
        --rtz-space-xs: ${space.xs || 4}px;
        --rtz-space-sm: ${space.sm || 8}px;
        --rtz-space-md: ${space.md || 12}px;
        --rtz-space-lg: ${space.lg || 16}px;
        --rtz-space-xl: ${space.xl || 24}px;
        
        --rtz-shadow: ${shadow.elevation || '0 10px 30px rgba(0,0,0,.18)'};
        --rtz-curve: ${motion.curvePrimary || 'cubic-bezier(.2,.8,.2,1)'};
        --rtz-duration: ${motion.durations?.content || 180}ms;
        
        --rtz-bubble-width: ${layout.bubbleWidth || 440}px;
        --rtz-bubble-max-height: ${layout.bubbleMaxHeightVh || 90}vh;
      }
      
      @media (prefers-color-scheme: light) {
        :host {
          --rtz-bg: var(--rtz-bg-light);
          --rtz-panel: var(--rtz-panel-light);
          --rtz-text: var(--rtz-text-light);
          --rtz-muted: var(--rtz-muted-light);
          --rtz-divider: var(--rtz-divider-light);
          --rtz-chip: var(--rtz-chip-light);
          --rtz-input: var(--rtz-input-light);
        }
      }
      
      @media (prefers-color-scheme: dark) {
        :host {
          --rtz-bg: var(--rtz-bg-dark);
          --rtz-panel: var(--rtz-panel-dark);
          --rtz-text: var(--rtz-text-dark);
          --rtz-muted: var(--rtz-muted-dark);
          --rtz-divider: var(--rtz-divider-dark);
          --rtz-chip: var(--rtz-chip-dark);
          --rtz-input: var(--rtz-input-dark);
        }
      }
      
      :host([data-theme="light"]) {
        --rtz-bg: var(--rtz-bg-light);
        --rtz-panel: var(--rtz-panel-light);
        --rtz-text: var(--rtz-text-light);
        --rtz-muted: var(--rtz-muted-light);
        --rtz-divider: var(--rtz-divider-light);
        --rtz-chip: var(--rtz-chip-light);
        --rtz-input: var(--rtz-input-light);
      }
      
      :host([data-theme="dark"]) {
        --rtz-bg: var(--rtz-bg-dark);
        --rtz-panel: var(--rtz-panel-dark);
        --rtz-text: var(--rtz-text-dark);
        --rtz-muted: var(--rtz-muted-dark);
        --rtz-divider: var(--rtz-divider-dark);
        --rtz-chip: var(--rtz-chip-dark);
        --rtz-input: var(--rtz-input-dark);
      }
      
      .rtz {
        font-family: var(--rtz-font);
        font-size: var(--rtz-font-size);
        line-height: var(--rtz-line-height);
        color: var(--rtz-text);
        position: relative;
      }
      
      .rtz-skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--rtz-accent);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: var(--rtz-radius-sm);
        z-index: 100;
        transition: top var(--rtz-duration) var(--rtz-curve);
      }
      
      .rtz-skip-link:focus {
        top: 6px;
      }
      
      /* Bubble Mode Styles */
      .rtz-bubble {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--rtz-accent);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--rtz-shadow);
        transition: transform var(--rtz-duration) var(--rtz-curve);
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1000;
      }
      
      .rtz-bubble:hover {
        transform: scale(1.05);
      }
      
      .rtz-bubble:focus {
        outline: 2px solid var(--rtz-accent);
        outline-offset: 2px;
      }
      
      .rtz-bubble-panel {
        position: fixed;
        bottom: 94px;
        right: 24px;
        width: var(--rtz-bubble-width);
        max-height: calc(var(--rtz-bubble-max-height) - 48px);
        background: var(--rtz-panel);
        border-radius: var(--rtz-radius-lg);
        box-shadow: var(--rtz-shadow);
        border: 1px solid var(--rtz-divider);
        overflow: hidden;
        transform: scale(0.98);
        opacity: 0;
        transition: all var(--rtz-duration) var(--rtz-curve);
        z-index: 999;
      }
      
      .rtz-bubble-panel[style*="block"] {
        transform: scale(1);
        opacity: 1;
      }
      
      /* Page Mode Styles */
      .rtz-page-container {
        width: 100%;
        height: 100%;
        background: var(--rtz-bg);
        display: flex;
        flex-direction: column;
      }
      
      .rtz-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--rtz-panel);
        border-radius: var(--rtz-radius-md);
        border: 1px solid var(--rtz-divider);
        overflow: hidden;
      }
      
      .rtz-header {
        padding: var(--rtz-space-lg);
        background: var(--rtz-panel);
        border-bottom: 1px solid var(--rtz-divider);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }
      
      .rtz-title {
        font-weight: 600;
        color: var(--rtz-text);
        margin: 0;
      }
      
      .rtz-close {
        background: none;
        border: none;
        color: var(--rtz-muted);
        font-size: 20px;
        cursor: pointer;
        padding: var(--rtz-space-xs);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--rtz-radius-sm);
        transition: all var(--rtz-duration) var(--rtz-curve);
      }
      
      .rtz-close:hover {
        background: var(--rtz-chip);
        color: var(--rtz-text);
      }
      
      .rtz-close:focus {
        outline: 2px solid var(--rtz-accent);
        outline-offset: 2px;
      }
      
      .rtz-messages {
        flex: 1;
        padding: var(--rtz-space-lg);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: var(--rtz-space-md);
        background: var(--rtz-bg);
        min-height: 0;
      }
      
      .rtz-input {
        padding: var(--rtz-space-lg);
        border-top: 1px solid var(--rtz-divider);
        display: flex;
        gap: var(--rtz-space-sm);
        background: var(--rtz-panel);
        flex-shrink: 0;
      }
      
      .rtz-inputbox {
        flex: 1;
        padding: var(--rtz-space-md);
        border: 1px solid var(--rtz-divider);
        border-radius: var(--rtz-radius-md);
        background: var(--rtz-input);
        color: var(--rtz-text);
        font-family: var(--rtz-font);
        font-size: var(--rtz-font-size);
        outline: none;
        transition: all var(--rtz-duration) var(--rtz-curve);
      }
      
      .rtz-inputbox:focus {
        border-color: var(--rtz-accent);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .rtz-inputbox::placeholder {
        color: var(--rtz-muted);
      }
      
      .rtz-send {
        padding: var(--rtz-space-md) var(--rtz-space-lg);
        background: var(--rtz-accent);
        color: white;
        border: none;
        border-radius: var(--rtz-radius-md);
        cursor: pointer;
        font-family: var(--rtz-font);
        font-size: var(--rtz-font-size);
        font-weight: 500;
        transition: all var(--rtz-duration) var(--rtz-curve);
        white-space: nowrap;
      }
      
      .rtz-send:hover {
        background: color-mix(in srgb, var(--rtz-accent) 90%, black);
      }
      
      .rtz-send:focus {
        outline: 2px solid var(--rtz-accent);
        outline-offset: 2px;
      }
      
      .rtz-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .msg {
        padding: var(--rtz-space-md);
        border-radius: var(--rtz-radius-md);
        max-width: 80%;
        word-wrap: break-word;
        animation: fadeInUp var(--rtz-duration) var(--rtz-curve);
      }
      
      .msg.user {
        background: var(--rtz-accent);
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }
      
      .msg.bot {
        background: var(--rtz-chip);
        color: var(--rtz-text);
        align-self: flex-start;
        border: 1px solid var(--rtz-divider);
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @media (max-width: 480px) {
        .rtz-bubble-panel {
          width: calc(100vw - 40px);
          right: -10px;
        }
        
        .rtz-inputbox {
          font-size: 16px; /* Prevent zoom on iOS */
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
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
      chatPanel.style.opacity = '1';
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
      chatPanel.style.opacity = '0';
      this.state.isOpen = false;
      toggleBtn?.setAttribute('aria-expanded', 'false');
      toggleBtn?.focus();
      this.disconnectWebSocket();
      this.trackEvent('close');
    }
  }

  private connectWebSocket() {
    if (this.ws) return;

    const apiBase = this.config.assetsBase?.replace('/embeds', '').replace('cdn.', 'api.') || 'https://api.example.com';
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
    
    const payload = {
      siteToken: this.config.siteToken,
      botId: this.config.botId,
      visitor_id: this.visitorId,
      events: events
    };
    
    try {
      const apiBase = (this.config as any).apiBase || this.config.assetsBase;
      const response = await fetch(`${apiBase}/v1/analytics/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Site-Token': this.config.siteToken
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.warn('Analytics flush failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Analytics flush error:', error);
      this.eventQueue.unshift(...events);
    }
  }

  private setupAPI() {
    if ((window as any).CHATBOT) {
      ((window as any).CHATBOT as any).api = {
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
      console.warn('window.CHATBOT not found during API setup');
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
    const palantrTheme = {
      colors: {
        light: { bg: '#F8FAFC', panel: '#FFFFFF', text: '#0B1220', muted: '#6B7280', divider: 'rgba(0,0,0,.06)', chip: '#F3F4F6', input: '#F9FAFB' },
        dark: { bg: '#0B0F14', panel: '#0E131A', text: '#E6EAF0', muted: '#9AA3AF', divider: 'rgba(255,255,255,.08)', chip: '#0F141B', input: '#11161E' }
      },
      brand: { accent: '#3B82F6' },
      radius: { sm: 10, md: 14, lg: 16, pill: 999 },
      space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      typography: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', baseSize: 14, lineHeight: 1.45 },
      layout: { bubbleWidth: 440, bubbleMaxHeightVh: 90 },
      shadow: { elevation: '0 10px 30px rgba(0,0,0,.18)' },
      motion: { curvePrimary: 'cubic-bezier(.2,.8,.2,1)', durations: { content: 180, macro: 200 } }
    };
    const themeCSS = this.generateThemeCSS(palantrTheme);
    this.shadowRoot.innerHTML = `
      <style>
        ${themeCSS}
        :host {
          all: initial;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .rtz-skip-link {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .rtz-skip-link:focus {
          position: static;
          width: auto;
          height: auto;
        }
        .rtz-bubble {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: var(--rtz-primary);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 2147483647;
          transition: transform 200ms var(--rtz-curve-primary);
        }
        .rtz-bubble:hover {
          transform: scale(1.05);
        }
        .rtz-bubble-panel {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 440px;
          max-height: calc(90vh - 48px);
          background: var(--rtz-panel-bg);
          border: 1px solid var(--rtz-divider);
          border-radius: var(--rtz-radius-md);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: none;
          flex-direction: column;
          z-index: 2147483647;
          font-family: Inter, system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.45;
        }
        .rtz-bubble-panel[style*="flex"] {
          display: flex;
          animation: bubbleOpen 200ms var(--rtz-curve-primary);
        }
        @keyframes bubbleOpen {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .rtz-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rtz-header {
          padding: 16px;
          border-bottom: 1px solid var(--rtz-divider);
          background: var(--rtz-panel-bg);
          border-radius: var(--rtz-radius-md) var(--rtz-radius-md) 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rtz-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--rtz-text);
          margin: 0;
        }
        .rtz-close {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--rtz-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .rtz-close:hover {
          background: var(--rtz-chip-bg);
          color: var(--rtz-text);
        }
        .rtz-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: var(--rtz-bg);
          min-height: 200px;
        }
        .rtz-input {
          padding: 16px;
          border-top: 1px solid var(--rtz-divider);
          background: var(--rtz-panel-bg);
          border-radius: 0 0 var(--rtz-radius-md) var(--rtz-radius-md);
          display: flex;
          gap: 8px;
        }
        .rtz-inputbox {
          flex: 1;
          padding: 12px;
          border: 1px solid var(--rtz-divider);
          border-radius: var(--rtz-radius-md);
          background: var(--rtz-input-bg);
          color: var(--rtz-text);
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }
        .rtz-inputbox:focus {
          border-color: var(--rtz-primary);
        }
        .rtz-send {
          padding: 12px 16px;
          background: var(--rtz-primary);
          color: white;
          border: none;
          border-radius: var(--rtz-radius-md);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .rtz-send:hover {
          opacity: 0.9;
        }
      </style>
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
              <span class="rtz-title" id="chat-title">🏢 Assistant</span>
              <button class="rtz-close" id="close-btn" aria-label="Close chat">×</button>
            </div>
            <div class="rtz-messages" id="messages" role="log" aria-live="polite" aria-label="Chat messages">
              <p style="color: var(--rtz-muted); margin: 0; padding: 20px; background: var(--rtz-panel-bg); border: 1px solid var(--rtz-divider); border-radius: var(--rtz-radius-md); text-align: center;">Hello! I'm your AI assistant. How can I help you today?</p>
            </div>
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
    const palantrTheme = {
      colors: {
        light: { bg: '#F8FAFC', panel: '#FFFFFF', text: '#0B1220', muted: '#6B7280', divider: 'rgba(0,0,0,.06)', chip: '#F3F4F6', input: '#F9FAFB' },
        dark: { bg: '#0B0F14', panel: '#0E131A', text: '#E6EAF0', muted: '#9AA3AF', divider: 'rgba(255,255,255,.08)', chip: '#0F141B', input: '#11161E' }
      },
      brand: { accent: '#3B82F6' },
      radius: { sm: 10, md: 14, lg: 16, pill: 999 },
      space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      typography: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', baseSize: 14, lineHeight: 1.45 },
      layout: { bubbleWidth: 440, bubbleMaxHeightVh: 90 },
      shadow: { elevation: '0 10px 30px rgba(0,0,0,.18)' },
      motion: { curvePrimary: 'cubic-bezier(.2,.8,.2,1)', durations: { content: 180, macro: 200 } }
    };
    const themeCSS = this.generateThemeCSS(palantrTheme);
    this.shadowRoot.innerHTML = `
      <style>
        ${themeCSS}
        :host {
          all: initial;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          height: 100%;
          display: block;
        }
        .rtz-skip-link {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .rtz-skip-link:focus {
          position: static;
          width: auto;
          height: auto;
        }
        .rtz-page-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--rtz-bg);
          font-family: Inter, system-ui, sans-serif;
          font-size: 15px;
          line-height: 1.45;
        }
        .rtz-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rtz-header {
          padding: 20px 24px;
          background: var(--rtz-panel-bg);
          border-bottom: 1px solid var(--rtz-divider);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rtz-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--rtz-text);
          margin: 0;
        }
        .rtz-messages {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: var(--rtz-bg);
          min-height: 0;
        }
        .rtz-input {
          padding: 20px 24px;
          background: var(--rtz-panel-bg);
          border-top: 1px solid var(--rtz-divider);
          position: sticky;
          bottom: 0;
          display: flex;
          gap: 12px;
        }
        .rtz-inputbox {
          flex: 1;
          padding: 16px;
          border: 1px solid var(--rtz-divider);
          border-radius: var(--rtz-radius-md);
          background: var(--rtz-input-bg);
          color: var(--rtz-text);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          resize: none;
          min-height: 24px;
        }
        .rtz-inputbox:focus {
          border-color: var(--rtz-primary);
        }
        .rtz-send {
          padding: 16px 20px;
          background: var(--rtz-primary);
          color: white;
          border: none;
          border-radius: var(--rtz-radius-md);
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
        }
        .rtz-send:hover {
          opacity: 0.9;
        }
        .rtz-welcome-message {
          color: var(--rtz-muted);
          margin: 0;
          padding: 20px;
          background: var(--rtz-panel-bg);
          border: 1px solid var(--rtz-divider);
          border-radius: var(--rtz-radius-md);
          text-align: center;
        }
      </style>
      <div class="rtz rtz-page-container" role="main" aria-label="Chat assistant">
        <a href="#message-input" class="rtz-skip-link">Skip to message input (Alt+/)</a>
        <div class="rtz-panel">
          <div class="rtz-header">
            <span class="rtz-title" id="chat-title">🏢 Assistant</span>
          </div>
          <div class="rtz-messages" id="messages" role="log" aria-live="polite" aria-label="Chat messages">
            <p class="rtz-welcome-message">Hello! I'm your AI assistant. How can I help you today?</p>
          </div>
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
  function tryInitialize() {
    if (typeof window !== 'undefined' && (window as any).CHATBOT) {
      console.log('Auto-initializing ChatWidget with config:', (window as any).CHATBOT);
      try {
        new ChatWidget((window as any).CHATBOT);
        return true;
      } catch (error) {
        console.error('Failed to initialize ChatWidget:', error);
        return false;
      }
    }
    return false;
  }

  if (tryInitialize()) {
    return;
  }

  console.log('window.CHATBOT not found, retrying initialization...');
  let attempts = 0;
  const maxAttempts = 10;
  const retryInterval = setInterval(() => {
    attempts++;
    if (tryInitialize()) {
      clearInterval(retryInterval);
      return;
    }
    
    if (attempts >= maxAttempts) {
      console.log('ChatWidget auto-initialization failed after', maxAttempts, 'attempts');
      clearInterval(retryInterval);
    }
  }, 100);
})();

export default ChatWidget;
