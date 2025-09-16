#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadTheme(themeId) {
  const themePath = path.join(__dirname, '..', 'themes', `${themeId}.json`);
  if (!fs.existsSync(themePath)) {
    throw new Error(`Theme file not found: ${themePath}`);
  }
  return JSON.parse(fs.readFileSync(themePath, 'utf8'));
}

function generateThemeCSS(theme) {
  const { colors, typography, radius, space, shadow, motion, brand } = theme;
  
  let css = ':host, .rtz {\n';
  
  css += `  --rtz-font: ${typography.fontFamily};\n`;
  css += `  --rtz-font-size: ${typography.baseSize}px;\n`;
  css += `  --rtz-line-height: ${typography.lineHeight};\n`;
  
  css += `  --rtz-radius-sm: ${radius.sm}px;\n`;
  css += `  --rtz-radius: ${radius.md}px;\n`;
  css += `  --rtz-radius-lg: ${radius.lg}px;\n`;
  css += `  --rtz-radius-pill: ${radius.pill}px;\n`;
  
  css += `  --rtz-space-xs: ${space.xs}px;\n`;
  css += `  --rtz-space-sm: ${space.sm}px;\n`;
  css += `  --rtz-space: ${space.md}px;\n`;
  css += `  --rtz-space-lg: ${space.lg}px;\n`;
  css += `  --rtz-space-xl: ${space.xl}px;\n`;
  
  css += `  --rtz-shadow: ${shadow.elevation};\n`;
  
  css += `  --rtz-ease: ${motion.curvePrimary};\n`;
  css += `  --rtz-motion-micro: ${motion.durations.micro}ms;\n`;
  css += `  --rtz-motion-content: ${motion.durations.content}ms;\n`;
  css += `  --rtz-motion-macro: ${motion.durations.macro}ms;\n`;
  css += `  --rtz-motion-stagger: ${motion.durations.stagger}ms;\n`;
  
  css += `  --rtz-accent: ${brand.accent};\n`;
  css += `  --rtz-accent-600: ${brand.accent};\n`;
  css += `  --rtz-accent-500: ${adjustColor(brand.accent, 0.1)};\n`;
  css += `  --rtz-accent-700: ${adjustColor(brand.accent, -0.1)};\n`;
  
  css += `  --rtz-bg: ${colors.light.bg};\n`;
  css += `  --rtz-panel: ${colors.light.panel};\n`;
  css += `  --rtz-text: ${colors.light.text};\n`;
  css += `  --rtz-muted: ${colors.light.muted};\n`;
  css += `  --rtz-divider: ${colors.light.divider};\n`;
  css += `  --rtz-chip: ${colors.light.chip};\n`;
  css += `  --rtz-input: ${colors.light.input};\n`;
  
  css += '}\n\n';
  
  css += '@media (prefers-color-scheme: dark) {\n';
  css += '  :host, .rtz {\n';
  css += `    --rtz-bg: ${colors.dark.bg};\n`;
  css += `    --rtz-panel: ${colors.dark.panel};\n`;
  css += `    --rtz-text: ${colors.dark.text};\n`;
  css += `    --rtz-muted: ${colors.dark.muted};\n`;
  css += `    --rtz-divider: ${colors.dark.divider};\n`;
  css += `    --rtz-chip: ${colors.dark.chip};\n`;
  css += `    --rtz-input: ${colors.dark.input};\n`;
  css += '  }\n';
  css += '}\n\n';
  
  css += ':host([data-theme="light"]), .rtz[data-theme="light"] {\n';
  css += `  --rtz-bg: ${colors.light.bg};\n`;
  css += `  --rtz-panel: ${colors.light.panel};\n`;
  css += `  --rtz-text: ${colors.light.text};\n`;
  css += `  --rtz-muted: ${colors.light.muted};\n`;
  css += `  --rtz-divider: ${colors.light.divider};\n`;
  css += `  --rtz-chip: ${colors.light.chip};\n`;
  css += `  --rtz-input: ${colors.light.input};\n`;
  css += '}\n\n';
  
  css += ':host([data-theme="dark"]), .rtz[data-theme="dark"] {\n';
  css += `  --rtz-bg: ${colors.dark.bg};\n`;
  css += `  --rtz-panel: ${colors.dark.panel};\n`;
  css += `  --rtz-text: ${colors.dark.text};\n`;
  css += `  --rtz-muted: ${colors.dark.muted};\n`;
  css += `  --rtz-divider: ${colors.dark.divider};\n`;
  css += `  --rtz-chip: ${colors.dark.chip};\n`;
  css += `  --rtz-input: ${colors.dark.input};\n`;
  css += '}\n\n';
  
  css += generateComponentCSS(theme);
  
  return css;
}

function generateComponentCSS(theme) {
  const { motion } = theme;
  
  return `
/* Container */
.rtz-panel {
  background: var(--rtz-panel);
  color: var(--rtz-text);
  border-radius: var(--rtz-radius);
  box-shadow: var(--rtz-shadow);
  border: 1px solid var(--rtz-divider);
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  line-height: var(--rtz-line-height);
}

/* Header */
.rtz-header {
  display: flex;
  align-items: center;
  gap: var(--rtz-space);
  padding: var(--rtz-space) var(--rtz-space-lg);
  border-bottom: 1px solid var(--rtz-divider);
}

.rtz-title {
  font-weight: 600;
  letter-spacing: 0.2px;
  flex: 1;
}

.rtz-close {
  background: none;
  border: none;
  color: var(--rtz-muted);
  cursor: pointer;
  padding: var(--rtz-space-xs);
  border-radius: var(--rtz-radius-sm);
  transition: all var(--rtz-motion-micro) var(--rtz-ease);
}

.rtz-close:hover {
  background: var(--rtz-chip);
  color: var(--rtz-text);
}

/* Messages */
.rtz-messages {
  padding: var(--rtz-space);
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rtz-space);
}

.rtz-msg {
  padding: var(--rtz-space) var(--rtz-space-lg);
  border-radius: var(--rtz-radius-sm);
  line-height: var(--rtz-line-height);
  animation: fadeInUp var(--rtz-motion-content) var(--rtz-ease);
}

.rtz-user {
  background: var(--rtz-accent);
  color: white;
  align-self: flex-end;
  max-width: 80%;
}

.rtz-bot {
  background: var(--rtz-chip);
  color: var(--rtz-text);
  align-self: flex-start;
  max-width: 85%;
}

.rtz-time {
  color: var(--rtz-muted);
  font-size: 0.78rem;
  margin-top: var(--rtz-space-xs);
}

/* Input */
.rtz-input {
  display: flex;
  gap: var(--rtz-space-sm);
  padding: var(--rtz-space);
  border-top: 1px solid var(--rtz-divider);
  background: var(--rtz-bg);
}

.rtz-inputbox {
  flex: 1;
  background: var(--rtz-input);
  border: 1px solid var(--rtz-divider);
  border-radius: var(--rtz-radius-sm);
  padding: var(--rtz-space) var(--rtz-space-lg);
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  color: var(--rtz-text);
  outline: none;
  transition: all var(--rtz-motion-micro) var(--rtz-ease);
}

.rtz-inputbox:focus {
  border-color: var(--rtz-accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.rtz-send {
  border: 1px solid var(--rtz-divider);
  background: var(--rtz-panel);
  color: var(--rtz-text);
  padding: var(--rtz-space) var(--rtz-space-lg);
  border-radius: var(--rtz-radius-sm);
  cursor: pointer;
  font-family: var(--rtz-font);
  font-size: var(--rtz-font-size);
  transition: all var(--rtz-motion-micro) var(--rtz-ease);
}

.rtz-send:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.10);
  background: var(--rtz-accent);
  color: white;
  border-color: var(--rtz-accent);
}

/* Suggestions (chips) */
.rtz-chip {
  background: var(--rtz-chip);
  border: 1px solid var(--rtz-divider);
  padding: var(--rtz-space-xs) var(--rtz-space);
  border-radius: var(--rtz-radius-pill);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--rtz-motion-micro) var(--rtz-ease);
}

.rtz-chip:hover {
  background: var(--rtz-accent);
  color: white;
  border-color: var(--rtz-accent);
}

/* Bubble button */
.rtz-bubble {
  position: fixed;
  right: 22px;
  bottom: 24px;
  background: var(--rtz-accent);
  color: white;
  border: none;
  border-radius: var(--rtz-radius-pill);
  padding: var(--rtz-space-lg);
  box-shadow: var(--rtz-shadow);
  cursor: pointer;
  transition: all var(--rtz-motion-micro) var(--rtz-ease);
  z-index: 2147483647;
}

.rtz-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}

.rtz-bubble:focus-visible {
  outline: 2px solid var(--rtz-accent-500);
  outline-offset: 2px;
}

/* Bubble panel */
.rtz-bubble-panel {
  position: fixed;
  right: 22px;
  bottom: 90px;
  width: 440px;
  max-width: calc(100vw - 44px);
  max-height: calc(90vh - 48px);
  z-index: 2147483646;
  animation: scaleIn var(--rtz-motion-content) var(--rtz-ease);
}

/* Page mode */
.rtz-page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rtz-page-container .rtz-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
  border: none;
}

.rtz-page-container .rtz-messages {
  flex: 1;
  max-height: none;
}

/* Skip link */
.rtz-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--rtz-accent);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  z-index: 100;
  transition: top var(--rtz-motion-micro) var(--rtz-ease);
}

.rtz-skip-link:focus {
  top: 6px;
}

/* Loader */
.rtz-loader {
  display: flex;
  gap: 4px;
  padding: var(--rtz-space);
}

.rtz-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rtz-radius-pill);
  background: var(--rtz-muted);
  animation: pop 0.9s var(--rtz-ease) infinite;
}

.rtz-dot:nth-child(2) {
  animation-delay: var(--rtz-motion-stagger);
}

.rtz-dot:nth-child(3) {
  animation-delay: calc(var(--rtz-motion-stagger) * 2);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pop {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .rtz-send:hover {
    transform: none;
  }
  
  .rtz-bubble:hover {
    transform: none;
  }
}
`;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function obfuscateCSS(css) {
  const classMap = new Map();
  
  return { css, classMap };
}

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
    .replace(/\s*{\s*/g, '{') // Clean up braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';') // Clean up semicolons
    .replace(/\s*,\s*/g, ',') // Clean up commas
    .trim();
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

function buildTheme(siteToken, themeId) {
  console.log(`Building theme ${themeId} for site ${siteToken}...`);
  
  const theme = loadTheme(themeId);
  
  let css = generateThemeCSS(theme);
  
  const { css: obfuscatedCSS, classMap } = obfuscateCSS(css);
  
  const minifiedCSS = minifyCSS(obfuscatedCSS);
  
  const hash = generateHash(minifiedCSS);
  
  const outputDir = path.join(__dirname, '..', 'apps', 'gateway', 'public', 'themes', siteToken);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const filename = `chat-ui.${hash}.css`;
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, minifiedCSS);
  
  const classMapPath = path.join(outputDir, `${filename}.map.json`);
  fs.writeFileSync(classMapPath, JSON.stringify(classMap, null, 2));
  
  console.log(`✅ Theme built: ${outputPath}`);
  console.log(`📊 CSS size: ${(minifiedCSS.length / 1024).toFixed(1)}KB`);
  console.log(`🔒 Classes obfuscated: ${classMap.size}`);
  console.log(`🎯 Hash: ${hash}`);
  
  return { filename, hash, classMap };
}

if (require.main === module) {
  const [,, siteToken, themeId] = process.argv;
  
  if (!siteToken || !themeId) {
    console.error('Usage: node build-theme.js <siteToken> <themeId>');
    console.error('Example: node build-theme.js SITE_demo_site1 palantr');
    process.exit(1);
  }
  
  try {
    buildTheme(siteToken, themeId);
  } catch (error) {
    console.error('❌ Theme build failed:', error.message);
    process.exit(1);
  }
}

module.exports = { buildTheme, loadTheme, generateThemeCSS };
