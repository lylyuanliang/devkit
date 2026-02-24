## ADDED Requirements

### Requirement: Switch between saved cluster environments
The system SHALL allow users to switch from one Kafka cluster environment to another, with proper connection lifecycle management (disconnect old, connect new) and user feedback.

#### Scenario: Select and switch to a different environment
- **WHEN** user selects a different environment from the environment list/dropdown
- **THEN** system displays loading state, disconnects from current environment, establishes connection to new environment, and hides loading state upon success

#### Scenario: Handle connection failure during switch
- **WHEN** user switches to an environment but connection establishment fails (e.g., broker unreachable, authentication error)
- **THEN** system displays error message, reverts to previous environment if possible, and remains in a consistent state

#### Scenario: Show loading state during switch
- **WHEN** environment switching begins
- **THEN** system displays a loading indicator (spinner, dimmed UI) to indicate that the operation is in progress and the interface is temporarily unavailable

### Requirement: Preserve workspace state across environment switches
The system SHALL maintain application state (query history, open topics, UI preferences) when switching between environments, allowing users to resume work seamlessly.

#### Scenario: Preserve topic browser state
- **WHEN** user switches environments while browsing a topic
- **THEN** system disconnects from old cluster, connects to new cluster, and maintains the list of recently viewed topics/queries in the UI (topic data refreshes from new cluster)

#### Scenario: Preserve query history
- **WHEN** user switches environments
- **THEN** system keeps the query execution history visible; historical queries remain accessible (though may reference data from previous cluster)

#### Scenario: Preserve consumer group offsets per environment
- **WHEN** user reads messages from a consumer group, switches to another environment, then switches back
- **THEN** system restores the previously recorded offset position for that consumer group in the original environment

### Requirement: Emit environment switch events
The system SHALL emit events at key points during environment switching to allow other components to react and synchronize state.

#### Scenario: Emit event when switching starts
- **WHEN** environment switch is initiated
- **THEN** system emits `kafka:environment:switching` event with payload `{ from: string, to: string }`

#### Scenario: Emit event when switching completes
- **WHEN** environment switch completes successfully
- **THEN** system emits `kafka:environment:switched` event with payload `{ environment: string, success: true }`

#### Scenario: Emit event on switch failure
- **WHEN** environment switch fails
- **THEN** system emits `kafka:environment:switched` event with payload `{ environment: string, success: false, error: string }`

### Requirement: Display active environment prominently
The system SHALL clearly indicate which environment is currently active to prevent accidental operations on wrong clusters.

#### Scenario: Show active environment in UI
- **WHEN** Kafka tool is displayed
- **THEN** system shows the currently active environment name in the header, toolbar, or prominent location with visual distinction (e.g., bold, highlight, badge)

#### Scenario: Update display on switch
- **WHEN** environment switch completes
- **THEN** system updates the active environment display to reflect the new environment
