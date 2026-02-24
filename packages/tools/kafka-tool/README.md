# Kafka Tool

A comprehensive Kafka client tool for DevKit that provides cluster management, topic operations, message production/consumption, and consumer group management with real-time lag monitoring.

## Features

### Cluster Management (P0)
- Save and manage multiple Kafka cluster configurations
- Support for SASL authentication (PLAIN, SCRAM-SHA-256, SCRAM-SHA-512)
- Support for SSL/TLS connections
- Secure password storage with AES-256-GCM encryption

### Topic Management (P0)
- List topics in connected cluster
- Create new topics with configurable partitions and replication factor
- Delete topics
- View partition details and leader information
- Update topic configuration (retention, compression, etc.)

### Message Production (P0)
- Send single or batch messages to topics
- Support for message keys and headers
- Multiple message formats: JSON, Avro, plain text
- Real-time feedback with partition, offset, and timestamp

### Message Consumption (P0)
- Consume messages from topics
- Navigate by offset or seek to beginning/end
- Filter and search messages by key or content
- Persistent consumption state (last offset)

### Consumer Group Management (P1)
- List and view consumer groups
- Display group members and assigned partitions
- Reset consumer group offsets (earliest/latest/specific)
- Delete consumer groups

### Lag Monitoring (P1)
- Real-time consumer lag metrics
- Configurable lag alerts
- Consumption rate calculation
- Historical lag data

### Event Source (Architecture)
- Implements `EventSource` interface for tool-level substitutability
- Other tools can publish messages via EventSourceRegistry
- Supports cross-tool event communication with standard naming convention

## Installation

```bash
yarn install
```

## Usage in Other Tools

If Kafka Tool is configured as the event source:

```typescript
import { EventSourceRegistry } from '@devkit/core/backend/event-source-registry';

// Publish a message
const eventSource = EventSourceRegistry.getCurrent();
await eventSource.publish('my-topic', { message: 'data' });

// Subscribe to a topic
await eventSource.subscribe('my-topic', (message) => {
  console.log('Received:', message);
});
```

## Events Emitted

- `kafka:registered-as-event-source` - Tool registered as event source
- `kafka:cluster-connected` - Connected to a Kafka cluster
- `kafka:cluster-saved` - Cluster configuration saved
- `kafka:message-sent` - Message successfully sent
- `kafka:consumer-created` - Consumer created for topic
- `kafka:consumer-lag-alert` - Consumer lag exceeds threshold
- `kafka:error` - Error occurred in Kafka operations

## Architecture

### Service Layer
- `KafkaService` - Main orchestrator
- `KafkaConnectionManager` - Manages cluster connections
- `KafkaAdminService` - Topic and cluster operations
- `KafkaProducerService` - Message production
- `KafkaConsumerService` - Message consumption
- `ConsumerGroupService` - Consumer group management
- `LagMonitorService` - Lag monitoring and metrics

### UI Components
- `KafkaToolComponent` - Main container with tabs
- `ClusterSelector` - Cluster management
- `TopicList` - Topic browser
- `MessageProducer` - Message production UI
- `MessageConsumer` - Message consumption UI
- Plus monitoring and alerting components

### Security
- Master key stored in `~/.devkit/master.key` (user-only permissions)
- AES-256-GCM encryption for sensitive data (passwords, certificates)
- Automatic key generation on first run
- Warning displayed about key backup importance

## Configuration

Clusters are saved to the application database with:
```typescript
interface KafkaClusterConfig {
  id: string;
  name: string;
  brokers: string[];
  sasl?: { mechanism, username }; // password stored separately
  ssl?: { rejectUnauthorized, ca, key, cert };
  createdAt: number;
  updatedAt: number;
}
```

## Development

Type checking:
```bash
yarn type-check
```

## Future Enhancements (P2)

- Schema Registry integration (Avro, Protobuf)
- Message export/import
- Batch operations
- Connection pooling optimization
- Plugin system for custom message formats
- Metrics persistence and visualization
- Advanced filtering and search
