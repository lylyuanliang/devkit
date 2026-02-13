import { EventEmitter } from 'events';

export class EventBus {
  private emitter: EventEmitter;
  private static instance: EventBus;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emit(eventName: string, data?: any): void {
    this.emitter.emit(eventName, data);
  }

  on(eventName: string, handler: (data: any) => void): void {
    this.emitter.on(eventName, handler);
  }

  off(eventName: string, handler: (data: any) => void): void {
    this.emitter.off(eventName, handler);
  }

  once(eventName: string, handler: (data: any) => void): void {
    this.emitter.once(eventName, handler);
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.emitter.removeAllListeners(eventName);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

// Standard core events
export const CORE_EVENTS = {
  TOOL_LOADED: 'tool:loaded',
  TOOL_UNLOADED: 'tool:unloaded',
  CONFIG_CHANGED: 'config:changed',
  APP_SHUTDOWN: 'app:shutdown',
  TOOL_STATUS_CHANGED: 'tool:status-changed',
} as const;
