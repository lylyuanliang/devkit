## ADDED Requirements

### Requirement: Display Onboarding Interface When No Consumer Groups Exist
The system SHALL display a user-friendly onboarding interface when no consumer groups are found, guiding users on how to create or experience consumer groups through multiple options.

#### Scenario: Show onboarding screen
- **WHEN** user opens the MessageConsumer page and no consumer groups are found
- **THEN** system displays the onboarding interface instead of an empty list

#### Scenario: Onboarding interface layout
- **WHEN** onboarding interface is displayed
- **THEN** system shows: Title "還沒有消費者組？", description, and three main action buttons/sections

#### Scenario: Option 1 - View usage guide
- **WHEN** user clicks "📖 查看使用指南"
- **THEN** system displays a modal or expandable section with code examples showing how to create a Kafka consumer group in common languages (Node.js, Python, Java)

#### Scenario: Option 2 - Create demo consumer group
- **WHEN** user clicks "🎬 創建演示消費者組"
- **THEN** system shows a form to select a topic and create a temporary demo consumer group

#### Scenario: Option 3 - View system topic
- **WHEN** user clicks "🔍 查看系統主題"
- **THEN** system navigates to the Topic view and shows the __consumer_offsets system topic to demonstrate Kafka's internal consumer group tracking

#### Scenario: Auto-hide onboarding when groups appear
- **WHEN** a real consumer group is created and appears in the system
- **THEN** system automatically hides the onboarding interface and shows the group list

### Requirement: Create Demo Consumer Group
The system SHALL allow users to create a temporary demo consumer group that automatically starts consuming from a selected topic to demonstrate consumer group functionality without requiring a real application.

#### Scenario: Display demo group creation form
- **WHEN** user selects "Create Demo Consumer Group"
- **THEN** system displays a form with: Topic selector dropdown, "Create Demo Group" button, and cancel option

#### Scenario: Select topic for demo
- **WHEN** user clicks the topic selector
- **THEN** system displays a dropdown list of available topics in the cluster (excluding system topics)

#### Scenario: Create demo group
- **WHEN** user selects a topic and clicks "Create Demo Consumer Group"
- **THEN** system: creates a consumer group with auto-generated ID (demo-group-<timestamp>), starts consuming from the topic, and returns to the group list showing the new demo group

#### Scenario: Demo group appears in list
- **WHEN** demo group is created
- **THEN** system immediately shows the demo group in the consumer groups list with a visual indicator (badge) showing it's a demo group

#### Scenario: Demo group auto-stop
- **WHEN** demo group has been inactive (not viewed or interacted with) for 5 minutes
- **THEN** system automatically stops consuming and displays a message "Demo group inactive, stopped consuming. [Resume] or [Delete]"

#### Scenario: Resume or delete demo group
- **WHEN** demo group is stopped
- **THEN** user can choose to resume consuming or delete the demo group

#### Scenario: Handle demo group creation error
- **WHEN** demo group creation fails
- **THEN** system displays an error message explaining the reason (e.g., topic not found, permission denied) and provides a "Retry" button

### Requirement: Usage Guide and Documentation
The system SHALL provide inline documentation and code examples to help new users understand how to create consumer groups in their applications.

#### Scenario: Display usage guide modal
- **WHEN** user clicks "View Usage Guide" from onboarding
- **THEN** system displays a modal with tabs for different programming languages: Node.js, Python, Java, etc.

#### Scenario: Show code examples
- **WHEN** user selects a language tab in the usage guide
- **THEN** system displays a complete, copy-paste-ready code example showing how to create a Kafka consumer group in that language

#### Scenario: Example includes key concepts
- **WHEN** code example is displayed
- **THEN** it includes comments explaining: groupId, topic subscription, message handler, and the relationship between the consumer group shown in this tool

#### Scenario: Copy code button
- **WHEN** user views a code example
- **THEN** a "Copy Code" button is available to copy the entire example to clipboard

#### Scenario: Link to external documentation
- **WHEN** usage guide is displayed
- **THEN** provide links to official Kafka documentation and this tool's own documentation for further reference
