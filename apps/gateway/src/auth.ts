import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

interface TokenUsageStore {
  [key: string]: { tokens: number; date: string };
}

const rateLimitStore: RateLimitStore = {};
const tokenUsageStore: TokenUsageStore = {};

export function requireSite(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      (req.query.site_token as string) ||
      (req.body?.siteToken as string) ||
      (req.headers["x-site-token"] as string);

    const bot_id = (req.query.bot_id as string) || (req.body?.botId as string);

    if (!token) return res.status(401).json({ error: "missing_site_token" });

    const siteMapping: { [key: string]: { site_id: string; org_id: string } } = {
      "SITE_demo_site1": { 
        site_id: "550e8400-e29b-41d4-a716-446655440011", 
        org_id: "550e8400-e29b-41d4-a716-446655440001" 
      },
      "SITE_demo_site2": { 
        site_id: "550e8400-e29b-41d4-a716-446655440012", 
        org_id: "550e8400-e29b-41d4-a716-446655440001" 
      },
      "SITE_live": { 
        site_id: "550e8400-e29b-41d4-a716-446655440013", 
        org_id: "550e8400-e29b-41d4-a716-446655440002" 
      },
      "SITE_live_a": { 
        site_id: "550e8400-e29b-41d4-a716-446655440301", 
        org_id: "550e8400-e29b-41d4-a716-446655440201" 
      },
      "SITE_live_b": { 
        site_id: "550e8400-e29b-41d4-a716-446655440302", 
        org_id: "550e8400-e29b-41d4-a716-446655440202" 
      },
      "SITE_pilot1": { 
        site_id: "550e8400-e29b-41d4-a716-446655440401", 
        org_id: "550e8400-e29b-41d4-a716-446655440301" 
      }
    };
    
    const siteData = siteMapping[token];
    if (!siteData) return res.status(401).json({ error: "invalid_site_token" });

    (req as any).site = {
      site_token: token,
      site_id: siteData.site_id,
      org_id: siteData.org_id,
      bot_id: bot_id
    };
    next();
  } catch (e) {
    return res.status(500).json({ error: "internal_error" });
  }
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const site = (req as any).site;
  if (!site) return next();

  const orgId = site.org_id;
  const now = Date.now();
  const windowMs = 1000; // 1 second window
  const maxRequests = parseInt(process.env.ORG_RATE_LIMIT_QPS || "2");

  if (!rateLimitStore[orgId]) {
    rateLimitStore[orgId] = { count: 0, resetTime: now + windowMs };
  }

  const bucket = rateLimitStore[orgId];
  
  if (now > bucket.resetTime) {
    bucket.count = 0;
    bucket.resetTime = now + windowMs;
  }

  if (bucket.count >= maxRequests) {
    return res.status(429).json({ 
      error: "rate_limit_exceeded", 
      retry_after: Math.ceil((bucket.resetTime - now) / 1000) 
    });
  }

  bucket.count++;
  next();
}

export function checkTokenLimit(orgId: string, tokensUsed: number): boolean {
  const dailyLimit = parseInt(process.env.ORG_DAILY_TOKEN_CAP || "200000");
  const today = new Date().toISOString().split('T')[0];
  
  if (!tokenUsageStore[orgId] || tokenUsageStore[orgId].date !== today) {
    tokenUsageStore[orgId] = { tokens: 0, date: today };
  }

  const usage = tokenUsageStore[orgId];
  
  if (usage.tokens + tokensUsed > dailyLimit) {
    return false;
  }

  usage.tokens += tokensUsed;
  return true;
}

export function logUsage(orgId: string, siteId: string, botId: string, data: {
  latency?: number;
  tokensIn?: number;
  tokensOut?: number;
  endpoint?: string;
  error?: string;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    org_id: orgId,
    site_id: siteId,
    bot_id: botId,
    ...data
  };
  
  console.log('[USAGE]', JSON.stringify(logEntry));
}

export const WS_CODES = { UNAUTHORIZED: 4401, BAD_REQUEST: 4400 };
