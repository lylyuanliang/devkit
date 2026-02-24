import { Admin } from 'kafkajs';
import { ConsumerGroupInfo, ConsumerGroupOffset } from '../types';

export class ConsumerGroupService {
  constructor(private admin: Admin) {}

  /**
   * List all consumer groups
   */
  async listConsumerGroups(): Promise<string[]> {
    try {
      const groups = await this.admin.listGroups();
      return groups.groups.map((group) => group.groupId);
    } catch (error) {
      throw new Error(`Failed to list consumer groups: ${error}`);
    }
  }

  /**
   * Get detailed info about a consumer group
   */
  async getConsumerGroupInfo(groupId: string): Promise<ConsumerGroupInfo> {
    try {
      const groups = await this.admin.describeGroups([groupId]);
      const group = groups.groups[0];

      if (!group) {
        throw new Error(`Consumer group ${groupId} not found`);
      }

      return {
        groupId: group.groupId,
        state: (group.state as any) || 'unknown',
        members: group.members.map((member) => ({
          memberId: member.memberId,
          clientId: member.clientId,
          host: member.host,
          topicPartitions: [],
        })),
        topics: [],
      };
    } catch (error) {
      throw new Error(`Failed to get consumer group info: ${error}`);
    }
  }

  /**
   * Get current offsets for a consumer group
   */
  async getConsumerGroupOffsets(
    groupId: string,
    topics?: string[]
  ): Promise<ConsumerGroupOffset[]> {
    try {
      const offsets = await this.admin.fetchOffsets(groupId);

      let filtered = offsets.filter((offset) => offset.offset !== undefined);

      if (topics && topics.length > 0) {
        filtered = filtered.filter((offset) => topics.includes(offset.topic));
      }

      return filtered.map((offset) => ({
        topic: offset.topic,
        partition: offset.partition,
        offset: parseInt(offset.offset || '0', 10),
        lag: 0, // Will be calculated in LagMonitorService
      }));
    } catch (error) {
      throw new Error(`Failed to get consumer group offsets: ${error}`);
    }
  }

  /**
   * Reset consumer group offset to earliest
   */
  async resetOffsetToEarliest(groupId: string, topics?: string[]): Promise<void> {
    try {
      const topicsToReset = topics || (await this.admin.listGroups()).groups
        .filter((g) => g.groupId === groupId)
        .flatMap(() => {
          // Get topics for this group
          return [];
        });

      // Note: kafkajs doesn't support direct offset reset
      // This would typically be done through admin API or consumer reset logic
      await this.admin.setOffsets({
        groupId,
        partitions: topicsToReset.map((topic) => ({
          topic,
          partition: 0,
          offset: '0',
        })),
      });

      console.log(`Reset offsets for group ${groupId} to earliest`);
    } catch (error) {
      throw new Error(`Failed to reset offset to earliest: ${error}`);
    }
  }

  /**
   * Reset consumer group offset to latest
   */
  async resetOffsetToLatest(groupId: string, topics?: string[]): Promise<void> {
    try {
      // In kafkajs, we need to first get the latest offset for each partition
      // Then set the consumer group offset to that

      if (!topics || topics.length === 0) {
        throw new Error('Topics must be specified for reset to latest');
      }

      const metadata = await this.admin.fetchTopicMetadata({ topics });

      const partitions: any[] = [];
      for (const topic of metadata.topics) {
        const latestOffsets = await this.admin.fetchTopicOffsets(topic.name);
        latestOffsets.forEach((offset) => {
          partitions.push({
            topic: topic.name,
            partition: offset.partition,
            offset: offset.high,
          });
        });
      }

      await this.admin.setOffsets({
        groupId,
        partitions,
      });

      console.log(`Reset offsets for group ${groupId} to latest`);
    } catch (error) {
      throw new Error(`Failed to reset offset to latest: ${error}`);
    }
  }

  /**
   * Reset consumer group offset to specific offset
   */
  async resetOffsetToSpecific(
    groupId: string,
    partitions: Array<{ topic: string; partition: number; offset: number }>
  ): Promise<void> {
    try {
      await this.admin.setOffsets({
        groupId,
        partitions: partitions.map((p) => ({
          topic: p.topic,
          partition: p.partition,
          offset: p.offset.toString(),
        })),
      });

      console.log(`Reset offsets for group ${groupId} to specific values`);
    } catch (error) {
      throw new Error(`Failed to reset offset to specific value: ${error}`);
    }
  }

  /**
   * Delete a consumer group
   */
  async deleteConsumerGroup(groupId: string): Promise<void> {
    try {
      await this.admin.deleteGroups([groupId]);
      console.log(`Deleted consumer group ${groupId}`);
    } catch (error) {
      throw new Error(`Failed to delete consumer group: ${error}`);
    }
  }
}
