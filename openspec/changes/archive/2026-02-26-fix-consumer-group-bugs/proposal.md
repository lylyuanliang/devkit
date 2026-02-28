## Why

The consumer group management feature has critical bugs that prevent proper monitoring and management of Kafka consumer groups. Partition assignments are not displayed, offset reset logic is incomplete, and system topics are not filtered, making the feature unreliable for production use.

## What Changes

- Fix partition assignment retrieval to properly display which partitions are assigned to each consumer group member
- Fix offset reset logic in `resetOffsetToEarliest` to correctly identify topics for the consumer group
- Add filtering to exclude system topics (`__consumer_offsets`, `__transaction_state`, etc.) from consumer group views
- Improve error handling and validation in offset reset operations
- Enhance UI to display partition assignment information in consumer group details

## Capabilities

### New Capabilities
- `consumer-group-partition-assignment`: Display partition assignments for each member in a consumer group, showing which topics and partitions are assigned to each consumer

### Modified Capabilities
- `consumer-group-offset-management`: Fix offset reset operations to correctly handle topic identification and improve error handling

## Impact

- **Backend**: `ConsumerGroupService` class methods (`getConsumerGroupInfo`, `resetOffsetToEarliest`)
- **Frontend**: `ConsumerGroupDetails.tsx` component to display partition assignments
- **Types**: `ConsumerGroupInfo` and `ConsumerGroupMember` types to include partition assignment data
- **API**: `KafkaAPI.listConsumerGroups` may need filtering logic for system topics
