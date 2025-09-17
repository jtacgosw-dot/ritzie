#!/usr/bin/env node

const API_BASE = 'http://localhost:8082';
const SITE_TOKEN = 'SITE_pilot1';

const questions = [
  "What is your return policy?",
  "How can I track my order?", 
  "What payment methods do you accept?",
  "How do I contact customer support?",
  "Do you ship internationally?"
];

async function runSmokeTest() {
  console.log('🧪 Pilot-1 Knowledge Base - 5-Question Smoke Test');
  console.log('================================================');
  
  const results = [];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n${i+1}. Question: "${question}"`);
    
    try {
      const response = await fetch(
        `${API_BASE}/v1/knowledge/search?site_token=${SITE_TOKEN}&q=${encodeURIComponent(question)}&k=3`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0];
        console.log(`   ✅ Answer: ${topResult.content.substring(0, 200)}...`);
        console.log(`   📄 Citation: ${topResult.title || topResult.source} (score: ${topResult.score?.toFixed(3) || 'N/A'})`);
        
        results.push({
          question,
          answer: topResult.content,
          citation: topResult.title || topResult.source,
          score: topResult.score,
          confidence: topResult.score > 0.7 ? 'HIGH' : topResult.score > 0.4 ? 'MEDIUM' : 'LOW'
        });
      } else {
        console.log(`   ❌ No results found`);
        results.push({
          question,
          answer: 'No answer found',
          citation: 'None',
          score: 0,
          confidence: 'NONE'
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        question,
        answer: `Error: ${error.message}`,
        citation: 'Error',
        score: 0,
        confidence: 'ERROR'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 SMOKE TEST SUMMARY');
  console.log('=====================');
  
  const highConfidence = results.filter(r => r.confidence === 'HIGH').length;
  const mediumConfidence = results.filter(r => r.confidence === 'MEDIUM').length;
  const lowConfidence = results.filter(r => r.confidence === 'LOW').length;
  const noAnswer = results.filter(r => r.confidence === 'NONE' || r.confidence === 'ERROR').length;
  
  console.log(`High Confidence: ${highConfidence}/5`);
  console.log(`Medium Confidence: ${mediumConfidence}/5`);
  console.log(`Low Confidence: ${lowConfidence}/5`);
  console.log(`No Answer: ${noAnswer}/5`);
  
  if (noAnswer > 2) {
    console.log('\n⚠️  WARNING: More than 2 questions have no answers - KB needs improvement');
  } else if (highConfidence >= 3) {
    console.log('\n✅ PASS: Knowledge base is performing well');
  } else {
    console.log('\n⚠️  CAUTION: Knowledge base needs some improvement');
  }
  
  console.log('\n📋 QUESTION → ANSWER → CITATION TABLE');
  console.log('=====================================');
  results.forEach((result, i) => {
    console.log(`${i+1}. ${result.question}`);
    console.log(`   Answer: ${result.answer.substring(0, 150)}...`);
    console.log(`   Citation: ${result.citation} (${result.confidence})`);
    console.log('');
  });
}

runSmokeTest().catch(console.error);
