## ADDED Requirements

### Requirement: Reusable styled components
The system SHALL provide reusable styled components built with Tailwind CSS.

#### Scenario: Button component is reusable
- **WHEN** developers import Button component
- **THEN** it renders with consistent Tailwind styling

#### Scenario: Input component is reusable
- **WHEN** developers import Input component
- **THEN** it renders with consistent Tailwind styling

#### Scenario: Card component is reusable
- **WHEN** developers import Card component
- **THEN** it renders with consistent Tailwind styling

### Requirement: Component variants support
The system SHALL support component variants (primary, secondary, danger, etc.) using Tailwind classes.

#### Scenario: Button variants render correctly
- **WHEN** Button component receives variant prop
- **THEN** it applies appropriate Tailwind classes for that variant

#### Scenario: Input variants render correctly
- **WHEN** Input component receives variant prop
- **THEN** it applies appropriate Tailwind classes for that variant

### Requirement: Component composition
The system SHALL allow composing components together using Tailwind utilities.

#### Scenario: Components can be nested
- **WHEN** components are nested
- **THEN** Tailwind classes compose correctly without conflicts

#### Scenario: Custom classes can be added
- **WHEN** developer passes className prop
- **THEN** custom Tailwind classes merge with component defaults
