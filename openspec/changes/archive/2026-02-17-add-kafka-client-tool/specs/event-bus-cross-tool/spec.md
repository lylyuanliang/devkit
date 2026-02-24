## ADDED Requirements

### Requirement: Define EventSource interface
The system SHALL define EventSource interface for tools that can act as event sources.

#### Scenario: EventSource interface contract
- **WHEN** a tool implements EventSource interface with publish(), subscribe(), unsubscribe() methods
- **THEN** system recognizes it as a valid event source and allows registration with EventSourceRegistry

### Requirement: Tool event communication convention
The system SHALL establish naming convention and best practices for cross-tool events.

#### Scenario: Use tool-id prefix in event names
- **WHEN** Kafka Tool emits an event
- **THEN** event name follows format `[tool-id]:[event-name]` (e.g., `kafka:message-sent`)

#### Scenario: Include metadata in events
- **WHEN** a tool emits an event
- **THEN** event data includes `timestamp` (Date.now()) and `toolId` fields for traceability

### Requirement: EventSourceRegistry for centralized access
The system SHALL provide EventSourceRegistry to manage current event source.

#### Scenario: Set current event source
- **WHEN** a tool calls EventSourceRegistry.setCurrent(this) during init()
- **THEN** system stores reference to the tool as the current event source

#### Scenario: Get current event source
- **WHEN** another tool calls EventSourceRegistry.getCurrent()
- **THEN** system returns the currently registered event source; throws error if none registered

### Requirement: Tool lifecycle and event cleanup
The system SHALL ensure tools properly clean up event listeners during destruction.

#### Scenario: Remove listeners on destroy
- **WHEN** tool's destroy() method is called
- **THEN** tool removes all EventBus listeners (e.g., via eventBus.removeAllListeners())

### Requirement: Document inter-tool communication patterns
The system SHALL provide clear documentation on how to implement and use inter-tool communication.

#### Scenario: Tool documentation includes events
- **WHEN** a tool developer reads tool documentation
- **THEN** documentation lists all events emitted and subscribed by the tool with examples

### Requirement: Support loose coupling between tools
The system SHALL allow tools to emit and listen to events without direct references.

#### Scenario: Tool A doesn't know about Tool B
- **WHEN** Tool A emits `custom:action` event
- **THEN** any tool can subscribe to this event without Tool A explicitly knowing about them

#### Scenario: Safe subscription without tool presence
- **WHEN** Tool A tries to subscribe to events from non-existent Tool B
- **THEN** subscription succeeds; handler called only if events are emitted
