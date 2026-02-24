## ADDED Requirements

### Requirement: Producer instance lifecycle management
The system's KafkaToolService SHALL manage Kafka Producer instances, creating one per connected cluster and lifecycle-aware cleanup.

#### Scenario: Create producer on cluster connect
- **WHEN** user connects to a Kafka cluster
- **THEN** KafkaToolService creates and initializes a kafkajs Producer for that cluster

#### Scenario: Reuse producer for multiple sends
- **WHEN** user sends multiple messages to the same connected cluster
- **THEN** system reuses the same Producer instance without recreating it

#### Scenario: Switch producer on cluster change
- **WHEN** user switches to a different cluster
- **THEN** system cleanly disconnects the previous cluster's Producer and creates a new one for the new cluster

#### Scenario: Disconnect producer on tool close
- **WHEN** Kafka tool is closed or user disconnects from cluster
- **THEN** system calls `producer.disconnect()` to clean up resources

### Requirement: Send message operation
The system SHALL provide a method to send messages to Kafka with support for JSON and plain text formats.

#### Scenario: Send plain text message
- **WHEN** frontend calls `produceMessage(topic, value: string, format: 'text')`
- **THEN** system converts the string to Buffer and calls `producer.send({ messages: [{ value }] })`

#### Scenario: Send JSON message
- **WHEN** frontend calls `produceMessage(topic, value: string, format: 'json')`
- **THEN** system validates JSON, converts to Buffer, and sends

#### Scenario: Send with message key
- **WHEN** frontend provides a key parameter: `produceMessage(topic, value, key: string)`
- **THEN** system includes key in the message: `{ key: Buffer.from(key), value: Buffer.from(value) }`

#### Scenario: Send to specific partition
- **WHEN** frontend specifies partition: `produceMessage(topic, value, partition: number)`
- **THEN** system sends message to that partition using `producer.send({ messages: [{..., partition}] })`

#### Scenario: Handle successful send
- **WHEN** `producer.send()` completes successfully
- **THEN** system returns the response containing partition, offset, and timestamp to the frontend

### Requirement: Producer error handling
The system SHALL handle and report errors that occur during message production.

#### Scenario: Topic does not exist
- **WHEN** user attempts to send to a topic that does not exist
- **THEN** system catches KafkaJS error and returns error message "Topic not found"

#### Scenario: Cluster connection lost
- **WHEN** message send fails due to loss of connection to broker
- **THEN** system returns error "Connection to broker failed" and suggests reconnecting

#### Scenario: Invalid partition
- **WHEN** user specifies a partition that exceeds the topic's partition count
- **THEN** system returns error "Invalid partition: X"

#### Scenario: Timeout on send
- **WHEN** message send times out (no broker response within timeout period)
- **THEN** system returns error "Send timeout - broker not responding"

### Requirement: Producer initialization with cluster configuration
The system SHALL initialize the Producer with appropriate cluster credentials and SSL settings.

#### Scenario: Producer with basic auth
- **WHEN** cluster uses SASL/PLAIN authentication
- **THEN** Producer is initialized with broker list and SASL credentials from cluster config

#### Scenario: Producer with SSL
- **WHEN** cluster uses SSL/TLS
- **THEN** Producer is initialized with broker list and SSL certificate paths from cluster config

#### Scenario: Producer with no auth
- **WHEN** cluster has no authentication
- **THEN** Producer is initialized with just the broker list

### Requirement: Metadata validation before send
The system SHALL validate that the target topic exists and is available before attempting to send.

#### Scenario: Fetch topic metadata
- **WHEN** user opens the produce view
- **THEN** system fetches and caches topic metadata (partition count, etc.)

#### Scenario: Validate topic on send
- **WHEN** user clicks send
- **THEN** system verifies the topic still exists in the cluster metadata

#### Scenario: Detect partition count changes
- **WHEN** a topic's partition count changes between opens
- **THEN** system refreshes metadata and validates partition existence
