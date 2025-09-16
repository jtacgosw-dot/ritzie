# Ritzie Theme System v1 - Pilot Pack

## 🚀 Pilot Organizations Ready for Deployment

### Pilot Org A - Palantr Professional
- **Site Token**: `SITE_live_a`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440121`
- **Theme**: Palantr (Professional, minimal design)
- **Personality**: Calm, authoritative tone (`calm_pro`)
- **Domain**: `pilot-a.example.com`

### Pilot Org B - Pastel Playful
- **Site Token**: `SITE_live_b`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440122`
- **Theme**: Pastel Playful (Warm, friendly design)
- **Personality**: Friendly, helpful tone (`friendly_helpful`)
- **Domain**: `pilot-b.example.com`

## 📦 Embed Snippets

### Pilot Org A - Bubble Mode
```html
<script>
  window.RITZIE = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    assetsBase: "https://assets.pilot-a.example.com"
  };
</script>
<script src="https://assets.pilot-a.example.com/embeds/chat.v1.js" async></script>
```

### Pilot Org A - Full-Page Mode
```html
<div id="ritzie-chat"></div>
<script>
  window.RITZIE = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    mode: "page",
    mount: "#ritzie-chat",
    assetsBase: "https://assets.pilot-a.example.com"
  };
</script>
<script src="https://assets.pilot-a.example.com/embeds/chat.v1.js" async></script>
```

### Pilot Org B - Bubble Mode
```html
<script>
  window.RITZIE = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    assetsBase: "https://assets.pilot-b.example.com"
  };
</script>
<script src="https://assets.pilot-b.example.com/embeds/chat.v1.js" async></script>
```

### Pilot Org B - Full-Page Mode
```html
<div id="ritzie-chat"></div>
<script>
  window.RITZIE = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    mode: "page",
    mount: "#ritzie-chat",
    assetsBase: "https://assets.pilot-b.example.com"
  };
</script>
<script src="https://assets.pilot-b.example.com/embeds/chat.v1.js" async></script>
```

## 🔒 CSP Configuration

### Pilot Org A CSP Headers
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.pilot-a.example.com;
  style-src 'self' 'unsafe-inline' https://assets.pilot-a.example.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.pilot-a.example.com;
  img-src 'self' data: https:;
```

### Pilot Org B CSP Headers
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.pilot-b.example.com;
  style-src 'self' 'unsafe-inline' https://assets.pilot-b.example.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.pilot-b.example.com;
  img-src 'self' data: https:;
```

## 🌐 Vanity CDN Setup

### DNS Configuration Required

**For Pilot Org A:**
```
assets.pilot-a.example.com     CNAME   cdn.ritzie.ai
telemetry.pilot-a.example.com  CNAME   events.ritzie.ai
```

**For Pilot Org B:**
```
assets.pilot-b.example.com     CNAME   cdn.ritzie.ai
telemetry.pilot-b.example.com  CNAME   events.ritzie.ai
```

## 📚 Knowledge Base Setup Guide

### 1. Upload Documents
- Navigate to admin dashboard: `https://api.ritzie.ai/admin`
- Use staff token for authentication
- Upload PDFs, DOCX, TXT, or CSV files (max 10MB each)
- Use clear, descriptive titles for better organization

### 2. Add URLs for Crawling
- Single page: Enter URL directly
- Sitemap crawl: Check "Use sitemap" option
- Domain crawl: Set depth to 2-3 for comprehensive coverage
- Monitor crawl progress in the dashboard

### 3. Best Practices
- Keep documents under 10MB for optimal processing
- Use clear, descriptive titles and organize by topic
- Update content regularly to maintain accuracy
- Monitor "Needs KB" alerts in analytics dashboard

## 📊 Analytics Dashboard Access

### Top FAQs Dashboard
- **URL**: `https://api.ritzie.ai/admin/analytics`
- **Authentication**: Staff token required
- **Features**:
  - Real-time FAQ aggregation with clustering
  - Query confidence scores and citation tracking
  - Weekly trends and gap analysis
  - Export capabilities for stakeholder reports

### Key Metrics to Monitor
- **Sessions**: Daily active conversations
- **Open Rate**: Widget engagement percentage
- **Messages/Session**: Average conversation length
- **CSAT Scores**: User satisfaction ratings
- **Containment %**: Questions answered without handoff
- **Response Time**: p50/p95 latency metrics

## 🚨 Emergency Controls

### Instant Widget Disable
```sql
UPDATE bots SET layout_mode = 'disabled' WHERE id = 'BOT_ID_HERE';
```

### Theme Rollback
Use the admin dashboard to rollback to previous theme versions:
1. Navigate to Theme Editor
2. Select "Version History"
3. Choose previous stable version
4. Click "Rollback" to revert changes

### Site Token Rotation
```bash
node scripts/rotate_site_token.mjs --site SITE_live_a
# Update client embed snippet with new token
```

## 📞 Support & Monitoring

### Health Monitoring
- **Response Time Target**: <2s for first token
- **Uptime SLA**: 99.9%
- **Error Rate Target**: <0.1%
- **Health Endpoint**: `https://api.ritzie.ai/health`

### Incident Response
1. **Check Health**: `curl -s https://api.ritzie.ai/health`
2. **Review Logs**: Docker Compose logs for errors
3. **OpenAI Status**: Verify API availability at status.openai.com
4. **Slack Alerts**: Monitor #ritzie-alerts for urgent issues

### 7-Day Pilot Plan

**Days 1-2**: Monitor top questions, add missing knowledge content
**Days 3-4**: Test both bubble and page modes, optimize widget placement
**Days 5-6**: Analyze user feedback, adjust themes and personality settings
**Day 7**: Comprehensive review with stakeholders, plan next phase

## ✅ Pilot Deployment Checklist

- [ ] DNS CNAME records configured for vanity CDN
- [ ] Embed snippets deployed to client websites
- [ ] CSP headers configured (if required)
- [ ] Initial knowledge base content uploaded
- [ ] Analytics dashboard access verified
- [ ] Emergency rollback procedures tested
- [ ] Monitoring alerts configured in Slack
- [ ] Stakeholder access to admin dashboard provided

## 🎯 Success Metrics

### Week 1 Targets
- **Widget Impressions**: >1000 per pilot org
- **Engagement Rate**: >15% (impressions to opens)
- **Average Session Length**: >3 messages
- **User Satisfaction**: >4.0/5.0 rating
- **Knowledge Coverage**: >80% questions answered with citations

### Optimization Opportunities
- **Theme Adjustments**: Based on user feedback and engagement
- **Content Gaps**: Identified through "Needs KB" analytics
- **Performance Tuning**: Response time optimization
- **Placement Testing**: Widget positioning and messaging

---

**Pilot Status**: READY FOR DEPLOYMENT 🚀

All production systems tested and verified. Client integration packages complete. Monitoring and incident response procedures in place.
