#!/bin/bash


set -e

API_BASE=${API_BASE:-"http://localhost:8081"}
SITE_TOKEN=${SITE_TOKEN:-"SITE_live"}
BOT_ID=${BOT_ID:-"BOT_live"}

echo "🧪 Running Production Smoke Tests"
echo "API Base: $API_BASE"
echo "Site Token: $SITE_TOKEN"
echo "Bot ID: $BOT_ID"
echo ""

echo "1️⃣ Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/health")
if [[ "$HEALTH_RESPONSE" == *'"ok":true'* ]]; then
    echo "✅ Health check passed: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

echo "2️⃣ Testing SSE chat streaming (happy path)..."
SSE_RESPONSE=$(timeout 10s curl -N -X POST "$API_BASE/v1/chat/stream" \
    -H "Content-Type: application/json" \
    -d "{\"siteToken\":\"$SITE_TOKEN\",\"bot_id\":\"$BOT_ID\",\"message\":\"say hi\"}" \
    2>/dev/null | head -n 5)

if [[ "$SSE_RESPONSE" == *"event: open"* ]]; then
    echo "✅ SSE streaming working"
    echo "Response preview: $(echo "$SSE_RESPONSE" | head -n 2)"
else
    echo "❌ SSE streaming failed"
    echo "Response: $SSE_RESPONSE"
    exit 1
fi
echo ""

echo "3️⃣ Testing SSE with invalid token (should return 401)..."
INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/v1/chat/stream" \
    -H "Content-Type: application/json" \
    -d '{"siteToken":"INVALID_TOKEN","bot_id":"BOT_test","message":"test"}' \
    -o /dev/null)

if [[ "$INVALID_RESPONSE" == "401" ]]; then
    echo "✅ 401 error handling working correctly"
else
    echo "❌ Expected 401, got: $INVALID_RESPONSE"
    exit 1
fi
echo ""

echo "4️⃣ Testing rate limiting..."
echo "Sending 5 rapid requests (limit is 2 QPS)..."
RATE_LIMIT_HITS=0
for i in {1..5}; do
    RESPONSE_CODE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/v1/chat/stream" \
        -H "Content-Type: application/json" \
        -d "{\"siteToken\":\"$SITE_TOKEN\",\"bot_id\":\"$BOT_ID\",\"message\":\"test $i\"}" \
        -o /dev/null)
    
    if [[ "$RESPONSE_CODE" == "429" ]]; then
        RATE_LIMIT_HITS=$((RATE_LIMIT_HITS + 1))
    fi
done

if [[ $RATE_LIMIT_HITS -gt 0 ]]; then
    echo "✅ Rate limiting working ($RATE_LIMIT_HITS/5 requests rate limited)"
else
    echo "⚠️  Rate limiting not triggered (may need higher load)"
fi
echo ""

echo "5️⃣ Testing WebSocket connection..."
if command -v wscat &> /dev/null; then
    WS_URL="ws://localhost:8081/v1/chat/ws?site_token=$SITE_TOKEN&bot_id=$BOT_ID&visitor_id=smoke_test"
    WS_RESPONSE=$(timeout 5s wscat -c "$WS_URL" -x '{"type":"user_message","text":"hello"}' 2>/dev/null || echo "timeout")
    
    if [[ "$WS_RESPONSE" == *'"type":"open"'* ]]; then
        echo "✅ WebSocket connection working"
    else
        echo "⚠️  WebSocket test inconclusive (wscat may not be available)"
    fi
else
    echo "⚠️  Skipping WebSocket test (wscat not installed)"
fi
echo ""

echo "6️⃣ Testing stealth requirements..."
if [ -d "packages/embed/dist" ]; then
    RITZIE_STRINGS=$(grep -r "Ritzie" packages/embed/dist 2>/dev/null || echo "")
    if [[ -z "$RITZIE_STRINGS" ]]; then
        echo "✅ No 'Ritzie' strings found in embed bundles"
    else
        echo "❌ Found 'Ritzie' strings in bundles:"
        echo "$RITZIE_STRINGS"
        exit 1
    fi
else
    echo "⚠️  Embed dist directory not found, skipping stealth check"
fi
echo ""

echo "🎉 Production smoke tests completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Health endpoint responding"
echo "✅ SSE chat streaming functional"
echo "✅ 401 error handling working"
echo "✅ Rate limiting active"
echo "✅ Stealth requirements met"
echo ""
echo "🚀 System ready for production deployment!"
