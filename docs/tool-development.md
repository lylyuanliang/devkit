# Tool Development Guide

## Creating a New Tool

### 1. Tool Structure

Create a new directory in `packages/tools/`:

```
packages/tools/my-tool/
├── src/
│   ├── ui/
│   │   └── MyToolComponent.tsx
│   ├── service/
│   │   └── myToolService.ts
│   ├── types.ts
│   └── index.ts
└── package.json
```

### 2. Implement ToolInstance Interface

```typescript
// packages/tools/my-tool/src/types.ts
import React from 'react';
import { ToolInstance, ToolStatus } from '@devkit/shared';

export class MyTool implements ToolInstance {
  private status: ToolStatus = 'disconnected';
  private config: any = {};
  private listeners: Map<string, Function[]> = new Map();

  async init(config: any): Promise<void> {
    this.config = config;
    // Initialize your tool
    this.status = 'connected';
  }

  async destroy(): Promise<void> {
    // Cleanup
    this.status = 'disconnected';
  }

  async getStatus(): Promise<ToolStatus> {
    return this.status;
  }

  async getConfig(): Promise<any> {
    return this.config;
  }

  async setConfig(config: any): Promise<void> {
    this.config = config;
    this.emit('config:changed', config);
  }

  getComponent(): React.ComponentType<any> {
    return MyToolComponent;
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}
```

### 3. Create UI Component

```typescript
// packages/tools/my-tool/src/ui/MyToolComponent.tsx
import React from 'react';

export const MyToolComponent: React.FC = () => {
  return (
    <div className="my-tool">
      <h2>My Tool</h2>
      {/* Your tool UI here */}
    </div>
  );
};
```

### 4. Register Tool

In the core application, register your tool:

```typescript
// packages/core/src/backend/tool-registry.ts
import { MyTool } from '@devkit/tools/my-tool';

registry.register(
  {
    id: 'my-tool',
    name: 'My Tool',
    category: 'dev-tools',
    icon: '🛠️',
    version: '0.1.0',
  },
  () => new MyTool()
);
```

### 5. Add to Build Configuration

Edit `tools.config.json`:

```json
{
  "included": ["my-tool"],
  "excluded": []
}
```

## Tool Lifecycle

1. **Discovery**: Tool is discovered at startup
2. **Registration**: Tool metadata is registered
3. **Instantiation**: User opens tool, instance is created
4. **Initialization**: `init()` is called with configuration
5. **Active**: Tool is displayed and can be interacted with
6. **Destruction**: User closes tool, `destroy()` is called
7. **Cleanup**: Resources are released

## Event Communication

### 工具内部事件（Local Events）

工具可以发出和监听内部事件：

```typescript
// 发出事件
tool.emit('data:received', { message: 'Hello' });

// 监听事件
tool.on('data:received', (data) => {
  console.log(data.message);
});

// 停止监听
tool.off('data:received', handler);
```

### 跨工具通信（Inter-Tool Communication）

**概念**: EventBus 是全局单例，所有工具都可以访问。这允许不同工具之间的事件通信。

**获取 EventBus 实例**:

```typescript
import { EventBus } from '@devkit/core/backend/event-bus';

export class KafkaTool implements ToolInstance {
  private eventBus = EventBus.getInstance();

  async init(config: any): Promise<void> {
    // 监听其他工具的事件
    this.eventBus.on('other-tool:action', (data) => {
      console.log('Received event from other tool:', data);
    });
  }

  private notifyOtherTools(eventName: string, data: any): void {
    // 向其他工具发送事件
    this.eventBus.emit(eventName, data);
  }
}
```

**事件命名规范**:

为了避免命名冲突，遵循以下规范：

```
格式: [tool-id]:[event-name]

示例:
- kafka:message-sent          // Kafka 工具发送了消息
- kafka:consumer-lag-changed  // Kafka 消费进度变化
- redis:key-updated           // Redis 工具的键更新了
- database:query-executed     // 数据库工具执行了查询
```

**完整的跨工具通信范例**:

```typescript
// Kafka Tool 发送消息并通知其他工具
class KafkaTool implements ToolInstance {
  private eventBus = EventBus.getInstance();

  async sendMessage(topic: string, message: any): Promise<void> {
    try {
      // 发送消息逻辑...
      await this.kafkaProducer.send({ topic, messages: [{ value: JSON.stringify(message) }] });

      // 通知所有订阅的工具
      this.eventBus.emit('kafka:message-sent', {
        timestamp: Date.now(),
        topic,
        message,
        toolId: 'kafka-tool'
      });
    } catch (error) {
      this.eventBus.emit('kafka:error', {
        timestamp: Date.now(),
        error: error.message,
        toolId: 'kafka-tool'
      });
    }
  }

  async destroy(): Promise<void> {
    // 清理时应该移除所有监听器
    this.eventBus.removeAllListeners('kafka:*');
  }
}

// 另一个工具监听 Kafka 事件
class MonitoringTool implements ToolInstance {
  private eventBus = EventBus.getInstance();

  async init(config: any): Promise<void> {
    // 监听 Kafka 消息发送事件
    this.eventBus.on('kafka:message-sent', (data) => {
      console.log(`Message sent to topic: ${data.topic}`);
      this.updateMetrics(data);
    });

    // 监听 Kafka 错误
    this.eventBus.on('kafka:error', (data) => {
      console.error(`Kafka error: ${data.error}`);
      this.logAlert(data);
    });
  }
}
```

**跨工具通信的最佳实践**:

1. **命名清晰**: 使用 `[tool-id]:[action]` 格式，避免歧义
2. **包含元数据**: 事件数据中包含 `timestamp` 和 `toolId`，便于追踪
3. **及时清理**: 在 `destroy()` 中移除所有监听器，避免内存泄漏
4. **错误处理**: 发送事件时捕获异常，并发出错误事件
5. **松耦合**: 不要假设其他工具是否监听了你的事件；反之亦然
6. **文档化**: 在工具文档中列出它发出和监听的所有事件

## Best Practices

1. **Keep tools independent**: Don't rely on other tools
2. **Handle errors gracefully**: Catch exceptions and update status
3. **Clean up resources**: Always implement destroy()
4. **Use TypeScript**: For type safety
5. **Test thoroughly**: Unit and integration tests
6. **Document configuration**: Explain what config options do
7. **Provide feedback**: Use status indicators and events

## Example: Kafka Tool

### Overview

The Kafka Tool demonstrates a complete, production-ready tool implementation with:
- Multiple service layers (Admin, Producer, Consumer, Lag Monitoring)
- EventSource interface implementation for tool-level substitutability
- Secure credential storage with encryption
- Rich UI components with Zustand state management
- Comprehensive event publishing for cross-tool communication

### Key Files

- **Service Layer**: `src/service/*.ts` - Kafka operations (connection, admin, producer, consumer, monitoring)
- **Core Tool**: `src/index.ts` - KafkaTool class implementing ToolInstance and EventSource
- **UI Components**: `src/ui/*.tsx` - Cluster, Topic, Message, Monitoring management
- **State**: `src/ui/store.ts` - Zustand store for UI state
- **Types**: `src/types/index.ts` - TypeScript interfaces for Kafka entities

### Using Kafka Tool as Event Source

If Kafka Tool is configured as the event source, other tools can use it for messaging:

```typescript
import { EventSourceRegistry } from '@devkit/core/backend/event-source-registry';

// In another tool's init() method
async someToolInit() {
  // Publish a message to Kafka
  const eventSource = EventSourceRegistry.getCurrent();
  await eventSource.publish('my-topic', {
    data: 'hello',
    timestamp: Date.now()
  });

  // Subscribe to a topic
  await eventSource.subscribe('my-topic', (message) => {
    console.log('Received:', message);
  });
}
```

### Events Emitted

The Kafka Tool emits the following events that other tools can subscribe to:

- `kafka:registered-as-event-source` - When configured as event source
- `kafka:cluster-connected` - When connected to a cluster
- `kafka:message-sent` - When a message is published
- `kafka:consumer-created` - When a consumer group is created
- `kafka:lag-alert` - When consumer lag exceeds threshold
- `kafka:error` - When an error occurs

Subscribe using the EventBus:

```typescript
const eventBus = EventBus.getInstance();
eventBus.on('kafka:message-sent', (data) => {
  console.log(`Message sent to ${data.topic}:`, data.partition);
});
```

### Architecture Pattern

The Kafka Tool follows this architecture:

```
KafkaTool (ToolInstance + EventSource)
  ├─ init() / destroy()  - Lifecycle
  ├─ getComponent()      - React UI
  ├─ publish/subscribe   - Event source interface
  ├─ KafkaService
  │  ├─ KafkaConnectionManager
  │  ├─ KafkaAdminService
  │  ├─ KafkaProducerService
  │  ├─ KafkaConsumerService
  │  ├─ ConsumerGroupService
  │  └─ LagMonitorService
  └─ EventBus integration
     └─ Emits kafka:* events
```

### Configuration Storage

Cluster configurations are stored securely:

```typescript
// Passwords encrypted with AES-256-GCM
const cluster: KafkaClusterConfig = {
  id: 'prod-cluster',
  name: 'Production',
  brokers: ['kafka1:9092', 'kafka2:9092'],
  sasl: { mechanism: 'plain', username: 'admin' },
  // Password stored separately in encrypted storage
};

await kafkaTool.saveCluster(cluster, password);
```

The master encryption key is automatically managed:
- Generated on first run at `~/.devkit/master.key`
- Protected with file permissions (0o600)
- Used to encrypt/decrypt sensitive data via DatabaseService

## Example: Simple Counter Tool

```typescript
import React, { useState } from 'react';
import { ToolInstance, ToolStatus } from '@devkit/shared';

class CounterTool implements ToolInstance {
  private status: ToolStatus = 'connected';
  private listeners: Map<string, Function[]> = new Map();

  async init(): Promise<void> {
    this.status = 'connected';
  }

  async destroy(): Promise<void> {
    this.status = 'disconnected';
  }

  async getStatus(): Promise<ToolStatus> {
    return this.status;
  }

  async getConfig(): Promise<any> {
    return {};
  }

  async setConfig(): Promise<void> {}

  getComponent(): React.ComponentType<any> {
    return () => {
      const [count, setCount] = useState(0);
      return (
        <div>
          <h2>Counter: {count}</h2>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    };
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}
```

## Theme Support

Tools automatically inherit the application theme through CSS variables. This means your tool will automatically support light and dark themes without any additional implementation.

### Using CSS Variables

Define your tool's styles using CSS variables instead of hardcoded colors:

```css
/* ❌ Don't do this */
.my-tool {
  background: white;
  color: black;
}

/* ✅ Do this instead */
.my-tool {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### Available CSS Variables

**Background Colors:**
- `--bg-primary`: Primary background
- `--bg-secondary`: Secondary background
- `--bg-tertiary`: Tertiary background

**Text Colors:**
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-tertiary`: Tertiary text color

**Border Colors:**
- `--border-primary`: Primary border color
- `--border-secondary`: Secondary border color

**Accent Colors:**
- `--accent-primary`: Primary accent color (blue)
- `--accent-secondary`: Secondary accent color
- `--accent-hover`: Hover state accent color

### Accessing Theme State

Use the `useTheme` hook to access the current theme:

```typescript
import { useTheme } from '@devkit/core/hooks';

export const MyToolComponent: React.FC = () => {
  const theme = useTheme(); // Returns 'light' or 'dark'
  return <div>Current theme: {theme}</div>;
};
```
