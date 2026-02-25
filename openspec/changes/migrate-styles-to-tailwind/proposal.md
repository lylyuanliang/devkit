## Why

The application currently uses inconsistent styling approaches: KafkaToolComponent uses inline styles with a custom theme system, while ConsumerGroupsContainer uses Tailwind CSS. This inconsistency makes maintenance difficult and prevents leveraging Tailwind's utility-first benefits. Migrating to Tailwind CSS as the unified framework will improve code maintainability, consistency, and developer experience.

## What Changes

- Migrate KafkaToolComponent and all related UI components from inline styles to Tailwind CSS classes
- Replace custom theme CSS variables with Tailwind's theme configuration
- Update all component styling to use Tailwind utility classes instead of inline `style` props
- Maintain dark/light theme support through Tailwind's dark mode configuration
- Ensure visual consistency across all UI components

## Capabilities

### New Capabilities
- `tailwind-unified-styling`: Unified styling system using Tailwind CSS across all components
- `tailwind-theme-system`: Dark/light theme support integrated with Tailwind configuration
- `tailwind-component-library`: Reusable styled components using Tailwind utilities

### Modified Capabilities
- `consumer-groups-ui`: Update ConsumerGroupsContainer to integrate seamlessly with Tailwind-based application
- `kafka-tool-ui`: Refactor KafkaToolComponent to use Tailwind CSS instead of inline styles

## Impact

- **Affected Code**:
  - `packages/tools/kafka-tool/src/ui/KafkaToolComponent.tsx`
  - `packages/tools/kafka-tool/src/ui/ConsumerGroupsView.tsx`
  - `packages/core/src/frontend/components/ConsumerGroupsContainer.tsx`
  - All related UI component files

- **Dependencies**:
  - Tailwind CSS (already installed)
  - PostCSS configuration (already configured)

- **Breaking Changes**: None - this is a styling refactor with no API changes

- **Systems Affected**:
  - Frontend UI rendering
  - Theme system
  - Component styling
