import { ConsumerGroupService } from '../consumer-group-service';
import { isSystemTopic } from '../../utils/kafka-utils';

// Mock KafkaJS Admin client
const mockAdmin = {
  listGroups: jest.fn(),
  describeGroups: jest.fn(),
  fetchOffsets: jest.fn(),
  fetchTopicMetadata: jest.fn(),
  fetchTopicOffsets: jest.fn(),
  setOffsets: jest.fn(),
  deleteGroups: jest.fn(),
};

describe('ConsumerGroupService', () => {
  let service: ConsumerGroupService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsumerGroupService(mockAdmin as any);
  });

  describe('listConsumerGroups', () => {
    it('should filter out system consumer groups', async () => {
      mockAdmin.listGroups.mockResolvedValue({
        groups: [
          { groupId: 'my-group' },
          { groupId: '__consumer_offsets' },
          { groupId: 'another-group' },
          { groupId: '__transaction_state' },
        ],
      });

      const result = await service.listConsumerGroups();

      expect(result).toEqual(['my-group', 'another-group']);
      expect(result).not.toContain('__consumer_offsets');
      expect(result).not.toContain('__transaction_state');
    });

    it('should throw error with specific message on authorization failure', async () => {
      mockAdmin.listGroups.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.listConsumerGroups()).rejects.toThrow(
        'Permission denied: You do not have permission to list consumer groups'
      );
    });

    it('should throw error with specific message on coordinator unavailable', async () => {
      mockAdmin.listGroups.mockRejectedValue(new Error('GROUP_COORDINATOR_NOT_AVAILABLE'));

      await expect(service.listConsumerGroups()).rejects.toThrow(
        'Kafka broker is not available. Please check your connection.'
      );
    });
  });

  describe('getConsumerGroupInfo', () => {
    it('should parse member metadata and extract partition assignments', async () => {
      mockAdmin.describeGroups.mockResolvedValue({
        groups: [
          {
            groupId: 'test-group',
            state: 'stable',
            members: [
              {
                memberId: 'member-1',
                clientId: 'client-1',
                host: 'localhost',
                memberMetadata: {
                  topics: ['topic-1', 'topic-2'],
                  partitions: [0, 1],
                },
              },
            ],
          },
        ],
      });

      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'topic-1', partition: 0, offset: '100' },
        { topic: 'topic-2', partition: 1, offset: '200' },
      ]);

      const result = await service.getConsumerGroupInfo('test-group');

      expect(result.groupId).toBe('test-group');
      expect(result.state).toBe('stable');
      expect(result.members).toHaveLength(1);
      expect(result.members[0].topicPartitions).toEqual([
        { topic: 'topic-1', partition: 0 },
        { topic: 'topic-1', partition: 1 },
        { topic: 'topic-2', partition: 0 },
        { topic: 'topic-2', partition: 1 },
      ]);
    });

    it('should filter out system topics from topics list', async () => {
      mockAdmin.describeGroups.mockResolvedValue({
        groups: [
          {
            groupId: 'test-group',
            state: 'stable',
            members: [],
          },
        ],
      });

      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'user-topic', partition: 0, offset: '100' },
        { topic: '__consumer_offsets', partition: 0, offset: '200' },
        { topic: 'another-topic', partition: 0, offset: '300' },
      ]);

      const result = await service.getConsumerGroupInfo('test-group');

      expect(result.topics).toEqual(['user-topic', 'another-topic']);
      expect(result.topics).not.toContain('__consumer_offsets');
    });

    it('should handle metadata parsing errors gracefully', async () => {
      mockAdmin.describeGroups.mockResolvedValue({
        groups: [
          {
            groupId: 'test-group',
            state: 'stable',
            members: [
              {
                memberId: 'member-1',
                clientId: 'client-1',
                host: 'localhost',
                memberMetadata: null,
              },
            ],
          },
        ],
      });

      mockAdmin.fetchOffsets.mockResolvedValue([]);

      const result = await service.getConsumerGroupInfo('test-group');

      expect(result.members[0].topicPartitions).toEqual([]);
    });
  });

  describe('resetOffsetToEarliest', () => {
    it('should fetch topics from consumer group when not provided', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'topic-1', partition: 0, offset: '100' },
        { topic: 'topic-1', partition: 1, offset: '200' },
      ]);

      mockAdmin.fetchTopicMetadata.mockResolvedValue({
        topics: [
          {
            name: 'topic-1',
            partitions: [
              { partitionId: 0 },
              { partitionId: 1 },
            ],
          },
        ],
      });

      mockAdmin.setOffsets.mockResolvedValue(undefined);

      await service.resetOffsetToEarliest('test-group');

      expect(mockAdmin.fetchOffsets).toHaveBeenCalledWith('test-group');
      expect(mockAdmin.setOffsets).toHaveBeenCalled();
    });

    it('should filter out system topics before resetting', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'user-topic', partition: 0, offset: '100' },
        { topic: '__consumer_offsets', partition: 0, offset: '200' },
      ]);

      mockAdmin.fetchTopicMetadata.mockResolvedValue({
        topics: [
          {
            name: 'user-topic',
            partitions: [{ partitionId: 0 }],
          },
        ],
      });

      mockAdmin.setOffsets.mockResolvedValue(undefined);

      await service.resetOffsetToEarliest('test-group');

      const setOffsetsCall = mockAdmin.setOffsets.mock.calls[0][0];
      expect(setOffsetsCall.partitions.every((p: any) => !isSystemTopic(p.topic))).toBe(true);
    });

    it('should throw error when no user topics exist', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: '__consumer_offsets', partition: 0, offset: '100' },
      ]);

      await expect(service.resetOffsetToEarliest('test-group')).rejects.toThrow(
        'No user topics found for consumer group'
      );
    });

    it('should throw specific error on authorization failure', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'topic-1', partition: 0, offset: '100' },
      ]);

      mockAdmin.fetchTopicMetadata.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.resetOffsetToEarliest('test-group')).rejects.toThrow(
        'Permission denied'
      );
    });
  });

  describe('resetOffsetToLatest', () => {
    it('should filter out system topics before resetting', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'user-topic', partition: 0, offset: '100' },
        { topic: '__consumer_offsets', partition: 0, offset: '200' },
      ]);

      mockAdmin.fetchTopicMetadata.mockResolvedValue({
        topics: [
          {
            name: 'user-topic',
            partitions: [{ partitionId: 0 }],
          },
        ],
      });

      mockAdmin.fetchTopicOffsets.mockResolvedValue([
        { partition: 0, high: '500' },
      ]);

      mockAdmin.setOffsets.mockResolvedValue(undefined);

      await service.resetOffsetToLatest('test-group');

      const setOffsetsCall = mockAdmin.setOffsets.mock.calls[0][0];
      expect(setOffsetsCall.partitions.every((p: any) => !isSystemTopic(p.topic))).toBe(true);
    });
  });

  describe('deleteConsumerGroup', () => {
    it('should delete consumer group successfully', async () => {
      mockAdmin.deleteGroups.mockResolvedValue(undefined);

      await service.deleteConsumerGroup('test-group');

      expect(mockAdmin.deleteGroups).toHaveBeenCalledWith(['test-group']);
    });

    it('should throw error on authorization failure', async () => {
      mockAdmin.deleteGroups.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.deleteConsumerGroup('test-group')).rejects.toThrow(
        'Permission denied: You do not have permission to delete consumer group test-group'
      );
    });

    it('should throw error when group is active', async () => {
      mockAdmin.deleteGroups.mockRejectedValue(new Error('ILLEGAL_GENERATION'));

      await expect(service.deleteConsumerGroup('test-group')).rejects.toThrow(
        'Cannot delete consumer group: The group is currently active'
      );
    });

    it('should throw error on coordinator unavailable', async () => {
      mockAdmin.deleteGroups.mockRejectedValue(new Error('GROUP_COORDINATOR_NOT_AVAILABLE'));

      await expect(service.deleteConsumerGroup('test-group')).rejects.toThrow(
        'Kafka broker is not available. Please check your connection.'
      );
    });
  });

  describe('Complete Consumer Group Management Workflow', () => {
    it('should complete full workflow: list -> get details -> reset -> delete', async () => {
      // Step 1: List consumer groups
      mockAdmin.listGroups.mockResolvedValue({
        groups: [
          { groupId: 'workflow-group' },
          { groupId: '__consumer_offsets' },
        ],
      });

      const groups = await service.listConsumerGroups();
      expect(groups).toEqual(['workflow-group']);

      // Step 2: Get consumer group details
      mockAdmin.describeGroups.mockResolvedValue({
        groups: [
          {
            groupId: 'workflow-group',
            state: 'stable',
            members: [
              {
                memberId: 'member-1',
                clientId: 'client-1',
                host: 'localhost',
                memberMetadata: {
                  topics: ['test-topic'],
                  partitions: [0],
                },
              },
            ],
          },
        ],
      });

      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'test-topic', partition: 0, offset: '100' },
      ]);

      const groupInfo = await service.getConsumerGroupInfo('workflow-group');
      expect(groupInfo.groupId).toBe('workflow-group');
      expect(groupInfo.state).toBe('stable');
      expect(groupInfo.members).toHaveLength(1);

      // Step 3: Reset offsets to earliest
      mockAdmin.fetchTopicMetadata.mockResolvedValue({
        topics: [
          {
            name: 'test-topic',
            partitions: [{ partitionId: 0 }],
          },
        ],
      });

      mockAdmin.setOffsets.mockResolvedValue(undefined);

      await service.resetOffsetToEarliest('workflow-group');
      expect(mockAdmin.setOffsets).toHaveBeenCalled();

      // Step 4: Delete consumer group
      mockAdmin.deleteGroups.mockResolvedValue(undefined);

      await service.deleteConsumerGroup('workflow-group');
      expect(mockAdmin.deleteGroups).toHaveBeenCalledWith(['workflow-group']);
    });
  });

  describe('Connection and Permission Error Handling', () => {
    it('should handle connection failure in listConsumerGroups', async () => {
      mockAdmin.listGroups.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.listConsumerGroups()).rejects.toThrow(
        'Failed to list consumer groups'
      );
    });

    it('should handle connection failure in getConsumerGroupInfo', async () => {
      mockAdmin.describeGroups.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.getConsumerGroupInfo('test-group')).rejects.toThrow(
        'Failed to get consumer group info'
      );
    });

    it('should handle permission error in resetOffsetToEarliest', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'test-topic', partition: 0, offset: '100' },
      ]);

      mockAdmin.fetchTopicMetadata.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.resetOffsetToEarliest('test-group')).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should handle permission error in resetOffsetToLatest', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'test-topic', partition: 0, offset: '100' },
      ]);

      mockAdmin.fetchTopicMetadata.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.resetOffsetToLatest('test-group')).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should handle permission error in resetOffsetToSpecific', async () => {
      mockAdmin.fetchOffsets.mockResolvedValue([
        { topic: 'test-topic', partition: 0, offset: '100' },
      ]);

      mockAdmin.fetchTopicMetadata.mockRejectedValue(new Error('AUTHORIZATION_FAILED'));

      await expect(service.resetOffsetToSpecific('test-group', 50)).rejects.toThrow(
        'Permission denied'
      );
    });
  });
});
