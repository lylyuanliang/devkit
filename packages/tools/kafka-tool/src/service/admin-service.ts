import { Admin } from 'kafkajs';
import { TopicInfo } from '../types';

export class KafkaAdminService {
  constructor(private admin: Admin) {}

  /**
   * List all topics in the cluster
   */
  async listTopics(): Promise<TopicInfo[]> {
    try {
      const metadata = await this.admin.fetchTopicMetadata();
      return metadata.topics.map((topic) => ({
        name: topic.name,
        partitions: topic.partitions.length,
        replicationFactor: topic.partitions[0]?.replicas.length || 0,
        leader: topic.partitions[0]?.leader,
        isr: topic.partitions[0]?.isr,
        replicas: topic.partitions[0]?.replicas,
      }));
    } catch (error) {
      throw new Error(`Failed to list topics: ${error}`);
    }
  }

  /**
   * Get detailed information about a specific topic
   */
  async getTopicInfo(topicName: string): Promise<TopicInfo> {
    try {
      const metadata = await this.admin.fetchTopicMetadata({ topics: [topicName] });
      const topic = metadata.topics[0];

      if (!topic) {
        throw new Error(`Topic ${topicName} not found`);
      }

      return {
        name: topic.name,
        partitions: topic.partitions.length,
        replicationFactor: topic.partitions[0]?.replicas.length || 0,
        leader: topic.partitions[0]?.leader,
        isr: topic.partitions[0]?.isr,
        replicas: topic.partitions[0]?.replicas,
      };
    } catch (error) {
      throw new Error(`Failed to get topic info: ${error}`);
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(
    topicName: string,
    partitions: number = 1,
    replicationFactor: number = 1
  ): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [
          {
            topic: topicName,
            numPartitions: partitions,
            replicationFactor: replicationFactor,
          },
        ],
        validateOnly: false,
      });
    } catch (error) {
      throw new Error(`Failed to create topic: ${error}`);
    }
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicName: string): Promise<void> {
    try {
      await this.admin.deleteTopics({
        topics: [topicName],
      });
    } catch (error) {
      throw new Error(`Failed to delete topic: ${error}`);
    }
  }

  /**
   * Get topic configuration
   */
  async getTopicConfig(topicName: string): Promise<Record<string, string>> {
    try {
      const configs = await this.admin.describeConfigs({
        includeSynced: true,
        resources: [
          {
            type: 2, // 2 = Topic
            name: topicName,
          },
        ],
      });

      const result: Record<string, string> = {};
      configs.resources[0]?.configEntries?.forEach((entry) => {
        result[entry.name] = entry.value || '';
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get topic config: ${error}`);
    }
  }

  /**
   * Update topic configuration
   */
  async updateTopicConfig(
    topicName: string,
    config: Record<string, string>
  ): Promise<void> {
    try {
      const configEntries = Object.entries(config).map(([name, value]) => ({
        name,
        value: value || '',
      }));

      await this.admin.alterConfigs({
        resources: [
          {
            type: 2, // 2 = Topic
            name: topicName,
            configEntries,
          },
        ],
        validateOnly: false,
      });
    } catch (error) {
      throw new Error(`Failed to update topic config: ${error}`);
    }
  }

  /**
   * Get cluster info
   */
  async getClusterInfo() {
    try {
      const cluster = await this.admin.describeCluster();
      return {
        brokers: cluster.brokers.map((broker) => ({
          id: broker.nodeId,
          host: broker.host,
          port: broker.port,
        })),
        controller: cluster.controller,
        brokerMetadata: cluster.brokers,
      };
    } catch (error) {
      throw new Error(`Failed to get cluster info: ${error}`);
    }
  }
}
