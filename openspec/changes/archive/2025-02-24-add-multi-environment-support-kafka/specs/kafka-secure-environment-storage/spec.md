## ADDED Requirements

### Requirement: Encrypt sensitive environment credentials
The system SHALL encrypt SASL passwords, API keys, and certificate paths using AES-256-GCM authenticated encryption before storing to database.

#### Scenario: Save SASL password securely
- **WHEN** user configures SASL authentication for an environment and saves
- **THEN** system encrypts the SASL password using DatabaseService.saveSecure() and stores encrypted data in database

#### Scenario: Save SSL/TLS certificate paths securely
- **WHEN** user provides SSL/TLS certificate paths for an environment
- **THEN** system encrypts the certificate paths (which may contain sensitive private key content) using DatabaseService.saveSecure()

#### Scenario: Load and decrypt credentials
- **WHEN** environment configuration is loaded (e.g., during switch or initialization)
- **THEN** system retrieves encrypted credentials from database, decrypts them using DatabaseService.loadSecure(), and returns plaintext for immediate use

### Requirement: Manage master encryption key
The system SHALL ensure that a master encryption key exists and is used consistently for all environment credential encryption.

#### Scenario: Auto-generate key on first run
- **WHEN** application starts for the first time and no master key exists
- **THEN** system generates a 256-bit random key via DatabaseService, saves it to `~/.devkit/master.key` with mode 0o600 (user-only permissions)

#### Scenario: Load existing master key on subsequent runs
- **WHEN** application starts and master key already exists
- **THEN** system loads the key from `~/.devkit/master.key` for decryption operations

### Requirement: Warn about key backup importance
The system SHALL display a one-time warning about the criticality of backing up the master encryption key.

#### Scenario: Display backup warning on first secure save
- **WHEN** sensitive data is encrypted and saved for the first time
- **THEN** system displays a prominent warning: "Master encryption key at ~/.devkit/master.key is not recoverable. Backup is recommended."

#### Scenario: Warning is not repeated
- **WHEN** user has already seen the warning
- **THEN** system does not display the warning again (tracked via DatabaseService flag)

### Requirement: Verify authentication tag on decryption
The system SHALL verify the authentication tag during decryption to ensure data integrity and detect tampering.

#### Scenario: Successful decryption with valid tag
- **WHEN** encrypted credential data is decrypted
- **THEN** system verifies the AES-256-GCM authentication tag; if valid, returns plaintext credential

#### Scenario: Reject corrupted or tampered data
- **WHEN** encrypted data has been corrupted or tampered with (authentication tag verification fails)
- **THEN** system throws an error and refuses to return plaintext; operation is aborted with user notification

### Requirement: Separate plaintext and encrypted storage
The system SHALL store non-sensitive environment data (host, brokers, description) in plaintext for debuggability, while encrypting only sensitive fields (auth credentials, certificate paths).

#### Scenario: Store environment metadata in plaintext
- **WHEN** user saves an environment
- **THEN** system stores name, host, brokers, description, and other non-sensitive fields in plaintext in `kafka_environments` table

#### Scenario: Store sensitive fields encrypted
- **WHEN** user saves authentication credentials or certificate paths
- **THEN** system stores these in encrypted form using DatabaseService.saveSecure() with reference keys in the plaintext record
