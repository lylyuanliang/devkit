## ADDED Requirements

### Requirement: List topics
The system SHALL retrieve and display all topics from the currently connected Kafka cluster.

#### Scenario: Display topic list
- **WHEN** user navigates to Topics view with a cluster connected
- **THEN** system queries Kafka broker metadata and displays topic names, partition count, and replication factor

### Requirement: Create topic
The system SHALL allow users to create a new topic with configurable partitions and replication factor.

#### Scenario: Create topic with defaults
- **WHEN** user enters topic name and confirms creation with default 1 partition and replication factor 1
- **THEN** system sends create topic command to Kafka broker and displays confirmation

#### Scenario: Create topic with custom configuration
- **WHEN** user specifies topic name, partition count, and replication factor
- **THEN** system validates input (replication factor ≤ broker count) and creates topic

### Requirement: Delete topic
The system SHALL allow users to delete a topic with confirmation.

#### Scenario: Delete topic
- **WHEN** user clicks delete on a topic and confirms
- **THEN** system sends delete topic command to Kafka broker; topic is removed from list

### Requirement: View topic details
The system SHALL display detailed information for a selected topic including partition layout, replica assignment, and configuration.

#### Scenario: View partition details
- **WHEN** user clicks on a topic name
- **THEN** system displays partition count, leader/replica brokers for each partition, and topic configuration

### Requirement: Configure topic settings
The system SHALL allow users to modify topic configuration (retention time, compression, etc.).

#### Scenario: Update retention policy
- **WHEN** user modifies retention time and saves
- **THEN** system applies the configuration change to Kafka broker
