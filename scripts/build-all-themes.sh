#!/bin/bash

echo "🎨 Building all theme variants for all sites..."

cd "$(dirname "$0")/.."

echo "📦 Compiling themes..."
node scripts/theme-compiler.js compile-all

echo "🔨 Building embed widget..."
cd packages/embed
pnpm run build

echo "🔍 Verifying stealth requirements..."
cd ../..
node scripts/theme-compiler.js verify

echo "✅ All themes built successfully!"
echo ""
echo "📋 Theme files generated:"
find apps/gateway/public/themes -name "*.css" -exec ls -lh {} \;

echo ""
echo "🧪 Test URLs:"
echo "  Dual Mode Test: http://localhost:8080/demo/dual-mode-test.html"
echo "  Theme System Test: http://localhost:8080/demo/theme-system-test.html"
echo "  Palantir Test: http://localhost:8080/demo/palantir-theme-test.html"
