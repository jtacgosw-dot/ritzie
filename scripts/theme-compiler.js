#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ThemeCompiler {
  constructor() {
    this.themesDir = path.resolve(__dirname, '../themes');
    this.outputDir = path.resolve(__dirname, '../apps/gateway/public/themes');
  }

  async compileTheme(siteToken, themeId, overrides = {}) {
    console.log(`🎨 Compiling theme ${themeId} for ${siteToken}...`);
    
    const baseTheme = this.loadTheme(themeId);
    const effectiveTheme = this.mergeThemeOverrides(baseTheme, overrides);
    const css = this.generateCSS(effectiveTheme);
    const obfuscatedCSS = this.obfuscateCSS(css);
    const minifiedCSS = this.minifyCSS(obfuscatedCSS);
    
    const hash = this.generateHash(minifiedCSS + siteToken);
    const filename = `chat-ui.${hash}.css`;
    
    const siteDir = path.join(this.outputDir, siteToken);
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(siteDir, filename), minifiedCSS);
    
    console.log(`  ✓ Generated ${filename} (${minifiedCSS.length} bytes)`);
    return { filename, hash, css: minifiedCSS };
  }

  loadTheme(themeId) {
    const themeFiles = {
      'palantr': 'palantr-minimal.json',
      'palantr-min': 'palantr-minimal.json',
      'pastel': 'pastel-playful.json',
      'pastel-play': 'pastel-playful.json',
      'contrast': 'high-contrast.json',
      'high-contrast': 'high-contrast.json'
    };
    
    const filename = themeFiles[themeId] || 'palantr-minimal.json';
    const themePath = path.join(this.themesDir, filename);
    
    if (!fs.existsSync(themePath)) {
      throw new Error(`Theme file not found: ${themePath}`);
    }
    
    return JSON.parse(fs.readFileSync(themePath, 'utf8'));
  }

  mergeThemeOverrides(baseTheme, overrides) {
    return this.deepMerge(baseTheme, overrides);
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  generateCSS(theme) {
    const { colors, typography, radius, space, shadow, motion, layout } = theme;
    
    return `
:host, .rtz {
  --rtz-font: ${typography.fontFamily};
  --rtz-font-size: ${typography.baseSize}px;
  --rtz-line-height: ${typography.lineHeight};
  
  --rtz-radius-sm: ${radius.sm}px;
  --rtz-radius-md: ${radius.md}px;
  --rtz-radius-lg: ${radius.lg}px;
  --rtz-radius-pill: ${radius.pill}px;
  
  --rtz-space-xs: ${space.xs}px;
  --rtz-space-sm: ${space.sm}px;
  --rtz-space-md: ${space.md}px;
  --rtz-space-lg: ${space.lg}px;
  --rtz-space-xl: ${space.xl}px;
  
  --rtz-shadow: ${shadow.elevation};
  --rtz-accent: ${theme.brand.accent};
  
  --rtz-curve: ${motion.curvePrimary};
  --rtz-duration-micro: ${motion.durations.micro}ms;
  --rtz-duration-content: ${motion.durations.content}ms;
  --rtz-duration-macro: ${motion.durations.macro}ms;
  --rtz-duration-stagger: ${motion.durations.stagger}ms;
  
  --rtz-bubble-width: ${layout.bubbleWidth}px;
  --rtz-bubble-max-height: ${layout.bubbleMaxHeightVh}vh;

  --rtz-bg: ${colors.light.bg};
  --rtz-panel: ${colors.light.panel};
  --rtz-text: ${colors.light.text};
  --rtz-muted: ${colors.light.muted};
  --rtz-divider: ${colors.light.divider};
  --rtz-input: ${colors.light.input};
  --rtz-chip: ${colors.light.chip};
}

@media (prefers-color-scheme: dark) {
  :host, .rtz {
    --rtz-bg: ${colors.dark.bg};
    --rtz-panel: ${colors.dark.panel};
    --rtz-text: ${colors.dark.text};
    --rtz-muted: ${colors.dark.muted};
    --rtz-divider: ${colors.dark.divider};
    --rtz-input: ${colors.dark.input};
    --rtz-chip: ${colors.dark.chip};
  }
}

:host([data-theme="dark"]), .rtz[data-theme="dark"] {
  --rtz-bg: ${colors.dark.bg};
  --rtz-panel: ${colors.dark.panel};
  --rtz-text: ${colors.dark.text};
  --rtz-muted: ${colors.dark.muted};
  --rtz-divider: ${colors.dark.divider};
  --rtz-input: ${colors.dark.input};
  --rtz-chip: ${colors.dark.chip};
}

:host([data-theme="light"]), .rtz[data-theme="light"] {
  --rtz-bg: ${colors.light.bg};
  --rtz-panel: ${colors.light.panel};
  --rtz-text: ${colors.light.text};
  --rtz-muted: ${colors.light.muted};
  --rtz-divider: ${colors.light.divider};
  --rtz-input: ${colors.light.input};
  --rtz-chip: ${colors.light.chip};
}

.rtz-panel {
  background: var(--rtz-panel);
  color: var(--rtz-text);
  border-radius: var(--rtz-radius-md);
  box-shadow: var(--rtz-shadow);
  border: 1px solid var(--rtz-divider);
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  line-height: var(--rtz-line-height);
}

.rtz-header {
  display: flex;
  align-items: center;
  gap: var(--rtz-space-md);
  padding: var(--rtz-space-md) var(--rtz-space-lg);
  border-bottom: 1px solid var(--rtz-divider);
}

.rtz-title {
  font-weight: 600;
  letter-spacing: 0.2px;
  font-size: calc(var(--rtz-font-size) + 1px);
}

.rtz-close {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--rtz-muted);
  cursor: pointer;
  padding: var(--rtz-space-xs);
  border-radius: var(--rtz-radius-sm);
  transition: all var(--rtz-duration-micro) var(--rtz-curve);
}

.rtz-close:hover {
  background: var(--rtz-chip);
  color: var(--rtz-text);
}

.rtz-close:focus-visible {
  outline: 2px solid var(--rtz-accent);
  outline-offset: 2px;
}

.rtz-messages {
  padding: var(--rtz-space-sm);
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rtz-space-sm);
}

.rtz-msg {
  padding: var(--rtz-space-sm) var(--rtz-space-md);
  border-radius: var(--rtz-radius-md);
  line-height: var(--rtz-line-height);
  max-width: 85%;
  word-wrap: break-word;
  animation: rtz-msg-in var(--rtz-duration-content) var(--rtz-curve);
}

.rtz-user {
  background: var(--rtz-accent);
  color: white;
  align-self: flex-end;
  margin-left: auto;
}

.rtz-bot {
  background: var(--rtz-chip);
  color: var(--rtz-text);
  align-self: flex-start;
}

.rtz-input {
  display: flex;
  gap: var(--rtz-space-sm);
  padding: var(--rtz-space-sm);
  border-top: 1px solid var(--rtz-divider);
  background: var(--rtz-bg);
}

.rtz-inputbox {
  flex: 1;
  background: var(--rtz-input);
  border: 1px solid var(--rtz-divider);
  border-radius: var(--rtz-radius-md);
  padding: var(--rtz-space-sm) var(--rtz-space-md);
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  color: var(--rtz-text);
  outline: none;
  transition: all var(--rtz-duration-micro) var(--rtz-curve);
}

.rtz-inputbox:focus {
  border-color: var(--rtz-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.rtz-inputbox::placeholder {
  color: var(--rtz-muted);
}

.rtz-send {
  border: 1px solid var(--rtz-divider);
  background: var(--rtz-panel);
  color: var(--rtz-text);
  padding: var(--rtz-space-sm) var(--rtz-space-lg);
  border-radius: var(--rtz-radius-sm);
  cursor: pointer;
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  font-weight: 500;
  transition: all var(--rtz-duration-micro) var(--rtz-curve);
  outline: none;
}

.rtz-send:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,.10);
  background: var(--rtz-accent);
  color: white;
  border-color: var(--rtz-accent);
}

.rtz-send:focus-visible {
  outline: 2px solid var(--rtz-accent);
  outline-offset: 2px;
}

.rtz-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.rtz-chip {
  background: var(--rtz-chip);
  border: 1px solid var(--rtz-divider);
  color: var(--rtz-text);
  padding: var(--rtz-space-xs) var(--rtz-space-sm);
  border-radius: var(--rtz-radius-pill);
  font-size: calc(var(--rtz-font-size) - 1px);
  cursor: pointer;
  transition: all var(--rtz-duration-micro) var(--rtz-curve);
}

.rtz-chip:hover {
  background: var(--rtz-accent);
  color: white;
  border-color: var(--rtz-accent);
}

.rtz-chip:focus-visible {
  outline: 2px solid var(--rtz-accent);
  outline-offset: 2px;
}

.rtz-bubble {
  position: fixed;
  right: 22px;
  bottom: 24px;
  background: var(--rtz-accent);
  color: #fff;
  border-radius: var(--rtz-radius-pill);
  padding: var(--rtz-space-md) var(--rtz-space-lg);
  box-shadow: var(--rtz-shadow);
  cursor: pointer;
  border: none;
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  font-weight: 500;
  transition: all var(--rtz-duration-micro) var(--rtz-curve);
  z-index: 999999;
}

.rtz-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0,0,0,.25);
}

.rtz-bubble:focus-visible {
  outline: 2px solid var(--rtz-accent);
  outline-offset: 2px;
}

.rtz-bubble-panel {
  position: fixed;
  right: 22px;
  bottom: 90px;
  width: var(--rtz-bubble-width);
  max-height: calc(var(--rtz-bubble-max-height) - 48px);
  z-index: 999998;
  animation: rtz-scale-in var(--rtz-duration-macro) var(--rtz-curve);
}

@keyframes rtz-scale-in {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes rtz-msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rtz-page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rtz-page-container .rtz-panel {
  flex: 1;
  border-radius: 0;
  box-shadow: none;
  border: none;
  display: flex;
  flex-direction: column;
}

.rtz-page-container .rtz-messages {
  flex: 1;
  max-height: none;
}

.rtz-loader {
  display: flex;
  gap: var(--rtz-space-xs);
  align-items: center;
  padding: var(--rtz-space-sm) var(--rtz-space-md);
}

.rtz-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rtz-radius-pill);
  background: var(--rtz-muted);
  animation: rtz-pop 0.9s var(--rtz-curve) infinite;
}

.rtz-dot:nth-child(2) {
  animation-delay: var(--rtz-duration-stagger);
}

.rtz-dot:nth-child(3) {
  animation-delay: calc(var(--rtz-duration-stagger) * 2);
}

@keyframes rtz-pop {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.rtz-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--rtz-accent);
  color: white;
  padding: var(--rtz-space-sm);
  text-decoration: none;
  border-radius: var(--rtz-radius-sm);
  z-index: 1000000;
}

.rtz-skip-link:focus {
  top: 6px;
}

.rtz-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 480px) {
  .rtz-bubble-panel {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 80px;
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  
  .rtz-bubble {
    right: calc(12px + env(safe-area-inset-right));
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .rtz-bubble,
  .rtz-send,
  .rtz-chip,
  .rtz-close,
  .rtz-inputbox,
  .rtz-msg {
    transition: none;
    animation: none;
  }
  
  .rtz-bubble-panel {
    animation: none;
  }
  
  .rtz-dot {
    animation: none;
    opacity: 0.6;
  }
  
  @keyframes rtz-scale-in {
    from, to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes rtz-msg-in {
    from, to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes rtz-pop {
    from, to {
      opacity: 0.6;
      transform: translateY(0);
    }
  }
}

@media (forced-colors: active) {
  .rtz-panel {
    border: 1px solid ButtonText;
  }
  
  .rtz-bubble {
    border: 1px solid ButtonText;
  }
  
  .rtz-inputbox {
    border: 1px solid ButtonText;
  }
}
    `;
  }

  obfuscateCSS(css) {
    const classMap = {
      'rtz-panel': this.generateObfuscatedName(),
      'rtz-header': this.generateObfuscatedName(),
      'rtz-title': this.generateObfuscatedName(),
      'rtz-close': this.generateObfuscatedName(),
      'rtz-messages': this.generateObfuscatedName(),
      'rtz-msg': this.generateObfuscatedName(),
      'rtz-user': this.generateObfuscatedName(),
      'rtz-bot': this.generateObfuscatedName(),
      'rtz-input': this.generateObfuscatedName(),
      'rtz-inputbox': this.generateObfuscatedName(),
      'rtz-send': this.generateObfuscatedName(),
      'rtz-chip': this.generateObfuscatedName(),
      'rtz-bubble': this.generateObfuscatedName(),
      'rtz-bubble-panel': this.generateObfuscatedName(),
      'rtz-page-container': this.generateObfuscatedName(),
      'rtz-loader': this.generateObfuscatedName(),
      'rtz-dot': this.generateObfuscatedName(),
      'rtz-skip-link': this.generateObfuscatedName(),
      'rtz-sr-only': this.generateObfuscatedName()
    };

    let obfuscated = css;
    for (const [original, obfuscatedName] of Object.entries(classMap)) {
      const regex = new RegExp(`\\.${original}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, `.${obfuscatedName}`);
    }

    const varMap = {};
    const varMatches = css.match(/--rtz-[a-z0-9-]+/g);
    if (varMatches) {
      const uniqueVars = [...new Set(varMatches)];
      uniqueVars.forEach(varName => {
        varMap[varName] = `--v${this.generateObfuscatedName()}`;
      });
      
      for (const [original, obfuscatedName] of Object.entries(varMap)) {
        const regex = new RegExp(original.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
        obfuscated = obfuscated.replace(regex, obfuscatedName);
      }
    }

    return obfuscated;
  }

  generateObfuscatedName() {
    return Math.random().toString(36).substr(2, 6);
  }

  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/,\s*/g, ',')
      .replace(/:\s*/g, ':')
      .trim();
  }

  generateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex').substr(0, 8);
  }

  async compileAllSites() {
    const sites = ['SITE_demo_site1', 'SITE_demo_site2'];
    const results = [];
    
    for (const site of sites) {
      const result = await this.compileTheme(site, 'palantr');
      results.push({ site, ...result });
    }
    
    return results;
  }

  verifyStealthRequirements() {
    console.log('🔍 Verifying stealth requirements...');
    
    const themeFiles = this.getAllThemeFiles();
    let hasVendorStrings = false;
    
    for (const file of themeFiles) {
      const css = fs.readFileSync(file, 'utf8');
      if (css.toLowerCase().includes('ritzie')) {
        console.warn(`⚠️  WARNING: Found "Ritzie" string in ${file}`);
        hasVendorStrings = true;
      } else {
        console.log(`  ✓ ${path.basename(file)} is stealth compliant`);
      }
      
      if (css.includes('/*') || css.includes('sourceMappingURL')) {
        console.warn(`⚠️  WARNING: Found comments/sourcemaps in ${file}`);
      }
    }
    
    if (!hasVendorStrings) {
      console.log('  ✅ No vendor strings found in any theme files');
    }
    
    return !hasVendorStrings;
  }

  getAllThemeFiles() {
    const files = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.css')) {
          files.push(fullPath);
        }
      }
    };
    
    if (fs.existsSync(this.outputDir)) {
      walkDir(this.outputDir);
    }
    
    return files;
  }
}

if (require.main === module) {
  const compiler = new ThemeCompiler();
  
  const command = process.argv[2];
  const siteToken = process.argv[3];
  const themeId = process.argv[4] || 'palantr';
  
  if (command === 'compile' && siteToken) {
    compiler.compileTheme(siteToken, themeId)
      .then(result => {
        console.log(`✅ Theme compiled successfully: ${result.filename}`);
      })
      .catch(error => {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
      });
  } else if (command === 'compile-all') {
    compiler.compileAllSites()
      .then(results => {
        console.log(`✅ Compiled ${results.length} site themes`);
        results.forEach(r => console.log(`  ${r.site}: ${r.filename}`));
      })
      .catch(error => {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
      });
  } else if (command === 'verify') {
    const isCompliant = compiler.verifyStealthRequirements();
    process.exit(isCompliant ? 0 : 1);
  } else {
    console.log('Usage:');
    console.log('  node theme-compiler.js compile <SITE_TOKEN> [THEME_ID]');
    console.log('  node theme-compiler.js compile-all');
    console.log('  node theme-compiler.js verify');
  }
}

module.exports = ThemeCompiler;
