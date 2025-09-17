# Pilot-1 Final Embed Snippets

## Bubble Mode (Recommended)
```html
<script>
  window.CHATBOT = {
    siteToken: "SITE_pilot1",
    botId: "550e8400-e29b-41d4-a716-446655440501",
    mode: "bubble",
    assetsBase: "https://assets.pilot1company.com"
  };
</script>
<script src="https://assets.pilot1company.com/embeds/chat.v1.js" async></script>
```

## Full-Page Mode (for dedicated chat pages)
```html
<div id="ritzie-chat" style="height:100vh;"></div>
<script>
  window.CHATBOT = {
    siteToken: "SITE_pilot1", 
    botId: "550e8400-e29b-41d4-a716-446655440501",
    mode: "page",
    mount: "#ritzie-chat",
    assetsBase: "https://assets.pilot1company.com"
  };
</script>
<script src="https://assets.pilot1company.com/embeds/chat.v1.js" async></script>
```

## CSP Configuration
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.pilot1company.com;
  style-src 'self' 'unsafe-inline' https://assets.pilot1company.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.pilot1company.com;
  img-src 'self' data: https:;
```

## Vanity CDN Setup
```
assets.pilot1company.com    CNAME   cdn.ritzie.ai
telemetry.pilot1company.com CNAME   events.ritzie.ai
```

## Token Rotation (Post-Install)
After successful installation, rotate the site token for security:
```bash
curl -X POST http://localhost:8082/v1/admin/rotate-token \
  -H "Content-Type: application/json" \
  -d '{"site_token":"SITE_pilot1","new_token":"SITE_pilot1_v2"}'
```

## Verification Tests
1. Network tab shows only pilot1company.com domains
2. First token streams in <600ms (warmed)
3. WebSocket or SSE connection established
4. Widget appears in bubble mode
5. Full-page mode renders correctly

✅ Ready for client deployment
