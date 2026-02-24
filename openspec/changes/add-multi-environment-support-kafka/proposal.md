## Why

Users need to manage and quickly switch between multiple Kafka cluster environments (dev, staging, prod) without manually re-entering configuration details. Currently, the Kafka tool supports only a single cluster connection at a time, making it cumbersome to work across multiple environments.

## What Changes

- Kafka tool configuration structure will be extended to support multiple environment definitions
- Users can now save multiple cluster configurations with unique names
- New UI component for environment/cluster selection and switching
- Switching between environments will disconnect the current connection and establish a new one, while preserving query history and workspace state
- Sensitive credentials (passwords, certificates) will continue to be encrypted using the existing secure storage mechanism

## Capabilities

### New Capabilities
- `kafka-multi-environment-management`: Save, load, edit, and delete multiple Kafka cluster configurations
- `kafka-environment-switching`: Switch between saved cluster environments with proper connection lifecycle management (disconnect, connect, show loading state)
- `kafka-secure-environment-storage`: Encrypt and securely persist sensitive environment data (SASL credentials, SSL certificates)

### Modified Capabilities
- `kafka-cluster-management`: Extended to support multi-environment configuration initialization and environment-aware connection state

## Impact

**Affected Code:**
- `packages/tools/kafka-tool/src/service/kafkaService.ts` - Multi-connection management
- `packages/tools/kafka-tool/src/ui/` - UI components for environment selection
- `packages/core/backend/database.ts` - New table for environment storage
- `packages/tools/kafka-tool/src/index.ts` - Tool initialization with multi-environment config

**API Changes:**
- `KafkaTool.init()` signature changes from single cluster to multiple environments
- New `switchEnvironment(name)` method on KafkaTool
- Events: `environment:switching`, `environment:switched` emitted during switches

**Dependencies:**
- No new external dependencies required (uses existing encryption, database, EventBus)

**Future Consideration for ES Tool:**
Once Kafka implementation is complete, the exact same pattern should be applied to the Elasticsearch tool. The design, secure storage approach, and UI patterns will be documented for easy replication.
