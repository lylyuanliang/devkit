# Tailwind CSS Migration Guide

## Overview
This guide documents the migration from inline styles to Tailwind CSS for the DevKit application.

## What Changed

### Before (Inline Styles)
```tsx
const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.containerBg,
    display: 'flex',
    flexDirection: 'column',
  },
};

<div style={styles.container}>...</div>
```

### After (Tailwind CSS)
```tsx
<div className="w-full h-full bg-gray-50 dark:bg-slate-950 flex flex-col">...</div>
```

## Benefits

1. **Smaller Bundle Size**: Tailwind's PurgeCSS removes unused styles
2. **Better Performance**: No runtime style object creation
3. **Easier Maintenance**: Styles are co-located with markup
4. **Dark Mode Support**: Built-in dark mode with `dark:` prefix
5. **Responsive Design**: Easy breakpoint management with `sm:`, `md:`, `lg:` prefixes
6. **Consistency**: Shared utility classes ensure visual consistency

## Migration Steps

### 1. Update tailwind.config.js
- Add content paths for all components
- Enable dark mode with `darkMode: 'class'`
- Extend theme with custom colors if needed

### 2. Replace Inline Styles
- Identify all `style={{}}` props
- Map to equivalent Tailwind classes
- Use `dark:` prefix for dark mode variants
- Use responsive prefixes for breakpoints

### 3. Create Reusable Components
- Extract common patterns into components
- Use Tailwind classes in component definitions
- Accept `className` prop for customization

### 4. Test Thoroughly
- Visual regression testing
- Dark mode switching
- Responsive layouts
- Keyboard navigation
- Browser compatibility

## Common Mappings

| Inline Style | Tailwind Class |
|---|---|
| `width: '100%'` | `w-full` |
| `height: '100%'` | `h-full` |
| `display: 'flex'` | `flex` |
| `flexDirection: 'column'` | `flex-col` |
| `padding: '24px'` | `p-6` |
| `marginBottom: '16px'` | `mb-4` |
| `backgroundColor: '#fff'` | `bg-white` |
| `color: '#333'` | `text-gray-900` |
| `borderRadius: '8px'` | `rounded-lg` |
| `boxShadow: '0 1px 3px'` | `shadow-sm` |

## Dark Mode Usage

```tsx
// Light mode: bg-white, dark mode: bg-slate-800
<div className="bg-white dark:bg-slate-800">...</div>

// Light mode: text-gray-900, dark mode: text-gray-100
<p className="text-gray-900 dark:text-gray-100">...</p>
```

## Responsive Design

```tsx
// Mobile: 1 column, tablet: 2 columns, desktop: 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>

// Mobile: small padding, desktop: large padding
<div className="p-4 md:p-6">...</div>
```

## Component Library

Reusable components are available in `components.tsx`:
- `Button`: Interactive button with variants
- `Input`: Text input with label and error
- `Card`: Container component
- `Table`: Data table with header and rows

See `COMPONENTS.md` for detailed documentation.

## Files Modified

- `tailwind.config.js`: Updated content paths and dark mode
- `packages/tools/kafka-tool/src/ui/KafkaToolComponent.tsx`: Migrated to Tailwind
- `packages/tools/kafka-tool/src/ui/ConsumerGroupsView.tsx`: Migrated to Tailwind
- `packages/tools/kafka-tool/src/ui/components.tsx`: New component library
- `packages/tools/kafka-tool/src/ui/tailwindClasses.ts`: Tailwind class mappings

## Files Backed Up

- `packages/tools/kafka-tool/src/ui/KafkaToolComponent.inline-styles.backup.tsx`: Original inline styles version

## Next Steps

1. Migrate remaining components to Tailwind
2. Create additional reusable components as needed
3. Update project documentation
4. Consider adding Tailwind CSS IntelliSense to IDE
5. Monitor bundle size and performance

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
