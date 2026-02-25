## MODIFIED Requirements

### Requirement: Consumer groups list displays with Tailwind styling
The system SHALL display consumer groups list using Tailwind CSS classes for all styling.

#### Scenario: Consumer groups table renders
- **WHEN** ConsumerGroupsView component renders
- **THEN** table displays with Tailwind-styled rows and columns

#### Scenario: Search input uses Tailwind styling
- **WHEN** search input is displayed
- **THEN** input field uses Tailwind classes for borders, padding, and focus states

#### Scenario: Refresh button uses Tailwind styling
- **WHEN** refresh button is displayed
- **THEN** button uses Tailwind classes for background, text, hover, and disabled states

### Requirement: Consumer group details page uses Tailwind styling
The system SHALL display consumer group details using Tailwind CSS classes.

#### Scenario: Details page renders with Tailwind styling
- **WHEN** ConsumerGroupDetailsPage renders
- **THEN** all elements use Tailwind classes for layout and styling

#### Scenario: Dialog components use Tailwind styling
- **WHEN** ResetOffsetsDialog or DeleteGroupDialog renders
- **THEN** dialogs use Tailwind classes for modal styling, buttons, and form elements

### Requirement: Consistent styling with KafkaToolComponent
The system SHALL maintain visual consistency between ConsumerGroupsView and KafkaToolComponent.

#### Scenario: Colors match between components
- **WHEN** both components render
- **THEN** they use the same Tailwind color palette

#### Scenario: Spacing matches between components
- **WHEN** both components render
- **THEN** they use the same Tailwind spacing scale

#### Scenario: Typography matches between components
- **WHEN** both components render
- **THEN** they use the same Tailwind font sizes and weights
