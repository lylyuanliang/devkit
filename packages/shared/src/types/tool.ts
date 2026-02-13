import React from 'react';

export type ToolStatus = 'connected' | 'disconnected' | 'error';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'messaging' | 'database' | 'monitoring' | 'dev-tools';
  icon: string;
  version: string;
}

export interface ToolInstance {
  // Lifecycle
  init(config: any): Promise<void>;
  destroy(): Promise<void>;

  // Status
  getStatus(): Promise<ToolStatus>;
  getConfig(): Promise<any>;
  setConfig(config: any): Promise<void>;

  // UI
  getComponent(): React.ComponentType<any>;

  // Events
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}

export interface ToolRegistry {
  register(tool: ToolConfig, factory: () => ToolInstance): void;
  get(id: string): ToolInstance | null;
  list(): ToolConfig[];
}

export interface ToolMetadata {
  id: string;
  name: string;
  category: string;
  icon: string;
  version: string;
  status: ToolStatus;
}
