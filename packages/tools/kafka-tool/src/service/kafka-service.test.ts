import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KafkaAdminService } from '../../../tools/kafka-tool/src/service/admin-service';
import { KafkaProducerService } from '../../../tools/kafka-tool/src/service/producer-service';
import { Admin, Producer } from 'kafkajs';

/**
 * Integration tests for Kafka services
 * Uses mocked Kafka clients
 */
describe('KafkaAdminService', () => {
  let mockAdmin: any;
  let adminService: KafkaAdminService;

  beforeEach(() => {
    // Mock Admin client
    mockAdmin = {
      fetchTopicMetadata: vi.fn(),
      createTopics: vi.fn(),
      deleteTopics: vi.fn(),
      describeConfigs: vi.fn(),
      alterConfigs: vi.fn(),
      describeCluster: vi.fn(),
    };

    adminService = new KafkaAdminService(mockAdmin);
  });

  describe('listTopics', () => {
    it('should return list of topics from cluster', async () => {
      const mockMetadata = {
        topics: [
          {
            name: 'topic1',
            partitions: [
              { partition: 0, leader: 1, isr: [1], replicas: [1] },
              { partition: 1, leader: 2, isr: [2], replicas: [2] },
            ],
          },
          {
            name: 'topic2',
            partitions: [{ partition: 0, leader: 1, isr: [1], replicas: [1] }],
          },
        ],
      };

      mockAdmin.fetchTopicMetadata.mockResolvedValue(mockMetadata);

      const topics = await adminService.listTopics();

      expect(topics).toHaveLength(2);
      expect(topics[0].name).toBe('topic1');
      expect(topics[0].partitions).toBe(2);
      expect(topics[1].name).toBe('topic2');
    });

    it('should handle empty topic list', async () => {
      mockAdmin.fetchTopicMetadata.mockResolvedValue({ topics: [] });

      const topics = await adminService.listTopics();

      expect(topics).toHaveLength(0);
    });
  });

  describe('createTopic', () => {
    it('should create topic with specified partitions and replication factor', async () => {
      mockAdmin.createTopics.mockResolvedValue(undefined);

      await adminService.createTopic('new-topic', 3, 2);

      expect(mockAdmin.createTopics).toHaveBeenCalledWith({
        topics: [
          {
            topic: 'new-topic',
            numPartitions: 3,
            replicationFactor: 2,
          },
        ],
        validateOnly: false,
      });
    });

    it('should throw error on creation failure', async () => {
      mockAdmin.createTopics.mockRejectedValue(new Error('Topic already exists'));

      await expect(adminService.createTopic('existing-topic', 1, 1)).rejects.toThrow(
        'Failed to create topic'
      );
    });
  });

  describe('deleteTopic', () => {
    it('should delete specified topic', async () => {
      mockAdmin.deleteTopics.mockResolvedValue(undefined);

      await adminService.deleteTopic('topic-to-delete');

      expect(mockAdmin.deleteTopics).toHaveBeenCalledWith({
        topics: ['topic-to-delete'],
      });
    });

    it('should handle deletion errors', async () => {
      mockAdmin.deleteTopics.mockRejectedValue(new Error('Topic not found'));

      await expect(adminService.deleteTopic('nonexistent')).rejects.toThrow(
        'Failed to delete topic'
      );
    });
  });

  describe('getClusterInfo', () => {
    it('should return cluster broker information', async () => {
      const mockCluster = {
        brokers: [
          { nodeId: 1, host: 'kafka1', port: 9092 },
          { nodeId: 2, host: 'kafka2', port: 9092 },
        ],
        controller: 1,
      };

      mockAdmin.describeCluster.mockResolvedValue(mockCluster);

      const info = await adminService.getClusterInfo();

      expect(info.brokers).toHaveLength(2);
      expect(info.brokers[0].id).toBe(1);
      expect(info.controller).toBe(1);
    });
  });
});

describe('KafkaProducerService', () => {
  let mockProducer: any;
  let producerService: KafkaProducerService;

  beforeEach(() => {
    // Mock Producer client
    mockProducer = {
      send: vi.fn(),
    };

    producerService = new KafkaProducerService(mockProducer);
  });

  describe('sendMessage', () => {
    it('should send single message to topic', async () => {
      const mockResult = [
        {
          partition: 0,
          offset: '100',
          timestamp: '1234567890',
        },
      ];

      mockProducer.send.mockResolvedValue([mockResult]);

      const result = await producerService.sendMessage('test-topic', 'hello world');

      expect(result).toHaveLength(1);
      expect(result[0].partition).toBe(0);
      expect(result[0].offset).toBe('100');

      expect(mockProducer.send).toHaveBeenCalled();
      const callArgs = mockProducer.send.mock.calls[0][0];
      expect(callArgs.topic).toBe('test-topic');
    });

    it('should send message with key', async () => {
      mockProducer.send.mockResolvedValue([[{ partition: 0, offset: '1', timestamp: '123' }]]);

      await producerService.sendMessage('topic', 'value', 'key123');

      const callArgs = mockProducer.send.mock.calls[0][0];
      expect(callArgs.messages[0].key).toBe('key123');
    });

    it('should handle send errors', async () => {
      mockProducer.send.mockRejectedValue(new Error('Broker connection failed'));

      await expect(producerService.sendMessage('topic', 'data')).rejects.toThrow(
        'Failed to send message'
      );
    });
  });

  describe('sendBatch', () => {
    it('should send multiple messages in batch', async () => {
      const messages = [
        { value: 'msg1' },
        { value: 'msg2' },
        { value: 'msg3' },
      ];

      mockProducer.send.mockResolvedValue([[
        { partition: 0, offset: '1', timestamp: '123' },
        { partition: 0, offset: '2', timestamp: '124' },
        { partition: 0, offset: '3', timestamp: '125' },
      ]]);

      const result = await producerService.sendBatch('topic', messages);

      expect(result).toHaveLength(3);
      expect(mockProducer.send).toHaveBeenCalled();
    });
  });
});
