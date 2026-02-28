## ADDED Requirements

### Requirement: Display partition assignments for consumer group members
The system SHALL retrieve and display which topics and partitions are assigned to each member of a consumer group. This information SHALL be fetched from the Kafka cluster and displayed in the consumer group details view.

#### Scenario: Retrieve partition assignments from Kafka
- **WHEN** user views consumer group details
- **THEN** system fetches partition assignment information for each member from the Kafka cluster
- **AND** partition data includes topic name and partition number for each assigned partition

#### Scenario: Display partition assignments in UI
- **WHEN** partition assignment data is retrieved successfully
- **THEN** consumer group details view displays a table showing each member's assigned topics and partitions
- **AND** the display includes member ID, client ID, and list of assigned partitions

#### Scenario: Handle empty partition assignments
- **WHEN** a consumer group member has no assigned partitions
- **THEN** system displays an empty state or "No partitions assigned" message
- **AND** the UI remains responsive and does not show errors

### Requirement: Filter system topics from consumer group views
The system SHALL exclude internal Kafka system topics from consumer group displays and operations. System topics include `__consumer_offsets`, `__transaction_state`, and other topics prefixed with double underscores.

#### Scenario: Filter system topics from list
- **WHEN** listing consumer groups or their topics
- **THEN** system filters out topics starting with `__` (double underscore)
- **AND** only user-created topics are displayed

#### Scenario: Prevent operations on system topics
- **WHEN** user attempts to reset offsets or perform operations on a consumer group
- **THEN** system excludes system topics from the operation scope
- **AND** only user-created topics are included in offset reset operations
