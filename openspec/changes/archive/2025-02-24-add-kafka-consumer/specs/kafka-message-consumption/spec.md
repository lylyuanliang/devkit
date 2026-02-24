## MODIFIED Requirements

### Requirement: Consume and display messages from topic
The system SHALL allow users to browse and view messages from any topic in the connected Kafka cluster with full message details.

#### Scenario: View recent messages from topic
- **WHEN** user selects a topic from the list
- **THEN** system displays the most recent messages with partition, offset, key, timestamp, and value preview

#### Scenario: View message details
- **WHEN** user clicks on a message in the list
- **THEN** system opens detail panel showing complete message metadata and full content with formatting

#### Scenario: Navigate between messages
- **WHEN** user is viewing message details
- **THEN** system displays previous/next buttons to navigate between messages without closing detail panel

#### Scenario: Handle messages with no key
- **WHEN** message has null key
- **THEN** system displays "(no key)" in the UI and message list

### Requirement: Support multiple message formats
The system SHALL display messages in appropriate formats based on content type with syntax highlighting.

#### Scenario: Display JSON message
- **WHEN** message value is valid JSON
- **THEN** system displays with syntax highlighting, indentation, and collapsible JSON tree view

#### Scenario: Display plain text message
- **WHEN** message is plain text (not JSON)
- **THEN** system displays as plain text without formatting

#### Scenario: Display binary message
- **WHEN** message contains binary data
- **THEN** system offers view options: Base64, hexadecimal, or raw

#### Scenario: Format detection
- **WHEN** displaying a message
- **THEN** system automatically detects format; user can override if desired

### Requirement: Consumer message navigation and filtering
The system SHALL support flexible offset positioning and message filtering for efficient message browsing.

#### Scenario: Consume from latest
- **WHEN** user selects "latest" position
- **THEN** system displays most recent messages in the topic

#### Scenario: Consume from earliest
- **WHEN** user selects "earliest" position
- **THEN** system displays oldest messages in the topic

#### Scenario: Consume from specific offset
- **WHEN** user specifies starting offset
- **THEN** system fetches and displays messages starting from that offset

#### Scenario: Consume from timestamp
- **WHEN** user specifies a timestamp
- **THEN** system finds earliest message at or after timestamp and starts consuming from there

#### Scenario: Consume from single partition
- **WHEN** user selects specific partition
- **THEN** system displays messages only from that partition

### Requirement: Real-time message metadata display
The system SHALL show complete metadata for each message including broker-assigned values.

#### Scenario: Display partition and offset
- **WHEN** viewing a message
- **THEN** system displays partition number and offset value

#### Scenario: Display timestamp
- **WHEN** viewing a message
- **THEN** system displays message timestamp in human-readable format (and raw milliseconds)

#### Scenario: Display key
- **WHEN** message has a key
- **THEN** system displays key value with same formatting as value (e.g., JSON if applicable)

#### Scenario: Display headers if present
- **WHEN** message has Kafka headers
- **THEN** system displays header key-value pairs

### Requirement: Message consumption feedback and error handling
The system SHALL provide clear feedback during message consumption and handle errors gracefully.

#### Scenario: Loading indicator
- **WHEN** system is fetching messages from Kafka
- **THEN** displays "Loading messages..." with spinner

#### Scenario: Connection error
- **WHEN** connection to cluster is lost during consumption
- **THEN** displays error message and offers retry option

#### Scenario: Topic not found
- **WHEN** selected topic is deleted
- **THEN** displays error "Topic no longer exists" and switches back to topic list

#### Scenario: No messages in range
- **WHEN** offset range contains no messages
- **THEN** displays "No messages found in this range"

### Requirement: Message consumption performance
The system SHALL handle large topics efficiently with pagination or virtual scrolling.

#### Scenario: Virtual scroll display
- **WHEN** viewing messages
- **THEN** system uses virtual scrolling to display only visible portion, loading more as user scrolls

#### Scenario: Batch load on scroll
- **WHEN** user scrolls to top or bottom of visible messages
- **THEN** system fetches next batch (e.g., 50 messages) in background

#### Scenario: Window size limit
- **WHEN** consuming messages
- **THEN** system limits window to manageable size (e.g., max 1000 messages in memory)
