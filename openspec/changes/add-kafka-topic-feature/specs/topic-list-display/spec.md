## ADDED Requirements

### Requirement: Display Topic List
The system SHALL display all topics in the connected Kafka cluster in a table format, showing topic name, partition count, replication factor, and leader information. The list SHALL be refreshable and support searching by topic name.

#### Scenario: Initial topic list load
- **WHEN** user navigates to the Topic Management view
- **THEN** system fetches all topics from the Kafka cluster and displays them in a table

#### Scenario: Topic list displays correct information
- **WHEN** topics are displayed in the list
- **THEN** each topic row shows: name, partitions, replicationFactor, leader, and ISR (in-sync replicas)

#### Scenario: Refresh topic list
- **WHEN** user clicks the "Refresh" button
- **THEN** system fetches the latest topic list from Kafka and updates the display

#### Scenario: Search topics by name
- **WHEN** user types in the search field
- **THEN** system filters the displayed topics to show only those matching the search query (case-insensitive)

#### Scenario: Handle empty topic list
- **WHEN** the Kafka cluster has no topics
- **THEN** system displays a message "No topics found" with an option to create a new topic

#### Scenario: Handle loading state
- **WHEN** system is fetching the topic list
- **THEN** system displays a loading indicator (spinner or skeleton) and disables user interactions

#### Scenario: Handle fetch error
- **WHEN** fetching the topic list fails
- **THEN** system displays an error message with the reason and provides a "Retry" button
