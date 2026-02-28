## 1. Utility Functions and Types

- [x] 1.1 Create `kafka-utils.ts` with `isSystemTopic()` function to filter topics starting with `__`
- [x] 1.2 Update `ConsumerGroupInfo` type to include partition assignment data in members
- [x] 1.3 Update `ConsumerGroupMember` type to include `topicPartitions` array with topic and partition info

## 2. Backend Service Fixes

- [x] 2.1 Fix `ConsumerGroupService.getConsumerGroupInfo()` to parse member protocol metadata and extract partition assignments
- [x] 2.2 Update `ConsumerGroupService.getConsumerGroupInfo()` to filter out system topics from the topics list
- [x] 2.3 Fix `ConsumerGroupService.resetOffsetToEarliest()` to use `fetchOffsets()` when topics are not provided
- [x] 2.4 Add system topic filtering to `resetOffsetToEarliest()` to exclude topics starting with `__`
- [x] 2.5 Add validation in `resetOffsetToEarliest()` to ensure at least one user topic exists
- [x] 2.6 Improve error handling in `resetOffsetToEarliest()` with specific error messages
- [x] 2.7 Update `ConsumerGroupService.resetOffsetToLatest()` to filter system topics
- [x] 2.8 Add system topic filtering to `ConsumerGroupService.listConsumerGroups()` if needed
- [x] 2.9 Add comprehensive error handling for connection failures and permission errors

## 3. Frontend Component Updates

- [x] 3.1 Update `ConsumerGroupDetails.tsx` to display partition assignments in a new table section
- [x] 3.2 Add partition assignment table with columns: Member ID, Client ID, Topic, Partition
- [x] 3.3 Handle empty partition assignments with appropriate UI message
- [x] 3.4 Update `ConsumerGroupsView.tsx` to filter system topics from display if applicable
- [x] 3.5 Update error message display in consumer group components to show specific error details
- [x] 3.6 Add loading state for partition assignment data retrieval

## 4. Testing

- [x] 4.1 Add unit tests for `isSystemTopic()` utility function
- [x] 4.2 Add unit tests for `ConsumerGroupService.getConsumerGroupInfo()` with partition assignment parsing
- [x] 4.3 Add unit tests for `resetOffsetToEarliest()` with various topic scenarios
- [x] 4.4 Add unit tests for system topic filtering in all service methods
- [x] 4.5 Add integration tests for complete consumer group management workflow
- [x] 4.6 Test error handling for connection failures and permission errors
- [x] 4.7 Update `ConsumerGroupDetails.tsx` tests to verify partition assignment display

## 5. Documentation and Cleanup

- [x] 5.1 Update README.md with consumer group feature documentation
- [x] 5.2 Add JSDoc comments to new utility functions
- [x] 5.3 Update type definitions documentation
- [x] 5.4 Verify no console.log statements remain in production code

