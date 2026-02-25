## ADDED Requirements

### Requirement: List consumer groups
The system SHALL display a paginated list of all consumer groups in the Kafka cluster with key metadata.

#### Scenario: Display consumer groups list
- **WHEN** user navigates to the consumer groups management page
- **THEN** system displays a table with all consumer groups, showing group ID, state, members count, and lag

#### Scenario: Filter consumer groups
- **WHEN** user enters text in the search/filter field
- **THEN** system filters the consumer groups list by group ID in real-time

#### Scenario: Sort consumer groups
- **WHEN** user clicks on a column header
- **THEN** system sorts the consumer groups by that column (ID, state, members, lag)

#### Scenario: Paginate consumer groups
- **WHEN** consumer groups exceed page size
- **THEN** system displays pagination controls and loads the next/previous page on user request

### Requirement: View consumer group details
The system SHALL display detailed information about a selected consumer group including members, topics, and partition assignments.

#### Scenario: Display group details
- **WHEN** user clicks on a consumer group in the list
- **THEN** system displays a detail view showing group ID, state, protocol type, and creation timestamp

#### Scenario: Display group members
- **WHEN** user views consumer group details
- **THEN** system displays a list of members with member ID, client ID, and host information

#### Scenario: Display topic subscriptions
- **WHEN** user views consumer group details
- **THEN** system displays topics the group is subscribed to with partition count

#### Scenario: Display partition assignments
- **WHEN** user views consumer group details
- **THEN** system displays partition assignments showing topic, partition ID, current offset, and lag per partition

### Requirement: Monitor consumer lag
The system SHALL track and display lag metrics for consumer groups to help identify consumption delays.

#### Scenario: Display lag metrics
- **WHEN** user views consumer group details
- **THEN** system displays total lag (sum of all partition lags) and lag per partition

#### Scenario: Refresh lag data
- **WHEN** user clicks refresh or after auto-refresh interval
- **THEN** system fetches latest offset and lag data from Kafka broker

#### Scenario: Highlight high lag
- **WHEN** partition lag exceeds threshold
- **THEN** system highlights the partition with visual indicator (color, icon)

### Requirement: Reset consumer group offsets
The system SHALL allow users to reset consumer group offsets to specific positions for replay or recovery scenarios.

#### Scenario: Reset to timestamp
- **WHEN** user selects "Reset Offsets" and chooses "To Timestamp"
- **THEN** system displays a date/time picker and resets all partitions to the offset at that timestamp

#### Scenario: Reset to beginning
- **WHEN** user selects "Reset Offsets" and chooses "To Beginning"
- **THEN** system resets all partition offsets to the earliest available offset

#### Scenario: Reset to end
- **WHEN** user selects "Reset Offsets" and chooses "To End"
- **THEN** system resets all partition offsets to the latest available offset

#### Scenario: Confirm offset reset
- **WHEN** user initiates offset reset
- **THEN** system displays confirmation dialog showing affected partitions and new offsets before applying

#### Scenario: Display reset result
- **WHEN** offset reset completes
- **THEN** system displays success message and updates the partition offsets in the UI

### Requirement: Delete consumer group
The system SHALL allow users to delete consumer groups with appropriate safeguards.

#### Scenario: Delete consumer group
- **WHEN** user clicks "Delete" on a consumer group
- **THEN** system displays confirmation dialog with group ID and warning about data loss

#### Scenario: Confirm deletion
- **WHEN** user confirms deletion
- **THEN** system deletes the consumer group and removes it from the list

#### Scenario: Display deletion error
- **WHEN** deletion fails (e.g., group is active)
- **THEN** system displays error message explaining why deletion failed

### Requirement: API endpoints for consumer group operations
The backend service SHALL provide REST API endpoints for all consumer group management operations.

#### Scenario: List consumer groups endpoint
- **WHEN** client calls GET /api/consumer-groups
- **THEN** system returns paginated list of consumer groups with metadata

#### Scenario: Get consumer group details endpoint
- **WHEN** client calls GET /api/consumer-groups/{groupId}
- **THEN** system returns detailed information including members, topics, and partition assignments

#### Scenario: Get consumer group lag endpoint
- **WHEN** client calls GET /api/consumer-groups/{groupId}/lag
- **THEN** system returns lag metrics for all partitions in the group

#### Scenario: Reset offsets endpoint
- **WHEN** client calls POST /api/consumer-groups/{groupId}/reset-offsets with reset strategy
- **THEN** system resets offsets according to strategy and returns new offset positions

#### Scenario: Delete consumer group endpoint
- **WHEN** client calls DELETE /api/consumer-groups/{groupId}
- **THEN** system deletes the consumer group and returns success response
