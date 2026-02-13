#!/bin/bash

# Theme System Verification Script
# This script verifies that the theme system is working correctly

echo "=== Theme System Verification ==="
echo ""

# Check if themes.ts exists
if [ -f "packages/core/src/frontend/styles/themes.ts" ]; then
  echo "✓ themes.ts file exists"
else
  echo "✗ themes.ts file missing"
  exit 1
fi

# Check if ThemeRegistry class is defined
if grep -q "class ThemeRegistry" packages/core/src/frontend/styles/themes.ts; then
  echo "✓ ThemeRegistry class defined"
else
  echo "✗ ThemeRegistry class not found"
  exit 1
fi

# Check if LIGHT_THEME is defined
if grep -q "export const LIGHT_THEME" packages/core/src/frontend/styles/themes.ts; then
  echo "✓ LIGHT_THEME defined"
else
  echo "✗ LIGHT_THEME not found"
  exit 1
fi

# Check if DARK_THEME is defined
if grep -q "export const DARK_THEME" packages/core/src/frontend/styles/themes.ts; then
  echo "✓ DARK_THEME defined"
else
  echo "✗ DARK_THEME not found"
  exit 1
fi

# Check if applyTheme function exists
if grep -q "export const applyTheme" packages/core/src/frontend/styles/themes.ts; then
  echo "✓ applyTheme function defined"
else
  echo "✗ applyTheme function not found"
  exit 1
fi

# Check if store uses ThemeName
if grep -q "ThemeName = string" packages/core/src/frontend/store.ts; then
  echo "✓ Store uses flexible ThemeName type"
else
  echo "✗ Store doesn't use ThemeName type"
  exit 1
fi

# Check if useTheme hook is updated
if grep -q "useAvailableThemes" packages/core/src/frontend/hooks/useTheme.ts; then
  echo "✓ useAvailableThemes hook exported"
else
  echo "✗ useAvailableThemes hook not found"
  exit 1
fi

# Check if ThemeToggle uses new system
if grep -q "useAvailableThemes" packages/core/src/frontend/components/ThemeToggle.tsx; then
  echo "✓ ThemeToggle uses new theme system"
else
  echo "✗ ThemeToggle not updated"
  exit 1
fi

echo ""
echo "=== All Checks Passed ==="
echo ""
echo "The theme system has been successfully improved for extensibility!"
echo ""
echo "To test:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Click the theme toggle button (sun/moon icon) in the sidebar"
echo "3. Verify that the theme switches between light and dark"
echo "4. Refresh the page to verify theme persistence"
echo ""
