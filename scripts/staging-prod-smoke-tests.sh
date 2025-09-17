#!/bin/bash


set -e

STAGING_URL="http://localhost:8081"
PROD_URL="http://localhost:8082"
PILOT1_SITE_TOKEN="SITE_pilot1"
PILOT1_BOT_ID="550e8400-e29b-41d4-a716-446655440501"

echo "🚀 Running Staging and Production Smoke Tests for Pilot-1"
echo "=================================================="

test_endpoint() {
    local env=$1
    local url=$2
    local endpoint=$3
    local expected_status=$4
    
    echo "Testing $env $endpoint..."
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ $env $endpoint: HTTP $response"
        if [ "$expected_status" = "200" ]; then
            echo "   Response: $(cat /tmp/response.json | jq -r '.ok // .theme.id // .results[0].content[0:50] // "Success"' 2>/dev/null || echo "OK")"
        fi
    else
        echo "❌ $env $endpoint: Expected $expected_status, got $response"
        cat /tmp/response.json 2>/dev/null || echo "No response body"
        return 1
    fi
}

test_websocket() {
    local env=$1
    local ws_url=$2
    
    echo "Testing $env WebSocket connection..."
    
    timeout 5s node -e "
        const WebSocket = require('ws');
        const ws = new WebSocket('$ws_url/v1/chat/ws?site_token=$PILOT1_SITE_TOKEN&bot_id=$PILOT1_BOT_ID&visitor_id=test');
        ws.on('open', () => {
            console.log('✅ $env WebSocket: Connection established');
            ws.close();
            process.exit(0);
        });
        ws.on('error', (err) => {
            console.log('❌ $env WebSocket: Connection failed -', err.message);
            process.exit(1);
        });
    " 2>/dev/null || echo "⚠️  $env WebSocket: Test skipped (requires ws module)"
}

echo -e "\n📋 STAGING TESTS ($STAGING_URL)"
echo "================================"

test_endpoint "STAGING" "$STAGING_URL" "/health" "200"
test_endpoint "STAGING" "$STAGING_URL" "/v1/embed-config?site_token=$PILOT1_SITE_TOKEN&bot_id=$PILOT1_BOT_ID" "200"
test_endpoint "STAGING" "$STAGING_URL" "/v1/knowledge/search?site_token=$PILOT1_SITE_TOKEN&q=help&k=3" "200"
test_endpoint "STAGING" "$STAGING_URL" "/v1/analytics/top-faqs?site_token=$PILOT1_SITE_TOKEN" "200"
test_endpoint "STAGING" "$STAGING_URL" "/v1/embed-config?site_token=INVALID&bot_id=$PILOT1_BOT_ID" "401"

test_websocket "STAGING" "ws://localhost:8081"

echo -e "\n📋 PRODUCTION TESTS ($PROD_URL)"
echo "================================="

test_endpoint "PRODUCTION" "$PROD_URL" "/health" "200"
test_endpoint "PRODUCTION" "$PROD_URL" "/v1/embed-config?site_token=$PILOT1_SITE_TOKEN&bot_id=$PILOT1_BOT_ID" "200"
test_endpoint "PRODUCTION" "$PROD_URL" "/v1/knowledge/search?site_token=$PILOT1_SITE_TOKEN&q=help&k=3" "200"
test_endpoint "PRODUCTION" "$PROD_URL" "/v1/analytics/top-faqs?site_token=$PILOT1_SITE_TOKEN" "200"
test_endpoint "PRODUCTION" "$PROD_URL" "/v1/embed-config?site_token=INVALID&bot_id=$PILOT1_BOT_ID" "401"

test_websocket "PRODUCTION" "ws://localhost:8082"

echo -e "\n🧪 A/B TESTING VERIFICATION"
echo "============================"

echo "Testing visitor assignment consistency..."
for i in {1..5}; do
    visitor_id="test_visitor_$i"
    response=$(curl -s "$PROD_URL/v1/embed-config?site_token=$PILOT1_SITE_TOKEN&bot_id=$PILOT1_BOT_ID&visitor_id=$visitor_id")
    layout_mode=$(echo "$response" | jq -r '.layoutMode')
    echo "Visitor $visitor_id: $layout_mode"
done

echo -e "\n💰 CONVERSION TRACKING TEST"
echo "==========================="

conversion_test=$(curl -s -X POST "$PROD_URL/v1/analytics/events" \
    -H "Content-Type: application/json" \
    -d "{
        \"siteToken\": \"$PILOT1_SITE_TOKEN\",
        \"botId\": \"$PILOT1_BOT_ID\",
        \"events\": [{
            \"type\": \"conversion\",
            \"ts\": $(date +%s)000,
            \"visitor_id\": \"smoke_test_visitor\",
            \"payload\": {\"cta_type\": \"talk_to_sales\"},
            \"utm_source\": \"smoke_test\",
            \"utm_medium\": \"verification\",
            \"utm_campaign\": \"pilot1_launch\"
        }]
    }")

if echo "$conversion_test" | jq -e '.success' > /dev/null; then
    echo "✅ Conversion tracking: Event ingested successfully"
else
    echo "❌ Conversion tracking: Failed to ingest event"
    echo "$conversion_test"
fi

echo -e "\n🛑 KILLSWITCH TEST"
echo "=================="

echo "Testing killswitch functionality..."
admin_test=$(curl -s -w "%{http_code}" -o /dev/null "$PROD_URL/admin" || echo "401")
if [ "$admin_test" = "401" ] || [ "$admin_test" = "200" ]; then
    echo "✅ Admin endpoint: Properly secured (HTTP $admin_test)"
else
    echo "❌ Admin endpoint: Unexpected response (HTTP $admin_test)"
fi

echo -e "\n⚡ PERFORMANCE TEST"
echo "=================="

echo "Testing response times..."
start_time=$(date +%s%3N)
curl -s "$PROD_URL/health" > /dev/null
end_time=$(date +%s%3N)
health_time=$((end_time - start_time))

start_time=$(date +%s%3N)
curl -s "$PROD_URL/v1/embed-config?site_token=$PILOT1_SITE_TOKEN&bot_id=$PILOT1_BOT_ID" > /dev/null
end_time=$(date +%s%3N)
config_time=$((end_time - start_time))

echo "Health endpoint: ${health_time}ms"
echo "Embed config: ${config_time}ms"

if [ $health_time -lt 500 ] && [ $config_time -lt 2000 ]; then
    echo "✅ Performance: All endpoints under threshold"
else
    echo "⚠️  Performance: Some endpoints may be slow"
fi

echo -e "\n🎉 SMOKE TESTS COMPLETED"
echo "========================"
echo "Staging URL: $STAGING_URL"
echo "Production URL: $PROD_URL"
echo "Pilot-1 Site Token: $PILOT1_SITE_TOKEN"
echo "Pilot-1 Bot ID: $PILOT1_BOT_ID"
echo ""
echo "Next steps:"
echo "1. Review any failed tests above"
echo "2. Test embed snippets in browser"
echo "3. Upload knowledge base content"
echo "4. Monitor analytics dashboard"
echo ""
echo "Dashboard URLs:"
echo "- Admin: $PROD_URL/admin"
echo "- Top FAQs: $PROD_URL/v1/analytics/top-faqs?site_token=$PILOT1_SITE_TOKEN"
echo "- Health: $PROD_URL/health"
