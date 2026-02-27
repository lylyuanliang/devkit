import { Admin } from 'kafkajs';
import { TopicInfo } from '../types';

/**
 * Validation rules for topic configuration
 */
const CONFIG_VALIDATION_RULES: Record<string, (value: string) => boolean> = {
  'retention.ms': (value) => {
    const num = parseInt(value, 10);
    return value === '-1' || (num > 0 && !isNaN(num));
  },
  'compression.type': (value) => {
    return ['none', 'gzip', 'snappy', 'lz4', 'zstd'].includes(value);
  },
  'cleanup.policy': (value) => {
    return ['delete', 'compact'].includes(value);
  },
  'min.insync.replicas': (value) => {
    const num = parseInt(value, 10);
    return num > 0 && !isNaN(num);
  },
};

export class KafkaAdminService {
  constructor(private admin: Admin) {}

  /**
   * Validate topic configuration values
   */
  private validateConfig(config: Record<string, string>): void {
    for (const [key, value] of Object.entries(config)) {
      if (CONFIG_VALIDATION_RULES[key]) {
        if (!CONFIG_VALIDATION_RULES[key](value)) {
          throw new Error(`Invalid value for ${key}: ${value}`);
        }
      }
    }
  }

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
   * Create a new topic with optional configuration
   * @param topicName - Name of the topic
   * @param partitions - Number of partitions (default: 1)
   * @param replicationFactor - Replication factor (default: 1)
   * @param config - Optional topic configuration (retention.ms, compression.type, cleanup.policy, min.insync.replicas)
   */
  async createTopic(
    topicName: string,
    partitions: number = 1,
    replicationFactor: number = 1,
    config?: Record<string, string>
  ): Promise<void> {
    try {
      // Validate inputs
      if (!topicName || topicName.trim().length === 0) {
        throw new Error('Topic name is required');
      }
      if (partitions < 1 || partitions > 100) {
        throw new Error('Partitions must be between 1 and 100');
      }
      if (replicationFactor < 1 || replicationFactor > 10) {
        throw new Error('Replication factor must be between 1 and 10');
      }

      // Validate configuration if provided
      if (config) {
        this.validateConfig(config);
      }

      const topicConfig = config
        ? Object.entries(config).map(([name, value]) => ({
            name,
            value: value || '',
          }))
        : undefined;

      await this.admin.createTopics({
        topics: [
          {
            topic: topicName,
            numPartitions: partitions,
            replicationFactor: replicationFactor,
            configEntries: topicConfig,
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
