import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventSourceRegistry } from './event-source-registry';
import { EventSource } from '@devkit/shared';

// Mock EventSource implementation
class MockEventSource implements EventSource {
  async publish(topic: string, message: any): Promise<void> {
    console.log(`Published to ${topic}:`, message);
  }

  async subscribe(topic: string, handler: (message: any) => void): Promise<void> {
    console.log(`Subscribed to ${topic}`);
  }

  async unsubscribe(topic: string, handler: Function): Promise<void> {
    console.log(`Unsubscribed from ${topic}`);
  }
}

describe('EventSourceRegistry', () => {
  beforeEach(() => {
    // Reset registry before each test
    EventSourceRegistry.reset();
  });

  it('should start with no configured event source', () => {
    expect(EventSourceRegistry.isConfigured()).toBe(false);
  });

  it('should set and retrieve current event source', () => {
    const source = new MockEventSource();
    EventSourceRegistry.setCurrent(source);

    expect(EventSourceRegistry.isConfigured()).toBe(true);
    expect(EventSourceRegistry.getCurrent()).toBe(source);
  });

  it('should throw error when getting unset event source', () => {
    expect(() => EventSourceRegistry.getCurrent()).toThrow(
      'No event source configured'
    );
  });

  it('should replace existing event source', () => {
    const source1 = new MockEventSource();
    const source2 = new MockEventSource();

    EventSourceRegistry.setCurrent(source1);
    expect(EventSourceRegistry.getCurrent()).toBe(source1);

    EventSourceRegistry.setCurrent(source2);
    expect(EventSourceRegistry.getCurrent()).toBe(source2);
  });

  it('should reset event source', () => {
    const source = new MockEventSource();
    EventSourceRegistry.setCurrent(source);
    expect(EventSourceRegistry.isConfigured()).toBe(true);

    EventSourceRegistry.reset();
    expect(EventSourceRegistry.isConfigured()).toBe(false);
  });

  it('should work with EventSource interface', async () => {
    const source = new MockEventSource();
    EventSourceRegistry.setCurrent(source);

    const retrieved = EventSourceRegistry.getCurrent();

    // Verify it implements EventSource interface
    expect(typeof retrieved.publish).toBe('function');
    expect(typeof retrieved.subscribe).toBe('function');
    expect(typeof retrieved.unsubscribe).toBe('function');
  });
});
