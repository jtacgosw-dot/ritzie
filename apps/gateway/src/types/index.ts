export interface Org {
  id: string;
  name: string;
  created_at: Date;
}

export interface Site {
  id: string;
  org_id: string;
  domain: string;
  site_token: string;
  created_at: Date;
}

export interface Bot {
  id: string;
  org_id: string;
  site_id: string;
  name?: string;
  prompt?: string;
  theme?: any;
  tools?: any;
  model: string;
  created_at: Date;
}

export interface Document {
  id: string;
  org_id: string;
  site_id: string;
  source?: string;
  title?: string;
  meta?: any;
  created_at: Date;
}

export interface Chunk {
  id: string;
  doc_id: string;
  org_id: string;
  site_id: string;
  content: string;
  embedding?: number[];
  tokens?: number;
  ord?: number;
  meta?: any;
}

export interface Conversation {
  id: string;
  org_id: string;
  site_id: string;
  bot_id: string;
  visitor_id: string;
  created_at: Date;
}

export interface Message {
  id: string;
  convo_id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  meta?: any;
  created_at: Date;
}

export interface AnalyticsEvent {
  type: string;
  payload?: any;
  ts?: number;
}

export interface BatchAnalyticsRequest {
  org_id: string;
  site_id: string;
  bot_id: string;
  visitor_id: string;
  events: AnalyticsEvent[];
}

export interface ChatMessage {
  type: 'user_message';
  text: string;
  context?: any;
  metadata?: any;
}

export interface ChatResponse {
  type: 'token' | 'final';
  text?: string;
  citations?: any[];
  usage?: any;
}

export interface AuthContext {
  org_id: string;
  site_id: string;
  bot_id?: string;
  visitor_id?: string;
}
