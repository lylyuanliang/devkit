## ADDED Requirements

### Requirement: Display Consumer Group Details Page
The system SHALL display a comprehensive consumer group details page with tabbed interface showing group information, member assignments, and consumption progress. The page SHALL allow users to switch between Overview, Progress, and Monitoring tabs without reloading data.

#### Scenario: Open consumer group details
- **WHEN** user clicks on a consumer group name from the list
- **THEN** system displays the consumer group details page with Overview tab active

#### Scenario: Display group overview information
- **WHEN** user views the Overview tab
- **THEN** system displays: Group ID, State (stable/rebalancing/dead), number of members, list of assigned topics, and last update timestamp

#### Scenario: Display member list with assignments
- **WHEN** user views the Overview tab
- **THEN** system displays all group members with their Member ID, Client ID, Host, and assigned topic-partitions in an expandable tree view

#### Scenario: Switch tabs without data loss
- **WHEN** user switches between tabs (Overview → Progress → Monitoring)
- **THEN** system maintains all previously loaded data and does not reload when returning to a previously viewed tab

#### Scenario: Refresh group details
- **WHEN** user clicks the "Refresh" button on the details page
- **THEN** system re-fetches all group information and updates all tabs with latest data

#### Scenario: Return to group list
- **WHEN** user clicks "Back to Groups" button
- **THEN** system navigates back to the consumer groups list view

#### Scenario: Handle details load error
- **WHEN** fetching group details fails
- **THEN** system displays an error message with the reason and provides a "Retry" button

### Requirement: Display Consumption Progress Table
The system SHALL display a consumption progress table showing current offset, lag, and log end offset for each partition of each topic assigned to the consumer group.

#### Scenario: Display progress table
- **WHEN** user views the Progress tab
- **THEN** system displays a table with columns: Topic, Partition, Current Offset, Lag, Log End Offset (LEO)

#### Scenario: Organize data by topic
- **WHEN** progress table is displayed
- **THEN** partitions are grouped by topic with topic names as section headers for easy scanning

#### Scenario: Click table row to view messages
- **WHEN** user clicks on a row in the progress table
- **THEN** system opens a modal dialog showing messages consumed by this partition (see message-view-in-group)

#### Scenario: Sort progress table
- **WHEN** user clicks on column headers (Topic, Lag, Offset)
- **THEN** system sorts the table by that column in ascending/descending order

#### Scenario: Search progress table
- **WHEN** user enters text in the progress table search field
- **THEN** system filters the table to show only rows matching the search term (topic name or partition)
