## ADDED Requirements

### Requirement: Create Topic with Basic Configuration
The system SHALL allow users to create a new topic by providing a topic name, partition count, and replication factor. The system SHALL validate inputs and provide clear error messages if creation fails.

#### Scenario: Open create topic form
- **WHEN** user clicks the "Create Topic" button in the topic list
- **THEN** system displays a modal dialog with a form containing fields for topic name, partitions, and replication factor

#### Scenario: Create topic with valid inputs
- **WHEN** user fills in the form with valid values (topic name, partitions ≥ 1, replication factor ≥ 1) and clicks "Create"
- **THEN** system creates the topic in Kafka and displays a success notification

#### Scenario: Auto-refresh list after creation
- **WHEN** topic creation succeeds
- **THEN** system automatically closes the form modal and refreshes the topic list to show the newly created topic

#### Scenario: Validate topic name is required
- **WHEN** user tries to create a topic without entering a name
- **THEN** system displays an error message "Topic name is required" and prevents form submission

#### Scenario: Validate topic name format
- **WHEN** user enters an invalid topic name (e.g., containing special characters not allowed by Kafka)
- **THEN** system displays an error message and prevents form submission

#### Scenario: Validate partition count
- **WHEN** user enters partition count < 1 or > 100
- **THEN** system displays an error message "Partitions must be between 1 and 100" and prevents form submission

#### Scenario: Validate replication factor
- **WHEN** user enters replication factor < 1 or > 10
- **THEN** system displays an error message "Replication factor must be between 1 and 10" and prevents form submission

#### Scenario: Handle creation failure
- **WHEN** topic creation fails (e.g., topic already exists, insufficient brokers)
- **THEN** system displays an error message with the reason and keeps the form modal open for user to retry

#### Scenario: Handle connection error during creation
- **WHEN** the system loses connection to Kafka during topic creation
- **THEN** system displays an error message "Connection lost" and allows user to retry

#### Scenario: Cancel topic creation
- **WHEN** user clicks the "Cancel" button in the form modal
- **THEN** system closes the modal without creating a topic and returns to the topic list

### Requirement: Create Topic with Advanced Configuration
The system SHALL allow users to optionally configure advanced topic settings including retention time, compression type, cleanup policy, and minimum in-sync replicas when creating a topic.

#### Scenario: Access advanced configuration options
- **WHEN** user clicks "Advanced Options" in the create topic form
- **THEN** system expands a collapsible section showing additional configuration fields

#### Scenario: Configure retention time
- **WHEN** user sets retention.ms in the advanced options
- **THEN** system includes this configuration when creating the topic

#### Scenario: Configure compression type
- **WHEN** user selects a compression type (none, gzip, snappy, lz4, zstd) from the dropdown
- **THEN** system includes this configuration when creating the topic

#### Scenario: Configure cleanup policy
- **WHEN** user selects a cleanup policy (delete, compact) from the dropdown
- **THEN** system includes this configuration when creating the topic

#### Scenario: Configure minimum in-sync replicas
- **WHEN** user sets min.insync.replicas in the advanced options
- **THEN** system includes this configuration when creating the topic

#### Scenario: Validate advanced configuration values
- **WHEN** user enters invalid values for advanced options (e.g., negative retention time)
- **THEN** system displays an error message and prevents form submission
