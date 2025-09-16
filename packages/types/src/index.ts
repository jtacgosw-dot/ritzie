export interface RitzieConfig {
  siteToken: string;
  botId: string;
  assetsBase?: string;
  telemetryBase?: string;
  visitorId?: string;
  mode?: 'bubble' | 'page' | 'disabled';
  mount?: string;
  theme?: string;
  themeMode?: 'light' | 'dark' | 'auto';
  themeOverrides?: ThemeOverrides;
}

export interface ThemeOverrides {
  brand?: {
    accent?: string;
    logoUrl?: string;
    avatarUrl?: string;
  };
  colors?: {
    light?: {
      bg?: string;
      panel?: string;
      text?: string;
      muted?: string;
      divider?: string;
      chip?: string;
      input?: string;
    };
    dark?: {
      bg?: string;
      panel?: string;
      text?: string;
      muted?: string;
      divider?: string;
      chip?: string;
      input?: string;
    };
  };
  typography?: {
    fontFamily?: string;
    baseSize?: number;
    lineHeight?: number;
  };
  layout?: {
    bubbleWidth?: number;
    bubbleMaxHeightVh?: number;
  };
}

export interface ChatMessage {
  type: 'user_message';
  text: string;
  context?: any;
  metadata?: any;
}

export interface ChatResponse {
  type: 'token' | 'final' | 'error';
  text?: string;
  citations?: Citation[];
  usage?: any;
  message?: string;
}

export interface Citation {
  chunk_id: string;
  doc_id: string;
  content: string;
  title?: string;
  source?: string;
  score?: number;
}

export interface AnalyticsEvent {
  type: 'impression' | 'open' | 'close' | 'message_user' | 'message_bot' | 'rating' | 'cta_click' | 'handoff_start' | 'conversion';
  payload?: any;
  ts?: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  brand: {
    logoUrl: string;
    avatarUrl: string;
    accent: string;
  };
  colors: {
    light: {
      bg: string;
      panel: string;
      text: string;
      muted: string;
      divider: string;
      chip: string;
      input: string;
    };
    dark: {
      bg: string;
      panel: string;
      text: string;
      muted: string;
      divider: string;
      chip: string;
      input: string;
    };
  };
  typography: {
    fontFamily: string;
    baseSize: number;
    lineHeight: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadow: {
    elevation: string;
  };
  layout: {
    mode: 'bubble' | 'page' | 'disabled';
    bubbleWidth: number;
    bubbleMaxHeightVh: number;
    pageHeader: boolean;
    mountSelector: string;
  };
  motion: {
    curvePrimary: string;
    durations: {
      micro: number;
      content: number;
      macro: number;
      stagger: number;
    };
    reducedMotion: boolean;
  };
  components: {
    message: {
      userBg: string;
      botBg: string;
    };
    chip: {
      bordered: boolean;
    };
    button: {
      style: string;
    };
  };
  personality: {
    tone: string;
    emoji: boolean;
  };
}

export interface WidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  hasUnread: boolean;
  messageCount: number;
}

declare global {
  interface Window {
    RITZIE?: RitzieConfig & {
      api?: {
        setMode: (mode: 'bubble' | 'page' | 'disabled') => void;
        open: () => void;
        close: () => void;
        trackPageView?: (path: string) => void;
      };
    };
  }
}
