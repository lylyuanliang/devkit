## MODIFIED Requirements

### Requirement: Reset consumer group offset to earliest
The system SHALL allow resetting a consumer group's offset to the earliest available offset for specified topics. The operation SHALL correctly identify topics associated with the consumer group and validate that topics exist before attempting the reset.

#### Scenario: Reset offset to earliest with valid topics
- **WHEN** user initiates offset reset to earliest for a consumer group with specified topics
- **THEN** system verifies the topics exist in the cluster
- **AND** system retrieves the earliest offset for each partition of those topics
- **AND** system sets the consumer group offset to the earliest offset for all partitions
- **AND** operation completes successfully with confirmation message

#### Scenario: Reset offset to earliest with invalid topics
- **WHEN** user attempts to reset offset to earliest with non-existent topics
- **THEN** system returns an error indicating which topics do not exist
- **AND** no offsets are modified

#### Scenario: Reset offset to earliest without topic specification
- **WHEN** user attempts to reset offset to earliest without specifying topics
- **THEN** system retrieves all topics subscribed by the consumer group
- **AND** system filters out system topics (topics starting with `__`)
- **AND** system resets offsets for all user-created topics to earliest

### Requirement: Reset consumer group offset to latest
The system SHALL allow resetting a consumer group's offset to the latest available offset for specified topics. The operation SHALL correctly identify the latest offset for each partition and handle edge cases.

#### Scenario: Reset offset to latest with valid topics
- **WHEN** user initiates offset reset to latest for a consumer group with specified topics
- **THEN** system verifies the topics exist in the cluster
- **AND** system retrieves the latest offset for each partition of those topics
- **AND** system sets the consumer group offset to the latest offset for all partitions
- **AND** operation completes successfully with confirmation message

#### Scenario: Reset offset to latest with empty partitions
- **WHEN** a topic has no messages (empty partitions)
- **THEN** system sets the offset to 0 (the latest available offset for empty partitions)
- **AND** operation completes without errors

### Requirement: Improve error handling in offset reset operations
The system SHALL provide clear, actionable error messages when offset reset operations fail. Errors SHALL indicate the specific cause and suggest remediation steps.

#### Scenario: Handle connection errors during offset reset
- **WHEN** connection to Kafka cluster is lost during offset reset
- **THEN** system returns an error message indicating connection failure
- **AND** error message suggests checking cluster connectivity
- **AND** no partial state changes are left in the system

#### Scenario: Handle permission errors during offset reset
- **WHEN** user lacks permissions to reset offsets for a consumer group
- **THEN** system returns an error message indicating insufficient permissions
- **AND** error message suggests contacting cluster administrator
