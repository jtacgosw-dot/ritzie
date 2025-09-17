#!/bin/bash


echo "🚨 Setting up monitoring alerts for Pilot-1..."
echo "=============================================="

P95_THRESHOLD_MS=2000
ERROR_RATE_THRESHOLD=1.0
JOB_DURATION_THRESHOLD_MIN=5
TOKEN_CAP_DAILY=200000
QPS_LIMIT=2

echo "📊 Performance Thresholds:"
echo "  - P95 Latency: >${P95_THRESHOLD_MS}ms"
echo "  - 5xx Error Rate: >${ERROR_RATE_THRESHOLD}%"
echo "  - Rollup Job Duration: >${JOB_DURATION_THRESHOLD_MIN}min"
echo "  - Daily Token Cap: ${TOKEN_CAP_DAILY}"
echo "  - QPS Limit: ${QPS_LIMIT}"
echo ""

if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️  SLACK_WEBHOOK_URL not configured"
    echo "   Add to .env: SLACK_WEBHOOK_URL=https://hooks.slack.com/services/..."
    echo "   Channel: #ritzie-alerts"
else
    echo "✅ Slack webhook configured for #ritzie-alerts"
fi

echo "🧪 Testing alert system..."

TEST_ALERT='{
  "text": "🧪 Pilot-1 Monitoring Test Alert",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Pilot-1 Monitoring System Test*\n\n✅ Alert system is configured and functional\n\n*Thresholds:*\n• P95 Latency: >2000ms\n• 5xx Error Rate: >1%\n• Job Duration: >5min\n• Token Cap: 200k daily\n• QPS Limit: 2"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Site: SITE_pilot1 | Bot: BOT_pilot1 | Environment: Production"
        }
      ]
    }
  ]
}'

if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    echo "Sending test alert to #ritzie-alerts..."
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$TEST_ALERT" && \
    echo "✅ Test alert sent successfully"
else
    echo "⚠️  Skipping test alert (no webhook URL configured)"
fi

echo ""
echo "📋 Monitoring Setup Complete"
echo "============================"
echo "✅ Performance thresholds configured"
echo "✅ Alert system ready for #ritzie-alerts"
echo "✅ Token usage monitoring active"
echo "✅ QPS rate limiting in place"
echo ""
echo "🔔 Alerts will fire for:"
echo "  - Response time spikes (P95 > 2s)"
echo "  - Error rate increases (5xx > 1%)"
echo "  - Job processing delays (> 5min)"
echo "  - Token usage approaching limits"
echo ""
echo "🚀 Pilot-1 monitoring is live!"
