## ADDED Requirements

### Requirement: Save Kafka cluster connection
The system SHALL allow users to save multiple Kafka cluster configurations with name, broker addresses, and optional authentication credentials.

#### Scenario: Save cluster with basic authentication
- **WHEN** user enters cluster name, broker addresses (e.g., localhost:9092), SASL mechanism (PLAIN/SCRAM), username, and password
- **THEN** system validates input, encrypts password using DatabaseService.saveSecure(), and stores configuration

#### Scenario: Save cluster with SSL/TLS
- **WHEN** user selects SSL option and provides certificate paths
- **THEN** system encrypts certificate paths and stores them securely

### Requirement: Switch between saved clusters
The system SHALL allow users to select from saved clusters and establish connection to the selected one.

#### Scenario: Select and connect
- **WHEN** user selects a cluster from the cluster list
- **THEN** system loads encrypted configuration, decrypts credentials, and initiates Kafka AdminClient connection

#### Scenario: Connection status feedback
- **WHEN** cluster connection is established
- **THEN** system displays "connected" status; if connection fails, displays error message

### Requirement: Manage saved clusters
The system SHALL allow users to update, delete, and duplicate cluster configurations.

#### Scenario: Delete cluster
- **WHEN** user clicks delete on a cluster
- **THEN** system removes the configuration from database

#### Scenario: Edit cluster
- **WHEN** user modifies cluster details and saves
- **THEN** system updates configuration and re-validates connection

### Requirement: Persist cluster list
The system SHALL automatically save the list of clusters to database on application startup, and load them on initialization.

#### Scenario: Restore clusters on startup
- **WHEN** application starts
- **THEN** system loads all saved clusters from database and displays them in the cluster selector
