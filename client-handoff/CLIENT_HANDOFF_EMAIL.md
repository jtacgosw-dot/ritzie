# Client Handoff Email Template

## Subject: Your AI Assistant is Live - 2-Minute Setup Required

---

Hi **[CLIENT_NAME]**,

Your Ritzie AI assistant is now live and ready for deployment! 🚀

## Quick Setup (Choose One Mode)

### Option 1: Bubble Widget (Recommended)
Paste this code in your site's `<head>` or before `</body>` on **all pages**:

```html
<script>
  window.RITZIE = {
    siteToken: "SITE_live",
    botId: "BOT_live",
    mode: "bubble",
    assetsBase: "https://assets.clientdomain.com"
  };
</script>
<script src="https://assets.clientdomain.com/embeds/chat.v1.js" async></script>
```

### Option 2: Full-Page Chat
For dedicated chat pages or embedded chat sections:

```html
<div id="ritzie-chat" style="height:100vh;"></div>
<script>
  window.RITZIE = {
    siteToken: "SITE_live",
    botId: "BOT_live",
    mode: "page",
    mount: "#ritzie-chat",
    assetsBase: "https://assets.clientdomain.com"
  };
</script>
<script src="https://assets.clientdomain.com/embeds/chat.v1.js" async></script>
```

## Security Configuration (If Required)

If your site uses strict Content Security Policy (CSP), add these lines:

```
Content-Security-Policy:
  script-src 'self' https://assets.clientdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.clientdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.clientdomain.com wss://api.ritzie.ai;
  img-src 'self' data: https:;
```

## What to Expect

✅ **Widget appears** bottom-right (bubble mode) or fills container (page mode)  
✅ **First response** in under 2 seconds  
✅ **Knowledge integration** with citations from your uploaded content  
✅ **Analytics tracking** for sessions, engagement, and top questions  
✅ **Mobile responsive** design that works on all devices  

## Testing Checklist

1. **Load your site** - widget should appear immediately
2. **Click to open** (bubble mode) or see full interface (page mode)
3. **Type "hello"** - should get a response within 2 seconds
4. **Ask about your business** - should provide relevant answers with citations
5. **Check DevTools** - no console errors, assets load from your domain

## Advanced Features

### Runtime Control
```javascript
// Switch modes dynamically
window.RITZIE?.api?.setMode("bubble");   // Bubble widget
window.RITZIE?.api?.setMode("page");     // Full-page chat
window.RITZIE?.api?.setMode("disabled"); // Hide completely

// Manual open/close (bubble mode)
window.RITZIE?.api?.open();
window.RITZIE?.api?.close();
```

### Emergency Disable
If you need to quickly disable the widget:
```html
<script>window.RITZIE = { mode: "disabled" };</script>
```

## Analytics Dashboard

Access your real-time analytics at: **[DASHBOARD_URL]**

Track:
- Session volume and engagement rates
- Top frequently asked questions
- Response accuracy and user satisfaction
- Conversion events and business impact

## 7-Day Pilot Plan

**Days 1-2**: Monitor top questions, add missing knowledge  
**Days 3-4**: Test both bubble and page modes, optimize placement  
**Days 5-7**: Review analytics, tune responses, plan full rollout  

## Support & Next Steps

📧 **Questions?** Reply to this email or contact support@ritzie.ai  
📊 **Analytics?** We'll send your first weekly report on [DATE]  
🔧 **Customization?** Schedule a call to discuss theme and feature updates  

## Quick Rollback (Just in Case)

Remove the two `<script>` tags or set `mode: "disabled"` to instantly hide the widget.

---

**That's it!** Your AI assistant is ready to help your customers 24/7.

Looking forward to seeing your engagement metrics!

**The Ritzie Team**

---

*P.S. - All assets load from your vanity domain (assets.clientdomain.com) so your customers only see your brand. Our stealth technology ensures zero vendor attribution.*
