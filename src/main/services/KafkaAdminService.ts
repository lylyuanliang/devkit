/**
 * Kafka 管理服务
 * 处理主题相关的管理操作
 */

import type { Admin, ITopicConfig } from 'kafkajs';
import { kafkaConnectionManager } from './KafkaConnectionManager';
import { connectionStore, secureStore } from '../storage';
import type {
  Topic,
  TopicDetail,
  Partition,
  CreateTopicConfig,
  ConfigEntry,
} from '../../common/types/kafka';

/**
 * Kafka管理服务类
 */
class KafkaAdminService {
  /**
   * 获取Admin实例
   */
  private async getAdmin(connectionId: string): Promise<Admin> {
    const config = connectionStore.getConnectionById(connectionId);
    if (!config) {
      throw new Error('连接不存在');
    }

    // 加载密码
    if (config.sasl) {
      const password = secureStore.getPassword(connectionId);
      if (password) {
        config.sasl.password = password;
      }
    }

    const kafka = kafkaConnectionManager.getConnection(config);
    return kafka.admin();
  }

  /**
   * 获取主题列表
   */
  async listTopics(connectionId: string): Promise<Topic[]> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 获取主题列表
      const topics = await admin.listTopics();

      // 获取主题元数据
      const metadata = await admin.fetchTopicMetadata({ topics });

      // 构建主题信息
      const topicList: Topic[] = metadata.topics.map((topic) => ({
        name: topic.name,
        partitions: topic.partitions.length,
        replicationFactor:
          topic.partitions.length > 0 ? topic.partitions[0].replicas.length : 0,
        internal: topic.name.startsWith('__'),
      }));

      return topicList;
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 获取主题详情
   */
  async getTopicDetail(connectionId: string, topicName: string): Promise<TopicDetail> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 获取主题元数据
      const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });
      const topicMetadata = metadata.topics.find((t) => t.name === topicName);

      if (!topicMetadata) {
        throw new Error('主题不存在');
      }

      // 获取主题配置
      const configResource = await admin.describeConfigs({
        resources: [
          {
            type: 2, // TOPIC
            name: topicName,
          },
        ],
        includeSynonyms: false,
      });

      const configs: ConfigEntry[] =
        configResource.resources[0]?.configEntries.map((entry) => ({
          name: entry.configName,
          value: entry.configValue,
          source: entry.configSource.toString(),
          isSensitive: entry.isSensitive,
          isReadOnly: entry.readOnly,
        })) || [];

      // 构建分区详情
      const partitionDetails: Partition[] = topicMetadata.partitions.map((partition) => ({
        partitionId: partition.partitionId,
        leader: partition.leader,
        replicas: partition.replicas,
        isr: partition.isr,
        offlineReplicas: partition.offlineReplicas || [],
        earliestOffset: '0', // 需要单独获取
        latestOffset: '0', // 需要单独获取
      }));

      // 构建主题详情
      const topicDetail: TopicDetail = {
        name: topicMetadata.name,
        partitions: topicMetadata.partitions.length,
        replicationFactor:
          topicMetadata.partitions.length > 0 ? topicMetadata.partitions[0].replicas.length : 0,
        internal: topicMetadata.name.startsWith('__'),
        partitionDetails,
        configs,
      };

      return topicDetail;
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 创建主题
   */
  async createTopic(connectionId: string, config: CreateTopicConfig): Promise<void> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 构建主题配置
      const topicConfig: ITopicConfig = {
        topic: config.topic,
        numPartitions: config.numPartitions,
        replicationFactor: config.replicationFactor,
      };

      // 添加配置项
      if (config.configEntries && config.configEntries.length > 0) {
        topicConfig.configEntries = config.configEntries;
      }

      // 创建主题
      await admin.createTopics({
        topics: [topicConfig],
        waitForLeaders: true,
        timeout: 30000,
      });
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 删除主题
   */
  async deleteTopic(connectionId: string, topicName: string): Promise<void> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      await admin.deleteTopics({
        topics: [topicName],
        timeout: 30000,
      });
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 更新主题配置
   */
  async updateTopicConfig(
    connectionId: string,
    topicName: string,
    configs: Record<string, string>
  ): Promise<void> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 构建配置更新
      const configEntries = Object.entries(configs).map(([name, value]) => ({
        name,
        value,
      }));

      await admin.alterConfigs({
        resources: [
          {
            type: 2, // TOPIC
            name: topicName,
            configEntries,
          },
        ],
        validateOnly: false,
      });
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 增加分区
   */
  async addPartitions(
    connectionId: string,
    topicName: string,
    totalPartitions: number
  ): Promise<void> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      await admin.createPartitions({
        topicPartitions: [
          {
            topic: topicName,
            count: totalPartitions,
          },
        ],
        timeout: 30000,
      });
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * 获取集群信息
   */
  async getClusterInfo(connectionId: string) {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();
      const cluster = await admin.describeCluster();

      return {
        brokers: cluster.brokers,
        controller: cluster.controller,
        clusterId: cluster.clusterId,
      };
    } finally {
      await admin.disconnect();
    }
  }
}

// 导出单例
export const kafkaAdminService = new KafkaAdminService();
