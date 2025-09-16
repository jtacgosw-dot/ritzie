# Pilot Pack - Theme System v1 Live Deployment

## 🚀 Pilot Organizations

### Pilot Org A - Palantr Theme
- **Organization**: Pilot Org A - Palantr  
- **Site Token**: `SITE_live_a`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440121`
- **Theme**: Palantr Minimal (Professional, clean design)
- **Personality**: `calm_pro` tone
- **Domain**: `pilot-a.example.com`

### Pilot Org B - Pastel Theme  
- **Organization**: Pilot Org B - Pastel
- **Site Token**: `SITE_live_b`
- **Bot ID**: `550e8400-e29b-41d4-a716-446655440122`
- **Theme**: Pastel Playful (Friendly, colorful design)
- **Personality**: `friendly_helpful` tone
- **Domain**: `pilot-b.example.com`

## 📋 Embed Snippets

### Pilot Org A - Bubble Mode
```html
<!-- Paste in <head> or before </body> on ALL pages -->
<script>
  window.RITZIE = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    assetsBase: "https://cdn.ritzie.ai"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Pilot Org A - Full Page Mode
```html
<!-- Paste in <head> or before </body> on chat page -->
<div id="chat-widget"></div>
<script>
  window.RITZIE = {
    siteToken: "SITE_live_a",
    botId: "550e8400-e29b-41d4-a716-446655440121",
    assetsBase: "https://cdn.ritzie.ai",
    mode: "page"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Pilot Org B - Bubble Mode
```html
<!-- Paste in <head> or before </body> on ALL pages -->
<script>
  window.RITZIE = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    assetsBase: "https://cdn.ritzie.ai"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Pilot Org B - Full Page Mode
```html
<!-- Paste in <head> or before </body> on chat page -->
<div id="chat-widget"></div>
<script>
  window.RITZIE = {
    siteToken: "SITE_live_b",
    botId: "550e8400-e29b-41d4-a716-446655440122",
    assetsBase: "https://cdn.ritzie.ai",
    mode: "page"
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

## 🔒 CSP Configuration

Add these Content Security Policy headers to allow the chat widget:

### For Direct CDN (cdn.ritzie.ai)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.ritzie.ai;
  style-src 'self' 'unsafe-inline' https://cdn.ritzie.ai;
  connect-src 'self' https://api.ritzie.ai https://events.ritzie.ai;
  img-src 'self' data: https:;
```

### For Vanity CDN (when configured)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.clientdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.clientdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.clientdomain.com;
  img-src 'self' data: https:;
```

## 📚 Knowledge Management

### Adding Documents/URLs
1. **Upload Documents**: Use the admin dashboard at `/admin` to upload PDFs, DOCX, TXT, or CSV files
2. **Crawl URLs**: Add individual pages or entire sitemaps through the knowledge management interface
3. **Processing Time**: Documents are typically searchable within 60 seconds of upload

### Supported Formats
- **PDFs**: Automatically extracted and chunked
- **Word Documents**: DOCX format supported
- **Text Files**: Plain text and CSV
- **Web Pages**: Single pages, sitemaps, or shallow domain crawls

## 📊 Analytics & Insights

### Top FAQs Dashboard
- **Access**: Available at `/admin` dashboard
- **Updates**: Refreshed nightly at 2 AM with new FAQ clusters
- **Data**: Shows most common user questions and confidence scores

### Viewing Transcripts
- **Location**: Admin dashboard under "Conversations"
- **Filtering**: Filter by date range, bot, or visitor
- **Export**: Download conversation transcripts for analysis

### Key Metrics Tracked
- Session count and open rates
- Messages per session
- Response latency (p50/p95)
- User satisfaction ratings
- Containment percentage

## 🛠️ Rollback & Emergency Controls

### Instant Hide (Emergency)
```sql
UPDATE bots SET layout_mode = 'disabled' WHERE id = 'BOT_ID_HERE';
```
This immediately hides the chat widget from all pages.

### Theme Rollback
```sql
UPDATE bots SET theme = '{"id": "base"}' WHERE id = 'BOT_ID_HERE';
```
This reverts to the base theme instantly.

### Rate Limiting
- **Current Limits**: 2 QPS per organization, 200K tokens daily
- **Adjustment**: Contact support to modify limits

## 🌐 Vanity CDN Setup (Optional)

To make the chat widget appear completely first-party:

### DNS Configuration
Add these CNAME records to your DNS:
```
assets.yourdomain.com    CNAME    cdn.ritzie.ai
telemetry.yourdomain.com CNAME    events.ritzie.ai
```

### Update Embed Code
```javascript
window.RITZIE = {
  siteToken: "YOUR_SITE_TOKEN",
  botId: "YOUR_BOT_ID",
  assetsBase: "https://assets.yourdomain.com",
  telemetryBase: "https://telemetry.yourdomain.com"
};
```

## 📞 Support & Monitoring

### Health Endpoints
- **Gateway Health**: `https://api.ritzie.ai/health`
- **Embed Config**: `https://api.ritzie.ai/v1/embed-config?site_token=YOUR_TOKEN&bot_id=YOUR_BOT_ID`

### Slack Alerts
- **Channel**: `#ritzie-alerts`
- **Triggers**: 5xx errors > 1%, p95 latency > 2s, job failures > 5min

### Emergency Contacts
- **Technical Issues**: Contact development team via Slack
- **Business Questions**: Reach out to account management

## ✅ Verification Checklist

Before going live, verify:
- [ ] Embed snippet loads without console errors
- [ ] Chat widget appears with correct theme
- [ ] Messages send and receive properly
- [ ] Knowledge search returns relevant results
- [ ] Analytics events are being tracked
- [ ] CSP headers allow all required resources
- [ ] Vanity CDN (if used) resolves correctly

---

**Deployment Date**: September 16, 2025  
**Theme System Version**: v1.0.0  
**Support**: Available 24/7 via Slack #ritzie-alerts
