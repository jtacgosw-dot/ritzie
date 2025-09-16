# Ritzie Chat Widget - 5-Minute Setup Guide

## 1. Choose Your Embed Mode

### Option A: Bubble Widget (Recommended)
Floating chat button in bottom-right corner:

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

### Option B: Full-Page Chat
Dedicated chat page or embedded section:

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

## 2. Add CSP Headers (if needed)

If your site has strict Content Security Policy, add these directives:

```
Content-Security-Policy:
  script-src 'self' https://assets.clientdomain.com;
  style-src 'self' 'unsafe-inline' https://assets.clientdomain.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.clientdomain.com wss://api.ritzie.ai;
  img-src 'self' data: https:;
```

## 3. Runtime Control (Optional)

Switch modes dynamically or control the widget:

```javascript
// Switch modes
window.RITZIE?.api?.setMode("bubble");   // Bubble widget
window.RITZIE?.api?.setMode("page");     // Full-page chat
window.RITZIE?.api?.setMode("disabled"); // Hide completely

// Manual open/close (bubble mode only)
window.RITZIE?.api?.open();
window.RITZIE?.api?.close();

// Track page views for analytics
window.RITZIE?.api?.trackPageView(window.location.pathname);
```

## 4. SPA Route Tracking (Optional)

For Single Page Applications, add this route change tracker:

```javascript
// Track route changes for analytics
window.addEventListener('popstate', () => {
  window.RITZIE?.api?.trackPageView(window.location.pathname);
});
```

## 5. Test & Verify

### Bubble Mode:
1. Open your website
2. Look for the chat button (bottom-right corner)
3. Click to open chat panel
4. Send a test message

### Page Mode:
1. Navigate to your chat page
2. Chat interface should fill the container
3. Send a test message
4. Verify responses appear within 2 seconds

## 6. Upload Knowledge (Optional)

Send us 1 PDF and 1 URL to ingest for testing:
- We'll verify citations appear in chat responses
- You can add more content later via the dashboard

## Troubleshooting

- **Widget doesn't load**: Check browser console for CSP errors
- **No responses**: Verify `siteToken` matches your account
- **Slow responses**: Check network tab for API connectivity
- **Page mode not working**: Ensure mount element exists before script loads
- **Mode switching fails**: Check console for JavaScript errors

## Support

Contact: support@ritzie.ai
Dashboard: https://dashboard.ritzie.ai
