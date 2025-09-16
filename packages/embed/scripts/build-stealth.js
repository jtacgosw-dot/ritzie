import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import postcss from 'postcss';
import cssnano from 'cssnano';

class StealthBuilder {
  constructor() {
    this.siteTokens = process.env.SITE_TOKENS?.split(',') || ['SITE_demo_site1', 'SITE_demo_site2'];
    this.outputDir = 'dist/themes';
  }

  async build() {
    console.log('🥷 Starting stealth build pipeline...');
    
    execSync('pnpm exec rollup -c', { stdio: 'inherit' });
    
    for (const siteToken of this.siteTokens) {
      await this.buildSiteTheme(siteToken);
    }
    
    this.verifyStealthRequirements();
    
    console.log('✅ Stealth build complete!');
  }

  async buildSiteTheme(siteToken) {
    console.log(`🎨 Building theme for ${siteToken}...`);
    
    const themeConfig = this.getThemeConfig(siteToken);
    const css = this.generateThemedCSS(themeConfig);
    const obfuscatedCSS = this.obfuscateCSS(css);
    const minifiedCSS = await this.minifyCSS(obfuscatedCSS);
    
    const hash = this.generateHash(minifiedCSS);
    const filename = `chat-ui.${hash}.css`;
    
    const siteDir = `${this.outputDir}/${siteToken}`;
    if (!existsSync(siteDir)) {
      mkdirSync(siteDir, { recursive: true });
    }
    
    writeFileSync(`${siteDir}/${filename}`, minifiedCSS);
    
    console.log(`  ✓ Generated ${filename} (${minifiedCSS.length} bytes)`);
  }

  getThemeConfig(siteToken) {
    const themes = {
      'SITE_demo_site1': {
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px'
      },
      'SITE_demo_site2': {
        primaryColor: '#28a745',
        secondaryColor: '#17a2b8',
        fontFamily: 'Roboto, sans-serif',
        borderRadius: '12px'
      }
    };
    
    return themes[siteToken] || themes['SITE_demo_site1'];
  }

  generateThemedCSS(theme) {
    return `
      :host {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --font-family: ${theme.fontFamily};
        --border-radius: ${theme.borderRadius};
      }
      
      .w_c { position: relative; font-family: var(--font-family); }
      .w_btn {
        width: 60px; height: 60px; border-radius: 50%;
        background: var(--primary); color: white; border: none;
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.2s;
      }
      .w_btn:hover { transform: scale(1.05); }
      .w_icon { width: 24px; height: 24px; }
      .w_panel {
        position: absolute; bottom: 70px; right: 0;
        width: 350px; height: 500px; background: white;
        border-radius: var(--border-radius); 
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .w_header {
        padding: 16px; background: var(--primary); color: white;
        display: flex; justify-content: space-between; align-items: center;
      }
      .w_title { font-weight: 600; }
      .w_close {
        background: none; border: none; color: white;
        font-size: 20px; cursor: pointer; padding: 0;
        width: 24px; height: 24px; display: flex;
        align-items: center; justify-content: center;
      }
      .w_messages {
        flex: 1; padding: 16px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 12px;
      }
      .w_input {
        padding: 16px; border-top: 1px solid #eee;
        display: flex; gap: 8px;
      }
      .w_input input {
        flex: 1; padding: 8px 12px; border: 1px solid #ddd;
        border-radius: calc(var(--border-radius) / 2); outline: none;
      }
      .w_input button {
        padding: 8px 16px; background: var(--primary); color: white;
        border: none; border-radius: calc(var(--border-radius) / 2); cursor: pointer;
      }
      .msg { 
        padding: 8px 12px; border-radius: calc(var(--border-radius) / 2); 
        max-width: 80%; word-wrap: break-word;
      }
      .msg.user { 
        background: var(--primary); color: white; align-self: flex-end; 
      }
      .msg.bot { 
        background: #f1f1f1; color: #333; align-self: flex-start; 
      }
    `;
  }

  obfuscateCSS(css) {
    const classMap = {
      'w_c': this.generateObfuscatedName(),
      'w_btn': this.generateObfuscatedName(),
      'w_icon': this.generateObfuscatedName(),
      'w_panel': this.generateObfuscatedName(),
      'w_header': this.generateObfuscatedName(),
      'w_title': this.generateObfuscatedName(),
      'w_close': this.generateObfuscatedName(),
      'w_messages': this.generateObfuscatedName(),
      'w_input': this.generateObfuscatedName(),
      'msg': this.generateObfuscatedName()
    };

    let obfuscated = css;
    for (const [original, obfuscatedName] of Object.entries(classMap)) {
      const regex = new RegExp(`\\.${original}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, `.${obfuscatedName}`);
    }

    return obfuscated;
  }

  generateObfuscatedName() {
    return 'c_' + Math.random().toString(36).substr(2, 6);
  }

  async minifyCSS(css) {
    const result = await postcss([
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifySelectors: true
        }]
      })
    ]).process(css, { from: undefined });
    
    return result.css;
  }

  generateHash(content) {
    return createHash('md5').update(content).digest('hex').substr(0, 8);
  }

  verifyStealthRequirements() {
    console.log('🔍 Verifying stealth requirements...');
    
    const bundlePath = 'dist/chat.v1.js';
    if (existsSync(bundlePath)) {
      const bundle = readFileSync(bundlePath, 'utf8');
      if (bundle.toLowerCase().includes('ritzie')) {
        console.warn('⚠️  WARNING: Found "Ritzie" string in bundle!');
      } else {
        console.log('  ✓ No vendor strings found in bundle');
      }
    }
    
    const themeFiles = execSync(`find ${this.outputDir} -name "*.css"`, { encoding: 'utf8' }).trim().split('\n');
    for (const file of themeFiles) {
      if (file) {
        const css = readFileSync(file, 'utf8');
        if (css.includes('/*') || css.includes('sourceMappingURL')) {
          console.warn(`⚠️  WARNING: Found comments/sourcemaps in ${file}`);
        } else {
          console.log(`  ✓ ${file} is properly minified`);
        }
      }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new StealthBuilder();
  builder.build().catch(console.error);
}

export default StealthBuilder;
