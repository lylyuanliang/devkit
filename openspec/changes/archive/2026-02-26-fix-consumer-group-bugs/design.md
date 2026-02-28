## Context

The Kafka tool's consumer group management feature currently has three critical issues:

1. **Partition assignments are not displayed** - The `ConsumerGroupInfo.members[].topicPartitions` array is always empty, preventing users from seeing which partitions are assigned to each consumer
2. **Offset reset logic is incomplete** - The `resetOffsetToEarliest` method has a bug where it tries to retrieve topics from the consumer group but the logic is incomplete, causing failures
3. **System topics are not filtered** - Internal Kafka topics like `__consumer_offsets` and `__transaction_state` are displayed alongside user topics, cluttering the UI

The current implementation uses KafkaJS Admin API to interact with the Kafka cluster. The service layer (`ConsumerGroupService`) handles all Kafka operations, while the UI layer (`ConsumerGroupsView`, `ConsumerGroupDetails`) displays the information.

## Goals / Non-Goals

**Goals:**
- Fix partition assignment retrieval and display in consumer group details
- Fix offset reset operations to correctly identify and handle topics
- Filter system topics from all consumer group views and operations
- Improve error messages for offset reset failures
- Ensure all operations are idempotent and handle edge cases

**Non-Goals:**
- Add support for creating consumer groups (Kafka doesn't support this via Admin API)
- Implement time-based offset reset (timestamp reset)
- Add pagination or sorting to consumer group lists
- Implement consumer group configuration management
- Add audit logging for consumer group operations

## Decisions

### Decision 1: Retrieve partition assignments from member metadata
**Choice**: Use KafkaJS `describeGroups()` API to get member metadata, then parse the member protocol metadata to extract partition assignments.

**Rationale**: KafkaJS provides member metadata in the `describeGroups()` response. The member object contains protocol metadata that includes partition assignments. This is the standard way to get this information.

**Alternative considered**: Use `fetchOffsets()` to infer assignments - rejected because it only shows offsets, not actual assignments, and doesn't work for inactive members.

**Implementation**:
- Modify `ConsumerGroupService.getConsumerGroupInfo()` to parse member metadata
- Extract `topicPartitions` from member protocol metadata
- Update `ConsumerGroupInfo` type to include partition data
- Update `ConsumerGroupDetails.tsx` to display partition assignments in a table

### Decision 2: Create a system topic filter utility
**Choice**: Create a reusable filter function `isSystemTopic(topicName: string)` that checks if a topic starts with `__`.

**Rationale**: System topics in Kafka always start with double underscores. This is a simple, reliable check. Centralizing this logic makes it reusable across the codebase.

**Alternative considered**: Maintain a hardcoded list of system topics - rejected because it's not maintainable and Kafka may add new system topics.

**Implementation**:
- Create `utils/kafka-utils.ts` with `isSystemTopic()` function
- Apply filter in `ConsumerGroupService.listConsumerGroups()`
- Apply filter in `ConsumerGroupService.getConsumerGroupInfo()` when returning topics
- Apply filter in `ConsumerGroupService.resetOffsetToEarliest()` and `resetOffsetToLatest()`
- Apply filter in UI components when displaying topics

### Decision 3: Fix offset reset logic to handle topic retrieval
**Choice**: For `resetOffsetToEarliest`, if topics are not specified, fetch them from the consumer group's current subscriptions using `fetchOffsets()`.

**Rationale**: `fetchOffsets()` returns all topics the consumer group has offsets for, which represents the topics it's subscribed to. This is more reliable than trying to parse group metadata.

**Alternative considered**: Use `describeGroups()` to get topics - rejected because the topics field in group metadata is not always populated.

**Implementation**:
- Modify `resetOffsetToEarliest()` to use `fetchOffsets()` when topics are not provided
- Filter out system topics from the fetched topics
- Validate that at least one user topic exists before proceeding
- Add proper error handling for edge cases (no topics, connection errors)

### Decision 4: Improve error handling with specific error types
**Choice**: Create specific error messages that indicate the cause and suggest remediation.

**Rationale**: Users need to understand why an operation failed and what to do about it. Generic errors are not helpful.

**Implementation**:
- Add validation checks before operations
- Provide specific error messages for: connection failures, permission errors, invalid topics, empty topic lists
- Include suggestions in error messages (e.g., "Check cluster connectivity" for connection errors)

## Risks / Trade-offs

**Risk 1: Member metadata parsing complexity**
- **Issue**: Member protocol metadata format may vary between Kafka versions
- **Mitigation**: Add try-catch around metadata parsing; if parsing fails, return empty assignments with a warning log

**Risk 2: Performance impact of filtering**
- **Issue**: Filtering system topics on every operation adds overhead
- **Mitigation**: The overhead is minimal (string prefix check). If needed, cache system topic list.

**Risk 3: Incomplete topic list in resetOffsetToEarliest**
- **Issue**: Using `fetchOffsets()` only returns topics with existing offsets; topics with no offsets won't be included
- **Mitigation**: This is acceptable behavior - if a consumer group has no offsets for a topic, it hasn't consumed from it yet, so resetting is not necessary

**Risk 4: Breaking change for users relying on system topics**
- **Issue**: Filtering system topics may break workflows that depend on seeing them
- **Mitigation**: System topics should never be directly managed by users; this is a bug fix, not a breaking change

## Migration Plan

1. **Phase 1**: Deploy backend fixes (partition assignment, offset reset logic, system topic filtering)
   - No data migration needed
   - Backward compatible - existing code continues to work

2. **Phase 2**: Deploy UI updates to display partition assignments
   - No breaking changes
   - New information displayed in existing UI

3. **Rollback**: If issues occur, revert to previous version - no data cleanup needed

## Open Questions

- Should we add a configuration option to show/hide system topics for advanced users?
- Should we implement caching for consumer group metadata to improve performance?
- Should we add a "refresh" button to manually reload partition assignments?
