# Client Handoff Email - Pilot-1 Ready

**Subject:** Your AI assistant is ready — 2-minute install

Hey [Client Name] 👋

Your Pilot-1 AI assistant is live and ready to deploy! Here's everything you need:

## 🚀 Quick Install (Bubble Mode)
Paste this site-wide, in `<head>` or before `</body>`:

```html
<script>
  window.CHATBOT = { 
    siteToken: "SITE_pilot1", 
    botId: "550e8400-e29b-41d4-a716-446655440501", 
    mode: "bubble",
    assetsBase: "https://assets.yourdomain.com"
  };
</script>
<script src="https://assets.yourdomain.com/embeds/chat.v1.js" async></script>
```

## 📄 Full-Page Mode (Optional)
For dedicated chat pages:

```html
<div id="ritzie-chat" style="height:100vh;"></div>
<script>
  window.CHATBOT = { 
    siteToken: "SITE_pilot1", 
    botId: "550e8400-e29b-41d4-a716-446655440501", 
    mode: "page", 
    mount: "#ritzie-chat",
    assetsBase: "https://assets.yourdomain.com"
  };
</script>
<script src="https://assets.yourdomain.com/embeds/chat.v1.js" async></script>
```

## 🔒 Content Security Policy (If Strict CSP)
Add these directives:

```
default-src 'self';
script-src 'self' https://assets.yourdomain.com;
style-src 'self' 'unsafe-inline' https://assets.yourdomain.com;
connect-src 'self' https://api.ritzie.ai https://telemetry.yourdomain.com;
img-src 'self' data: https:;
```

## 📚 Knowledge Training
Send us 2-3 core PDFs or your help-center URL and we'll train the assistant. You'll get:
- Live Top FAQs dashboard
- Full conversation transcripts
- Knowledge gap analysis

## 🎛️ A/B Testing Active
We're running bubble vs full-page mode testing (50/50 split, sticky by visitor) to optimize engagement.

## 📊 Success Metrics We're Tracking
- Open rate ≥ 12% of pageviews
- Messages per session: 2.5+
- Containment rate ≥ 40%
- CSAT score ≥ 4.4/5
- Response time p95 < 2s
- Conversion events from "Talk to sales" CTA

## 🛡️ Instant Rollback
Need to disable? Just tell us and we'll hide the widget in one click (layout_mode="disabled").

## 🔗 Vanity CDN Setup
For complete white-label experience, add these DNS records:
```
assets.yourdomain.com       CNAME   cdn.ritzie.ai
telemetry.yourdomain.com    CNAME   events.ritzie.ai
```

## 📈 24-Hour Check-In
We'll send you a pilot report in 24 hours with:
- Engagement metrics and trends
- Top FAQs and knowledge gaps
- Conversion tracking results
- Optimization recommendations

Questions? Reply to this email or Slack us directly.

—The Ritzie Team

*P.S. Your assistant uses our Palantr theme with calm, professional tone and no emojis—perfect for your brand.*
