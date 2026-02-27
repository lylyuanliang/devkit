import { Admin } from 'kafkajs';
import { ConsumerGroupInfo, ConsumerGroupOffset } from '../types';
import { isSystemTopic } from '../utils/kafka-utils';

export class ConsumerGroupService {
  constructor(private admin: Admin) {}

  /**
   * List all consumer groups
   * Filters out system consumer groups if applicable
   */
  async listConsumerGroups(): Promise<string[]> {
    try {
      const groups = await this.admin.listGroups();
      // Filter out system consumer groups (those starting with __)
      return groups.groups
        .map((group) => group.groupId)
        .filter((groupId) => !isSystemTopic(groupId));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('AUTHORIZATION_FAILED')) {
          throw new Error(
            'Permission denied: You do not have permission to list consumer groups'
          );
        }
        if (error.message.includes('GROUP_COORDINATOR_NOT_AVAILABLE')) {
          throw new Error('Kafka broker is not available. Please check your connection.');
        }
      }
      throw new Error(`Failed to list consumer groups: ${error}`);
    }
  }

  /**
   * Get detailed info about a consumer group
   * Parses member protocol metadata to extract partition assignments
   */
  async getConsumerGroupInfo(groupId: string): Promise<ConsumerGroupInfo> {
    try {
      const groups = await this.admin.describeGroups([groupId]);
      const group = groups.groups[0];

      if (!group) {
        throw new Error(`Consumer group ${groupId} not found`);
      }

      // Parse member metadata to extract partition assignments
      const members = group.members.map((member) => {
        let topicPartitions: { topic: string; partition: number }[] = [];

        try {
          // memberMetadata contains the partition assignment information
          if (member.memberMetadata) {
            const metadata = member.memberMetadata;
            // The metadata structure contains topics and partitions assigned to this member
            if (metadata.topics && Array.isArray(metadata.topics)) {
              metadata.topics.forEach((topic: string) => {
                if (metadata.partitions && Array.isArray(metadata.partitions)) {
                  metadata.partitions.forEach((partition: number) => {
                    topicPartitions.push({ topic, partition });
                  });
                }
              });
            }
          }
        } catch (parseError) {
          // If metadata parsing fails, continue with empty topicPartitions
        }

        return {
          memberId: member.memberId,
          clientId: member.clientId,
          host: member.host,
          topicPartitions,
        };
      });

      // Get topics from offsets and filter out system topics
      let topics: string[] = [];
      try {
        const offsets = await this.admin.fetchOffsets(groupId);
        const uniqueTopics = new Set(offsets.map((o) => o.topic));
        topics = Array.from(uniqueTopics).filter((topic) => !isSystemTopic(topic));
      } catch (offsetError) {
        // If fetching offsets fails, continue with empty topics list
      }

      return {
        groupId: group.groupId,
        state: (group.state as any) || 'unknown',
        members,
        topics,
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
   * Fetches topics from consumer group if not provided
   * Filters out system topics
   */
  async resetOffsetToEarliest(groupId: string, topics?: string[]): Promise<void> {
    try {
      let topicsToReset = topics || [];

      // If topics not provided, fetch them from the consumer group
      if (!topicsToReset || topicsToReset.length === 0) {
        try {
          const offsets = await this.admin.fetchOffsets(groupId);
          const uniqueTopics = new Set(offsets.map((o) => o.topic));
          topicsToReset = Array.from(uniqueTopics);
        } catch (fetchError) {
          throw new Error(`Failed to fetch topics for consumer group: ${fetchError}`);
        }
      }

      // Filter out system topics
      const userTopics = topicsToReset.filter((topic) => !isSystemTopic(topic));

      // Validate that at least one user topic exists
      if (userTopics.length === 0) {
        throw new Error(
          'No user topics found for consumer group. Cannot reset offsets for system topics only.'
        );
      }

      // Get all partitions for the topics
      const metadata = await this.admin.fetchTopicMetadata({ topics: userTopics });
      const partitions: any[] = [];

      for (const topic of metadata.topics) {
        const topicPartitions = topic.partitions || [];
        topicPartitions.forEach((partition) => {
          partitions.push({
            topic: topic.name,
            partition: partition.partitionId,
            offset: '0', // earliest offset
          });
        });
      }

      if (partitions.length === 0) {
        throw new Error('No partitions found for the specified topics');
      }

      await this.admin.setOffsets({
        groupId,
        partitions,
      });

      console.log(`Reset offsets for group ${groupId} to earliest`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('AUTHORIZATION_FAILED')) {
          throw new Error(
            `Permission denied: You do not have permission to reset offsets for consumer group ${groupId}`
          );
        }
        if (error.message.includes('GROUP_COORDINATOR_NOT_AVAILABLE')) {
          throw new Error('Kafka broker is not available. Please check your connection.');
        }
        if (error.message.includes('No user topics found')) {
          throw error;
        }
      }
      throw new Error(`Failed to reset offset to earliest: ${error}`);
    }
  }

  /**
   * Reset consumer group offset to latest
   * Filters out system topics before resetting
   */
  async resetOffsetToLatest(groupId: string, topics?: string[]): Promise<void> {
    try {
      let topicsToReset = topics || [];

      // If topics not provided, fetch them from the consumer group
      if (!topicsToReset || topicsToReset.length === 0) {
        try {
          const offsets = await this.admin.fetchOffsets(groupId);
          const uniqueTopics = new Set(offsets.map((o) => o.topic));
          topicsToReset = Array.from(uniqueTopics);
        } catch (fetchError) {
          throw new Error(`Failed to fetch topics for consumer group: ${fetchError}`);
        }
      }

      // Filter out system topics
      const userTopics = topicsToReset.filter((topic) => !isSystemTopic(topic));

      if (userTopics.length === 0) {
        throw new Error(
          'No user topics found for consumer group. Cannot reset offsets for system topics only.'
        );
      }

      // Get latest offsets for each partition
      const metadata = await this.admin.fetchTopicMetadata({ topics: userTopics });
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

      if (partitions.length === 0) {
        throw new Error('No partitions found for the specified topics');
      }

      await this.admin.setOffsets({
        groupId,
        partitions,
      });

      console.log(`Reset offsets for group ${groupId} to latest`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('AUTHORIZATION_FAILED')) {
          throw new Error(
            `Permission denied: You do not have permission to reset offsets for consumer group ${groupId}`
          );
        }
        if (error.message.includes('GROUP_COORDINATOR_NOT_AVAILABLE')) {
          throw new Error('Kafka broker is not available. Please check your connection.');
        }
        if (error.message.includes('No user topics found')) {
          throw error;
        }
      }
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
      if (!partitions || partitions.length === 0) {
        throw new Error('At least one partition must be specified');
      }

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
      if (error instanceof Error) {
        if (error.message.includes('AUTHORIZATION_FAILED')) {
          throw new Error(
            `Permission denied: You do not have permission to reset offsets for consumer group ${groupId}`
          );
        }
        if (error.message.includes('INVALID_OFFSET')) {
          throw new Error('Invalid offset value provided');
        }
      }
      throw new Error(`Failed to reset offset to specific value: ${error}`);
    }
  }

  /**
   * Delete a consumer group
   */
  async deleteConsumerGroup(groupId: string): Promise<void> {
    try {
      await this.admin.deleteGroups([groupId]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('AUTHORIZATION_FAILED')) {
          throw new Error(
            `Permission denied: You do not have permission to delete consumer group ${groupId}`
          );
        }
        if (error.message.includes('ILLEGAL_GENERATION')) {
          throw new Error(
            'Cannot delete consumer group: The group is currently active. Please stop all consumers first.'
          );
        }
        if (error.message.includes('GROUP_COORDINATOR_NOT_AVAILABLE')) {
          throw new Error('Kafka broker is not available. Please check your connection.');
        }
      }
      throw new Error(`Failed to delete consumer group: ${error}`);
    }
  }
}
