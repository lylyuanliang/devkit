## ADDED Requirements

### Requirement: Store consumed offset locally
The system SHALL persist the current consumption position to localStorage for each topic/partition combination.

#### Scenario: Record offset after viewing messages
- **WHEN** user views messages up to a certain offset
- **THEN** system records the highest offset viewed in localStorage

#### Scenario: Restore offset on re-open
- **WHEN** user re-opens the same topic
- **THEN** system restores consumption from the previously saved offset

#### Scenario: Multiple partition tracking
- **WHEN** viewing messages from multiple partitions
- **THEN** system tracks offset separately for each partition

#### Scenario: Offset not submitted to broker
- **WHEN** offset is recorded locally
- **THEN** system explicitly does NOT submit offset to Kafka broker to avoid affecting other consumers

### Requirement: Display current consumption position
The system SHALL show user the current offset and position information.

#### Scenario: Display current offset in header
- **WHEN** viewing messages from a partition
- **THEN** system displays "Currently viewing offset X-Y" in the header

#### Scenario: Display topic statistics
- **WHEN** viewing a topic
- **THEN** system displays total messages, earliest offset, latest offset available

#### Scenario: Show lag indicator
- **WHEN** user is not viewing latest messages
- **THEN** system displays "N messages newer" to show lag from latest

### Requirement: Manual offset jumping
The system SHALL allow users to jump to a specific offset or timestamp.

#### Scenario: Jump to specific offset
- **WHEN** user enters an offset number and clicks "Jump"
- **THEN** system loads messages from that offset

#### Scenario: Jump to timestamp
- **WHEN** user selects a date/time and clicks "Jump to time"
- **THEN** system calculates offset at that time and jumps to it

#### Scenario: Jump to earliest message
- **WHEN** user clicks "Go to earliest"
- **THEN** system jumps to offset 0

#### Scenario: Jump to latest message
- **WHEN** user clicks "Go to latest"
- **THEN** system jumps to the highest available offset

#### Scenario: Validate offset before jumping
- **WHEN** user enters an offset
- **THEN** system validates offset is within available range; if invalid, shows error

### Requirement: Consumer group and offset tracking
The system SHALL use a stable consumer group for offset tracking.

#### Scenario: Use fixed consumer group
- **WHEN** consuming messages
- **THEN** system uses a fixed group id (e.g., "devkit-consumer") for consistency

#### Scenario: Clear consumer group offset
- **WHEN** user explicitly chooses to reset position
- **THEN** system can reset stored offset (locally) and re-consume from specified position

#### Scenario: Multiple tool instances
- **WHEN** multiple instances of DevKit are open
- **THEN** each instance tracks offset independently in localStorage

### Requirement: Offset navigation UI
The system SHALL provide controls for easy offset navigation.

#### Scenario: Offset input field
- **WHEN** viewing a topic
- **THEN** system displays input field where user can type an offset to jump to

#### Scenario: Navigation buttons
- **WHEN** viewing messages
- **THEN** system displays "First", "Previous", "Next", "Last" buttons for pagination

#### Scenario: Visual offset indicator
- **WHEN** user is viewing messages
- **THEN** system shows progress indicator (e.g., "offset 1000-1050 of 10000") to indicate position in topic
