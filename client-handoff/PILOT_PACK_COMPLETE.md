# Pilot Pack - Theme System v1 Live Deployment

## 🚀 Pilot Organizations Ready

### Pilot Org A - Palantr Theme
- **Organization**: Pilot Org A - Palantr
- **Site Token**: `SITE_live_a`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440121`
- **Theme**: Palantr Minimal (Professional, clean design)
- **Personality**: `calm_pro` tone, no emojis
- **Layout**: Bubble mode (default)

### Pilot Org B - Pastel Theme
- **Organization**: Pilot Org B - Pastel
- **Site Token**: `SITE_live_b`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440122`
- **Theme**: Pastel Playful (Colorful, friendly design)
- **Personality**: `friendly_helpful` tone, emojis enabled
- **Layout**: Bubble mode (default)

## 📋 Embed Snippets

### Org A (Palantr) - Bubble Mode
```html
<!-- Pilot Org A - Palantr Theme (Bubble Mode) -->
<script>
  window.CHATBOT = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    assetsBase: "https://cdn.ritzie.ai"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Org A (Palantr) - Full Page Mode
```html
<!-- Pilot Org A - Palantr Theme (Full Page Mode) -->
<script>
  window.CHATBOT = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    assetsBase: "https://cdn.ritzie.ai",
    mode: "page"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
<div id="ritzie-chat"></div>
```

### Org B (Pastel) - Bubble Mode
```html
<!-- Pilot Org B - Pastel Theme (Bubble Mode) -->
<script>
  window.CHATBOT = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    assetsBase: "https://cdn.ritzie.ai"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Org B (Pastel) - Full Page Mode
```html
<!-- Pilot Org B - Pastel Theme (Full Page Mode) -->
<script>
  window.CHATBOT = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    assetsBase: "https://cdn.ritzie.ai",
    mode: "page"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
<div id="ritzie-chat"></div>
```

## 🔒 CSP Configuration

### For Direct CDN (cdn.ritzie.ai)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.ritzie.ai;
  style-src 'self' 'unsafe-inline' https://cdn.ritzie.ai;
  connect-src 'self' https://api.ritzie.ai https://events.ritzie.ai;
  img-src 'self' data: https:;
```

### For Vanity CDN (Recommended)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.clientdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.clientdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.clientdomain.com;
  img-src 'self' data: https:;
```

**DNS CNAME Setup Required:**
```
assets.clientdomain.com CNAME cdn.ritzie.ai
telemetry.clientdomain.com CNAME events.ritzie.ai
```

## 📊 Analytics & Dashboard Access

### Top FAQs Dashboard
- **URL**: `http://localhost:8082/v1/analytics/top-faqs?site_token=SITE_live_a`
- **Features**: Query clustering, confidence scoring, knowledge gap identification
- **Updates**: Nightly aggregation at 2 AM (scheduled via BullMQ)

### KPI Dashboard
- **URL**: `http://localhost:8082/v1/analytics/kpi?site_token=SITE_live_a`
- **Metrics**: Sessions, open rate, containment rate, CSAT scores
- **Refresh**: Real-time data with nightly rollups

### Admin Theme Editor
- **URL**: `http://localhost:8082/admin`
- **Features**: Theme editing, import/export, A/B testing, rollback

## 📚 Knowledge Management Mini-Guide

### Adding Documents
1. **Upload PDFs/DOCX**: Use `/v1/knowledge/uploads` endpoint
2. **Crawl URLs**: Use `/v1/knowledge/urls` with depth parameter
3. **Search Knowledge**: Use `/v1/knowledge/search?q=query&k=5`

### Best Practices
- Upload FAQ documents first for immediate impact
- Use shallow crawls (depth=1) for faster processing
- Monitor Top FAQs for knowledge gaps

## 🔄 Rollback Instructions

### Instant Hide (Emergency)
Set `layout_mode="disabled"` in bot configuration to instantly hide the widget.

### Theme Rollback
1. Access admin dashboard at `/admin`
2. Select bot from dropdown
3. Click "Rollback" to previous theme version
4. Confirm rollback action

### Full Disable
Remove embed script tags from client website.

## 📈 Monitoring & Alerts

### Health Monitoring
- **Endpoint**: `http://localhost:8082/health`
- **Expected**: `{"ok": true}`

### Performance Thresholds
- **P95 Latency**: < 2 seconds
- **5xx Error Rate**: < 1%
- **Rollup Job Duration**: < 5 minutes

### Slack Alerts Setup
Configure webhook for `#ritzie-alerts` channel:
- Health endpoint failures
- High error rates
- Job processing delays

## 🎯 Success Metrics

### Week 1 Targets
- **Org A (Palantr)**: Professional use cases, technical queries
- **Org B (Pastel)**: Customer support, friendly interactions
- **Combined**: > 100 conversations, < 2s avg response time

### A/B Testing Insights
- Theme preference by user segment
- Personality tone effectiveness
- Conversion rate differences

## 🚨 Support & Escalation

### Technical Issues
1. Check health endpoint first
2. Review browser console for errors
3. Verify CSP configuration
4. Contact technical team with error logs

### Theme Customization
1. Use admin dashboard for minor changes
2. Export current theme as backup
3. Test changes in staging first
4. Document all customizations

---

**Deployment Date**: September 17, 2025  
**Version**: Theme System v1.0.0  
**Status**: ✅ Live and Ready for Pilot Testing
