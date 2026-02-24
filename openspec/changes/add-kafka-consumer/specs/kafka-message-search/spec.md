## ADDED Requirements

### Requirement: Search messages by key
The system SHALL allow users to search for messages by their message key.

#### Scenario: Search key prefix
- **WHEN** user enters a key prefix in the search box
- **THEN** system filters displayed messages to show only those where key starts with the prefix

#### Scenario: Exact key match
- **WHEN** user enables "exact match" and enters a key
- **THEN** system displays only messages with that exact key value

#### Scenario: Case-sensitive key search
- **WHEN** user searches for a key
- **THEN** search is case-sensitive; user can toggle case-insensitive option

#### Scenario: Key search on displayed messages
- **WHEN** user performs key search
- **THEN** search applies to currently loaded messages (not entire topic)

### Requirement: Search messages by content
The system SHALL allow users to search for text within message values.

#### Scenario: Full-text search
- **WHEN** user enters search text
- **THEN** system searches message values and highlights matches

#### Scenario: Search highlights matches
- **WHEN** search results are displayed
- **THEN** matching text is highlighted in yellow in message list and detail view

#### Scenario: Case-insensitive search option
- **WHEN** user toggles "case insensitive"
- **THEN** search ignores case in both search term and message content

#### Scenario: Search in JSON field
- **WHEN** message is JSON and user enables JSON path search
- **THEN** system can search specific JSON fields (e.g., "user.email contains 'example'")

### Requirement: Search by offset range
The system SHALL allow users to filter messages within an offset range.

#### Scenario: Filter by offset range
- **WHEN** user specifies min and max offset
- **THEN** system displays only messages within that offset range

#### Scenario: Filter by timestamp range
- **WHEN** user selects date/time range
- **THEN** system filters messages within that time window

#### Scenario: Combine offset and content search
- **WHEN** user specifies both offset range and search text
- **THEN** system applies both filters (AND logic)

### Requirement: Search UI controls
The system SHALL provide clear search interface with input fields and filter options.

#### Scenario: Display search box
- **WHEN** user views the messages list
- **THEN** system displays search box with placeholders for different search types

#### Scenario: Clear search
- **WHEN** user clicks "Clear" button or deletes search text
- **THEN** system removes filter and displays all messages again

#### Scenario: Search result count
- **WHEN** search is applied
- **THEN** system displays count "N messages match search"

#### Scenario: No results message
- **WHEN** search returns no results
- **THEN** system displays "No messages match search criteria"

### Requirement: Search performance on large datasets
The system SHALL handle search efficiently on large message sets without blocking UI.

#### Scenario: Search with debouncing
- **WHEN** user types in search box
- **THEN** system debounces search input (e.g., 300ms) before filtering

#### Scenario: Limit search scope
- **WHEN** search would require scanning large number of messages
- **THEN** system limits search to currently loaded messages and displays "searching in visible messages"

#### Scenario: Async search operation
- **WHEN** search is in progress
- **THEN** system shows loading indicator; user can cancel search
