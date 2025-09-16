# Client Handoff Guide - Ritzie Chat Widget

## Quick Setup (2 minutes)

### Standard Embed
```html
<script>
  window.RITZIE = { 
    siteToken: "SITE_your_token", 
    botId: "BOT_your_id" 
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

### Full-Page Chat
```html
<div id="ritzie-chat" style="height:100vh;"></div>
<script>
  window.RITZIE = { 
    siteToken: "SITE_your_token", 
    botId: "BOT_your_id", 
    mode: "page", 
    mount: "#ritzie-chat" 
  };
</script>
<script src="https://cdn.ritzie.ai/embeds/chat.v1.js" async></script>
```

## Content Security Policy (CSP)

If your site uses strict CSP, add these directives:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.ritzie.ai;
  style-src 'self' 'unsafe-inline' https://cdn.ritzie.ai;
  connect-src 'self' https://api.ritzie.ai https://events.ritzie.ai;
  img-src 'self' data: https:;
```

### Vanity CDN (Recommended)
For white-label deployment, set up these CNAMEs:
```
assets.yourdomain.com    CNAME    cdn.ritzie.ai
telemetry.yourdomain.com CNAME    events.ritzie.ai
```

Then update your embed:
```html
<script>
  window.RITZIE = { 
    siteToken: "SITE_your_token", 
    botId: "BOT_your_id",
    assetsBase: "https://assets.yourdomain.com",
    telemetryBase: "https://telemetry.yourdomain.com"
  };
</script>
<script src="https://assets.yourdomain.com/embeds/chat.v1.js" async></script>
```

## Analytics Dashboard

Access your real-time analytics at: **[DASHBOARD_URL]**

### Key Metrics
- **Sessions**: Total chat interactions
- **Open Rate**: % of visitors who open the chat
- **Messages/Session**: Average conversation length
- **CSAT Score**: Customer satisfaction rating
- **Containment Rate**: % of queries resolved without handoff
- **Top FAQs**: Most common questions and gaps

### FAQ Analytics
- **Top Questions**: Most frequently asked queries
- **New This Week**: Emerging topics requiring attention
- **Needs KB**: Low-confidence responses requiring knowledge base updates
- **Citation Rate**: % of responses with source references

## Theme Customization

### Quick Brand Updates
Update your brand colors via the admin dashboard:
1. Go to Dashboard → Appearance
2. Select your bot
3. Modify brand colors, logo, typography
4. Preview changes in real-time
5. Publish when ready

### Advanced Theming
For custom themes, edit JSON tokens:
```json
{
  "brand": { "accent": "#your-color" },
  "colors": {
    "light": { "bg": "#FFFFFF", "text": "#000000" },
    "dark": { "bg": "#000000", "text": "#FFFFFF" }
  },
  "personality": { "tone": "friendly_helpful" }
}
```

## Knowledge Management

### Adding Content
1. **Upload Documents**: PDF, DOCX, TXT files via dashboard
2. **URL Crawling**: Add website URLs for automatic ingestion
3. **Manual Entries**: Create FAQ entries directly

### Best Practices
- Keep documents under 10MB
- Use clear, descriptive titles
- Update content regularly
- Monitor "Needs KB" alerts in analytics

## Emergency Controls

### Disable Widget
```html
<script>window.RITZIE = { mode: "disabled" };</script>
```

### Rate Limiting
Contact support to adjust rate limits if experiencing high traffic.

### Rollback Theme
Use the admin dashboard to rollback to previous theme versions.

## Support & Monitoring

### Health Monitoring
- **Response Time**: Target <2s for first token
- **Uptime**: 99.9% SLA
- **Error Rate**: <0.1% target

### Support Channels
- **Email**: support@ritzie.ai
- **Dashboard**: Live chat support
- **Emergency**: [Emergency contact info]

### Troubleshooting

**Widget not loading?**
- Check CSP headers
- Verify site token is correct
- Check browser console for errors

**Slow responses?**
- Check knowledge base size
- Review query complexity
- Contact support for optimization

**Theme not updating?**
- Clear browser cache
- Verify theme version in admin
- Check CDN cache invalidation

## Performance Optimization

### Bundle Size
- Widget: <100KB compressed
- CSS: <10KB per theme
- Lazy loading for optimal performance

### Caching
- Static assets: 1 year cache
- Theme CSS: Immutable with hash-based invalidation
- API responses: Optimized for <100ms

## Privacy & Compliance

### Data Handling
- All data encrypted in transit and at rest
- GDPR/CCPA compliant data processing
- Configurable data retention policies

### User Privacy
- No tracking without consent
- Anonymized analytics by default
- User data export/deletion available

## Integration Examples

### E-commerce
```html
<!-- Track conversions -->
<script>
window.RITZIE.api.trackPageView('/checkout/success');
</script>
```

### Support Portal
```html
<!-- Pre-populate context -->
<script>
window.RITZIE = {
  siteToken: "SITE_token",
  botId: "BOT_id",
  context: { userId: "user123", plan: "premium" }
};
</script>
```

### Multi-language
```html
<!-- Language-specific bot -->
<script>
const userLang = navigator.language.startsWith('es') ? 'es' : 'en';
window.RITZIE = {
  siteToken: "SITE_token",
  botId: userLang === 'es' ? "BOT_spanish" : "BOT_english"
};
</script>
```

---

**Questions?** Contact your implementation team or visit the support portal.
