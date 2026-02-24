## ADDED Requirements

### Requirement: Per-environment workspace state isolation

The system SHALL maintain completely independent workspace state for each Elasticsearch environment.

#### Scenario: Preserve opened indices per environment
- **WHEN** user opens indices while working with environment A
- **THEN** this list is stored per environment and switching to environment B shows different opened indices list

#### Scenario: Preserve selected index per environment
- **WHEN** user selects an index in environment A
- **THEN** when returning to environment A later, system automatically reselects the same index

#### Scenario: Isolate filter configuration per environment
- **WHEN** user applies filters (query, time range, field selection) in environment A
- **THEN** these filters are stored per environment and do not affect environment B's filter state

#### Scenario: Preserve query history per environment
- **WHEN** user executes queries in environment A
- **WHEN** user switches to environment B and executes queries there
- **THEN** each environment has separate query history and user can access previous queries for each

#### Scenario: Preserve scroll position per environment
- **WHEN** user scrolls to position N in results for environment A
- **THEN** when switching to environment B and back to A, scroll position is restored

#### Scenario: Store UI preferences per environment
- **WHEN** user configures UI settings (result view mode, columns displayed, sort order) for environment A
- **THEN** when switching to environment B, those preferences apply to B independently

#### Scenario: Timestamp state for cache invalidation
- **WHEN** workspace state is saved for an environment
- **THEN** system stores timestamp and can invalidate stale state if configuration changed

---

### Requirement: Zustand store for state management

The system SHALL use Zustand store with per-environment namespace for state management.

#### Scenario: Initialize store with empty state
- **WHEN** ElasticsearchTool initializes
- **THEN** Zustand store is created with environmentStates Map initialized empty

#### Scenario: Create environment state on first access
- **WHEN** user switches to environment that has no stored state
- **THEN** system creates default WorkspaceStatePerEnv with empty lists and default settings

#### Scenario: Retrieve state when switching environments
- **WHEN** environment switch completes
- **THEN** system retrieves that environment's state from Zustand store and applies to UI

#### Scenario: Update state atomically per environment
- **WHEN** user performs action that changes state (open index, apply filter, scroll)
- **THEN** system updates Zustand store for current environment only without affecting other environments

#### Scenario: Persist state to localStorage
- **WHEN** user performs state-changing action
- **THEN** system persists environment state to localStorage with environment name as key

#### Scenario: Recover state from localStorage on startup
- **WHEN** application restarts
- **THEN** system loads persisted state from localStorage for active environment

---

### Requirement: State restoration on environment switch

The system SHALL completely restore workspace state when switching to a previously used environment.

#### Scenario: Restore UI to previous state after switch
- **WHEN** user switches to environment A that was previously used with specific state
- **THEN** system restores: opened indices, selected index, filters, scroll positions, and UI preferences

#### Scenario: Handle missing state gracefully
- **WHEN** switching to environment that has no persisted state (first time or cleared)
- **THEN** system applies sensible defaults (empty lists, no filters, top scroll position)

#### Scenario: Notify UI of state restoration
- **WHEN** environment state is restored
- **THEN** system triggers state change events allowing all UI components to react and update

#### Scenario: Clear state when environment is deleted
- **WHEN** an environment is deleted from storage
- **THEN** system clears its workspace state from Zustand store and localStorage

---

### Requirement: Prevent state pollution between environments

The system SHALL prevent accidental state leakage between environments.

#### Scenario: Isolate filter operations per environment
- **WHEN** user sets filter in environment A
- **WHEN** user switches to environment B
- **THEN** environment B's filters are unaffected by environment A's filters

#### Scenario: Isolate query history per environment
- **WHEN** user executes query in environment A
- **WHEN** user switches to environment B
- **THEN** environment B's query history does not include queries from environment A

#### Scenario: Prevent cache cross-contamination
- **WHEN** system caches query results or metadata for environment A
- **THEN** when accessing environment B, cached data from environment A is not used

#### Scenario: Validate state consistency on access
- **WHEN** workspace state is retrieved for an environment
- **THEN** system validates state structure and discards corrupted or invalid state
