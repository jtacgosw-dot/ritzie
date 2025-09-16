# Ritzie Pilot Deployment Checklist

## 🎯 Pre-Deployment

- [ ] **API Key Configured**: Real OpenAI API key in production environment
- [ ] **Guardrails Active**: Rate limiting (2 QPS) and token caps (200k/day) enabled
- [ ] **Stealth Verified**: No "Ritzie" strings in client-visible assets
- [ ] **Vanity CDN**: Client DNS configured for first-party asset loading
- [ ] **Security Headers**: CSP configuration provided to client

## 🚀 Deployment Steps

### 1. Infrastructure
```bash
# Deploy production stack
docker compose -f docker-compose.prod.yml up -d --build

# Initialize database
psql $DATABASE_URL -f infra/db/schema.sql
psql $DATABASE_URL -f scripts/setup-demo-data.sql
```

### 2. Smoke Tests
```bash
# Run comprehensive tests
./scripts/prod-smoke-tests.sh

# Expected: All ✅ green checkmarks
```

### 3. Client Integration
```html
<!-- Provide this embed snippet -->
<script>
  window.RITZIE = {
    siteToken: "SITE_live",
    botId: "BOT_live", 
    assetsBase: "https://assets.clientdomain.com"
  };
</script>
<script src="https://assets.clientdomain.com/embeds/chat.v1.js" async></script>
```

## 🧪 Pilot Testing

### Functional Tests
- [ ] **Widget Loads**: Chat bubble appears on client site
- [ ] **First Response**: <2s latency for simple queries
- [ ] **Knowledge Integration**: Upload 1 PDF, verify citations
- [ ] **Analytics Tracking**: Events captured in dashboard
- [ ] **Error Handling**: Graceful fallbacks on API failures

### Stealth Verification
- [ ] **Network Tab**: Only client vanity domains visible
- [ ] **Source Code**: No "Ritzie" references in minified assets
- [ ] **Theme Isolation**: No cross-tenant style bleeding
- [ ] **Cache Headers**: Proper ETags and immutable assets

### Security Tests
- [ ] **Invalid Tokens**: Return 401/4401 errors
- [ ] **Rate Limiting**: 429 responses after 2 QPS
- [ ] **Token Budgets**: Daily caps enforced per org
- [ ] **PII Protection**: No sensitive data in logs

## 📊 Success Metrics

### Performance Targets
- **First Token**: <600ms (warm)
- **Complete Response**: <2s p95
- **Uptime**: >99.9%
- **Error Rate**: <1%

### Business Metrics
- **Open Rate**: >15%
- **Messages/Session**: >2.5
- **CSAT Score**: >4.0/5
- **Containment**: >70%

## 🚨 Escalation Paths

### Technical Issues
1. **Check Health**: `curl -s https://api.ritzie.ai/health`
2. **Review Logs**: Docker Compose logs for errors
3. **OpenAI Status**: Verify API availability
4. **Slack Alert**: #ritzie-alerts for urgent issues

### Client Feedback
1. **Widget UX**: Theme adjustments via dashboard
2. **Response Quality**: Knowledge base tuning
3. **Performance**: Model/timeout optimizations
4. **Analytics**: Custom event tracking

## 📋 Handoff Deliverables

### Technical Package
- [ ] **Embed Snippet**: Production-ready HTML
- [ ] **CSP Configuration**: Security headers
- [ ] **Setup Guide**: 5-minute integration steps
- [ ] **Troubleshooting**: Common issues and fixes

### Documentation
- [ ] **API Reference**: Endpoint specifications
- [ ] **Analytics Guide**: Event tracking and dashboards
- [ ] **Knowledge Management**: Upload and crawl workflows
- [ ] **Incident Playbook**: Emergency procedures

### Support Materials
- [ ] **Demo Video**: Widget integration walkthrough
- [ ] **FAQ Document**: Common questions and answers
- [ ] **Contact Info**: Support channels and escalation
- [ ] **SLA Agreement**: Performance and availability commitments

## ✅ Go-Live Approval

**Technical Lead**: _________________ Date: _________

**Product Manager**: _________________ Date: _________

**Client Stakeholder**: _________________ Date: _________

---

**Pilot Status**: READY FOR DEPLOYMENT 🚀

All production systems tested and verified. Client integration package complete. Monitoring and incident response procedures in place.
