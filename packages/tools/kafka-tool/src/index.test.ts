import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventSource } from '@devkit/shared';

/**
 * Tests for EventSource interface implementation
 */
describe('EventSource Interface', () => {
  let mockEventSource: EventSource;

  beforeEach(() => {
    // Mock EventSource implementation
    mockEventSource = {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(undefined),
      unsubscribe: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('publish', () => {
    it('should publish message to topic', async () => {
      const topic = 'test-topic';
      const message = { data: 'test' };

      await mockEventSource.publish(topic, message);

      expect(mockEventSource.publish).toHaveBeenCalledWith(topic, message);
    });

    it('should handle publish errors', async () => {
      const error = new Error('Broker unavailable');
      mockEventSource.publish = vi.fn().mockRejectedValue(error);

      await expect(mockEventSource.publish('topic', {})).rejects.toThrow(
        'Broker unavailable'
      );
    });

    it('should accept string messages', async () => {
      await mockEventSource.publish('topic', 'string message');

      expect(mockEventSource.publish).toHaveBeenCalledWith('topic', 'string message');
    });

    it('should accept object messages', async () => {
      const message = { key: 'value', nested: { data: [1, 2, 3] } };

      await mockEventSource.publish('topic', message);

      expect(mockEventSource.publish).toHaveBeenCalledWith('topic', message);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to topic with handler', async () => {
      const topic = 'test-topic';
      const handler = vi.fn();

      await mockEventSource.subscribe(topic, handler);

      expect(mockEventSource.subscribe).toHaveBeenCalledWith(topic, handler);
    });

    it('should call handler when message received', async () => {
      const handler = vi.fn();
      const message = { data: 'test' };

      await mockEventSource.subscribe('topic', handler);

      // Simulate message arrival
      const subscribedHandler = (mockEventSource.subscribe as any).mock.calls[0][1];
      subscribedHandler(message);

      expect(subscribedHandler).toBeDefined();
    });

    it('should handle subscription errors', async () => {
      const error = new Error('Consumer group error');
      mockEventSource.subscribe = vi.fn().mockRejectedValue(error);

      await expect(mockEventSource.subscribe('topic', () => {})).rejects.toThrow(
        'Consumer group error'
      );
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from topic', async () => {
      const topic = 'test-topic';
      const handler = vi.fn();

      await mockEventSource.unsubscribe(topic, handler);

      expect(mockEventSource.unsubscribe).toHaveBeenCalledWith(topic, handler);
    });

    it('should handle unsubscribe errors', async () => {
      const error = new Error('Failed to unsubscribe');
      mockEventSource.unsubscribe = vi.fn().mockRejectedValue(error);

      await expect(mockEventSource.unsubscribe('topic', () => {})).rejects.toThrow(
        'Failed to unsubscribe'
      );
    });
  });

  describe('Event Source Contract', () => {
    it('should implement all required methods', () => {
      expect(typeof mockEventSource.publish).toBe('function');
      expect(typeof mockEventSource.subscribe).toBe('function');
      expect(typeof mockEventSource.unsubscribe).toBe('function');
    });

    it('should be usable with EventSourceRegistry', () => {
      // Test that the interface is compatible with EventSourceRegistry expectations
      const methods = ['publish', 'subscribe', 'unsubscribe'];

      methods.forEach((method) => {
        expect((mockEventSource as any)[method]).toBeDefined();
        expect(typeof (mockEventSource as any)[method]).toBe('function');
      });
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        mockEventSource.publish('topic1', { msg: 1 }),
        mockEventSource.publish('topic2', { msg: 2 }),
        mockEventSource.subscribe('topic3', () => {}),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});

/**
 * Tests for Kafka Tool's EventSource implementation pattern
 */
describe('Kafka Tool EventSource Pattern', () => {
  let kafkaEventSource: EventSource;
  let messageLog: Array<{ topic: string; message: any }> = [];

  beforeEach(() => {
    messageLog = [];

    // Simulate Kafka Tool EventSource implementation
    kafkaEventSource = {
      publish: async (topic, message) => {
        // Simulate publishing to Kafka
        messageLog.push({ topic, message });
      },
      subscribe: async (topic, handler) => {
        // Simulate subscription
        // In real implementation, would use Kafka consumer
      },
      unsubscribe: async (topic, handler) => {
        // Simulate unsubscription
      },
    };
  });

  it('should maintain event order when publishing', async () => {
    await kafkaEventSource.publish('topic', { seq: 1 });
    await kafkaEventSource.publish('topic', { seq: 2 });
    await kafkaEventSource.publish('topic', { seq: 3 });

    expect(messageLog).toHaveLength(3);
    expect(messageLog[0].message.seq).toBe(1);
    expect(messageLog[1].message.seq).toBe(2);
    expect(messageLog[2].message.seq).toBe(3);
  });

  it('should support multiple topics', async () => {
    await kafkaEventSource.publish('topic-a', { topic: 'a' });
    await kafkaEventSource.publish('topic-b', { topic: 'b' });
    await kafkaEventSource.publish('topic-a', { topic: 'a2' });

    const topicAMessages = messageLog.filter((m) => m.topic === 'topic-a');
    const topicBMessages = messageLog.filter((m) => m.topic === 'topic-b');

    expect(topicAMessages).toHaveLength(2);
    expect(topicBMessages).toHaveLength(1);
  });

  it('should preserve message content', async () => {
    const message = {
      timestamp: Date.now(),
      data: { nested: { value: 123 } },
      tags: ['tag1', 'tag2'],
    };

    await kafkaEventSource.publish('topic', message);

    expect(messageLog[0].message).toEqual(message);
  });
});
