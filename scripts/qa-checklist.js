import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class QAChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  checkStealthRequirements() {
    console.log('🔍 Checking stealth requirements...');
    
    const bundlePath = 'packages/embed/dist/chat.v1.js';
    if (existsSync(bundlePath)) {
      const bundle = readFileSync(bundlePath, 'utf8');
      const vendorStrings = ['ritzie', 'Ritzie', 'RITZIE'];
      
      for (const str of vendorStrings) {
        if (bundle.includes(str)) {
          this.errors.push(`Found vendor string "${str}" in ${bundlePath}`);
        }
      }
    } else {
      this.errors.push(`Bundle not found: ${bundlePath}`);
    }
    
    try {
      const cssFiles = execSync('find packages/embed/dist/themes -name "*.css"', { encoding: 'utf8' }).trim().split('\n');
      for (const file of cssFiles) {
        if (file) {
          const css = readFileSync(file, 'utf8');
          if (css.includes('/*') || css.includes('sourceMappingURL')) {
            this.warnings.push(`Found comments/sourcemaps in ${file}`);
          }
          if (css.includes('ritzie') || css.includes('Ritzie')) {
            this.errors.push(`Found vendor strings in ${file}`);
          }
        }
      }
    } catch (e) {
      this.warnings.push('Could not check CSS files');
    }
  }

  checkNetworkStealth() {
    console.log('🌐 Checking network stealth...');
    
    const embedCode = readFileSync('packages/embed/dist/chat.v1.js', 'utf8');
    if (!embedCode.includes('assetsBase')) {
      this.errors.push('Embed widget does not support custom assetsBase');
    }
  }

  checkMultiTenant() {
    console.log('🏢 Checking multi-tenant isolation...');
    
    const schema = readFileSync('infra/db/schema.sql', 'utf8');
    const tables = ['orgs', 'sites', 'bots', 'documents', 'chunks', 'conversations', 'messages', 'events'];
    
    for (const table of tables) {
      if (!schema.includes(`CREATE TABLE ${table}`)) {
        this.errors.push(`Missing table: ${table}`);
      }
      if (table !== 'orgs' && !schema.includes('org_id')) {
        this.errors.push(`Table ${table} missing org_id column`);
      }
    }
  }

  checkSecurity() {
    console.log('🔒 Checking security...');
    
    const authFile = readFileSync('apps/gateway/src/utils/auth.ts', 'utf8');
    if (!authFile.includes('JWT_SECRET')) {
      this.errors.push('JWT_SECRET not used in auth utilities');
    }
    
    const gatewayFile = readFileSync('apps/gateway/src/index.ts', 'utf8');
    if (!gatewayFile.includes('cors')) {
      this.warnings.push('CORS not configured in gateway');
    }
  }

  checkPerformance() {
    console.log('⚡ Checking performance requirements...');
    
    const chatFile = readFileSync('apps/gateway/src/routes/chat.ts', 'utf8');
    if (!chatFile.includes('WebSocket') && !chatFile.includes('SSE')) {
      this.errors.push('No streaming implementation found in chat routes');
    }
    
    const ingestionFile = readFileSync('apps/gateway/src/jobs/ingestion.ts', 'utf8');
    if (!ingestionFile.includes('chunkText')) {
      this.errors.push('No text chunking found in ingestion pipeline');
    }
  }

  run() {
    console.log('🚀 Running QA checklist...\n');
    
    this.checkStealthRequirements();
    this.checkNetworkStealth();
    this.checkMultiTenant();
    this.checkSecurity();
    this.checkPerformance();
    
    console.log('\n📊 QA Results:');
    console.log(`✅ Checks completed`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 All critical checks passed!');
    } else {
      console.log('\n💥 Critical issues found - fix before deployment');
      process.exit(1);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new QAChecker();
  checker.run();
}

export default QAChecker;
