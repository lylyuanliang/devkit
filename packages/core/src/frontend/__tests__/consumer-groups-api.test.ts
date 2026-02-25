import { apiClient } from '../api/client';
import { ConsumerGroup, ConsumerGroupDetails, PartitionOffset, ResetOffsetsRequest } from '../../types/consumer-groups';

// Mock Tauri invoke
const mockInvoke = jest.fn();

Object.defineProperty(window, '__TAURI__', {
  value: {
    invoke: mockInvoke,
  },
  writable: true,
});

describe('Consumer Groups API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvoke.mockClear();
  });

  describe('listConsumerGroups', () => {
    it('should fetch consumer groups for a cluster', async () => {
      const clusterId = 'test-cluster';
      const mockGroups: ConsumerGroup[] = [
        {
          group_id: 'group-1',
          state: 'Stable',
          protocol_type: 'consumer',
          members_count: 2,
          total_lag: 100,
        },
        {
          group_id: 'group-2',
          state: 'Dead',
          protocol_type: 'consumer',
          members_count: 0,
          total_lag: 0,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockGroups);

      const result = await apiClient.listConsumerGroups(clusterId);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_list_consumer_groups', {
        cluster_id: clusterId,
      });
      expect(result).toEqual(mockGroups);
      expect(result).toHaveLength(2);
      expect(result[0].group_id).toBe('group-1');
    });

    it('should return empty array when Tauri is not available', async () => {
      const originalTauri = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      const result = await apiClient.listConsumerGroups('test-cluster');

      expect(result).toEqual([]);

      (window as any).__TAURI__ = originalTauri;
    });

    it('should handle API errors', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(apiClient.listConsumerGroups('test-cluster')).rejects.toThrow(
        'Connection failed'
      );
    });
  });

  describe('getConsumerGroupDetails', () => {
    it('should fetch consumer group details', async () => {
      const clusterId = 'test-cluster';
      const groupId = 'test-group';
      const mockDetails: ConsumerGroupDetails = {
        group_id: groupId,
        state: 'Stable',
        protocol_type: 'consumer',
        members: [
          {
            member_id: 'member-1',
            client_id: 'client-1',
            host: '192.168.1.1',
          },
        ],
        topics: ['topic-1', 'topic-2'],
      };

      mockInvoke.mockResolvedValueOnce(mockDetails);

      const result = await apiClient.getConsumerGroupDetails(clusterId, groupId);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_get_consumer_group_details', {
        cluster_id: clusterId,
        group_id: groupId,
      });
      expect(result).toEqual(mockDetails);
      expect(result.members).toHaveLength(1);
      expect(result.topics).toHaveLength(2);
    });

    it('should throw error when Tauri is not available', async () => {
      const originalTauri = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      await expect(
        apiClient.getConsumerGroupDetails('test-cluster', 'test-group')
      ).rejects.toThrow('Tauri not available');

      (window as any).__TAURI__ = originalTauri;
    });
  });

  describe('getConsumerGroupLag', () => {
    it('should fetch consumer group lag data', async () => {
      const clusterId = 'test-cluster';
      const groupId = 'test-group';
      const mockLag: PartitionOffset[] = [
        {
          topic: 'topic-1',
          partition: 0,
          current_offset: 100,
          log_end_offset: 150,
          lag: 50,
        },
        {
          topic: 'topic-1',
          partition: 1,
          current_offset: 200,
          log_end_offset: 250,
          lag: 50,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockLag);

      const result = await apiClient.getConsumerGroupLag(clusterId, groupId);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_get_consumer_group_lag', {
        cluster_id: clusterId,
        group_id: groupId,
      });
      expect(result).toEqual(mockLag);
      expect(result).toHaveLength(2);
      expect(result[0].lag).toBe(50);
    });

    it('should return empty array when Tauri is not available', async () => {
      const originalTauri = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      const result = await apiClient.getConsumerGroupLag('test-cluster', 'test-group');

      expect(result).toEqual([]);

      (window as any).__TAURI__ = originalTauri;
    });
  });

  describe('deleteConsumerGroup', () => {
    it('should delete a consumer group', async () => {
      const clusterId = 'test-cluster';
      const groupId = 'test-group';

      mockInvoke.mockResolvedValueOnce(undefined);

      await apiClient.deleteConsumerGroup(clusterId, groupId);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_delete_consumer_group', {
        cluster_id: clusterId,
        group_id: groupId,
      });
    });

    it('should handle deletion errors', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Group is active'));

      await expect(
        apiClient.deleteConsumerGroup('test-cluster', 'test-group')
      ).rejects.toThrow('Group is active');
    });

    it('should resolve when Tauri is not available', async () => {
      const originalTauri = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      await expect(
        apiClient.deleteConsumerGroup('test-cluster', 'test-group')
      ).resolves.toBeUndefined();

      (window as any).__TAURI__ = originalTauri;
    });
  });

  describe('resetConsumerGroupOffsets', () => {
    it('should reset offsets to beginning', async () => {
      const clusterId = 'test-cluster';
      const request: ResetOffsetsRequest = {
        group_id: 'test-group',
        strategy: 'beginning',
      };
      const mockResult: PartitionOffset[] = [
        {
          topic: 'topic-1',
          partition: 0,
          current_offset: 0,
          log_end_offset: 150,
          lag: 150,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockResult);

      const result = await apiClient.resetConsumerGroupOffsets(clusterId, request);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_reset_consumer_group_offsets', {
        cluster_id: clusterId,
        request,
      });
      expect(result).toEqual(mockResult);
      expect(result[0].current_offset).toBe(0);
    });

    it('should reset offsets to end', async () => {
      const clusterId = 'test-cluster';
      const request: ResetOffsetsRequest = {
        group_id: 'test-group',
        strategy: 'end',
      };
      const mockResult: PartitionOffset[] = [
        {
          topic: 'topic-1',
          partition: 0,
          current_offset: 150,
          log_end_offset: 150,
          lag: 0,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockResult);

      const result = await apiClient.resetConsumerGroupOffsets(clusterId, request);

      expect(result[0].lag).toBe(0);
    });

    it('should reset offsets to timestamp', async () => {
      const clusterId = 'test-cluster';
      const timestamp = Date.now();
      const request: ResetOffsetsRequest = {
        group_id: 'test-group',
        strategy: 'timestamp',
        timestamp,
      };
      const mockResult: PartitionOffset[] = [
        {
          topic: 'topic-1',
          partition: 0,
          current_offset: 75,
          log_end_offset: 150,
          lag: 75,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockResult);

      const result = await apiClient.resetConsumerGroupOffsets(clusterId, request);

      expect(mockInvoke).toHaveBeenCalledWith('kafka_reset_consumer_group_offsets', {
        cluster_id: clusterId,
        request: expect.objectContaining({ timestamp }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should return empty array when Tauri is not available', async () => {
      const originalTauri = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      const result = await apiClient.resetConsumerGroupOffsets('test-cluster', {
        group_id: 'test-group',
        strategy: 'beginning',
      });

      expect(result).toEqual([]);

      (window as any).__TAURI__ = originalTauri;
    });
  });
});
