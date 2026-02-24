## Context

DevKit is a modular tool container with Tauri (desktop), React (frontend), and Node.js (backend). The Kafka tool currently supports a single cluster connection at a time. Users managing multiple Kafka clusters (dev, staging, prod) must manually update configuration or manage multiple tool instances.

The existing infrastructure provides:
- **DatabaseService** with `saveSecure()` / `loadSecure()` for AES-256-GCM encryption
- **EventBus** for global event communication between tools
- **Tool lifecycle** via `init()`, `destroy()`, and event emission
- **Zustand** for frontend state management

## Goals / Non-Goals

**Goals:**
- Enable users to save and manage multiple Kafka cluster configurations
- Provide seamless switching between environments with proper connection lifecycle (disconnect old, connect new, show loading state)
- Preserve workspace state (query history, UI preferences) across environment switches
- Encrypt sensitive credentials (SASL passwords, SSL certificate paths) in the database
- Establish a clear, reusable pattern for multi-environment support that can be applied to other tools (e.g., Elasticsearch)
- Provide clear feedback during switching (loading states, error messages)

**Non-Goals:**
- Support for schema registry integration (P2 feature)
- Cross-device key/configuration sync
- Performance optimization beyond what kafkajs provides
- Real-time cluster health dashboards (monitoring is separate concern)

## Decisions

### D1: Multi-Connection Management Model
**Decision**: Kafka tool maintains a `Map<environmentName, KafkaAdminClient>` internally. On init, it loads all environment configs but only connects to the active one. Switching calls `disconnect()` on old, then establishes new connection.

**Rationale**:
- Avoids holding unnecessary connections (resource efficiency)
- Clear lifecycle: only active environment has a live connection
- Mirrors the Kafka tool's existing single-connection assumption

**Alternatives Considered**:
- A) Pre-connect all environments: Wastes resources, multiple hanging connections
- B) Lazy-connect on demand: Fine, but switching adds latency; our approach pre-loads metadata

### D2: Configuration Storage with Dual Sensitivity
**Decision**: Store environment configs in `kafka_environments` table with split storage:
- Plaintext: name, host, brokers, description, connectionConfig
- Encrypted via `saveSecure()`: auth (SASL username/password), tls (certificate paths)

**Rationale**:
- Reuses existing encryption infrastructure (DatabaseService)
- Sensitive data encrypted, non-sensitive data human-readable for debugging
- Scalable: if new sensitive fields are added, just call `saveSecure()` on them

**Alternatives Considered**:
- A) Encrypt entire config: Loses debuggability
- B) No encryption: Security risk
- C) Separate columns per sensitive field: Verbose, harder to maintain

### D3: Environment Switching as Promise + Event
**Decision**: `switchEnvironment(name)` returns `Promise<{ success, error? }>`. During switch, emit `environment:switching` and `environment:switched` events.

**Rationale**:
- Promise lets UI manage loading state without extra plumbing
- Events allow other parts of tool (logging, monitoring panels) to react
- Non-blocking: UI updates immediately via promise, secondary systems react via events

**Alternatives Considered**:
- A) Only Promise: UI works, but other components don't know about switches
- B) Only events: UI must listen, feels indirect
- C) Callback-based: Awkward in modern async code

### D4: Tool Initialization Signature Change
**Decision**: `init(config)` changes from single cluster to multi-environment structure:
```typescript
// OLD
init({ host: "...", auth: {...} })

// NEW
init({
  environments: [
    { name: "dev", host: "...", auth: {...} },
    { name: "prod", host: "...", auth: {...} }
  ],
  activeEnvironment: "dev"
})
```

**Rationale**:
- Explicit contract: tool knows about all available environments upfront
- Backward compatible via migration: old single-cluster configs can be wrapped in an "environments" array
- Clear active selection at init time

**Alternatives Considered**:
- A) Separate init + addEnvironment calls: More flexible but awkward
- B) Load from database directly: Makes tool testing harder

### D5: UI Architecture
**Decision**: Implement environment selector as a dropdown/list in a new "Environments" panel, alongside existing Cluster Management, Topic Browser, etc. Active environment name prominently displayed in header.

**Rationale**:
- Clear spatial separation: environment management separate from cluster details
- Follows existing DevKit tab architecture
- Easy to spot current environment (reduces user errors)

**Alternatives Considered**:
- A) Inline switcher: Clutters cluster management UI
- B) Modal dialog: Disrupts workflow

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Connection switching latency** | Switching waits for Kafka connection; show loading state and allow cancellation (future) |
| **Accidental command to wrong cluster** | Prominently display active environment; require confirmation for destructive ops (P2) |
| **Credentials in memory** | Passwords are loaded into memory after decryption; document in-memory protection strategy |
| **Master key loss** | User loses access to all configs; display backup warning on first secure save (already in DatabaseService) |
| **Stale connection state** | If switch fails midway, tool might have inconsistent state; implement proper try-catch and rollback |

## Migration Plan

**Phase 1: Backend Infrastructure**
1. Add `kafka_environments` table to DatabaseService schema
2. Implement environment CRUD operations in KafkaService
3. Update `KafkaTool.init()` to accept multi-environment config

**Phase 2: Connection Management**
1. Implement `switchEnvironment()` with proper disconnect/connect lifecycle
2. Add event emission: `environment:switching`, `environment:switched`
3. Ensure workspace state (queries, offsets) persists across switches

**Phase 3: Frontend UI**
1. Create Environments panel with list and selector
2. Add loading spinner during switch
3. Display active environment in header/toolbar

**Phase 4: Testing & Documentation**
1. Unit tests for multi-connection logic
2. Integration tests for switch + state preservation
3. Document the pattern for replication in Elasticsearch tool

**Rollback**: If issues arise, load only "active" environment from config (ignore others); single-cluster mode still works as fallback.

## Open Questions

1. **Credential rotation**: Should the tool support updating credentials for an environment without losing saved history? (Design: yes, separate spec)
2. **Environment aliases/grouping**: Should users tag environments (e.g., "production", "staging") for quick filtering? (Defer to P2)
3. **Connection pool**: Should we keep a pool of pre-warmed connections or just one active? (Current approach: one active, optimal resource use)

---

## Implementation Reference for ES Tool

⚠️ **Important Note for Future ES Tool Implementation**:

Once this Kafka implementation is complete, the Elasticsearch tool should follow the exact same pattern:
1. Read `kafkaService.ts` for multi-connection management
2. Examine `switchEnvironment()` method for proper lifecycle handling
3. Study `secure-environment-storage` spec for encryption approach
4. Review UI components for environment selector implementation
5. Adapt event emission patterns (`environment:switching`, `environment:switched`)

The design decisions, database schema, and event patterns are intentionally generic to support any tool with multi-environment needs.
