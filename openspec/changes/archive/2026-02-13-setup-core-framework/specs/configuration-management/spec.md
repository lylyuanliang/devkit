## ADDED Requirements

### Requirement: Configuration Storage

The system SHALL persist tool configurations and application state in a local SQLite database.

#### Scenario: Configuration is saved
- **WHEN** a tool's configuration is updated
- **THEN** the configuration SHALL be persisted to the database
- **AND** the configuration SHALL survive application restarts

#### Scenario: Configuration is retrieved
- **WHEN** a tool is initialized
- **THEN** the system SHALL retrieve its saved configuration from the database
- **AND** the tool SHALL use this configuration to establish connections

#### Scenario: Configuration schema
- **WHEN** the application starts
- **THEN** the database schema SHALL be created if it doesn't exist
- **AND** the schema SHALL include tables for tool_configs, connections, and recent_items

### Requirement: Connection Management

The system SHALL manage tool connections and their credentials securely.

#### Scenario: Store connection
- **WHEN** a user configures a tool connection (e.g., Kafka broker address)
- **THEN** the connection details SHALL be stored in the database
- **AND** sensitive data (passwords, tokens) SHALL be stored securely

#### Scenario: Retrieve connection
- **WHEN** a tool needs to connect
- **THEN** the system SHALL retrieve the connection details from the database
- **AND** the tool SHALL use these details to establish the connection

#### Scenario: Update connection
- **WHEN** a user modifies connection details
- **THEN** the updated details SHALL be persisted to the database
- **AND** existing connections using the old details SHALL be closed and re-established

#### Scenario: Delete connection
- **WHEN** a user deletes a connection
- **THEN** the connection details SHALL be removed from the database
- **AND** any active connections using those details SHALL be closed

### Requirement: Application State Persistence

The system SHALL persist application state such as sidebar state, tab order, and window size.

#### Scenario: Window size persists
- **WHEN** the user resizes the application window
- **THEN** the new size SHALL be saved
- **AND** when the application restarts, the window SHALL be the same size

#### Scenario: Tab state persists
- **WHEN** the user has multiple tabs open
- **THEN** the tab order and active tab SHALL be saved
- **AND** when the application restarts, the tabs SHALL be restored in the same state

#### Scenario: Sidebar state persists
- **WHEN** the user collapses or expands the sidebar
- **THEN** the state SHALL be saved
- **AND** when the application restarts, the sidebar SHALL be in the same state
