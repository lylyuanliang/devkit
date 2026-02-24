## ADDED Requirements

### Requirement: Consume messages from topic
The system SHALL allow users to consume messages from a selected topic and partition, starting from a specified offset or timestamp.

#### Scenario: Consume latest messages
- **WHEN** user selects a topic and partition, then clicks "Consume from Latest"
- **THEN** system creates a consumer that receives new messages as they arrive and displays them in real-time

#### Scenario: Consume from specific offset
- **WHEN** user enters an offset number
- **THEN** system seeks to that offset and displays messages starting from it

#### Scenario: Consume from beginning
- **WHEN** user clicks "Consume from Beginning"
- **THEN** system displays all messages in the partition from the earliest offset

### Requirement: Display message content
The system SHALL display consumed messages with key, value, timestamp, headers, and offset.

#### Scenario: Display JSON message
- **WHEN** message value is valid JSON
- **THEN** system formats and highlights JSON for readability

#### Scenario: Display plain text message
- **WHEN** message value is plain text
- **THEN** system displays raw text content

#### Scenario: Display message metadata
- **WHEN** user views a message
- **THEN** system displays partition, offset, timestamp, key, headers, and message size

### Requirement: Filter and search messages
The system SHALL allow users to search messages by key, header value, or payload content.

#### Scenario: Filter by key
- **WHEN** user enters a key value in the filter
- **THEN** system only displays messages matching that key

#### Scenario: Search by payload
- **WHEN** user enters search text
- **THEN** system filters displayed messages to those containing the text in their value

### Requirement: Navigate messages
The system SHALL allow users to navigate through consumed messages with pagination or scrolling.

#### Scenario: Load next batch of messages
- **WHEN** user scrolls to bottom of message list
- **THEN** system fetches and displays next set of messages

#### Scenario: Navigate by offset
- **WHEN** user enters an offset number
- **THEN** system seeks to that offset and displays messages from there

### Requirement: Persist consumption state
The system SHALL save the last consumed offset for each topic/partition to allow resuming consumption.

#### Scenario: Resume from last position
- **WHEN** user reopens a previously consumed topic
- **THEN** system loads the last consumed offset from database and offers to resume from that position
