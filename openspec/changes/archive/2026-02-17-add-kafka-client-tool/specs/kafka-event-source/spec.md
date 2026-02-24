## ADDED Requirements

### Requirement: Implement EventSource interface
The system SHALL implement the EventSource interface allowing Kafka Tool to act as a pub/sub event source for other tools.

#### Scenario: Register as event source
- **WHEN** Kafka Tool initializes with configuration `asEventSource: true`
- **THEN** system registers Kafka Tool with EventSourceRegistry and emits `kafka:registered-as-event-source` event

#### Scenario: Other tool gets current event source
- **WHEN** another tool calls EventSourceRegistry.getCurrent()
- **THEN** system returns the Kafka Tool instance (which implements EventSource)

### Requirement: Publish messages via EventSource
The system SHALL allow external tools to publish messages to Kafka topics through the EventSource interface.

#### Scenario: External tool publishes message
- **WHEN** another tool calls `eventSource.publish('topic-name', {data})`
- **THEN** system sends the message to Kafka with the tool's request

#### Scenario: Publish fails
- **WHEN** message publish fails (e.g., broker down)
- **THEN** system throws an error with descriptive message

### Requirement: Subscribe to topics via EventSource
The system SHALL allow external tools to subscribe to Kafka topics through the EventSource interface.

#### Scenario: External tool subscribes to topic
- **WHEN** another tool calls `eventSource.subscribe('topic-name', handler)`
- **THEN** system creates a consumer group and calls handler for each incoming message

#### Scenario: Unsubscribe from topic
- **WHEN** another tool calls `eventSource.unsubscribe('topic-name', handler)`
- **THEN** system removes the subscription and stops calling the handler

### Requirement: Emit tool-level events
The system SHALL emit events when Kafka operations occur, allowing other tools to react.

#### Scenario: Emit message-sent event
- **WHEN** a message is successfully sent to Kafka
- **THEN** system emits `kafka:message-sent` event with topic, partition, offset, and timestamp

#### Scenario: Emit consumer-created event
- **WHEN** a new consumer group is created
- **THEN** system emits `kafka:consumer-created` event with group name and topic

#### Scenario: Emit error event
- **WHEN** a Kafka operation fails
- **THEN** system emits `kafka:error` event with error details and timestamp

### Requirement: Support EventSource switching
The system SHALL support switching from Kafka as event source to another tool implementing EventSource.

#### Scenario: Switch event source
- **WHEN** user configures a different tool as event source
- **THEN** system updates EventSourceRegistry.setCurrent() to point to new tool; other tools receive new event source on next lookup
