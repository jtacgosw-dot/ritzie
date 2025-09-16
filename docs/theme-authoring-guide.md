# Theme Authoring Guide

## Overview
The Ritzie theme system uses JSON design tokens to create consistent, customizable chat experiences. This guide covers the essential token structure and best practices.

## Core Token Structure

### Brand Tokens
```json
{
  "brand": {
    "logoUrl": "https://...",     // Company logo (optional)
    "avatarUrl": "https://...",   // Bot avatar (optional)
    "accent": "#3B82F6"           // Primary brand color
  }
}
```

### Color Tokens
Define colors for both light and dark modes:
```json
{
  "colors": {
    "light": {
      "bg": "#FFFFFF",           // Background
      "panel": "#FFFFFF",        // Chat panel background
      "text": "#0B1220",         // Primary text
      "muted": "#6B7280",        // Secondary text
      "divider": "rgba(0,0,0,.06)", // Borders/dividers
      "chip": "#F3F4F6",         // Suggestion chips
      "input": "#F9FAFB"         // Input background
    },
    "dark": {
      "bg": "#0B0F14",
      "panel": "#0E131A",
      "text": "#E6EAF0",
      "muted": "#9AA3AF",
      "divider": "rgba(255,255,255,.08)",
      "chip": "#0F141B",
      "input": "#11161E"
    }
  }
}
```

### Typography Tokens
```json
{
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "baseSize": 14,              // Base font size in px
    "lineHeight": 1.45           // Line height multiplier
  }
}
```

### Spacing & Layout
```json
{
  "radius": {
    "sm": 10,                    // Small border radius
    "md": 14,                    // Medium border radius
    "lg": 16,                    // Large border radius
    "pill": 999                  // Pill shape
  },
  "space": {
    "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24
  },
  "shadow": {
    "elevation": "0 10px 30px rgba(0,0,0,.18)"
  }
}
```

### Motion Tokens
Control animations and transitions:
```json
{
  "motion": {
    "curvePrimary": "cubic-bezier(.2,.8,.2,1)",
    "durations": {
      "micro": 120,              // Button hovers, small interactions
      "content": 180,            // Message animations
      "macro": 220,              // Panel open/close
      "stagger": 40              // Sequential animations
    },
    "reducedMotion": true        // Respect user preferences
  }
}
```

### Layout Configuration
```json
{
  "layout": {
    "mode": "bubble",            // "bubble" | "page" | "disabled"
    "bubbleWidth": 440,          // Bubble mode width in px
    "bubbleMaxHeightVh": 90,     // Max height as viewport %
    "pageHeader": true,          // Show header in page mode
    "mountSelector": "#ritzie-chat"
  }
}
```

### Personality Settings
```json
{
  "personality": {
    "tone": "calm_pro",          // "calm_pro" | "friendly_helpful" | "salesy_confident" | "playful_light"
    "emoji": false               // Enable emoji in responses
  }
}
```

## Best Practices

### Color Guidelines
- **Contrast**: Ensure AA accessibility compliance (4.5:1 for normal text, 3:1 for large text)
- **Consistency**: Use the same color roles across light/dark modes
- **Brand Alignment**: Accent color should match your brand identity

### Typography
- **System Fonts**: Prefer system font stacks for performance
- **Readability**: Keep base size between 13-16px
- **Line Height**: 1.4-1.6 works well for chat interfaces

### Motion
- **Performance**: Use transform and opacity for animations
- **Accessibility**: Always respect `prefers-reduced-motion`
- **Hierarchy**: Micro < Content < Macro durations

### Layout
- **Responsive**: Test both bubble and page modes
- **Mobile**: Ensure touch targets are at least 44px
- **Context**: Consider where the widget will be embedded

## Do's and Don'ts

### ✅ Do
- Test themes in both light and dark modes
- Validate color contrast ratios
- Use semantic color names (bg, text, muted)
- Keep motion subtle and purposeful
- Test on mobile devices

### ❌ Don't
- Use absolute colors in motion or layout tokens
- Set font sizes below 12px
- Create jarring color transitions between modes
- Ignore reduced motion preferences
- Use complex animations that impact performance

## Theme Inheritance

Themes follow this inheritance order:
1. **Base Theme** (system defaults)
2. **Preset Theme** (e.g., "palantr", "pastel-playful")
3. **Bot Overrides** (stored in database)
4. **Runtime Overrides** (client-side, if enabled)

Only specify tokens you want to change - missing tokens inherit from the parent level.

## Testing Your Theme

1. **Admin Preview**: Use the theme editor's live preview
2. **Dual Mode Test**: Test both bubble and page modes
3. **Accessibility**: Run automated contrast checks
4. **Performance**: Verify smooth animations
5. **Cross-browser**: Test in Chrome, Firefox, Safari

## Common Patterns

### Corporate/Professional
```json
{
  "colors": {
    "light": { "bg": "#FFFFFF", "text": "#1F2937", "accent": "#1F2937" },
    "dark": { "bg": "#111827", "text": "#F9FAFB", "accent": "#60A5FA" }
  },
  "personality": { "tone": "calm_pro", "emoji": false }
}
```

### Friendly/Consumer
```json
{
  "colors": {
    "light": { "bg": "#FEFEFE", "text": "#374151", "accent": "#10B981" },
    "dark": { "bg": "#0F172A", "text": "#E2E8F0", "accent": "#34D399" }
  },
  "personality": { "tone": "friendly_helpful", "emoji": true }
}
```

### High Contrast/Accessibility
```json
{
  "colors": {
    "light": { "bg": "#FFFFFF", "text": "#000000", "accent": "#0000EE" },
    "dark": { "bg": "#000000", "text": "#FFFFFF", "accent": "#FFFF00" }
  },
  "motion": { "reducedMotion": true }
}
```
