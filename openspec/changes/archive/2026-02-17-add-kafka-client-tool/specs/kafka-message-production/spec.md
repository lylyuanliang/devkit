## ADDED Requirements

### Requirement: Send message to topic
The system SHALL allow users to send a message to a specified topic with optional key and headers.

#### Scenario: Send simple JSON message
- **WHEN** user selects a topic, enters message content in JSON format, and clicks Send
- **THEN** system validates JSON syntax, sends message to Kafka producer, and displays success confirmation with partition and offset

#### Scenario: Send message with key
- **WHEN** user enters a message key
- **THEN** system uses the key for Kafka partitioning; all messages with the same key go to the same partition

#### Scenario: Send message with headers
- **WHEN** user adds custom headers (key-value pairs)
- **THEN** system includes headers in the Kafka message record

### Requirement: Support multiple message formats
The system SHALL support sending messages in JSON, Avro (if schema available), and plain text formats.

#### Scenario: Send plain text message
- **WHEN** user selects plain text format and enters content
- **THEN** system sends raw text as message value without format validation

#### Scenario: Send formatted message
- **WHEN** user selects JSON format
- **THEN** system validates JSON syntax before sending; displays error if invalid

### Requirement: Batch message production
The system SHALL allow users to send multiple messages in one operation.

#### Scenario: Send batch of messages
- **WHEN** user pastes or uploads a list of messages (newline-separated JSON)
- **THEN** system parses each line, validates format, and sends all messages to the topic; displays count of successful sends

### Requirement: Message production feedback
The system SHALL display real-time feedback for each sent message including partition, offset, and timestamp.

#### Scenario: Display message metadata
- **WHEN** message is successfully sent
- **THEN** system shows partition number, offset value, and server timestamp

#### Scenario: Handle send error
- **WHEN** message send fails (e.g., broker down)
- **THEN** system displays error message and logs the failure
