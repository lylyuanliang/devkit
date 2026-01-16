/**
 * Kafka 生产者服务
 * 处理消息发送相关操作
 */

import type { Producer, ProducerRecord, RecordMetadata } from 'kafkajs';
import { kafkaConnectionManager } from './KafkaConnectionManager';
import { connectionStore, secureStore } from '../storage';
import type { ProducerMessage } from '../../common/types/message';

/**
 * 生产者实例映射
 */
interface ProducerInstance {
  producer: Producer;
  connectionId: string;
  createdAt: Date;
}

/**
 * 发送结果
 */
export interface SendResult {
  success: boolean;
  partition?: number;
  offset?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Kafka生产者服务类
 */
class KafkaProducerService {
  private producers: Map<string, ProducerInstance> = new Map();

  /**
   * 获取或创建生产者实例
   */
  private async getProducer(connectionId: string): Promise<Producer> {
    let instance = this.producers.get(connectionId);

    if (!instance) {
      // 获取连接配置
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

      // 获取Kafka实例
      const kafka = kafkaConnectionManager.getConnection(config);
      const producer = kafka.producer({
        allowAutoTopicCreation: false,
        transactionTimeout: 30000,
      });

      // 连接生产者
      await producer.connect();

      instance = {
        producer,
        connectionId,
        createdAt: new Date(),
      };

      this.producers.set(connectionId, instance);

      console.log(`Producer created for connection: ${connectionId}`);
    }

    return instance.producer;
  }

  /**
   * 发送单条消息
   */
  async sendMessage(connectionId: string, message: ProducerMessage): Promise<SendResult> {
    try {
      const producer = await this.getProducer(connectionId);

      // 构建消息记录
      const record: ProducerRecord = {
        topic: message.topic,
        messages: [
          {
            key: message.key || null,
            value: message.value,
            headers: message.headers?.reduce(
              (acc, header) => {
                acc[header.key] = header.value;
                return acc;
              },
              {} as Record<string, string>
            ),
            partition: message.partition,
            timestamp: message.timestamp,
          },
        ],
      };

      // 发送消息
      const metadata = await producer.send(record);

      // 返回结果
      const result = metadata[0];
      return {
        success: true,
        partition: result.partition,
        offset: result.baseOffset,
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 批量发送消息
   */
  async sendBatchMessages(
    connectionId: string,
    messages: ProducerMessage[]
  ): Promise<{
    success: boolean;
    successCount: number;
    failureCount: number;
    results: SendResult[];
  }> {
    const results: SendResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      const producer = await this.getProducer(connectionId);

      // 按主题分组消息
      const messagesByTopic = messages.reduce(
        (acc, msg) => {
          if (!acc[msg.topic]) {
            acc[msg.topic] = [];
          }
          acc[msg.topic].push(msg);
          return acc;
        },
        {} as Record<string, ProducerMessage[]>
      );

      // 批量发送每个主题的消息
      for (const [topic, topicMessages] of Object.entries(messagesByTopic)) {
        const record: ProducerRecord = {
          topic,
          messages: topicMessages.map((msg) => ({
            key: msg.key || null,
            value: msg.value,
            headers: msg.headers?.reduce(
              (acc, header) => {
                acc[header.key] = header.value;
                return acc;
              },
              {} as Record<string, string>
            ),
            partition: msg.partition,
            timestamp: msg.timestamp,
          })),
        };

        try {
          const metadata = await producer.send(record);
          
          // 记录每条消息的结果
          metadata.forEach((result) => {
            results.push({
              success: true,
              partition: result.partition,
              offset: result.baseOffset,
              timestamp: result.timestamp,
            });
            successCount++;
          });
        } catch (error) {
          // 批次发送失败，标记所有消息为失败
          const errorMessage = error instanceof Error ? error.message : '发送失败';
          topicMessages.forEach(() => {
            results.push({
              success: false,
              error: errorMessage,
            });
            failureCount++;
          });
        }
      }

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        results,
      };
    } catch (error) {
      console.error('批量发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '批量发送失败';

      return {
        success: false,
        successCount: 0,
        failureCount: messages.length,
        results: messages.map(() => ({
          success: false,
          error: errorMessage,
        })),
      };
    }
  }

  /**
   * 关闭生产者
   */
  async closeProducer(connectionId: string): Promise<void> {
    const instance = this.producers.get(connectionId);
    if (!instance) {
      return;
    }

    try {
      await instance.producer.disconnect();
      this.producers.delete(connectionId);
      console.log(`Producer closed for connection: ${connectionId}`);
    } catch (error) {
      console.error(`关闭生产者失败:`, error);
    }
  }

  /**
   * 关闭所有生产者
   */
  async closeAllProducers(): Promise<void> {
    const closePromises = Array.from(this.producers.keys()).map((id) => this.closeProducer(id));
    await Promise.all(closePromises);
  }
}

// 导出单例
export const kafkaProducerService = new KafkaProducerService();
