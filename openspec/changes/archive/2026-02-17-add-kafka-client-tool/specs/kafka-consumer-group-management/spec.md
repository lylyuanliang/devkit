## ADDED Requirements

### Requirement: List consumer groups
The system SHALL retrieve and display all consumer groups from the Kafka cluster.

#### Scenario: Display consumer groups
- **WHEN** user navigates to Consumer Groups view
- **THEN** system queries Kafka cluster and displays list of active and inactive consumer groups with their state

### Requirement: View consumer group details
The system SHALL display detailed information for a selected consumer group including members, assigned partitions, and current offsets.

#### Scenario: View group members
- **WHEN** user clicks on a consumer group
- **THEN** system displays active members, their assigned partitions, and current member IDs

#### Scenario: View group offsets
- **WHEN** user views a consumer group
- **THEN** system displays the current committed offset for each assigned partition

### Requirement: Reset consumer group offset
The system SHALL allow users to reset a consumer group's offset to earliest, latest, or a specific offset.

#### Scenario: Reset to earliest
- **WHEN** user selects "Reset to earliest" for a consumer group
- **THEN** system resets all partition offsets to the beginning and confirms action

#### Scenario: Reset to latest
- **WHEN** user selects "Reset to latest" for a consumer group
- **THEN** system resets all partition offsets to the current end and confirms action

#### Scenario: Reset to specific offset
- **WHEN** user enters a specific offset value
- **THEN** system resets partition offsets to the specified value

### Requirement: Delete consumer group
The system SHALL allow users to delete a consumer group.

#### Scenario: Delete group
- **WHEN** user clicks delete on a consumer group and confirms
- **THEN** system deletes the consumer group from Kafka cluster

### Requirement: Monitor consumer group lag
The system SHALL calculate and display the lag (difference between latest offset and committed offset) for each partition in a consumer group.

#### Scenario: Display lag per partition
- **WHEN** user views a consumer group details
- **THEN** system displays lag value for each partition (as number of unconsumed messages)

#### Scenario: Display total group lag
- **WHEN** user views consumer group summary
- **THEN** system displays total lag across all partitions in the group
