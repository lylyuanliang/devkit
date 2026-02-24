## ADDED Requirements

### Requirement: Topic selection interface
The system SHALL provide a dropdown selector allowing users to select the target topic from the currently connected Kafka cluster.

#### Scenario: Select topic from connected cluster
- **WHEN** user opens the produce view with a connected cluster
- **THEN** system displays a dropdown populated with all topics from the cluster

#### Scenario: Topic selection required for sending
- **WHEN** user attempts to send a message without selecting a topic
- **THEN** system disables the send button and displays an error message "Please select a topic"

### Requirement: Message content editor
The system SHALL provide a text editor for users to input the message content.

#### Scenario: Input message content
- **WHEN** user types in the message editor
- **THEN** system accepts and displays the input text in real-time

#### Scenario: Large message size warning
- **WHEN** message content exceeds 100KB
- **THEN** system displays a warning "Message size approaching limit (1MB)"

#### Scenario: Empty message validation
- **WHEN** user attempts to send with empty message content
- **THEN** system disables send button and displays "Message content is required"

### Requirement: Message format selector
The system SHALL allow users to select the message format (JSON, Plain Text) before sending.

#### Scenario: Select JSON format
- **WHEN** user selects "JSON" from the format dropdown
- **THEN** system enables real-time JSON validation in the editor

#### Scenario: Select Plain Text format
- **WHEN** user selects "Plain Text" from the format dropdown
- **THEN** system disables JSON validation and accepts any text input

#### Scenario: Default format
- **WHEN** user opens the produce view
- **THEN** system defaults to "Plain Text" format

### Requirement: JSON format validation
The system SHALL validate JSON syntax when JSON format is selected.

#### Scenario: Valid JSON input
- **WHEN** user inputs valid JSON and finishes editing
- **THEN** system displays a green checkmark indicating valid JSON

#### Scenario: Invalid JSON input
- **WHEN** user inputs invalid JSON
- **THEN** system displays a red error message with the line number and parse error description

#### Scenario: Live validation feedback
- **WHEN** user is still typing JSON
- **THEN** system provides validation feedback without interrupting the user experience

### Requirement: Message key (advanced option)
The system SHALL provide an optional message key field in the advanced options section.

#### Scenario: Set message key
- **WHEN** user expands advanced options and enters a key value
- **THEN** system stores the key and includes it in the sent message

#### Scenario: No key specified
- **WHEN** user does not provide a key
- **THEN** system sends the message with null key, allowing Kafka to distribute across partitions

### Requirement: Partition selection (advanced option)
The system SHALL allow users to specify a target partition in the advanced options.

#### Scenario: Specify target partition
- **WHEN** user expands advanced options and enters a partition number
- **THEN** system validates the partition exists and sends message to that partition

#### Scenario: Invalid partition number
- **WHEN** user specifies a partition number that exceeds the topic's partition count
- **THEN** system displays error "Partition X does not exist for topic Y" and disables send

#### Scenario: Partition without key
- **WHEN** user specifies a partition but no key
- **THEN** system sends to the specified partition; key remains null

### Requirement: Send message button
The system SHALL provide a send button that initiates message transmission to Kafka.

#### Scenario: Send button enabled state
- **WHEN** user has selected a topic and entered message content
- **THEN** system enables the send button

#### Scenario: Send button disabled during transmission
- **WHEN** user clicks send button and transmission is in progress
- **THEN** system disables the button and displays "Sending..." text

#### Scenario: Send button after completion
- **WHEN** message transmission completes (success or failure)
- **THEN** system re-enables the send button for next message

### Requirement: Send success feedback
The system SHALL display confirmation with message metadata when transmission succeeds.

#### Scenario: Send success notification
- **WHEN** message is successfully sent to Kafka
- **THEN** system displays a success toast notification with message "Message sent successfully"

#### Scenario: Display message metadata
- **WHEN** message is successfully sent
- **THEN** system displays the returned partition, offset, and timestamp for confirmation

#### Scenario: Clear editor after send
- **WHEN** user confirms the success notification
- **THEN** system optionally clears the message editor for next message (or user can manually clear)

### Requirement: Send failure feedback
The system SHALL display clear error messages when message transmission fails.

#### Scenario: Network error during send
- **WHEN** Kafka cluster is unreachable or times out
- **THEN** system displays error toast "Failed to send message: Connection timeout"

#### Scenario: Cluster disconnected
- **WHEN** cluster connection is lost after production view opened
- **THEN** system displays error "Cluster disconnected. Please reconnect in Cluster Management" and disables send

#### Scenario: Topic deleted during editing
- **WHEN** selected topic is deleted from cluster before message is sent
- **THEN** system displays error "Topic no longer exists" and disables send button

### Requirement: UI layout for produce view
The system SHALL organize the produce interface with clear sections: topic selection, format selection, message editor, advanced options, and send controls.

#### Scenario: Initial layout
- **WHEN** user opens the produce view
- **THEN** system displays: topic selector, format selector, message editor area, collapsed advanced options, send button

#### Scenario: Responsive design
- **WHEN** screen width changes
- **THEN** system adjusts editor height and layout to remain usable
