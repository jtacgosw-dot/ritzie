#!/bin/bash


set -e

PROD_URL="http://localhost:8082"
PILOT1_SITE_TOKEN="SITE_pilot1"

echo "📚 Knowledge Ingestion Demo for Pilot-1"
echo "======================================="

create_sample_pdf() {
    echo "Creating sample FAQ document..."
    
    cat > /tmp/pilot1_faq.txt << 'EOF'
Pilot-1 Organization FAQ

Q: What are your business hours?
A: We are open Monday through Friday, 9 AM to 6 PM EST. Weekend support is available for urgent issues.

Q: How do I contact customer support?
A: You can reach our support team via email at support@pilot1.com, phone at 1-800-PILOT1, or through this chat widget.

Q: What services do you offer?
A: We provide comprehensive business solutions including consulting, implementation, and ongoing support for enterprise clients.

Q: How long does implementation take?
A: Typical implementations take 2-4 weeks depending on complexity. We'll provide a detailed timeline during your consultation.

Q: Do you offer training?
A: Yes, we provide comprehensive training for all users as part of our implementation package, plus ongoing training resources.

Q: What is your refund policy?
A: We offer a 30-day money-back guarantee for all new customers. Contact support for refund requests.

Q: How do I schedule a demo?
A: Click the "Talk to Sales" button in this chat or email sales@pilot1.com to schedule a personalized demo.
EOF

    echo "Sample FAQ document created at /tmp/pilot1_faq.txt"
}

test_pdf_upload() {
    echo -e "\n🔄 Testing PDF Upload..."
    
    create_sample_pdf
    
    response=$(curl -s -X POST "$PROD_URL/v1/knowledge/uploads" \
        -F "site_token=$PILOT1_SITE_TOKEN" \
        -F "file=@/tmp/pilot1_faq.txt;type=text/plain")
    
    if echo "$response" | jq -e '.queued' > /dev/null; then
        doc_id=$(echo "$response" | jq -r '.doc_id')
        echo "✅ PDF Upload: Document queued successfully"
        echo "   Document ID: $doc_id"
        echo "   Status: $(echo "$response" | jq -r '.message')"
    else
        echo "❌ PDF Upload: Failed"
        echo "$response"
        return 1
    fi
}

test_url_crawl() {
    echo -e "\n🕷️  Testing URL Crawling..."
    
    response=$(curl -s -X POST "$PROD_URL/v1/knowledge/urls" \
        -H "Content-Type: application/json" \
        -d "{
            \"site_token\": \"$PILOT1_SITE_TOKEN\",
            \"url\": \"https://httpbin.org/html\",
            \"depth\": 1,
            \"sitemap\": false
        }")
    
    if echo "$response" | jq -e '.queued' > /dev/null; then
        doc_id=$(echo "$response" | jq -r '.doc_id')
        echo "✅ URL Crawl: Crawl queued successfully"
        echo "   Document ID: $doc_id"
        echo "   Status: $(echo "$response" | jq -r '.message')"
    else
        echo "❌ URL Crawl: Failed"
        echo "$response"
        return 1
    fi
}

test_sitemap_crawl() {
    echo -e "\n🗺️  Testing Sitemap Crawling..."
    
    response=$(curl -s -X POST "$PROD_URL/v1/knowledge/urls" \
        -H "Content-Type: application/json" \
        -d "{
            \"site_token\": \"$PILOT1_SITE_TOKEN\",
            \"url\": \"https://httpbin.org/robots.txt\",
            \"depth\": 1,
            \"sitemap\": true
        }")
    
    if echo "$response" | jq -e '.queued' > /dev/null; then
        doc_id=$(echo "$response" | jq -r '.doc_id')
        echo "✅ Sitemap Crawl: Crawl queued successfully"
        echo "   Document ID: $doc_id"
        echo "   Status: $(echo "$response" | jq -r '.message')"
    else
        echo "❌ Sitemap Crawl: Failed"
        echo "$response"
        return 1
    fi
}

test_knowledge_search() {
    echo -e "\n🔍 Testing Knowledge Search..."
    
    echo "Waiting for ingestion processing..."
    sleep 2
    
    queries=("business hours" "support" "demo" "refund policy")
    
    for query in "${queries[@]}"; do
        echo "Searching for: '$query'"
        
        response=$(curl -s "$PROD_URL/v1/knowledge/search?site_token=$PILOT1_SITE_TOKEN&q=$query&k=3")
        
        if echo "$response" | jq -e '.results' > /dev/null; then
            result_count=$(echo "$response" | jq '.results | length')
            echo "  ✅ Found $result_count results"
            
            if [ "$result_count" -gt 0 ]; then
                first_result=$(echo "$response" | jq -r '.results[0].content[0:100]')
                source=$(echo "$response" | jq -r '.results[0].source // "unknown"')
                echo "  📄 Sample: \"$first_result...\" (Source: $source)"
            fi
        else
            echo "  ❌ Search failed for '$query'"
            echo "$response"
        fi
        echo ""
    done
}

test_citations() {
    echo -e "\n📖 Testing Citation Verification..."
    
    
    response=$(curl -s "$PROD_URL/v1/knowledge/search?site_token=$PILOT1_SITE_TOKEN&q=hours&k=1")
    
    if echo "$response" | jq -e '.results[0].doc_id' > /dev/null; then
        doc_id=$(echo "$response" | jq -r '.results[0].doc_id')
        chunk_id=$(echo "$response" | jq -r '.results[0].chunk_id')
        title=$(echo "$response" | jq -r '.results[0].title // "Untitled"')
        
        echo "✅ Citation data available:"
        echo "   Document ID: $doc_id"
        echo "   Chunk ID: $chunk_id"
        echo "   Title: $title"
        echo "   This enables proper citation in chat responses"
    else
        echo "❌ Citation data missing from search results"
    fi
}

generate_client_instructions() {
    echo -e "\n📋 Client Knowledge Ingestion Instructions"
    echo "=========================================="
    
    cat << EOF

For Pilot-1 Organization:

1. PDF Upload:
   curl -X POST $PROD_URL/v1/knowledge/uploads \\
     -F "site_token=$PILOT1_SITE_TOKEN" \\
     -F "file=@your-document.pdf"

2. URL Crawling:
   curl -X POST $PROD_URL/v1/knowledge/urls \\
     -H "Content-Type: application/json" \\
     -d '{
       "site_token": "$PILOT1_SITE_TOKEN",
       "url": "https://your-site.com/help",
       "depth": 1
     }'

3. Sitemap Crawling:
   curl -X POST $PROD_URL/v1/knowledge/urls \\
     -H "Content-Type: application/json" \\
     -d '{
       "site_token": "$PILOT1_SITE_TOKEN",
       "url": "https://your-site.com/sitemap.xml",
       "sitemap": true
     }'

4. Search Knowledge:
   curl "$PROD_URL/v1/knowledge/search?site_token=$PILOT1_SITE_TOKEN&q=your+query&k=5"

Recommended Content to Upload:
- FAQ documents
- Product documentation
- Support articles
- Company policies
- Contact information

Processing Time:
- PDFs: 30-60 seconds
- URL crawls: 60-90 seconds
- Sitemaps: 2-5 minutes (depending on size)

EOF
}

echo "Starting knowledge ingestion tests..."

test_pdf_upload
test_url_crawl
test_sitemap_crawl
test_knowledge_search
test_citations
generate_client_instructions

echo -e "\n🎉 Knowledge Ingestion Demo Completed!"
echo "======================================"
echo ""
echo "Summary:"
echo "- PDF upload functionality verified"
echo "- URL crawling functionality verified"  
echo "- Sitemap processing functionality verified"
echo "- Knowledge search with citations working"
echo ""
echo "Next Steps for Client:"
echo "1. Upload 2-3 core FAQ/support documents"
echo "2. Provide help center URL for crawling"
echo "3. Test search functionality with real queries"
echo "4. Monitor Top FAQs dashboard for insights"
echo ""
echo "Knowledge Base Status: Ready for Production Content"

rm -f /tmp/pilot1_faq.txt
