## Why

Kafka consumer groups are critical for managing message consumption in distributed systems. Currently, the platform lacks built-in consumer group management capabilities, forcing users to rely on external tools or CLI commands. Adding consumer group management to the UI enables users to monitor, configure, and troubleshoot consumer groups directly within the platform.

## What Changes

- New consumer groups management page in the UI with list view and detail view
- API endpoints to fetch consumer group metadata, member information, and lag metrics
- Ability to view consumer group offsets and partition assignments
- Support for resetting consumer group offsets to specific timestamps or beginning/end
- Consumer group deletion capability with confirmation
- Real-time lag monitoring and visualization

## Capabilities

### New Capabilities
- `consumer-groups-management`: UI and API for viewing, monitoring, and managing Kafka consumer groups including offset management and lag tracking

### Modified Capabilities
<!-- No existing capabilities require spec-level changes -->

## Impact

- **UI**: New consumer groups management page and navigation
- **Backend Service**: New API endpoints for consumer group operations
- **Kafka Integration**: Extended Kafka client usage for consumer group operations
- **Database**: Potential caching of consumer group metadata for performance
