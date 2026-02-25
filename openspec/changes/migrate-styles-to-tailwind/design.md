## Context

The application has two different styling approaches:
- **KafkaToolComponent**: Uses inline styles with a custom theme system (CSS variables in theme.css)
- **ConsumerGroupsContainer**: Uses Tailwind CSS with utility classes

This inconsistency creates maintenance burden and prevents leveraging Tailwind's full capabilities. The project already has Tailwind CSS installed and configured (tailwind.config.js, postcss.config.cjs), making migration straightforward.

Current state:
- Tailwind CSS v4.1.18 installed
- Theme CSS variables defined for light/dark modes
- KafkaToolComponent uses ~2000+ lines with inline styles
- ConsumerGroupsContainer properly uses Tailwind classes

## Goals / Non-Goals

**Goals:**
- Unify all UI components to use Tailwind CSS
- Maintain existing dark/light theme functionality
- Improve code maintainability and consistency
- Enable future component library development
- Preserve all visual appearance and functionality

**Non-Goals:**
- Change application behavior or APIs
- Redesign UI components (styling only)
- Migrate backend code
- Update non-UI components

## Decisions

### Decision 1: Use Tailwind CSS as the unified framework
**Rationale**: Already installed, configured, and proven in ConsumerGroupsContainer. Utility-first approach reduces code duplication and improves maintainability.

**Alternatives considered**:
- Keep inline styles: Would perpetuate inconsistency
- Use CSS Modules: More verbose, doesn't leverage existing Tailwind setup
- Use styled-components: Unnecessary complexity, Tailwind is simpler

### Decision 2: Extend Tailwind theme with CSS variables for dark mode
**Rationale**: Tailwind's built-in dark mode support works well with CSS variables. Allows smooth theme switching without component changes.

**Alternatives considered**:
- Use Tailwind's class-based dark mode: Requires adding `dark:` prefix everywhere
- Remove CSS variables entirely: Loses flexibility for future customization

### Decision 3: Migrate components in phases
**Rationale**: Reduces risk and allows testing each component independently.

**Phase 1**: KafkaToolComponent and related UI files
**Phase 2**: ConsumerGroupsContainer integration
**Phase 3**: Remaining components

### Decision 4: Keep component structure unchanged
**Rationale**: Styling refactor should not require architectural changes. Reduces risk and testing burden.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Visual regression during migration | Comprehensive visual testing after each phase; keep inline styles as reference |
| Tailwind class name conflicts | Use Tailwind's namespace/prefix if needed; review generated CSS |
| Performance impact | Tailwind's PurgeCSS removes unused styles; monitor bundle size |
| Learning curve for team | Tailwind documentation is excellent; utility classes are intuitive |
| Dark mode edge cases | Test all components in both light and dark modes |

## Migration Plan

**Phase 1: KafkaToolComponent**
1. Analyze current inline styles and map to Tailwind equivalents
2. Create Tailwind utility class versions of styled components
3. Replace inline styles with Tailwind classes
4. Test all views (clusters, topics, produce, consumer-groups)
5. Verify dark/light theme switching

**Phase 2: ConsumerGroupsView**
1. Update ConsumerGroupsView to use Tailwind classes
2. Ensure consistency with KafkaToolComponent styling
3. Test integration with main application

**Phase 3: Remaining components**
1. Update any other UI components
2. Remove unused CSS variables if applicable
3. Final visual regression testing

**Rollback Strategy**:
- Keep git history; can revert commits if issues arise
- No database or API changes, so rollback is safe

## Open Questions

1. Should we create a Tailwind component library for reusable styled components?
2. Do we need custom Tailwind plugins for specific design patterns?
3. Should we add Tailwind CSS IntelliSense to the project setup?
