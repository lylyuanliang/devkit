# Elasticsearch Tool - Multi-Environment Support Implementation Tasks

## 1. Database Schema Setup

- [ ] 1.1 Create `elasticsearch_environments` table with id, name, host, port, authType, tlsEnabled fields
- [ ] 1.2 Add encrypted credential fields: auth_username (encrypted), auth_password (encrypted), auth_apikey (encrypted)
- [ ] 1.3 Add TLS fields: tls_ca (encrypted), tls_cert (encrypted), tls_key (encrypted)
- [ ] 1.4 Add metadata fields: description, tags, createdAt, updatedAt with proper indexing on name
- [ ] 1.5 Create `elasticsearch_active_environment` table with id and environmentName fields
- [ ] 1.6 Create database migration script to handle both fresh install and upgrade from legacy config
- [ ] 1.7 Implement automatic migration of existing single-cluster config to "default" environment

## 2. CRUD Operations - DatabaseService

- [ ] 2.1 Implement `saveElasticsearchEnvironment()` with validation and encryption of credentials
- [ ] 2.2 Implement `getElasticsearchEnvironment(name)` with decryption of credentials
- [ ] 2.3 Implement `listElasticsearchEnvironments()` returning all environments without plaintext credentials
- [ ] 2.4 Implement `deleteElasticsearchEnvironment(name)` with cleanup of active reference
- [ ] 2.5 Implement `getActiveEnvironment()` to retrieve current active environment
- [ ] 2.6 Implement `setActiveEnvironment(name)` to update active environment pointer
- [ ] 2.7 Add validation logic for environment configurations (required fields, format validation)

## 3. Master Key and Encryption Infrastructure

- [ ] 3.1 Create master key generation and storage at ~/.devkit/master.key with 0600 permissions
- [ ] 3.2 Implement AES-256-GCM encryption function for credentials
- [ ] 3.3 Implement AES-256-GCM decryption function for credentials
- [ ] 3.4 Add master key loading on service initialization with error handling
- [ ] 3.5 Create utility to redact credentials in logs and debug output
- [ ] 3.6 Add master key rotation preparation (infrastructure for future rotation feature)

## 4. Multi-Connection Management - ElasticsearchService

- [ ] 4.1 Create ElasticsearchService singleton with Map<string, client> connection pool
- [ ] 4.2 Implement `initializeConnections()` to load all environments on service startup
- [ ] 4.3 Implement `connect(environmentName)` to establish client connection
- [ ] 4.4 Implement `disconnect(environmentName)` to close specific connection
- [ ] 4.5 Implement `getClient(environmentName)` to retrieve active client for operations
- [ ] 4.6 Implement connection pooling with bounded size and cleanup for unused connections
- [ ] 4.7 Add connection health check and automatic reconnection for stale connections

## 5. Environment Switching Lifecycle

- [ ] 5.1 Implement validation phase: check environment config and test connectivity
- [ ] 5.2 Implement switching phase: emit `elasticsearch:environment:switching` event
- [ ] 5.3 Implement connection phase: disconnect old, connect new, restore state
- [ ] 5.4 Implement switched phase: emit `elasticsearch:environment:switched` event with details
- [ ] 5.5 Implement error handling and rollback to previous environment on failure
- [ ] 5.6 Implement debouncing for rapid environment switch requests (200ms)
- [ ] 5.7 Add logging for all environment switch transitions

## 6. Connection Error Classification

- [ ] 6.1 Create `ConnectionErrorType` enum: TIMEOUT, BROKER_UNREACHABLE, AUTHENTICATION_FAILED, SSL_ERROR, UNKNOWN
- [ ] 6.2 Implement error classification logic for timeout errors (ECONNREFUSED, timeout patterns)
- [ ] 6.3 Implement error classification logic for unreachable errors (ENOTFOUND, getaddrinfo)
- [ ] 6.4 Implement error classification logic for auth errors (SASL, auth, unauthorized)
- [ ] 6.5 Implement error classification logic for SSL errors (certificate, ssl patterns)
- [ ] 6.6 Create user-friendly error messages for each error type
- [ ] 6.7 Mark errors as retryable or non-retryable based on type
- [ ] 6.8 Implement retry suggestion UI for retryable errors

## 7. Zustand Store - Per-Environment State

- [ ] 7.1 Create `WorkspaceStatePerEnv` interface with: openedIndices, selectedIndex, filters, queryHistory, scrollPositions, uiPreferences, timestamp
- [ ] 7.2 Create `useWorkspaceStore()` Zustand store with `environmentStates: Map<envName, state>`
- [ ] 7.3 Implement `setCurrentEnvironment(name)` to activate environment in store
- [ ] 7.4 Implement `getEnvironmentState(name)` to retrieve per-environment state
- [ ] 7.5 Implement `updateEnvironmentState(name, updates)` for atomic state updates
- [ ] 7.6 Implement localStorage persistence for environment states (store/load)
- [ ] 7.7 Add state validation and corruption recovery on load

## 8. State Restoration on Switch

- [ ] 8.1 Implement state restoration in ElasticsearchTool on environment switch
- [ ] 8.2 Restore opened indices list for new environment
- [ ] 8.3 Restore selected index for new environment
- [ ] 8.4 Restore filter configuration for new environment
- [ ] 8.5 Restore query history for new environment
- [ ] 8.6 Restore scroll positions for new environment
- [ ] 8.7 Restore UI preferences for new environment
- [ ] 8.8 Handle graceful fallback to defaults when state missing

## 9. ElasticsearchTool Class

- [ ] 9.1 Create `ElasticsearchTool` class with constructor accepting service and store
- [ ] 9.2 Implement `init()` method to initialize service, load environments, activate last active
- [ ] 9.3 Implement `switchEnvironment(name)` method with full lifecycle
- [ ] 9.4 Implement `getCurrentEnvironment()` to retrieve active environment
- [ ] 9.5 Implement `saveEnvironment(config)` wrapper to ElasticsearchService
- [ ] 9.6 Implement `deleteEnvironment(name)` wrapper with state cleanup
- [ ] 9.7 Implement `destroy()` method to cleanup all connections and subscriptions
- [ ] 9.8 Add event emitter for tool-level events

## 10. EnvironmentSelector UI Component

- [ ] 10.1 Create `EnvironmentSelector.tsx` component with dropdown display
- [ ] 10.2 Implement environment list rendering with all saved environments
- [ ] 10.3 Add active indicator (checkmark or highlight) on current environment
- [ ] 10.4 Implement click handler for environment selection
- [ ] 10.5 Add loading state display ("⏳ Switching environment...") during switch
- [ ] 10.6 Add error state display with error message
- [ ] 10.7 Add connection status indicator (green/red dot)
- [ ] 10.8 Implement hover tooltip showing environment metadata (host, port, description)

## 11. EnvironmentManager UI Component

- [ ] 11.1 Create `EnvironmentManager.tsx` component with form and environment list
- [ ] 11.2 Implement environment list table showing: name, host, auth type, description, actions
- [ ] 11.3 Create "Add Environment" form with fields: name, host, port, auth type, TLS settings
- [ ] 11.4 Implement auth type selection (none, basic, apikey)
- [ ] 11.5 Implement TLS settings section with CA, cert, key upload
- [ ] 11.6 Add description and tags fields to form
- [ ] 11.7 Implement "Edit" action with form pre-population
- [ ] 11.8 Implement "Delete" action with confirmation dialog
- [ ] 11.9 Implement "Duplicate" action to copy environment
- [ ] 11.10 Implement "Test Connection" button with success/error display
- [ ] 11.11 Add form validation with error messages for required fields
- [ ] 11.12 Implement form submission to save environment via service

## 12. EnvironmentPanel Integration

- [ ] 12.1 Create `EnvironmentPanel.tsx` component combining Selector and Manager
- [ ] 12.2 Layout selector dropdown and manager controls in panel
- [ ] 12.3 Display active environment information section
- [ ] 12.4 Implement error notification display with auto-dismiss (5 second timeout)
- [ ] 12.5 Show loading state during environment switch
- [ ] 12.6 Display connection status indicator
- [ ] 12.7 Add collapsible sections to manage panel layout
- [ ] 12.8 Implement responsive design for different screen sizes

## 13. Event System Integration

- [ ] 13.1 Hook up event emitter to ElasticsearchService
- [ ] 13.2 Emit `elasticsearch:environment:switching` event with from/to environment names
- [ ] 13.3 Emit `elasticsearch:environment:switched` event with environment details and state
- [ ] 13.4 Subscribe to events in UI components for real-time updates
- [ ] 13.5 Handle event errors gracefully in error boundaries
- [ ] 13.6 Test event propagation across components

## 14. Sidebar Menu Integration

- [ ] 14.1 Add Elasticsearch tool menu item to left sidebar alongside Kafka Tool
- [ ] 14.2 Display current active Elasticsearch environment in sidebar
- [ ] 14.3 Show connection status indicator (green/yellow/red) in sidebar
- [ ] 14.4 Implement click handler to expand/open EnvironmentPanel
- [ ] 14.5 Add right-click context menu for environment management
- [ ] 14.6 Ensure Kafka and Elasticsearch environments managed independently
- [ ] 14.7 Test sidebar rendering with both tools active

## 15. Testing - Unit Tests

- [ ] 15.1 Write tests for DatabaseService CRUD operations
- [ ] 15.2 Write tests for environment encryption/decryption
- [ ] 15.3 Write tests for ElasticsearchService connection management
- [ ] 15.4 Write tests for environment switching lifecycle
- [ ] 15.5 Write tests for error classification logic
- [ ] 15.6 Write tests for Zustand store state management
- [ ] 15.7 Write tests for state restoration logic

## 16. Testing - Integration Tests

- [ ] 16.1 Test full environment switch flow (validation → disconnect → connect → restore state)
- [ ] 16.2 Test multiple environment switches in sequence
- [ ] 16.3 Test state isolation between environments
- [ ] 16.4 Test event emission and propagation
- [ ] 16.5 Test UI component integration with service
- [ ] 16.6 Test error handling and recovery
- [ ] 16.7 Test concurrent environment operations (debouncing)

## 17. Testing - End-to-End Tests

- [ ] 17.1 Test complete user workflow: create env → switch → perform operations → switch again
- [ ] 17.2 Test environment persistence across application restart
- [ ] 17.3 Test sidebar integration with Elasticsearch tool
- [ ] 17.4 Test UI components rendering and interaction
- [ ] 17.5 Test legacy configuration migration on first upgrade
- [ ] 17.6 Test credential encryption with real ES connections

## 18. Documentation

- [ ] 18.1 Create user migration guide for switching to multi-environment support
- [ ] 18.2 Document environment configuration options and security best practices
- [ ] 18.3 Document how to create, edit, delete, and switch environments
- [ ] 18.4 Add code comments to key implementation sections
- [ ] 18.5 Create troubleshooting guide for common connection errors
- [ ] 18.6 Document API for developers (service methods, events, types)
- [ ] 18.7 Add inline JSDoc documentation to all exported functions and classes
- [ ] 18.8 Create screenshots or GIFs showing UI features in action

## 19. Verification and Quality Assurance

- [ ] 19.1 Verify all database migrations execute successfully
- [ ] 19.2 Verify backward compatibility with existing single-cluster configs
- [ ] 19.3 Verify encryption/decryption works correctly with real credentials
- [ ] 19.4 Verify environment switches complete within 2 second target
- [ ] 19.5 Verify no plaintext credentials in logs or database
- [ ] 19.6 Verify state isolation between environments
- [ ] 19.7 Verify UI responsiveness and no memory leaks
- [ ] 19.8 Verify error handling for all error types
- [ ] 19.9 Code review for security issues (SQL injection, XSS, etc.)
- [ ] 19.10 Performance testing with 10+ environments
