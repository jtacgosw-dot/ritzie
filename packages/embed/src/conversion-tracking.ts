export interface ConversionEvent {
  type: 'conversion';
  cta_type: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  theme_version?: string;
  layout_mode?: string;
  visitor_id: string;
  ts: number;
}

export function trackConversion(ctaType: string, visitorId: string, themeVersion?: string, layoutMode?: string): void {
  const urlParams = new URLSearchParams(window.location.search);
  
  const conversionEvent: ConversionEvent = {
    type: 'conversion',
    cta_type: ctaType,
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    theme_version: themeVersion,
    layout_mode: layoutMode,
    visitor_id: visitorId,
    ts: Date.now()
  };

  console.log('[CONVERSION]', conversionEvent);

  if (typeof window !== 'undefined' && (window as any).CHATBOT?.onConversion) {
    (window as any).CHATBOT.onConversion(conversionEvent);
  }
}

export function addConversionCTA(container: HTMLElement, visitorId: string, themeVersion?: string, layoutMode?: string): void {
  const ctaButton = document.createElement('button');
  ctaButton.textContent = 'Talk to Sales';
  ctaButton.className = 'ritzie-cta-button';
  ctaButton.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin: 8px 0;
  `;
  
  ctaButton.addEventListener('click', () => {
    trackConversion('talk_to_sales', visitorId, themeVersion, layoutMode);
    
    window.open('mailto:sales@example.com?subject=Sales Inquiry from Chat Widget', '_blank');
  });
  
  container.appendChild(ctaButton);
}
