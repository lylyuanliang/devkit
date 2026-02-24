## ADDED Requirements

### Requirement: Topic selector and message list view
The system SHALL display the selected topic with a message list showing recent messages from the configured starting position.

#### Scenario: Display topic messages from latest
- **WHEN** user opens a topic with default "from latest" setting
- **THEN** system displays the most recent messages in the topic (newest first)

#### Scenario: Display topic messages from earliest
- **WHEN** user opens a topic with "from earliest" setting
- **THEN** system displays messages starting from the beginning of the topic (oldest first)

#### Scenario: Message list shows essential fields
- **WHEN** displaying messages in the list
- **THEN** system shows partition, offset, timestamp, key (if present), and message value preview

#### Scenario: Click message to view details
- **WHEN** user clicks on a message in the list
- **THEN** system opens a detail panel showing full message content, all metadata, and formatting options

### Requirement: Virtual scrolling for large message lists
The system SHALL implement virtual scrolling to efficiently display large numbers of messages without performance degradation.

#### Scenario: Load messages on demand
- **WHEN** user scrolls through the message list
- **THEN** system loads additional messages in background and renders only visible portion

#### Scenario: Scroll upward to load older messages
- **WHEN** user scrolls to the top of the list
- **THEN** system fetches and displays older messages (lower offsets)

#### Scenario: Scroll downward to load newer messages
- **WHEN** user scrolls to the bottom of the list
- **THEN** system fetches and displays newer messages (higher offsets)

### Requirement: Message detail view
The system SHALL provide a detailed view of individual messages with all metadata and formatting options.

#### Scenario: Display message metadata
- **WHEN** user opens message details
- **THEN** system displays partition, offset, timestamp (formatted), key, and headers

#### Scenario: Display message value in JSON format
- **WHEN** message value is valid JSON
- **THEN** system displays JSON with syntax highlighting and indentation

#### Scenario: Display message value as plain text
- **WHEN** message value is not JSON or user selects plain text view
- **THEN** system displays raw message content as text

#### Scenario: Display binary message as Base64
- **WHEN** message contains non-UTF-8 binary data
- **THEN** system provides option to view as Base64 or hexadecimal encoding

#### Scenario: Copy message to clipboard
- **WHEN** user clicks "Copy" button in message detail view
- **THEN** system copies the message value to clipboard

### Requirement: Consumer starting position configuration
The system SHALL allow users to specify where to start consuming messages (earliest, latest, or specific offset).

#### Scenario: Consume from latest position
- **WHEN** user selects "latest" option before starting consumption
- **THEN** system starts consuming from the most recent messages in the topic

#### Scenario: Consume from earliest position
- **WHEN** user selects "earliest" option
- **THEN** system starts consuming from the beginning of the topic

#### Scenario: Consume from specific offset
- **WHEN** user selects "from offset" and enters an offset number
- **THEN** system starts consuming from that offset on the selected partition

#### Scenario: Consume from specific timestamp
- **WHEN** user selects "from timestamp" and enters a date/time
- **THEN** system starts consuming from the earliest message at or after that timestamp

### Requirement: Partition selection
The system SHALL allow users to consume from specific partitions or all partitions.

#### Scenario: Select single partition
- **WHEN** user selects a specific partition number
- **THEN** system displays messages only from that partition with their offsets

#### Scenario: View all partitions together
- **WHEN** user selects "all partitions"
- **THEN** system displays messages from all partitions, labeled with partition number

#### Scenario: Partition information display
- **WHEN** viewing messages from a partition
- **THEN** system displays total message count, earliest offset, and latest offset for that partition

### Requirement: Message preview truncation
The system SHALL show concise message previews in the list while allowing full content view in detail panel.

#### Scenario: Truncate long message values
- **WHEN** message value exceeds 200 characters
- **THEN** system displays first 200 characters in the list with "..." ellipsis

#### Scenario: Show full message in detail view
- **WHEN** user opens message detail panel
- **THEN** system displays complete message value without truncation

### Requirement: Loading and empty states
The system SHALL provide clear feedback when loading messages or when no messages are available.

#### Scenario: Display loading spinner
- **WHEN** system is fetching messages from Kafka
- **THEN** system displays "Loading messages..." with a spinner

#### Scenario: Display empty state
- **WHEN** selected topic has no messages in the consumption window
- **THEN** system displays "No messages found in selected range"

#### Scenario: Connection loss feedback
- **WHEN** connection to cluster is lost during message consumption
- **THEN** system displays error "Connection lost" and allows retry
