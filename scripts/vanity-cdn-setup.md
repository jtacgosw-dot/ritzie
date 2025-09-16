# Vanity CDN Setup Guide

## Overview
Configure vanity CDN domains to ensure complete stealth deployment where only client domains appear in browser network tabs.

## DNS Configuration

### For Each Client Domain
Configure the following CNAME records in the client's DNS:

```
assets.CLIENTDOMAIN.com     CNAME   cdn.ritzie.ai
telemetry.CLIENTDOMAIN.com  CNAME   events.ritzie.ai
```

### Example for Pilot Organizations

**Pilot Org A (pilot-a.example.com):**
```
assets.pilot-a.example.com     CNAME   cdn.ritzie.ai
telemetry.pilot-a.example.com  CNAME   events.ritzie.ai
```

**Pilot Org B (pilot-b.example.com):**
```
assets.pilot-b.example.com     CNAME   cdn.ritzie.ai
telemetry.pilot-b.example.com  CNAME   events.ritzie.ai
```

## Environment Configuration

Update the production environment variables:

```bash
# For Pilot Org A
ASSETS_CDN_BASE=https://assets.pilot-a.example.com
TELEMETRY_BASE=https://telemetry.pilot-a.example.com

# For Pilot Org B  
ASSETS_CDN_BASE=https://assets.pilot-b.example.com
TELEMETRY_BASE=https://telemetry.pilot-b.example.com
```

## Embed Snippet Updates

Update client embed snippets to use vanity domains:

```html
<script>
  window.RITZIE = {
    siteToken: "SITE_live_a",
    botId: "BOT_ID_HERE",
    assetsBase: "https://assets.pilot-a.example.com",
    telemetryBase: "https://telemetry.pilot-a.example.com"
  };
</script>
<script src="https://assets.pilot-a.example.com/embeds/chat.v1.js" async></script>
```

## Verification Steps

### 1. DNS Propagation Check
```bash
dig assets.pilot-a.example.com CNAME
# Should return: assets.pilot-a.example.com. 300 IN CNAME cdn.ritzie.ai.

dig telemetry.pilot-a.example.com CNAME  
# Should return: telemetry.pilot-a.example.com. 300 IN CNAME events.ritzie.ai.
```

### 2. SSL Certificate Verification
```bash
curl -I https://assets.pilot-a.example.com/embeds/chat.v1.js
# Should return 200 OK with valid SSL certificate
```

### 3. Network Tab Stealth Check
1. Open client website with embed snippet
2. Open browser DevTools → Network tab
3. Verify only client vanity domains appear
4. No "ritzie.ai" or "cdn.ritzie.ai" should be visible

## Troubleshooting

### DNS Issues
- **Propagation Delay**: DNS changes can take 24-48 hours to fully propagate
- **TTL Settings**: Ensure CNAME records have appropriate TTL (300-3600 seconds)
- **Subdomain Conflicts**: Verify no existing A records conflict with CNAME

### SSL Certificate Issues
- **Certificate Mismatch**: CDN automatically provisions SSL for CNAME domains
- **Mixed Content**: Ensure all assets use HTTPS URLs
- **Certificate Validation**: May take 10-15 minutes after DNS propagation

### Performance Considerations
- **CDN Edge Locations**: Assets served from global edge network
- **Cache Headers**: Immutable assets cached for 1 year
- **Compression**: Gzip/Brotli compression enabled automatically

## Security Headers

Update CSP headers to use vanity domains:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://assets.CLIENTDOMAIN.com;
  style-src 'self' 'unsafe-inline' https://assets.CLIENTDOMAIN.com;
  connect-src 'self' https://api.ritzie.ai https://telemetry.CLIENTDOMAIN.com;
  img-src 'self' data: https:;
```

## Monitoring

### Health Checks
- Monitor vanity domain availability every 5 minutes
- Alert on 4xx/5xx responses from vanity endpoints
- Track SSL certificate expiration dates

### Analytics
- Verify telemetry events reach analytics pipeline
- Monitor for CORS errors in browser console
- Track asset load times from vanity domains

---

**Status**: Ready for client DNS configuration
**Next Steps**: Coordinate with client IT teams for DNS changes
