## ADDED Requirements

### Requirement: Secure credential encryption with AES-256-GCM

The system SHALL protect sensitive credentials using industry-standard encryption.

#### Scenario: Generate or load master encryption key
- **WHEN** system initializes for first time
- **THEN** system generates master key at ~/.devkit/master.key with secure permissions (600) or loads existing key

#### Scenario: Encrypt password before storage
- **WHEN** user saves environment with basic authentication password
- **THEN** system encrypts password using AES-256-GCM with master key before persisting to database

#### Scenario: Encrypt API key before storage
- **WHEN** user saves environment with API key authentication
- **THEN** system encrypts API key using AES-256-GCM with master key before persisting to database

#### Scenario: Encrypt TLS certificates before storage
- **WHEN** user uploads TLS certificates (CA, client cert, client key)
- **THEN** system encrypts certificate data using AES-256-GCM with master key before storage

#### Scenario: Decrypt credentials when retrieving configuration
- **WHEN** system retrieves environment configuration from database for connection establishment
- **THEN** system decrypts all encrypted fields using master key and makes credentials available for authentication

#### Scenario: Prevent plaintext storage of sensitive data
- **WHEN** environment configuration with credentials is stored
- **THEN** system ensures no plaintext password, API key, or certificate material is ever written to database

---

### Requirement: Secure master key management

The system SHALL manage the master key with appropriate security practices.

#### Scenario: Store master key outside database
- **WHEN** master key is created or loaded
- **THEN** key is stored only in ~/.devkit/master.key file, never embedded in database or application code

#### Scenario: Set restrictive file permissions on master key
- **WHEN** master key file is created
- **THEN** file permissions are set to 0600 (readable/writable by owner only)

#### Scenario: Prevent master key transmission
- **WHEN** application communicates over network
- **THEN** master key is never included in any network transmission or logs

#### Scenario: Warn if master key is missing
- **WHEN** application starts but cannot locate master key
- **THEN** system displays warning and prevents environment operations until key is recovered or recreated

#### Scenario: Support key rotation path
- **WHEN** master key needs to be rotated
- **THEN** system provides mechanism to re-encrypt all credentials with new key (feature for future implementation)

---

### Requirement: Authentication method selection and storage

The system SHALL support multiple authentication methods securely.

#### Scenario: Support no authentication configuration
- **WHEN** user creates environment without authentication
- **THEN** system stores authentication type as 'none' without credentials

#### Scenario: Support basic username/password authentication
- **WHEN** user provides username and password
- **THEN** system stores auth type as 'basic' with encrypted credentials

#### Scenario: Support API key authentication
- **WHEN** user provides API key credential
- **THEN** system stores auth type as 'apikey' with encrypted key

#### Scenario: Retrieve correct authentication for connection
- **WHEN** system establishes connection to Elasticsearch
- **THEN** system applies correct authentication method based on stored configuration

---

### Requirement: TLS/SSL configuration management

The system SHALL securely handle TLS configuration.

#### Scenario: Store TLS enabled flag
- **WHEN** user enables or disables TLS for environment
- **THEN** system stores TLS enabled state unencrypted (configuration) with certificates encrypted if provided

#### Scenario: Handle certificate authority configuration
- **WHEN** user uploads custom CA certificate
- **THEN** system encrypts and stores CA certificate for use in certificate validation

#### Scenario: Handle client certificate authentication
- **WHEN** user uploads client certificate and key for mutual TLS
- **THEN** system encrypts and stores both certificate and private key

#### Scenario: Enforce certificate validation setting
- **WHEN** system establishes TLS connection
- **THEN** system applies rejectUnauthorized setting from configuration during certificate validation

#### Scenario: Provide insecure mode option for development
- **WHEN** user sets rejectUnauthorized to false (insecure mode)
- **THEN** system allows this but displays warning about security implications

---

### Requirement: Secrets never appear in logs or debugging

The system SHALL prevent secrets from appearing in debug output.

#### Scenario: Mask credentials in error messages
- **WHEN** connection error occurs with authentication
- **THEN** error message displays masked credentials or generic message without revealing actual password/key

#### Scenario: Exclude credentials from debug logs
- **WHEN** system logs configuration for debugging
- **THEN** credentials are excluded or redacted from logs

#### Scenario: Prevent credentials in network traces
- **WHEN** application level logging captures network activity
- **THEN** authentication headers and credential data are redacted or not logged

#### Scenario: Sanitize stored configuration dumps
- **WHEN** developer requests full environment configuration for inspection
- **THEN** system returns configuration with all encrypted fields marked as [REDACTED]
