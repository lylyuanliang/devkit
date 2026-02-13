## ADDED Requirements

### Requirement: CSS Variables for Theming

The system SHALL use CSS custom properties to define theme colors.

#### Scenario: CSS variables are defined
- **WHEN** the application loads
- **THEN** CSS variables for light and dark themes SHALL be defined
- **AND** variables SHALL include colors for background, text, borders, and accents

#### Scenario: CSS variables are applied
- **WHEN** a theme is selected
- **THEN** the appropriate CSS variables SHALL be set on the root element
- **AND** all components using these variables SHALL automatically update

#### Scenario: Theme colors are consistent
- **WHEN** the theme is applied
- **THEN** all UI elements SHALL use colors from the CSS variables
- **AND** there SHALL be no hardcoded colors that don't respect the theme

### Requirement: Light Theme Styling

The system SHALL provide a complete light theme with appropriate colors.

#### Scenario: Light theme colors are defined
- **WHEN** light theme is active
- **THEN** background colors SHALL be light (white or near-white)
- **AND** text colors SHALL be dark (black or near-black)
- **AND** accent colors SHALL be visible on light backgrounds

### Requirement: Dark Theme Styling

The system SHALL provide a complete dark theme with appropriate colors.

#### Scenario: Dark theme colors are defined
- **WHEN** dark theme is active
- **THEN** background colors SHALL be dark (dark gray or near-black)
- **AND** text colors SHALL be light (white or near-white)
- **AND** accent colors SHALL be visible on dark backgrounds

#### Scenario: Dark theme is readable
- **WHEN** dark theme is active
- **THEN** text contrast SHALL meet WCAG AA standards
- **AND** all UI elements SHALL be clearly visible

### Requirement: Tool Theme Inheritance

Tools SHALL automatically inherit and apply the current theme without requiring individual theme implementation.

#### Scenario: Tool inherits theme colors
- **WHEN** a tool is rendered in the work area
- **THEN** the tool SHALL automatically use the current theme colors
- **AND** the tool SHALL not need to implement theme switching logic

#### Scenario: Tool responds to theme changes
- **WHEN** the user changes the theme
- **THEN** all open tools SHALL immediately update to reflect the new theme
- **AND** the tool's colors SHALL match the application theme

#### Scenario: Tool uses CSS variables
- **WHEN** a tool is developed
- **THEN** the tool SHALL use CSS variables for colors instead of hardcoded values
- **AND** the tool SHALL inherit colors from the root CSS variables

### Requirement: useTheme Hook for Tools

Tools MAY access the current theme state via a useTheme hook for advanced use cases.

#### Scenario: Tool accesses theme state
- **WHEN** a tool needs to know the current theme programmatically
- **THEN** the tool SHALL be able to call useTheme() hook
- **AND** the hook SHALL return the current theme ('light' or 'dark')

#### Scenario: Tool responds to theme changes programmatically
- **WHEN** the theme changes
- **THEN** components using useTheme() SHALL be notified
- **AND** the component SHALL re-render with the new theme value

