## ADDED Requirements

### Requirement: Display Topic Configuration Options
The system SHALL provide a user-friendly interface for configuring topic settings during creation, including retention time, compression type, cleanup policy, and minimum in-sync replicas. The system SHALL validate configuration values and provide helpful descriptions for each option.

#### Scenario: Display configuration field descriptions
- **WHEN** user hovers over or focuses on a configuration field
- **THEN** system displays a tooltip or help text explaining the purpose and valid values for that field

#### Scenario: Provide default configuration values
- **WHEN** user opens the advanced configuration section
- **THEN** system displays default values for each configuration option (e.g., retention.ms = -1 for unlimited, compression.type = none)

#### Scenario: Support retention time configuration
- **WHEN** user sets retention.ms value
- **THEN** system accepts values in milliseconds (e.g., 86400000 for 1 day) or -1 for unlimited retention

#### Scenario: Support compression type selection
- **WHEN** user selects a compression type
- **THEN** system provides a dropdown with options: none, gzip, snappy, lz4, zstd

#### Scenario: Support cleanup policy selection
- **WHEN** user selects a cleanup policy
- **THEN** system provides a dropdown with options: delete (default), compact

#### Scenario: Support minimum in-sync replicas configuration
- **WHEN** user sets min.insync.replicas value
- **THEN** system accepts values between 1 and the replication factor

#### Scenario: Validate configuration value ranges
- **WHEN** user enters a configuration value outside the valid range
- **THEN** system displays an error message with the valid range and prevents form submission

#### Scenario: Show configuration summary before creation
- **WHEN** user is about to create a topic with advanced configuration
- **THEN** system displays a summary of all configured settings for user review
