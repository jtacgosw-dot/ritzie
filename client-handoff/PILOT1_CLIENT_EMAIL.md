# Subject: Your AI assistant is ready — 2-minute install

Hey [Client Name] 👋

Your Pilot-1 AI assistant is now live and ready for deployment! Here's everything you need to get started:

## 🚀 Quick Install (Bubble Mode)

Paste this snippet site-wide, in `<head>` or before `</body>`:

```html
<script>
  window.CHATBOT = { 
    siteToken: "SITE_pilot1", 
    botId: "550e8400-e29b-41d4-a716-446655440501", 
    assetsBase: "https://assets.yourdomain.com" 
  };
</script>
<script src="https://assets.yourdomain.com/embeds/chat.v1.js" async></script>
```

## 📄 Full-Page Mode (Optional)

For dedicated chat pages like `/contact` or `/support`:

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

## 🔒 Security Configuration

If you use a strict Content Security Policy (CSP), add these lines:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.yourdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.yourdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.yourdomain.com;
  img-src 'self' data: https:;
```

## 📚 Knowledge Training

Send us 2–3 core PDFs or your help-center URL and we'll train your assistant immediately. You'll get:

- **Live Top FAQs Dashboard**: See what customers are asking most
- **Full Transcripts**: Review all conversations for insights
- **Citation Tracking**: Every answer includes source references

## 🎯 Success Metrics

Your assistant is configured for optimal performance:

- **Personality**: Professional, calm tone (no emojis)
- **Response Time**: < 2 seconds average
- **A/B Testing**: Automatic bubble vs full-page optimization
- **Conversion Tracking**: "Talk to Sales" CTA with UTM attribution

## 🛡️ Emergency Controls

**Instant Hide**: Contact us and we'll disable the widget in one click  
**Theme Changes**: Access your admin dashboard for real-time adjustments  
**Rollback**: Revert to any previous version instantly

## 📊 Analytics Access

- **Dashboard**: [Your analytics URL]
- **Top FAQs**: Real-time insights into customer questions
- **Performance**: Response times, satisfaction scores, containment rates

## 🚨 Support

- **Technical Issues**: Monitored 24/7 via Slack alerts
- **Business Questions**: Direct line to your account team
- **Emergency**: Instant killswitch available

---

**Next Steps:**
1. Install the embed snippet on your site
2. Send us your knowledge base content
3. We'll schedule a 20-minute walkthrough in 3 days

Ready to transform your customer experience!

—The Ritzie Team

*P.S. Your assistant learns from every interaction. The more conversations it has, the smarter it gets.*
