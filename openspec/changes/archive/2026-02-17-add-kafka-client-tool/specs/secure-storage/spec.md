## ADDED Requirements

### Requirement: Encrypt sensitive data in DatabaseService
The system SHALL provide `saveSecure()` and `loadSecure()` methods in DatabaseService to encrypt sensitive configuration.

#### Scenario: Save password securely
- **WHEN** Kafka Tool calls `db.saveSecure('kafka:config:cluster-1:secrets', {saslPassword: '...'})`
- **THEN** system encrypts the data using AES-256-GCM and stores in SQLite

#### Scenario: Load and decrypt password
- **WHEN** Kafka Tool calls `db.loadSecure('kafka:config:cluster-1:secrets')`
- **THEN** system retrieves encrypted data, decrypts it, and returns plaintext

### Requirement: Generate and manage master encryption key
The system SHALL automatically generate and persist a master encryption key on first run.

#### Scenario: First application launch
- **WHEN** application starts for the first time
- **THEN** system generates a 256-bit random key, saves it to `~/.devkit/master.key` with mode 0o600 (user-only read)

#### Scenario: Subsequent launches
- **WHEN** application starts after first run
- **THEN** system loads the master key from `~/.devkit/master.key`

### Requirement: Use authenticated encryption
The system SHALL use AES-256-GCM for encryption to ensure both confidentiality and authenticity.

#### Scenario: Encrypt with authentication
- **WHEN** sensitive data is encrypted
- **THEN** system uses AES-256-GCM with random IV and attaches authentication tag

#### Scenario: Verify on decryption
- **WHEN** data is decrypted
- **THEN** system verifies authentication tag; if invalid, throws error instead of returning corrupted data

### Requirement: Protect master key file
The system SHALL ensure master key file is only readable by the owning user.

#### Scenario: Secure file permissions
- **WHEN** master key file is created or accessed
- **THEN** file permissions are set to 0o600 (read/write for owner only)

### Requirement: Encrypt Kafka cluster credentials
The system SHALL use secure storage for SASL passwords, SSL certificate paths, and API keys.

#### Scenario: Save SASL credentials
- **WHEN** user configures SASL authentication for a cluster
- **THEN** system stores username in cleartext (non-sensitive) and password using saveSecure()

#### Scenario: Save SSL/TLS certificates
- **WHEN** user provides certificate paths
- **THEN** system stores paths using saveSecure() to protect private key contents

### Requirement: Warn about key backup
The system SHALL display warnings about the importance of backing up the master key.

#### Scenario: Display warning on first secure save
- **WHEN** first sensitive data is saved
- **THEN** system displays a one-time warning: "Master encryption key at ~/.devkit/master.key is not recoverable. Backup is recommended."
