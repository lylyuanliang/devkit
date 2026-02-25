## MODIFIED Requirements

### Requirement: KafkaToolComponent uses Tailwind CSS
The system SHALL refactor KafkaToolComponent to use Tailwind CSS classes instead of inline styles.

#### Scenario: Cluster management view uses Tailwind styling
- **WHEN** cluster management view renders
- **THEN** all elements use Tailwind classes for layout, spacing, and colors

#### Scenario: Topics view uses Tailwind styling
- **WHEN** topics view renders
- **THEN** topic cards and list use Tailwind classes for styling

#### Scenario: Consumer groups view uses Tailwind styling
- **WHEN** consumer groups view renders
- **THEN** all elements use Tailwind classes for layout and styling

#### Scenario: Produce message view uses Tailwind styling
- **WHEN** produce message view renders
- **THEN** form inputs and buttons use Tailwind classes

### Requirement: Theme switching works in KafkaToolComponent
The system SHALL support dark/light theme switching in KafkaToolComponent using Tailwind's dark mode.

#### Scenario: Dark mode applies to all views
- **WHEN** user switches to dark mode
- **THEN** all KafkaToolComponent views render with dark theme colors

#### Scenario: Light mode applies to all views
- **WHEN** user switches to light mode
- **THEN** all KafkaToolComponent views render with light theme colors

### Requirement: Responsive layout in KafkaToolComponent
The system SHALL support responsive design in KafkaToolComponent using Tailwind breakpoints.

#### Scenario: Mobile layout adapts
- **WHEN** viewport is narrow
- **THEN** KafkaToolComponent layout adapts using Tailwind responsive classes

#### Scenario: Desktop layout adapts
- **WHEN** viewport is wide
- **THEN** KafkaToolComponent layout adapts using Tailwind responsive classes

### Requirement: Consistent styling across all KafkaToolComponent views
The system SHALL maintain consistent styling across clusters, topics, consumer-groups, and produce views.

#### Scenario: Headers are consistent
- **WHEN** any view renders
- **THEN** headers use the same Tailwind styling

#### Scenario: Buttons are consistent
- **WHEN** any view renders
- **THEN** buttons use the same Tailwind styling

#### Scenario: Input fields are consistent
- **WHEN** any view renders
- **THEN** input fields use the same Tailwind styling
