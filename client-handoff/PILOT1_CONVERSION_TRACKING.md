# Pilot-1 Conversion Tracking Setup

## "Talk to Sales" CTA Implementation

### 1. Bot Configuration
The Pilot-1 bot includes a "Talk to sales" CTA that fires conversion events with UTM context.

### 2. Conversion Event Structure
```javascript
{
  type: 'conversion',
  ts: Date.now(),
  visitor_id: 'visitor_123',
  payload: {
    cta_type: 'talk_to_sales',
    utm_source: 'website',
    utm_medium: 'chatbot',
    utm_campaign: 'pilot1',
    utm_content: 'talk_to_sales_cta'
  }
}
```

### 3. Client Button Attribution
For client-rendered buttons that should track conversions:

```html
<button data-ritzie-attribution="talk_to_sales" 
        data-utm-source="website" 
        data-utm-medium="button" 
        data-utm-campaign="pilot1">
  Contact Sales
</button>
```

### 4. Analytics Dashboard
Conversion events are tracked in the analytics dashboard with:
- Conversion rate by UTM parameters
- Attribution source analysis
- Time-to-conversion metrics
- A/B test variant performance

### 5. Verification
Test conversion tracking:
```bash
curl -X POST http://localhost:8082/v1/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "siteToken": "SITE_pilot1",
    "botId": "550e8400-e29b-41d4-a716-446655440501",
    "events": [{
      "type": "conversion",
      "ts": 1694876400000,
      "visitor_id": "test_visitor",
      "payload": {
        "cta_type": "talk_to_sales",
        "utm_source": "test",
        "utm_medium": "pilot",
        "utm_campaign": "verification"
      }
    }]
  }'
```

## Success Metrics
- Conversion rate ≥ 2% of chat sessions
- Attribution tracking accuracy ≥ 95%
- UTM parameter capture rate ≥ 90%
