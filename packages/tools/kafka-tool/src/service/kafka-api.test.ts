import { KafkaAPI } from './kafka-api';
import { KafkaMessage } from '../types';

// @ts-ignore - jest is not strictly typed in this environment
// Mock kafkajs
jest.mock('kafkajs', () => ({
  Kafka: jest.fn(() => ({
    admin: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      fetchTopicMetadata: jest.fn(),
    })),
    producer: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(() => Promise.resolve([[{ partition: 0, offset: '1', timestamp: '1234567890' }]])),
    })),
    consumer: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(() => Promise.resolve()),
      stop: jest.fn(),
    })),
  })),
}));

// @ts-ignore - jest is not strictly typed
describe('KafkaAPI', () => {
  const clusterId = 'test-cluster';
  const brokers = ['localhost:9092'];

  // @ts-ignore - jest is not strictly typed
  beforeEach(() => {
    localStorage.clear();
    // Clear cluster connections before each test
    // @ts-ignore - jest is not strictly typed
    jest.clearAllMocks();
  });

  // ==================== Cluster Connection Tests ====================
  // @ts-ignore - jest is not strictly typed
  describe('Cluster Connection', () => {
    // @ts-ignore - jest is not strictly typed
    it('should connect to a cluster', async () => {
      await expect(KafkaAPI.connectCluster(clusterId, brokers)).resolves.not.toThrow();
    });

    // @ts-ignore - jest is not strictly typed
    it('should throw error when connecting to invalid broker', async () => {
      const { Kafka } = require('kafkajs');
      // @ts-ignore - jest is not strictly typed
      Kafka.mockImplementationOnce(() => ({
        admin: jest.fn(() => ({
          connect: jest.fn(() => Promise.reject(new Error('Connection failed'))),
          disconnect: jest.fn(),
          fetchTopicMetadata: jest.fn(),
        })),
      }));

      await expect(KafkaAPI.connectCluster('invalid-cluster', ['invalid:9999'])).rejects.toThrow('Failed to connect to cluster');
    });

    // @ts-ignore - jest is not strictly typed
    it('should disconnect from a cluster', async () => {
      await KafkaAPI.connectCluster(clusterId, brokers);
      await expect(KafkaAPI.disconnectCluster(clusterId)).resolves.not.toThrow();
    });

    // @ts-ignore - jest is not strictly typed
    it('should handle disconnecting from non-existent cluster gracefully', async () => {
      await expect(KafkaAPI.disconnectCluster('non-existent')).resolves.not.toThrow();
    });
  });

  // ==================== Produce Message Tests ====================
  // @ts-ignore - jest is not strictly typed
  describe('produceMessage', () => {
    // @ts-ignore - jest is not strictly typed
    beforeEach(async () => {
      await KafkaAPI.connectCluster(clusterId, brokers);
    });

    // @ts-ignore - jest is not strictly typed
    it('should produce a message successfully', async () => {
      const result = await KafkaAPI.produceMessage(clusterId, {
        topic: 'test-topic',
        value: 'test message',
      });

      expect(result).toHaveProperty('partition');
      expect(result).toHaveProperty('offset');
      expect(result).toHaveProperty('timestamp');
    });

    // @ts-ignore - jest is not strictly typed
    it('should reject message without topic', async () => {
      try {
        await KafkaAPI.produceMessage(clusterId, {
          topic: '',
          value: 'test message',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Topic and value are required');
      }
    });

    // @ts-ignore - jest is not strictly typed
    it('should reject message without value', async () => {
      try {
        await KafkaAPI.produceMessage(clusterId, {
          topic: 'test-topic',
          value: '',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Topic and value are required');
      }
    });

    // @ts-ignore - jest is not strictly typed
    it('should support optional key and partition', async () => {
      const result = await KafkaAPI.produceMessage(clusterId, {
        topic: 'test-topic',
        value: 'test message',
        key: 'test-key',
        partition: 1,
      });

      expect(result).toBeDefined();
    });

    // @ts-ignore - jest is not strictly typed
    it('should throw error when cluster not connected', async () => {
      try {
        await KafkaAPI.produceMessage('non-existent', {
          topic: 'test-topic',
          value: 'test message',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Not connected to cluster');
      }
    });
  });

  // ==================== Consume Messages Tests ====================
  // @ts-ignore - jest is not strictly typed
  describe('consumeMessages', () => {
    // @ts-ignore - jest is not strictly typed
    beforeEach(async () => {
      await KafkaAPI.connectCluster(clusterId, brokers);
    });

    // @ts-ignore - jest is not strictly typed
    it('should consume messages from topic', async () => {
      const result = await KafkaAPI.consumeMessages(clusterId, {
        topic: 'test-topic',
      });

      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.totalMessages).toBeGreaterThanOrEqual(0);
    });

    // @ts-ignore - jest is not strictly typed
    it('should reject request without topic', async () => {
      try {
        await KafkaAPI.consumeMessages(clusterId, {
          topic: '',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Topic is required');
      }
    });

    // @ts-ignore - jest is not strictly typed
    it('should support fromBeginning option', async () => {
      const result = await KafkaAPI.consumeMessages(clusterId, {
        topic: 'test-topic',
        fromBeginning: true,
      });

      expect(result.messages).toBeDefined();
    });

    // @ts-ignore - jest is not strictly typed
    it('should throw error when cluster not connected', async () => {
      try {
        await KafkaAPI.consumeMessages('non-existent', {
          topic: 'test-topic',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Not connected to cluster');
      }
    });
  });

  // ==================== Message Search Tests ====================
  describe('searchMessages', () => {
    const mockMessages: KafkaMessage[] = [
      {
        partition: 0,
        offset: 100,
        timestamp: Date.now(),
        key: 'user-123',
        value: JSON.stringify({ userId: 123, action: 'login' }),
        size: 50,
      },
      {
        partition: 0,
        offset: 101,
        timestamp: Date.now(),
        key: 'user-456',
        value: JSON.stringify({ userId: 456, action: 'logout' }),
        size: 52,
      },
      {
        partition: 1,
        offset: 50,
        timestamp: Date.now(),
        key: 'system',
        value: 'Application started',
        size: 35,
      },
    ];

    it('should search by key', () => {
      const results = KafkaAPI.searchMessages({
        messages: mockMessages,
        keyFilter: 'user',
      });

      expect(results.length).toBe(2);
      expect(results.every(msg => msg.key?.includes('user'))).toBe(true);
    });

    it('should search by content', () => {
      const results = KafkaAPI.searchMessages({
        messages: mockMessages,
        contentFilter: 'login',
      });

      expect(results.length).toBe(1);
      expect(results[0].key).toBe('user-123');
    });

    it('should search by both key and content', () => {
      const results = KafkaAPI.searchMessages({
        messages: mockMessages,
        keyFilter: 'user',
        contentFilter: 'logout',
      });

      expect(results.length).toBe(1);
      expect(results[0].key).toBe('user-456');
    });

    it('should be case-insensitive', () => {
      const results = KafkaAPI.searchMessages({
        messages: mockMessages,
        contentFilter: 'LOGIN',
      });

      expect(results.length).toBe(1);
    });

    it('should return all messages when no filter', () => {
      const results = KafkaAPI.searchMessages({
        messages: mockMessages,
      });

      expect(results.length).toBe(mockMessages.length);
    });
  });

  // ==================== JSON Validation Tests ====================
  describe('isValidJSON', () => {
    it('should validate valid JSON', () => {
      const validJSON = JSON.stringify({ test: 'data' });
      expect(KafkaAPI.isValidJSON(validJSON)).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(KafkaAPI.isValidJSON('{invalid json}')).toBe(false);
      expect(KafkaAPI.isValidJSON('not json at all')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(KafkaAPI.isValidJSON('')).toBe(false);
    });
  });

  // ==================== JSON Formatting Tests ====================
  describe('formatJSON', () => {
    it('should format valid JSON with indentation', () => {
      const input = '{"key":"value","nested":{"a":1}}';
      const result = KafkaAPI.formatJSON(input);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
      expect(result.includes('key')).toBe(true);
    });

    it('should return original string for invalid JSON', () => {
      const input = 'not valid json';
      const result = KafkaAPI.formatJSON(input);

      expect(result).toBe(input);
    });
  });

  // ==================== Consumption State Tests ====================
  describe('Consumption State', () => {
    it('should save consumption state', () => {
      KafkaAPI.saveConsumptionState('test-topic', 0, 100);

      const state = localStorage.getItem('kafka-consume-state-test-topic-0');
      expect(state).toBeDefined();

      const parsed = JSON.parse(state!);
      expect(parsed.offset).toBe(100);
      expect(parsed.timestamp).toBeDefined();
    });

    it('should load consumption state', () => {
      KafkaAPI.saveConsumptionState('test-topic', 0, 100);
      const state = KafkaAPI.loadConsumptionState('test-topic', 0);

      expect(state).not.toBeNull();
      expect(state?.offset).toBe(100);
    });

    it('should return null for non-existent state', () => {
      const state = KafkaAPI.loadConsumptionState('non-existent', 0);

      expect(state).toBeNull();
    });

    it('should clear consumption state', () => {
      KafkaAPI.saveConsumptionState('test-topic', 0, 100);
      KafkaAPI.clearConsumptionState('test-topic', 0);

      const state = KafkaAPI.loadConsumptionState('test-topic', 0);
      expect(state).toBeNull();
    });
  });
});
