## ADDED Requirements

### Requirement: Tool Menu Display

The system SHALL display a searchable, categorized list of available tools in the sidebar.

#### Scenario: Tool menu shows categories
- **WHEN** the sidebar is expanded
- **THEN** tools SHALL be organized into categories (e.g., "Messaging", "Database", "Monitoring")
- **AND** each category SHALL be collapsible/expandable

#### Scenario: Tool list displays
- **WHEN** a category is expanded
- **THEN** all tools in that category SHALL be listed
- **AND** each tool SHALL display its name and icon

#### Scenario: Tool status indicator
- **WHEN** a tool is displayed in the menu
- **THEN** a status indicator SHALL show: 🟢 (connected), 🔴 (disconnected), or ⚪ (not configured)

### Requirement: Tool Search

The system SHALL provide a search function to filter tools by name.

#### Scenario: Search filters tools
- **WHEN** the user types in the search box
- **THEN** the tool list SHALL be filtered to show only matching tools
- **AND** the search SHALL be case-insensitive

#### Scenario: Search across categories
- **WHEN** the user searches
- **THEN** results SHALL include tools from all categories
- **AND** matching tools SHALL be displayed regardless of category

#### Scenario: Clear search
- **WHEN** the user clears the search box
- **THEN** all tools SHALL be displayed again
- **AND** the original category structure SHALL be restored

### Requirement: Recent Tools

The system SHALL track and display recently used tools.

#### Scenario: Recent tools section
- **WHEN** the sidebar is expanded
- **THEN** a "Recent" section SHALL appear at the top
- **AND** it SHALL show the 5 most recently opened tools

#### Scenario: Recent tools update
- **WHEN** the user opens a tool
- **THEN** that tool SHALL be added to the recent list
- **AND** if the list exceeds 5 items, the oldest SHALL be removed

#### Scenario: Recent tools persist
- **WHEN** the application restarts
- **THEN** the recent tools list SHALL be restored
- **AND** it SHALL show the same tools as before

### Requirement: Tool Open Action

The system SHALL allow users to open tools from the menu.

#### Scenario: Open tool from menu
- **WHEN** the user clicks on a tool in the menu
- **THEN** a new tab SHALL be created for that tool
- **AND** the tool SHALL be initialized and displayed

#### Scenario: Open already-open tool
- **WHEN** the user clicks on a tool that is already open in a tab
- **THEN** the existing tab SHALL be activated
- **AND** no duplicate tab SHALL be created
