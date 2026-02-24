## MODIFIED Requirements

### Requirement: Save Kafka cluster connection
The system SHALL allow users to save multiple Kafka cluster configurations with name, broker addresses, and optional authentication credentials. Configurations are now stored as named "environments" rather than anonymous clusters, supporting multi-environment management workflows.

#### Scenario: Save cluster with basic authentication
- **WHEN** user enters environment name, broker addresses (e.g., localhost:9092), SASL mechanism (PLAIN/SCRAM), username, and password
- **THEN** system validates input, encrypts password using DatabaseService.saveSecure(), and stores configuration with unique environment name

#### Scenario: Save cluster with SSL/TLS
- **WHEN** user selects SSL option and provides certificate paths
- **THEN** system encrypts certificate paths and stores them securely as part of the environment configuration

### Requirement: Switch between saved clusters
The system SHALL allow users to select from saved cluster environments and establish connection to the selected one, with proper lifecycle management and state preservation.

#### Scenario: Select and connect to environment
- **WHEN** user selects an environment from the environment list
- **THEN** system disconnects from previous environment, loads encrypted configuration, decrypts credentials, and initiates Kafka AdminClient connection to the new environment

#### Scenario: Connection status feedback during switch
- **WHEN** cluster connection is established or fails during environment switch
- **THEN** system displays loading state during switch, then shows "connected" status upon success; if connection fails, displays error message and reverts to previous environment if possible

### Requirement: Manage saved clusters
The system SHALL allow users to update, delete, and duplicate cluster/environment configurations within the multi-environment context.

#### Scenario: Delete environment
- **WHEN** user clicks delete on an environment
- **THEN** system removes the configuration from database; if deleting the active environment, switches to another available environment first

#### Scenario: Edit environment
- **WHEN** user modifies environment details and saves
- **THEN** system updates configuration in database and re-validates connection if environment is currently active

### Requirement: Persist cluster list
The system SHALL automatically load all saved cluster environments from database on tool initialization and enable switching between them.

#### Scenario: Restore environments on tool initialization
- **WHEN** Kafka tool initializes
- **THEN** system loads all saved environments from database, restores the previously active environment, and establishes connection to it

#### Scenario: Initialize with multi-environment config
- **WHEN** Kafka tool receives init(config) with environments array and activeEnvironment field
- **THEN** system loads all environments and connects to the specified active environment

## ADDED Requirements

### Requirement: Environment-aware connection state
The system SHALL maintain connection state on a per-environment basis, allowing the tool to manage multiple potential connections while keeping only the active one connected.

#### Scenario: Maintain per-environment state
- **WHEN** Kafka tool has multiple environments configured
- **THEN** system internally tracks connection state for each environment (not connected, connecting, connected, error) while only maintaining a live connection to the active environment

#### Scenario: Access active environment configuration
- **WHEN** tool needs current cluster information for operations
- **THEN** system provides the active environment's configuration without exposing connection states of other environments

### Requirement: Environment initialization in tool lifecycle
The system SHALL extend KafkaTool initialization to accept and manage multi-environment configuration.

#### Scenario: Initialize with multiple environments
- **WHEN** KafkaTool.init() is called with config containing environments array and activeEnvironment name
- **THEN** system registers all environments, loads their configurations from database, and establishes connection to the active one

#### Scenario: Backward compatibility with single environment
- **WHEN** legacy single-cluster configuration is loaded
- **THEN** system wraps it in an environments array with a default name (e.g., "default") and initializes successfully
