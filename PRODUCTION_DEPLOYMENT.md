# Ritzie Production Deployment Guide

## 🚀 Production Infrastructure

### 1. Environment Configuration

Copy `.env.prod` to your production environment:

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://ritzie:***@postgres:5432/ritzie
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=sk-********************************
LLM_PROVIDER=openai
CHAT_MODEL=gpt-4.1-mini
EMBEDDINGS_MODEL=text-embedding-3-small
LLM_TIMEOUT_MS=25000
LLM_MAX_TOKENS=800
ASSETS_CDN_BASE=https://cdn.ritzie.ai
TELEMETRY_BASE=https://events.ritzie.ai

# Production Guardrails
ORG_RATE_LIMIT_QPS=2
ORG_DAILY_TOKEN_CAP=200000
KB_ONLY=false
RETRIEVAL_TOPK=8
RETRIEVAL_MAX_TOKENS=1200
JWT_SECRET=change_me_now_prod_secret_key_here
```

### 2. Docker Deployment

```bash
# Deploy production stack
docker compose -f docker-compose.prod.yml up -d --build

# Initialize database
psql $DATABASE_URL -f infra/db/schema.sql
psql $DATABASE_URL -f scripts/setup-demo-data.sql

# Verify health
curl -s https://api.ritzie.ai/health
```

### 3. Nginx Configuration

Use `infra/nginx/ritzie.conf` for:
- Unbuffered SSE streaming
- WebSocket upgrade handling
- Security headers
- Rate limiting (optional)

### 4. Vanity CDN (Stealth)

Configure client DNS:
```
assets.CLIENTDOMAIN.com   CNAME   cdn.ritzie.ai
telemetry.CLIENTDOMAIN.com CNAME  events.ritzie.ai
```

Update environment:
```bash
ASSETS_CDN_BASE=https://assets.clientdomain.com
TELEMETRY_BASE=https://telemetry.clientdomain.com
```

## 🧪 Production Smoke Tests

Run comprehensive tests:
```bash
./scripts/prod-smoke-tests.sh
```

Expected results:
- ✅ Health endpoint: `{"ok":true}`
- ✅ SSE streaming with real OpenAI responses
- ✅ 401 errors for invalid tokens
- ✅ Rate limiting (2 QPS enforced)
- ✅ WebSocket connections working
- ✅ No "Ritzie" strings in bundles

## 🔐 Security & Guardrails

### Rate Limiting
- **2 QPS per organization**
- 429 responses with retry-after headers
- Jittered backoff on retries

### Token Budgets
- **200,000 tokens/day per organization**
- Automatic context truncation if needed
- Usage logging per org/site/bot

### Error Handling
- **2 retries** with exponential backoff (250ms, 1s)
- Graceful fallbacks on LLM failures
- No provider stack traces exposed

### Observability
```json
{
  "timestamp": "2025-09-16T01:47:10.000Z",
  "org_id": "ORG_live",
  "site_id": "SITE_live", 
  "bot_id": "BOT_live",
  "endpoint": "sse_chat",
  "latency": 1250,
  "tokensIn": 15,
  "tokensOut": 42
}
```

## 📦 Client Handoff Package

### Embed Snippet
```html
<script>
  window.RITZIE = {
    siteToken: "SITE_live",
    botId: "BOT_live",
    assetsBase: "https://assets.clientdomain.com"
  };
</script>
<script src="https://assets.clientdomain.com/embeds/chat.v1.js" async></script>
```

### CSP Configuration
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.clientdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.clientdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.clientdomain.com;
  img-src 'self' data: https:;
```

### Setup Steps
1. Paste embed snippet globally
2. Add CSP headers if needed
3. Send 1 PDF + 1 URL for knowledge testing
4. Verify citations appear in responses

## 🚨 Incident Playbook

### Widget Not Loading
```bash
# Check health
curl -s https://api.ritzie.ai/health

# Check assets CDN
curl -I https://assets.clientdomain.com/embeds/chat.v1.js

# Check CSP errors in browser console
```

### 401 Errors on Live Site
```bash
# Verify site token
node scripts/rotate_site_token.mjs --site SITE_xxx

# Update client embed with new token
# Redeploy client site
```

### SSE Streaming Stalls
```bash
# Check Nginx proxy settings
# Ensure: proxy_buffering off
# Ensure: proxy_read_timeout 3600s

# Check OpenAI API status
curl -s https://status.openai.com/api/v2/status.json
```

### Cost Spike
```bash
# Lower daily token cap
export ORG_DAILY_TOKEN_CAP=50000

# Switch to cheaper model
export CHAT_MODEL=gpt-4o-mini

# Restart gateway
docker compose -f docker-compose.prod.yml restart gateway
```

## 📊 Monitoring & Alerts

### Health Monitoring
- **Endpoint**: `/health` every 60s
- **Expected**: `{"ok":true}` in <500ms
- **Alert**: Slack #ritzie-alerts on failures

### Usage Metrics
- Sessions, open rate, msgs/session
- p50/p95 latency <2s target
- CSAT scores, containment %
- Token spend by org/site/bot

### Nightly Rollups
```bash
# Aggregate daily metrics
node scripts/rollup-analytics.js

# Export CSV for pilot review
node scripts/export-metrics.js --days=7
```

## 🔄 Token Rotation

```bash
# Rotate compromised site token
node scripts/rotate_site_token.mjs --site SITE_xxx

# Update client embed snippet
# Verify old token returns 401
```

## ✅ Production Checklist

- [ ] Docker Compose deployed and healthy
- [ ] Database schema and demo data loaded
- [ ] Nginx configured for SSE/WS
- [ ] Vanity CDN DNS configured
- [ ] Production smoke tests passing
- [ ] Rate limiting and token caps active
- [ ] Observability logging enabled
- [ ] Client embed snippet provided
- [ ] CSP configuration documented
- [ ] Incident playbook reviewed
- [ ] Monitoring alerts configured

**Status: PRODUCTION READY! 🚀**
