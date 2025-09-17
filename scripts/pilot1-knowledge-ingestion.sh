#!/bin/bash

echo "🧠 Pilot-1 Knowledge Ingestion Demo"
echo "=================================="

SITE_TOKEN="SITE_pilot1"
BOT_ID="550e8400-e29b-41d4-a716-446655440501"
API_BASE="http://localhost:8082"

echo "📄 Creating sample PDF content..."
cat > /tmp/pilot1_faq.txt << 'EOF'

We offer a 30-day return policy for all products. Items must be in original condition with tags attached.

You can track your order using the tracking number sent to your email. Visit our tracking page and enter your order number.

Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.

You can reach our support team via:
- Email: support@pilot1company.com
- Phone: 1-800-PILOT1
- Live chat on our website

We accept all major credit cards, PayPal, Apple Pay, and Google Pay.

Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer support.
EOF

echo "📚 Simulating PDF upload..."
echo "POST $API_BASE/v1/knowledge/uploads"
echo "Content: Sample FAQ document with 6 common questions"
echo "✅ PDF upload would be queued for processing"

echo ""
echo "🌐 Simulating URL crawl..."
echo "POST $API_BASE/v1/knowledge/urls"
echo "URL: https://pilot1company.com/help"
echo "Depth: 2 (help page + linked articles)"
echo "✅ URL crawl would be queued for processing"

echo ""
echo "🔍 Testing knowledge search..."
curl -s "$API_BASE/v1/knowledge/search?site_token=$SITE_TOKEN&q=return%20policy&k=3" | jq '.'

echo ""
echo "📊 Knowledge Base Status:"
echo "- Sample FAQ: 6 questions covering returns, shipping, support"
echo "- Help Center: Product guides, troubleshooting, policies"
echo "- Search Coverage: Returns, shipping, payments, support contact"
echo ""
echo "✅ Knowledge ingestion demo complete"
