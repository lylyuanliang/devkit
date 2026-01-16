/**
 * Kafka 消费组管理服务
 * 处理消费组相关的管理操作
 */

import type { Admin, Kafka } from 'kafkajs';
import { kafkaConnectionManager } from './KafkaConnectionManager';
import { connectionStore, secureStore } from '../storage';
import type {
  ConsumerGroup,
  ConsumerGroupDetail,
  ConsumerGroupMember,
  PartitionConsumerDetail,
  OffsetResetConfig,
} from '../../common/types/consumerGroup';

/**
 * Kafka消费组管理服务类
 */
class KafkaConsumerGroupService {
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
   * 获取Kafka实例
   */
  private async getKafka(connectionId: string): Promise<Kafka> {
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

    return kafkaConnectionManager.getConnection(config);
  }

  /**
   * 获取消费组列表
   */
  async listConsumerGroups(connectionId: string): Promise<ConsumerGroup[]> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 获取所有消费组
      const groups = await admin.listGroups();

      // 转换为我们的类型
      const consumerGroups: ConsumerGroup[] = groups.groups.map((group) => ({
        groupId: group.groupId,
        state: (group as any).groupState || 'UNKNOWN' as ConsumerGroup['state'],
        protocol: group.protocolType || '',
        protocolType: group.protocolType || '',
        members: [],
      }));

      await admin.disconnect();

      return consumerGroups;
    } catch (error) {
      await admin.disconnect().catch(() => {});
      throw error;
    }
  }

  /**
   * 获取消费组详情
   */
  async getConsumerGroupDetail(
    connectionId: string,
    groupId: string
  ): Promise<ConsumerGroupDetail | null> {
    const admin = await this.getAdmin(connectionId);
    const kafka = await this.getKafka(connectionId);

    try {
      await admin.connect();

      // 获取消费组描述
      const groupDescription = await admin.describeGroups([groupId]);
      const group = groupDescription.groups[0];

      if (!group || (group as any).errorCode !== 0) {
        return null;
      }

      // 获取成员信息
      const members: ConsumerGroupMember[] = group.members.map((member) => {
        // 解析成员分配信息
        let memberAssignment: { topic: string; partitions: number[] }[] = [];

        try {
          // 尝试解析成员元数据
          if (member.memberMetadata) {
            // memberMetadata可能是Buffer或base64字符串
            const metadata = Buffer.isBuffer(member.memberMetadata)
              ? member.memberMetadata
              : Buffer.from(member.memberMetadata as any, 'base64');
            // 这里简化处理，实际需要解析Kafka协议
            // 为了简化，我们从memberAssignment中获取
          }

          // 解析成员分配
          if (member.memberAssignment) {
            // memberAssignment可能是Buffer或base64字符串
            const assignment = Buffer.isBuffer(member.memberAssignment)
              ? member.memberAssignment
              : Buffer.from(member.memberAssignment as any, 'base64');
            // 简化处理：从group.members中获取分配信息
            // 实际应该解析Kafka协议格式
          }
        } catch (error) {
          console.warn('Failed to parse member assignment:', error);
        }

        return {
          memberId: member.memberId,
          clientId: member.clientId || '',
          clientHost: member.clientHost || '',
          memberAssignment,
        };
      });

      // 获取分区消费详情
      const partitionDetails = await this.getPartitionDetails(
        kafka,
        connectionId,
        groupId
      );

      // 计算总Lag
      const totalLag = partitionDetails.reduce((sum, detail) => sum + detail.lag, 0);

      await admin.disconnect();

      return {
        groupId: group.groupId,
        state: group.state as ConsumerGroup['state'],
        protocol: group.protocolType || '',
        protocolType: group.protocolType || '',
        members,
        partitionDetails,
        totalLag,
      };
    } catch (error) {
      await admin.disconnect().catch(() => {});
      throw error;
    }
  }

  /**
   * 获取分区消费详情（包括Offset和Lag）
   */
  private async getPartitionDetails(
    kafka: Kafka,
    connectionId: string,
    groupId: string
  ): Promise<PartitionConsumerDetail[]> {
    const admin = kafka.admin();

    try {
      await admin.connect();

      // 获取消费组的offsets
      const offsets = await admin.fetchOffsets({ groupId });

      const partitionDetails: PartitionConsumerDetail[] = [];

      for (const offset of offsets) {
        const { topic, partitions } = offset;

        for (const partition of partitions) {
          const partitionId = partition.partition;

          // 获取日志结束offset
          const logEndOffset = await this.getLogEndOffset(
            admin,
            connectionId,
            topic,
            partitionId
          );

          const currentOffset = partition.offset || '0';
          const lag = Math.max(0, Number(logEndOffset) - Number(currentOffset));

          partitionDetails.push({
            topic,
            partition: partitionId,
            currentOffset,
            logEndOffset,
            lag,
            lastCommittedAt: (partition as any).timestamp ? new Date(Number((partition as any).timestamp)) : undefined,
          });
        }
      }

      await admin.disconnect();

      return partitionDetails;
    } catch (error) {
      await admin.disconnect().catch(() => {});
      throw error;
    }
  }

  /**
   * 获取日志结束offset
   */
  private async getLogEndOffset(
    admin: Admin,
    connectionId: string,
    topic: string,
    partition: number
  ): Promise<string> {
    try {
      // 使用admin获取高水位标记
      const offsets = await admin.fetchTopicOffsets(topic);
      const partitionOffset = offsets.find((o) => o.partition === partition);

      if (partitionOffset) {
        return partitionOffset.high.toString();
      }

      return '0';
    } catch (error) {
      console.warn(`Failed to get log end offset for ${topic}:${partition}:`, error);
      return '0';
    }
  }

  /**
   * 重置消费组Offset
   */
  async resetOffset(connectionId: string, config: OffsetResetConfig): Promise<void> {
    const admin = await this.getAdmin(connectionId);
    const kafka = await this.getKafka(connectionId);

    try {
      await admin.connect();

      // 创建临时消费者来重置offset
      const consumer = kafka.consumer({ groupId: config.groupId });

      try {
        await consumer.connect();

        // 根据策略重置offset
        if (config.strategy === 'earliest') {
          // 重置到最早
          await consumer.seek({
            topic: config.topic,
            partition: config.partitions?.[0] || 0,
            offset: '0',
          });
        } else if (config.strategy === 'latest') {
          // 重置到最新（需要先获取高水位）
          const offsets = await admin.fetchTopicOffsets(config.topic);
          for (const partition of config.partitions || []) {
            const partitionOffset = offsets.find((o) => o.partition === partition);
            if (partitionOffset) {
              await consumer.seek({
                topic: config.topic,
                partition,
                offset: partitionOffset.high.toString(),
              });
            }
          }
        } else if (config.strategy === 'offset' && config.offset) {
          // 重置到指定offset
          for (const partition of config.partitions || []) {
            await consumer.seek({
              topic: config.topic,
              partition,
              offset: config.offset,
            });
          }
        } else if (config.strategy === 'timestamp' && config.timestamp) {
          // 重置到指定时间戳
          const offsets = await admin.fetchTopicOffsets(config.topic);
          // 简化处理：使用高水位标记
          // 实际应该根据时间戳查找对应的offset
          for (const partition of config.partitions || []) {
            const partitionOffset = offsets.find((o) => o.partition === partition);
            if (partitionOffset) {
              await consumer.seek({
                topic: config.topic,
                partition,
                offset: partitionOffset.high.toString(),
              });
            }
          }
        } else if (config.strategy === 'shift' && config.shift) {
          // 偏移指定数量
          const offsets = await admin.fetchOffsets({ groupId: config.groupId });
          const groupOffset = offsets.find((o) => o.topic === config.topic);
          if (groupOffset) {
            for (const partition of config.partitions || []) {
              const partitionOffset = groupOffset.partitions.find(
                (p) => p.partition === partition
              );
              if (partitionOffset) {
                const currentOffset = Number(partitionOffset.offset || '0');
                const newOffset = Math.max(0, currentOffset + config.shift!);
                await consumer.seek({
                  topic: config.topic,
                  partition,
                  offset: newOffset.toString(),
                });
              }
            }
          }
        }

        await consumer.disconnect();
      } catch (error) {
        await consumer.disconnect().catch(() => {});
        throw error;
      }

      await admin.disconnect();
    } catch (error) {
      await admin.disconnect().catch(() => {});
      throw error;
    }
  }

  /**
   * 删除消费组
   */
  async deleteConsumerGroup(connectionId: string, groupId: string): Promise<void> {
    const admin = await this.getAdmin(connectionId);

    try {
      await admin.connect();

      // 删除消费组
      await admin.deleteGroups([groupId]);

      await admin.disconnect();
    } catch (error) {
      await admin.disconnect().catch(() => {});
      throw error;
    }
  }
}

export const kafkaConsumerGroupService = new KafkaConsumerGroupService();
