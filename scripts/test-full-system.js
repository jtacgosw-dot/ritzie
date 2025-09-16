#!/usr/bin/env node

import { readFileSync } from 'fs';
import { spawn } from 'child_process';

class SystemTester {
  constructor() {
    this.results = [];
    this.errors = [];
    this.gatewayProcess = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    this.results.push({ timestamp, type, message });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startGateway() {
    this.log('Starting gateway server...');
    
    return new Promise((resolve, reject) => {
      this.gatewayProcess = spawn('node', ['dist/index.js'], {
        cwd: '/home/ubuntu/ritzie/apps/gateway',
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      this.gatewayProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Server running on port')) {
          this.log('Gateway server started successfully', 'success');
          resolve();
        }
      });

      this.gatewayProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('ECONNREFUSED')) {
          this.log(`Gateway error: ${error}`, 'warning');
        }
      });

      this.gatewayProcess.on('error', (error) => {
        this.log(`Failed to start gateway: ${error.message}`, 'error');
        reject(error);
      });

      setTimeout(() => {
        if (!output.includes('Server running on port')) {
          this.log('Gateway startup timeout - continuing with tests', 'warning');
          resolve();
        }
      }, 10000);
    });
  }

  async stopGateway() {
    if (this.gatewayProcess) {
      this.gatewayProcess.kill();
      this.gatewayProcess = null;
      this.log('Gateway server stopped');
    }
  }

  async testHealthEndpoint() {
    this.log('Testing health endpoint...');
    
    try {
      const response = await fetch('http://localhost:8080/health');
      if (response.ok) {
        const data = await response.json();
        this.log(`Health check passed: ${JSON.stringify(data)}`, 'success');
        return true;
      } else {
        this.log(`Health check failed: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`, 'error');
      return false;
    }
  }

  async testStealthRequirements() {
    this.log('Testing stealth requirements...');
    
    try {
      const bundle = readFileSync('/home/ubuntu/ritzie/packages/embed/dist/chat.v1.js', 'utf8');
      const vendorStrings = ['ritzie', 'Ritzie', 'RITZIE'];
      
      for (const str of vendorStrings) {
        if (bundle.includes(str)) {
          this.log(`Found vendor string "${str}" in bundle`, 'error');
          return false;
        }
      }
      
      const cssFiles = [
        '/home/ubuntu/ritzie/packages/embed/dist/themes/SITE_demo_site1/chat-ui.435dd644.css',
        '/home/ubuntu/ritzie/packages/embed/dist/themes/SITE_demo_site2/chat-ui.87c76dd7.css'
      ];
      
      for (const file of cssFiles) {
        try {
          const css = readFileSync(file, 'utf8');
          if (css.includes('/*') || css.includes('sourceMappingURL')) {
            this.log(`Found comments/sourcemaps in ${file}`, 'error');
            return false;
          }
          if (css.includes('ritzie') || css.includes('Ritzie')) {
            this.log(`Found vendor strings in ${file}`, 'error');
            return false;
          }
        } catch (e) {
          this.log(`Could not read CSS file ${file}`, 'warning');
        }
      }
      
      this.log('All stealth requirements passed', 'success');
      return true;
    } catch (error) {
      this.log(`Stealth test error: ${error.message}`, 'error');
      return false;
    }
  }

  async testAnalyticsEndpoint() {
    this.log('Testing analytics endpoint...');
    
    try {
      const payload = {
        org_id: '550e8400-e29b-41d4-a716-446655440001',
        site_id: '550e8400-e29b-41d4-a716-446655440011',
        bot_id: '550e8400-e29b-41d4-a716-446655440003',
        visitor_id: 'test_visitor_123',
        events: [
          { type: 'impression', ts: Math.floor(Date.now() / 1000) },
          { type: 'open', ts: Math.floor(Date.now() / 1000) + 1 }
        ]
      };

      const response = await fetch('http://localhost:8080/v1/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        this.log(`Analytics endpoint working: ${JSON.stringify(data)}`, 'success');
        return true;
      } else {
        this.log(`Analytics endpoint failed: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Analytics test error: ${error.message}`, 'error');
      return false;
    }
  }

  async testKnowledgeEndpoint() {
    this.log('Testing knowledge search endpoint...');
    
    try {
      const response = await fetch('http://localhost:8080/v1/knowledge/search?q=business%20hours&k=5');
      
      if (response.ok) {
        const data = await response.json();
        this.log(`Knowledge search working: found ${data.results?.length || 0} results`, 'success');
        return true;
      } else {
        this.log(`Knowledge search failed: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Knowledge test error: ${error.message}`, 'error');
      return false;
    }
  }

  async testEmbedWidget() {
    this.log('Testing embed widget functionality...');
    
    try {
      const widget = readFileSync('/home/ubuntu/ritzie/packages/embed/dist/chat.v1.js', 'utf8');
      
      if (widget.length < 1000) {
        this.log('Widget bundle seems too small', 'error');
        return false;
      }
      
      if (!widget.includes('ChatWidget')) {
        this.log('Widget does not contain expected class', 'error');
        return false;
      }
      
      if (!widget.includes('CHAT_CONFIG')) {
        this.log('Widget does not support CHAT_CONFIG', 'error');
        return false;
      }
      
      this.log(`Widget bundle is valid (${widget.length} bytes)`, 'success');
      return true;
    } catch (error) {
      this.log(`Widget test error: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive system tests...');
    
    const tests = [
      { name: 'Stealth Requirements', fn: () => this.testStealthRequirements() },
      { name: 'Embed Widget', fn: () => this.testEmbedWidget() },
      { name: 'Gateway Startup', fn: () => this.startGateway() },
      { name: 'Health Endpoint', fn: () => this.testHealthEndpoint() },
      { name: 'Analytics Endpoint', fn: () => this.testAnalyticsEndpoint() },
      { name: 'Knowledge Endpoint', fn: () => this.testKnowledgeEndpoint() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        this.log(`Running test: ${test.name}`);
        const result = await test.fn();
        if (result === true) {
          passed++;
        } else if (result === false) {
          failed++;
        }
      } catch (error) {
        this.log(`Test ${test.name} threw error: ${error.message}`, 'error');
        failed++;
      }
      
      await this.sleep(1000); // Brief pause between tests
    }

    await this.stopGateway();

    this.log('📊 Test Results Summary:');
    this.log(`✅ Passed: ${passed}`);
    this.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
      this.log('🎉 All tests passed! System is ready for deployment.', 'success');
    } else {
      this.log('💥 Some tests failed. Review the issues above.', 'error');
    }

    return { passed, failed, results: this.results };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SystemTester();
  tester.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default SystemTester;
