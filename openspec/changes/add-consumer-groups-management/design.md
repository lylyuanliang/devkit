## Context

The devkit is a Tauri-based desktop application for managing Kafka clusters and tools. Currently, it provides cluster management, environment management, and message production capabilities. Consumer group management is a critical missing feature that users need to monitor consumption patterns, troubleshoot lag issues, and manage offset positions.

The application architecture consists of:
- **Frontend**: React/TypeScript with Tauri invoke for backend communication
- **Backend**: Rust with Tauri commands exposing APIs to the frontend
- **Kafka Integration**: KafkaJS client for cluster operations
- **Data Persistence**: SQLite database for configuration and state

## Goals / Non-Goals

**Goals:**
- Provide a comprehensive UI for viewing and managing Kafka consumer groups
- Display real-time lag metrics and partition assignments
- Enable offset reset operations for recovery and replay scenarios
- Support consumer group deletion with safety confirmations
- Integrate seamlessly with existing cluster and environment management
- Maintain performance with large numbers of consumer groups and partitions

**Non-Goals:**
- Consumer group creation (groups are created by applications)
- Advanced ACL/security management for consumer groups
- Consumer group metrics persistence/historical tracking
- Integration with external monitoring systems
- Custom consumer group policies or configurations

## Decisions

### 1. API Architecture: Tauri Commands vs HTTP Endpoints
**Decision**: Extend existing Tauri command pattern for consumer group operations
**Rationale**:
- Consistent with existing architecture (all Kafka operations use Tauri commands)
- Leverages existing authentication and cluster context
- Simpler deployment (no separate HTTP server needed)
- Direct access to KafkaJS client already initialized in backend

**Alternatives Considered**:
- HTTP REST API: Would require additional server setup and authentication layer
- Direct KafkaJS in frontend: Would bloat frontend bundle and lose backend control

### 2. Data Fetching Strategy: On-Demand vs Polling
**Decision**: On-demand fetching with optional auto-refresh UI toggle
**Rationale**:
- Consumer group metadata changes infrequently
- Lag data can be fetched on-demand when user views details
- Reduces backend load and network traffic
- User can enable auto-refresh for specific groups if needed

**Alternatives Considered**:
- Continuous polling: Would consume resources unnecessarily
- WebSocket streaming: Adds complexity without clear benefit for this use case

### 3. Lag Calculation: Broker-side vs Client-side
**Decision**: Fetch offsets from broker and calculate lag in backend
**Rationale**:
- Ensures consistent lag calculation across all clients
- Reduces frontend complexity
- Leverages KafkaJS admin client capabilities
- Single source of truth for lag metrics

**Alternatives Considered**:
- Frontend calculation: Would require fetching raw offset data and duplicating logic
- Kafka metrics topic: Would add dependency on metrics collection

### 4. Offset Reset Scope: Per-Partition vs Group-Wide
**Decision**: Support group-wide reset with per-partition granularity in UI
**Rationale**:
- Most common use case is resetting entire group for replay
- UI shows per-partition results for transparency
- Simplifies API while maintaining flexibility

**Alternatives Considered**:
- Per-partition reset only: Would be tedious for large groups
- Group-wide only: Would lose visibility into per-partition state

### 5. Caching Strategy: In-Memory vs Database
**Decision**: In-memory cache with optional database persistence for metadata
**Rationale**:
- Consumer group metadata is relatively static
- In-memory cache provides fast access for UI
- Database persistence optional for future historical tracking
- Reduces Kafka broker queries

**Alternatives Considered**:
- No caching: Would cause excessive broker queries
- Database-only: Would add latency for frequently accessed data

## Risks / Trade-offs

**[Risk] Large consumer groups with many partitions**
→ Mitigation: Implement pagination in UI, lazy-load partition details, add search/filter

**[Risk] Lag calculation accuracy with high-throughput topics**
→ Mitigation: Fetch latest offsets directly from broker, document lag calculation method

**[Risk] Offset reset operations are destructive**
→ Mitigation: Require explicit confirmation, show affected partitions before applying, log all reset operations

**[Risk] Performance with hundreds of consumer groups**
→ Mitigation: Implement efficient list pagination, add filtering/search, consider background refresh for active groups only

**[Risk] Stale lag data if user doesn't refresh**
→ Mitigation: Provide manual refresh button, optional auto-refresh toggle, show data timestamp

## Migration Plan

### Phase 1: Backend Implementation
1. Add new Tauri commands for consumer group operations
2. Implement KafkaJS admin client methods for group operations
3. Add error handling and validation
4. Test with real Kafka cluster

### Phase 2: Frontend Implementation
1. Create consumer groups page component
2. Implement list view with pagination and filtering
3. Implement detail view with partition assignments
4. Add offset reset and deletion dialogs
5. Integrate with existing navigation

### Phase 3: Integration & Testing
1. Connect frontend to backend APIs
2. Test lag calculation accuracy
3. Test offset reset operations
4. Performance testing with large groups
5. User acceptance testing

### Phase 4: Deployment
1. Update navigation to include consumer groups
2. Release as part of next version
3. Monitor for issues and performance

## Open Questions

1. Should we cache consumer group metadata in the database for historical tracking?
2. What should be the default auto-refresh interval if user enables it?
3. Should we support filtering by topic or state in the list view?
4. How should we handle consumer groups with no active members?
5. Should offset reset operations be logged to a separate audit log?
