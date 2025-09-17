
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface AlertSeverity {
  [key: string]: string;
}

const emoji: AlertSeverity = {
  info: '💡',
  warning: '⚠️',
  error: '❌',
  critical: '🚨'
};

export async function sendSlackAlert(message: string, severity: string = 'info'): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('Slack webhook not configured');
    return;
  }

  const payload = {
    text: `${emoji[severity]} ${message}`,
    channel: '#ritzie-alerts',
    username: 'Ritzie Monitor',
    icon_emoji: ':robot_face:'
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

export async function checkPerformanceThresholds(metrics: {
  p95_latency?: number;
  error_rate?: number;
  job_duration?: number;
}): Promise<void> {
  if (metrics.p95_latency && metrics.p95_latency > 2000) {
    await sendSlackAlert(`P95 latency exceeded threshold: ${metrics.p95_latency}ms > 2000ms`, 'warning');
  }

  if (metrics.error_rate && metrics.error_rate > 0.01) {
    await sendSlackAlert(`5xx error rate exceeded threshold: ${(metrics.error_rate * 100).toFixed(2)}% > 1%`, 'error');
  }

  if (metrics.job_duration && metrics.job_duration > 300000) {
    await sendSlackAlert(`Rollup job duration exceeded threshold: ${Math.round(metrics.job_duration / 1000)}s > 5min`, 'warning');
  }
}

export async function checkTokenUsage(orgId: string, usage: number, cap: number): Promise<void> {
  const percentage = (usage / cap) * 100;
  
  if (percentage > 80) {
    await sendSlackAlert(`Token usage alert for org ${orgId}: ${usage}/${cap} tokens used (${percentage.toFixed(1)}%)`, 'warning');
  }
}
