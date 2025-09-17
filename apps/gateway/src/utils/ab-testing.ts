export interface ABTestConfig {
  enabled: boolean;
  variantA: string;
  variantB: string;
}

export function getVisitorVariant(visitorId: string, testConfig: ABTestConfig): string {
  if (!testConfig.enabled) {
    return testConfig.variantA || 'bubble';
  }

  let hash = 0;
  for (let i = 0; i < visitorId.length; i++) {
    const char = visitorId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const normalized = Math.abs(hash) % 1000;
  const variant = normalized < 500 ? testConfig.variantA : testConfig.variantB;
  
  console.log(`[A/B TEST] Visitor ${visitorId} (hash: ${normalized}) assigned to variant: ${variant}`);
  
  return variant || 'bubble';
}

export function tagAnalyticsWithVariant(event: any, variant: string, testId?: string): any {
  return {
    ...event,
    ab_test_variant: variant,
    ab_test_id: testId,
    theme_version: event.theme_version || '1.0.0',
    layout_mode: variant
  };
}
