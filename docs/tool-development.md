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

Tools can emit and listen to events:

```typescript
// Emit event
tool.emit('data:received', { message: 'Hello' });

// Listen to event
tool.on('data:received', (data) => {
  console.log(data.message);
});

// Stop listening
tool.off('data:received', handler);
```

## Best Practices

1. **Keep tools independent**: Don't rely on other tools
2. **Handle errors gracefully**: Catch exceptions and update status
3. **Clean up resources**: Always implement destroy()
4. **Use TypeScript**: For type safety
5. **Test thoroughly**: Unit and integration tests
6. **Document configuration**: Explain what config options do
7. **Provide feedback**: Use status indicators and events

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
