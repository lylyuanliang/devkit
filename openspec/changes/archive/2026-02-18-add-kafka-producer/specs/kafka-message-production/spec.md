## MODIFIED Requirements

### Requirement: Send message to topic
The system SHALL allow users to send a message to a specified topic with optional key and partition targeting.

#### Scenario: Send plain text message
- **WHEN** user selects a topic, enters message content in plain text format, and clicks Send
- **THEN** system sends the message to the Kafka producer and displays success confirmation with partition, offset, and timestamp

#### Scenario: Send JSON message
- **WHEN** user selects a topic, sets format to JSON, enters valid JSON content, and clicks Send
- **THEN** system validates JSON syntax, sends message to Kafka producer, and displays success confirmation with partition and offset

#### Scenario: Send message with key
- **WHEN** user enters a message key in the advanced options
- **THEN** system includes the key when sending to Kafka; all messages with the same key are partitioned to the same partition

#### Scenario: Send to specific partition
- **WHEN** user specifies a partition number in the advanced options
- **THEN** system sends the message directly to that partition, bypassing partitioning logic

### Requirement: Support multiple message formats
The system SHALL support sending messages in JSON and plain text formats with appropriate validation.

#### Scenario: Send plain text message
- **WHEN** user selects plain text format and enters content
- **THEN** system sends raw text as message value without format validation

#### Scenario: Send JSON message
- **WHEN** user selects JSON format
- **THEN** system validates JSON syntax before sending; displays error if JSON is invalid and prevents sending

#### Scenario: Format validation prevents sending
- **WHEN** user selects JSON format with invalid syntax
- **THEN** system displays specific error with line number and prevents the send operation

### Requirement: Message production feedback
The system SHALL display real-time feedback for each sent message including partition, offset, and timestamp.

#### Scenario: Display message metadata on success
- **WHEN** message is successfully sent
- **THEN** system displays success toast notification showing partition number, offset value, and server timestamp

#### Scenario: Handle send error with message
- **WHEN** message send fails (e.g., topic not found, broker down, timeout)
- **THEN** system displays error message with specific reason and allows user to retry

#### Scenario: Handle cluster disconnection during send
- **WHEN** cluster is disconnected while attempting to send
- **THEN** system displays error "Cluster disconnected" and suggests reconnecting in Cluster Management

### Requirement: Topic and partition validation
The system SHALL validate that target topic and partition exist before attempting to send.

#### Scenario: Validate topic exists
- **WHEN** user attempts to send a message
- **THEN** system verifies the topic exists in the cluster; if not, displays error "Topic does not exist"

#### Scenario: Validate partition exists
- **WHEN** user specifies a partition number
- **THEN** system verifies the partition exists for that topic; if not, displays error "Partition X does not exist"

#### Scenario: Empty topic list
- **WHEN** cluster has no topics
- **THEN** system disables the send button and displays message "No topics available in this cluster"
