## ADDED Requirements

### Requirement: Environment selector UI component

The system SHALL provide a user interface component for selecting active environment.

#### Scenario: Display list of available environments
- **WHEN** environment selector renders
- **THEN** user sees dropdown list showing all saved environments with clear labels

#### Scenario: Highlight currently active environment
- **WHEN** environments are displayed in selector
- **THEN** active environment is visually distinguished (checkmark, highlight, or indicator)

#### Scenario: Allow environment selection
- **WHEN** user clicks on environment in dropdown
- **THEN** system initiates environment switch and updates active indicator

#### Scenario: Display environment metadata
- **WHEN** user hovers or inspects environment in selector
- **THEN** system shows environment details (host, port, description, tags) as tooltip or preview

#### Scenario: Show loading state during switch
- **WHEN** environment switch is in progress
- **THEN** selector displays loading indicator (spinner) with message "⏳ Switching environment..."

#### Scenario: Display connection status
- **WHEN** environment is active and connected
- **THEN** selector shows connected indicator (green dot or icon)

#### Scenario: Display connection error indication
- **WHEN** environment connection fails
- **THEN** selector shows error indicator (red dot) and error message on hover

---

### Requirement: Environment manager UI component

The system SHALL provide interface for managing (create, read, update, delete) environments.

#### Scenario: Create new environment form
- **WHEN** user clicks "Add Environment" or "+" button
- **THEN** system displays form with fields: name, host, port, authentication type, TLS settings, description, tags

#### Scenario: Edit existing environment configuration
- **WHEN** user selects environment and clicks "Edit"
- **THEN** system displays form pre-filled with environment configuration allowing modifications

#### Scenario: Delete environment with confirmation
- **WHEN** user clicks "Delete" on environment
- **THEN** system prompts for confirmation and deletes environment if confirmed

#### Scenario: Duplicate environment configuration
- **WHEN** user clicks "Duplicate" on existing environment
- **THEN** system creates copy with name suffix (e.g., "prod-cluster-copy") pre-filled in form

#### Scenario: Validate required fields in form
- **WHEN** user submits environment configuration form
- **THEN** system validates required fields (name, host) and displays error messages for missing values

#### Scenario: Test connection before saving
- **WHEN** user clicks "Test Connection" button in environment manager
- **THEN** system attempts connection and displays success or error message without saving

#### Scenario: Display existing environments in table or list
- **WHEN** environment manager opens
- **THEN** system displays all saved environments with columns: name, host, auth type, description, active indicator

#### Scenario: Handle save completion feedback
- **WHEN** user successfully saves environment configuration
- **THEN** system displays success message and updates environment list display

#### Scenario: Handle save errors appropriately
- **WHEN** environment save fails (duplicate name, connection error, etc.)
- **THEN** system displays user-friendly error message with suggestion for resolution

---

### Requirement: Environment panel integration

The system SHALL provide unified panel integrating selector and manager.

#### Scenario: Display environment selector and manager in panel
- **WHEN** environment panel renders
- **THEN** user sees selector dropdown and manager controls in organized layout

#### Scenario: Switch environments from panel
- **WHEN** user selects environment in panel selector
- **THEN** panel initiates switch and displays loading/status feedback

#### Scenario: Manage environments from panel
- **WHEN** user interacts with manager controls in panel
- **THEN** panel allows full CRUD operations on environments

#### Scenario: Display auto-dismissing error notifications
- **WHEN** environment operation fails (connection error, invalid config)
- **THEN** panel displays error notification that auto-dismisses after 5 seconds or on user click

#### Scenario: Show active environment information
- **WHEN** environment is successfully switched
- **THEN** panel displays active environment name, host, connection status, and last switched timestamp

#### Scenario: Display switching state in panel
- **WHEN** environment switch is in progress
- **THEN** panel shows loading state with message and blocks environment selection until complete

#### Scenario: Display panel in expandable sidebar section
- **WHEN** application renders left sidebar
- **THEN** environment panel appears as collapsible section below or alongside Kafka Tool panel

---

### Requirement: Integration with left sidebar menu

The system SHALL integrate Elasticsearch environment selector into main application sidebar.

#### Scenario: Display Elasticsearch tool in left sidebar
- **WHEN** application renders left sidebar
- **THEN** Elasticsearch tool appears as menu item alongside Kafka Tool and other tools

#### Scenario: Show active Elasticsearch environment indicator
- **WHEN** user views left sidebar
- **THEN** sidebar displays current active Elasticsearch environment name with connection indicator

#### Scenario: Allow quick environment switching from sidebar
- **WHEN** user clicks on sidebar Elasticsearch section
- **THEN** sidebar expands or panel opens showing environment selector for quick switching

#### Scenario: Display environment connection status in sidebar
- **WHEN** Elasticsearch connection status changes
- **THEN** sidebar indicator updates to show connected (green), connecting (yellow), or error (red) state

#### Scenario: Provide access to environment manager from sidebar
- **WHEN** user right-clicks or uses menu button in sidebar Elasticsearch section
- **THEN** context menu provides options to manage environments, open panel, or view settings

#### Scenario: Maintain independent state from Kafka Tool
- **WHEN** Elasticsearch environment switches
- **THEN** Kafka environment state remains unchanged (tools manage independently)

#### Scenario: Display both Kafka and Elasticsearch active environments simultaneously
- **WHEN** left sidebar renders with both tools active
- **THEN** both Kafka and Elasticsearch current environment indicators are visible without cluttering UI

---

### Requirement: Event-driven UI updates

The system SHALL use events to coordinate UI updates across components.

#### Scenario: Listen for environment switching events
- **WHEN** ElasticsearchService emits elasticsearch:environment:switching event
- **THEN** UI components receive event and display loading/transition state

#### Scenario: Listen for environment switched events
- **WHEN** ElasticsearchService emits elasticsearch:environment:switched event
- **THEN** UI components receive event with new environment details and update display

#### Scenario: Propagate environment information in events
- **WHEN** elasticsearch:environment:switched event is emitted
- **THEN** event contains environment name, client instance, workspace state, and timestamp

#### Scenario: Handle event errors gracefully
- **WHEN** environment switch event indicates error
- **THEN** UI displays error notification with error type and user-friendly message

#### Scenario: Clear loading state on event completion
- **WHEN** elasticsearch:environment:switched event is received
- **THEN** UI removes loading indicator and displays active environment state
