## ADDED Requirements

### Requirement: Consumer instance lifecycle management
The system's KafkaToolService SHALL manage Kafka Consumer instances, creating on demand and cleaning up resources properly.

#### Scenario: Create consumer on first consumption request
- **WHEN** user opens the consume view for a topic
- **THEN** KafkaToolService creates a kafkajs Consumer with a stable group id

#### Scenario: Reuse consumer for browsing same topic
- **WHEN** user navigates between messages in the same topic
- **THEN** system reuses the same Consumer instance

#### Scenario: Create new consumer for different topic
- **WHEN** user switches to a different topic
- **THEN** system may create a new Consumer or reuse with group management (TBD based on performance)

#### Scenario: Clean up consumer on cluster disconnect
- **WHEN** user disconnects from cluster
- **THEN** system calls `consumer.disconnect()` to release resources

#### Scenario: Consumer survives tool minimize
- **WHEN** user minimizes or switches away from Kafka tool
- **THEN** system keeps consumer connected (or can implement resume on re-open for optimization)

### Requirement: Fetch messages from specified starting position
The system SHALL retrieve messages starting from user-specified position (latest, earliest, offset, timestamp).

#### Scenario: Fetch from latest offset
- **WHEN** user selects "latest" starting position
- **THEN** system fetches most recent messages, limiting to a window (e.g., last 100 messages)

#### Scenario: Fetch from earliest offset
- **WHEN** user selects "earliest" starting position
- **THEN** system fetches from offset 0, limiting to a window size

#### Scenario: Fetch from specific offset
- **WHEN** user specifies starting offset
- **THEN** system fetches messages starting from that offset

#### Scenario: Fetch from timestamp
- **WHEN** user specifies timestamp
- **THEN** system queries broker for offset at that time, then fetches messages from that point

#### Scenario: Handle offset out of range
- **WHEN** specified offset is beyond available range
- **THEN** system handles gracefully: if beyond latest, adjusts to latest; if before earliest, adjusts to earliest

### Requirement: Partition-aware message fetching
The system SHALL support fetching messages from specific partitions or all partitions in a topic.

#### Scenario: Fetch from specific partition
- **WHEN** user specifies a partition
- **THEN** system fetches messages only from that partition with their offsets

#### Scenario: Fetch from all partitions
- **WHEN** user selects "all partitions"
- **THEN** system fetches messages from all partitions, labeled with partition metadata

#### Scenario: Validate partition exists
- **WHEN** user specifies a partition number
- **THEN** system verifies partition exists; if invalid, returns error

### Requirement: Incremental message fetching for scrolling
The system SHALL support fetching additional messages as user scrolls (upward for older, downward for newer).

#### Scenario: Fetch older messages on upward scroll
- **WHEN** user scrolls to top of visible messages
- **THEN** system fetches previous messages (lower offsets) and prepends to list

#### Scenario: Fetch newer messages on downward scroll
- **WHEN** user scrolls to bottom of visible messages
- **THEN** system fetches next messages (higher offsets) and appends to list

#### Scenario: Batch fetch size
- **WHEN** fetching messages for scrolling
- **THEN** system fetches in batches (e.g., 50 messages) for efficiency

### Requirement: Message metadata retrieval
The system SHALL fetch partition metadata to support offset calculation and validation.

#### Scenario: Fetch partition info
- **WHEN** consuming from a topic
- **THEN** system retrieves partition count and earliest/latest offset for each partition

#### Scenario: Calculate offset at timestamp
- **WHEN** user specifies timestamp for starting position
- **THEN** system calls Kafka Admin API to find offset at that timestamp

### Requirement: Error handling for consumption failures
The system SHALL handle and report errors gracefully during message consumption.

#### Scenario: Handle topic deletion
- **WHEN** topic is deleted while user is consuming from it
- **THEN** system detects error and returns "Topic no longer exists"

#### Scenario: Handle broker unavailable
- **WHEN** broker is unreachable during message fetch
- **THEN** system returns error with timeout and suggests retry

#### Scenario: Handle invalid partition
- **WHEN** specified partition does not exist
- **THEN** system returns clear error with available partition numbers

#### Scenario: Handle authentication failure
- **WHEN** consumer authentication fails
- **THEN** system returns error and suggests checking credentials
