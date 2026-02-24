# DevKit Architecture

## Overview

DevKit is a modular tool container application built with Tauri, React, and Node.js. It provides a framework for hosting multiple independent tools (Kafka client, Redis client, etc.) in a single application.

## Project Structure

```
devkit/
├── packages/
│   ├── core/                 # Main application
│   │   ├── src/
│   │   │   ├── frontend/     # React UI
│   │   │   ├── backend/      # Node.js backend
│   │   │   └── types/        # Shared types
│   │   └── vite.config.ts
│   ├── shared/               # Shared types and utilities
│   │   └── src/types/
│   └── tools/                # Tool packages
│       └── kafka-tool/
├── src-tauri/                # Tauri configuration
│   ├── tauri.conf.json
│   ├── Cargo.toml
│   └── src/main.rs
└── tools.config.json         # Build configuration
```

## Architecture

### Frontend (React + TypeScript)

- **Components**: Sidebar, TabBar, WorkArea, SettingsPanel
- **State Management**: Zustand for global state
- **Persistence**: localStorage for UI state
- **API Client**: Tauri commands for backend communication

### Backend (Node.js)

- **Database**: SQLite for configuration and state storage
- **Event Bus**: EventEmitter for inter-tool communication
- **Tool Registry**: Manages tool lifecycle and instantiation
- **Tauri Commands**: RPC interface for frontend

### Tool Framework

All tools implement the `ToolInstance` interface:

```typescript
interface ToolInstance {
  init(config: any): Promise<void>;
  destroy(): Promise<void>;
  getStatus(): Promise<ToolStatus>;
  getConfig(): Promise<any>;
  setConfig(config: any): Promise<void>;
  getComponent(): React.ComponentType<any>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}
```

## Development

### Setup

```bash
yarn install
```

### Development Server

```bash
yarn dev
```

### Build

```bash
yarn build
```

### Build with Specific Tools

Edit `tools.config.json` to select which tools to include:

```json
{
  "included": ["kafka-tool", "redis-tool"],
  "excluded": []
}
```

Then run:

```bash
yarn build
```

## Tool Development

See `docs/tool-development.md` for detailed instructions on creating new tools.

## Event Source Registry

The `EventSourceRegistry` is a centralized system that allows tools to act as replaceable event sources, enabling tool-level substitutability:

### Purpose

- **Tool Substitutability**: Tools implementing the `EventSource` interface can be swapped at runtime
- **Decoupling**: Other tools use `EventSourceRegistry.getCurrent()` instead of depending on specific tool implementations
- **Future Flexibility**: Easily switch between Kafka, Redis, RabbitMQ, or other message queues

### EventSource Interface

```typescript
interface EventSource {
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, handler: (message: any) => void): Promise<void>;
  unsubscribe(topic: string, handler: Function): Promise<void>;
}
```

### Usage

```typescript
// In a tool that needs to use an event source
const eventSource = EventSourceRegistry.getCurrent();
await eventSource.publish('my-topic', { data: 'value' });
```

### Current Implementation

The **Kafka Tool** currently implements the `EventSource` interface:
- Cluster management with SASL/SSL support
- Secure credential storage (AES-256-GCM encryption)
- Topic and consumer group operations
- Real-time lag monitoring and alerts

See `packages/tools/kafka-tool/README.md` for details.

## Key Features

- **Modular Architecture**: Tools are independent and can be developed separately
- **Flexible Packaging**: Choose which tools to include in builds
- **Persistent State**: Configuration and recent tools are saved
- **Event-Driven**: Tools can communicate via event bus and event sources
- **Tool-Level Substitutability**: EventSource-implementing tools can be swapped at runtime
- **Secure Storage**: Sensitive configuration encrypted with AES-256-GCM
- **Lightweight**: Tauri-based, ~20-50MB vs Electron's 150-300MB
