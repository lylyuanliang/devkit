## Why

Users need a way to switch between light and dark themes to improve readability and reduce eye strain in different lighting conditions. This is a common UX feature that enhances user experience and accessibility.

## What Changes

- Add a theme toggle button to the UI (in the header or sidebar)
- Support light and dark color schemes
- Persist theme preference to local storage
- Apply theme colors to all UI components
- Update CSS variables for dynamic theming

## Capabilities

### New Capabilities

- `theme-switcher`: UI component that allows users to toggle between light and dark themes
- `theme-persistence`: System to save and restore user's theme preference across sessions
- `theme-styling`: CSS variables and styling system that supports light/dark theme variants

### Modified Capabilities

- `core-ui-shell`: Modified to support theme switching and apply theme colors to the main layout

## Impact

- `packages/core/src/frontend/components/`: Add theme toggle button component
- `packages/core/src/frontend/store.ts`: Add theme state to Zustand store
- `packages/core/src/frontend/styles/`: Add CSS variables and theme-specific styles
- `packages/core/src/frontend/hooks/`: Add useTheme hook for theme management
