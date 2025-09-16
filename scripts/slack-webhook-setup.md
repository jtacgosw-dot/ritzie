# Slack Webhook Setup for Monitoring Alerts

## Overview
Configure Slack webhook integration for #ritzie-alerts channel to receive production monitoring notifications.

## Webhook Configuration

### 1. Create Slack Webhook
1. Go to https://api.slack.com/apps
2. Create new app or select existing app
3. Navigate to "Incoming Webhooks"
4. Activate incoming webhooks
5. Add new webhook to workspace
6. Select #ritzie-alerts channel
7. Copy webhook URL

### 2. Environment Configuration
Add webhook URL to production environment:

```bash
# Add to .env.prod
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Alert Types

#### Health Endpoint Failures
- **Trigger**: `/health` endpoint returns non-200 status
- **Frequency**: Immediate notification
- **Message**: "🚨 Health check failed: {status} {response}"

#### 5xx Error Rate Spikes
- **Trigger**: >1% 5xx error rate over 5-minute window
- **Frequency**: Immediate notification
- **Message**: "⚠️ High error rate: {percentage}% 5xx errors in last 5 minutes"

#### Job Failures
- **Trigger**: FAQ aggregation or analytics rollup job fails
- **Frequency**: Immediate notification
- **Message**: "❌ Job failed: {job_name} - {error_message}"

#### Token Usage Alerts
- **Trigger**: Daily token usage >80% of cap
- **Frequency**: Daily digest at 9 AM
- **Message**: "📊 Token usage alert: {usage}/{cap} tokens used ({percentage}%)"

### 4. Implementation Example

```javascript
// Add to apps/gateway/src/utils/alerts.js
import fetch from 'node-fetch';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function sendSlackAlert(message, severity = 'info') {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('Slack webhook not configured');
    return;
  }

  const emoji = {
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  const payload = {
    text: `${emoji[severity]} ${message}`,
    channel: '#ritzie-alerts',
    username: 'Ritzie Monitor',
    icon_emoji: ':robot_face:'
  };

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}
```

### 5. Health Check Integration

```javascript
// Add to apps/gateway/src/index.ts
import { sendSlackAlert } from './utils/alerts.js';

app.get("/health", async (_req, res) => {
  try {
    // Existing health checks...
    res.json({ ok: true });
  } catch (error) {
    await sendSlackAlert(`Health check failed: ${error.message}`, 'error');
    res.status(500).json({ ok: false, error: error.message });
  }
});
```

### 6. Monitoring Schedule

#### Continuous Monitoring
- Health endpoint: Every 60 seconds
- Error rate tracking: Every 5 minutes
- Job status monitoring: Real-time

#### Daily Reports
- Token usage summary: 9 AM daily
- FAQ aggregation results: 3 AM daily (after job completion)
- Performance metrics: 10 AM daily

### 7. Alert Escalation

#### Level 1: Slack Notifications
- All alerts go to #ritzie-alerts
- Team members can acknowledge and respond

#### Level 2: Critical Alerts
- Health endpoint down >5 minutes
- Error rate >5% for >10 minutes
- Complete service outage

#### Level 3: Emergency Response
- Data breach or security incident
- Complete system failure
- Customer-facing outage >30 minutes

### 8. Testing Alerts

```bash
# Test webhook connectivity
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"🧪 Test alert from Ritzie monitoring system"}'

# Test health check alert
curl -X POST http://localhost:8080/test-alert \
  -H 'Content-Type: application/json' \
  -d '{"type":"health_check_failure","message":"Test alert"}'
```

### 9. Alert Suppression

#### Maintenance Windows
- Suppress alerts during planned maintenance
- Configure maintenance mode in environment
- Resume alerts after maintenance completion

#### Rate Limiting
- Prevent alert spam with rate limiting
- Maximum 1 alert per type per 5 minutes
- Batch similar alerts into single notification

---

**Status**: Ready for webhook URL configuration
**Next Steps**: Obtain Slack webhook URL and add to production environment
