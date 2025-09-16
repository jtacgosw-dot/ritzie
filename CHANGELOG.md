# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-09-16

### Theme System v1 - Complete Finalization

#### ✨ Features
- **JSON Design Tokens**: Complete tokenization of colors, typography, spacing, motion, and components
- **Server-Driven Embed Config**: `/v1/embed-config` endpoint returns complete merged theme configuration
- **Per-Site Hashed CSS**: Stealth-compliant compilation with cache busting and no sourcemaps
- **Dual Mode Support**: Bubble and full-page modes with server-controlled switching
- **Motion System**: Configurable animations with reduced-motion fallbacks and accessibility compliance
- **Admin Theme Editor**: Dashboard at `/admin` with import/export, versioning, rollback, and A/B testing
- **Top FAQs Analytics**: Real-time aggregation with query clustering and confidence scoring
- **Personality Hooks**: Tone mapping (calm_pro, friendly_helpful, etc.) with emoji controls

#### 🔒 Security & Stealth
- **Complete Stealth Compliance**: No vendor strings in any compiled assets
- **Vanity CDN Support**: CNAME configuration for white-label deployment
- **Secret Management**: OpenAI API key scrubbed from git history with pre-commit guards
- **GitHub Push Protection**: Compliance verified with clean branch deployment

#### 🧪 Testing & Quality
- **E2E Test Suite**: Playwright tests for bubble/page modes and theme switching
- **Accessibility Testing**: Axe integration for AA compliance and focus management
- **Performance Validation**: Bundle size checks and motion system verification
- **Stealth Verification**: Automated vendor string detection and prevention

#### 🏗️ Architecture
- **Theme Inheritance**: Flexible override system with base → preset → custom chain
- **Runtime Configuration**: Server-driven config prevents client tampering
- **FAQ Aggregation**: Nightly job with OpenAI embeddings and clustering
- **Analytics Pipeline**: Real-time events with rollup aggregation

#### 📦 Deployment Ready
- **Production Infrastructure**: Docker Compose with health checks and monitoring
- **Client Handoff Package**: Embed snippets, CSP headers, and setup documentation
- **Monitoring & Alerts**: Health endpoints, error tracking, and Slack integration
- **Demo Themes**: Palantr, Pastel Playful, and High Contrast presets

### Added
- Complete theme system with JSON design tokens
- Server-driven embed configuration endpoint
- Admin dashboard for theme management
- FAQ aggregation with clustering
- E2E and accessibility test suites
- Stealth compilation pipeline
- Production deployment infrastructure
- Client handoff documentation

### Changed
- Enhanced embed widget with dual-mode support
- Improved analytics with real-time aggregation
- Updated security with secret management
- Refined theme inheritance system

### Security
- Removed exposed OpenAI API key from git history
- Added pre-commit hooks for secret detection
- Implemented stealth compliance verification
- Enhanced CSP and security headers

---

**Full Changelog**: https://github.com/jtacgosw-dot/ritzie/compare/master-base...v0.1.0
