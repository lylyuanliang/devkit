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

## Key Features

- **Modular Architecture**: Tools are independent and can be developed separately
- **Flexible Packaging**: Choose which tools to include in builds
- **Persistent State**: Configuration and recent tools are saved
- **Event-Driven**: Tools can communicate via event bus
- **Lightweight**: Tauri-based, ~20-50MB vs Electron's 150-300MB
