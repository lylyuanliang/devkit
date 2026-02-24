## 1. Database Schema & Infrastructure

- [x] 1.1 Create `kafka_environments` table in DatabaseService schema with fields: id, name, host, brokers, auth_secrets_key, connectionConfig, tls_secrets_key, monitoring, description, tags, createdAt, updatedAt
- [x] 1.2 Add migration script to handle existing single-cluster configs (wrap in environments array with "default" name)
- [x] 1.3 Create `kafka_active_environment`_environment` table to track currently active environment per tool instance
- [x] 1.4 Implement CRUD operations in DatabaseService for kafka_environments (save, load, list, delete, update)

## 2. KafkaService Multi-Connection Management

- [x] 2.1 Refactor KafkaService to maintain `Map<string, KafkaAdminClient>` for multiple connections
- [x] 2.2 Implement `loadEnvironments()`()` method to load all saved environments from database
- [x] 2.3 Implement `getEnvironment()`(name)` method to retrieve single environment config with encrypted fields decrypted
- [x] 2.4 Implement `switchEnvironment()`(name)` method with proper lifecycle: validate, disconnect old, connect new, emit events
- [x] 2.5 Implement `createConnection()`(environment)` helper to establish KafkaAdminClient connection
- [x] 2.6 Implement `disconnectEnvironment()`(name)` helper to gracefully close connection and clean up resources

## 3. KafkaTool Initialization & State Management

- [x] 3.1 Update `KafkaTool.init()`()` signature to accept `{ environments: EsEnvironment[], activeEnvironment: string }`
- [x] 3.2 Modify `KafkaTool.init()`()` to load all environments and establish connection to active one
- [x] 3.3 Update `KafkaTool.getStatus()`()` to return status of currently active environment
- [x] 3.4 Implement `KafkaTool.switchEnvironment()`()
- [x] 3.5 Add internal state tracking for workspace state (queries, opened topics, UI preferences) that persists across switches
- [x] 3.6 Update `KafkaTool.destroy()`()` to properly clean up all connections

## 4. Event Emission & Inter-Tool Communication

- [x] 4.1 Emit `kafka:environment:switching`` event when switch begins (payload: { from, to })
- [x] 4.2 Emit `kafka:environment:switched`` event when switch completes (payload: { environment, success, error? })
- [x] 4.3 Ensure events are emitted through EventBus for other tools to listen if needed
- [x] 4.4 Document event format in tool development guide or event naming standards

## 5. Secure Storage of Environment Credentials

- [x] 5.1 When saving environment with auth credentials, use DatabaseService.saveSecure() for password field
- [x] 5.2 When saving environment with TLS, use DatabaseService.saveSecure() for certificate paths
- [x] 5.3 When loading environment, call DatabaseService.loadSecure() to decrypt auth and TLS fields
- [x] 5.4 Ensure master key is generated on first run and stored at ~/.devkit/master.key with 0o600 permissions
- [x] 5.5 Display one-time warning about backing up master.key on first secure save

## 6. Environment Management UI Components

- [x] 6.1 Create EnvironmentSelector component (dropdown or list) showing all saved environments
- [x] 6.2 Create EnvironmentManager component for CRUD operations (add, edit, delete, duplicate environments)
- [x] 6.3 Add active environment display in tool header/toolbar (prominently show current environment name)
- [x] 6.4 Implement loading spinner/state during environment switch
- [x] 6.5 Add error toast/notification for connection failures during switch
- [x] 6.6 Integrate EnvironmentSelector into existing Kafka tool UI layout

## 7. Workspace State Preservation

- [x] 7.1 Identify all workspace state to preserve (opened topics, consumer groups, query history, scroll positions, filters)
- [x] 7.2 Store workspace state in Zustand store with namespace per environment (or global with reusable structure)
- [x] 7.3 On environment switch, preserve current state before disconnecting
- [x] 7.4 On environment switch, restore state for newly active environment if it exists (create empty if first time)
- [x] 7.5 Ensure query history is preserved but data refreshes from new cluster

## 8. Testing & Validation

- [ ] 8.1 Unit tests: KafkaService.switchEnvironment() with various auth types
- [ ] 8.2 Unit tests: Secure storage encryption/decryption via DatabaseService
- [ ] 8.3 Integration tests: Full environment switch workflow (disconnect, connect, emit events)
- [ ] 8.4 Integration tests: Workspace state preservation across switches
- [ ] 8.5 E2E tests: UI environment selection and switching
- [ ] 8.6 Manual testing: Verify SASL, SSL/TLS, and no-auth environments work correctly

## 9. Documentation & Migration

- [ ] 9.1 Update tool-development.md with multi-environment pattern documentation
- [ ] 9.2 Document KafkaTool API changes (init signature, switchEnvironment method, events)
- [ ] 9.3 Add code comments explaining multi-connection management in KafkaService
- [ ] 9.4 Create MIGRATION_GUIDE.md for users upgrading from single-cluster setup
- [ ] 9.5 Update tool README with examples of saving/switching environments

## 10. ES Tool Reference Documentation

- [x] 10.1 Create ES_IMPLEMENTATION_REFERENCE.md documenting the exact same pattern for ES tool
- [x] 10.2 Include code references to KafkaService for connection management
- [x] 10.3 Document encryption approach, event patterns, UI component patterns
- [x] 10.4 Provide checklist for applying same changes to ES tool
- [x] 10.5 **CRITICAL**: Mark all code locations where ES tool should read Kafka implementation to ensure alignment

## 11. Code Review & Finalization

- [ ] 11.1 Review KafkaService changes for thread safety and proper resource cleanup
- [ ] 11.2 Verify no memory leaks in connection switching (old connections properly closed)
- [ ] 11.3 Review encryption usage - verify master key is never logged or exposed
- [ ] 11.4 Test backward compatibility - ensure old single-cluster configs still load
- [ ] 11.5 Performance check - environment switching should be responsive (<2 seconds typical)
