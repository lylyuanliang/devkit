/**
 * Kafka 连接管理器
 * 管理 Kafka 连接的创建、测试、维护
 */

import { Kafka, KafkaConfig } from 'kafkajs';
import type { ConnectionConfig, ConnectionTestResult } from '../../common/types/connection';
import { v4 as uuidv4 } from 'uuid';

/**
 * Kafka 连接实例映射
 */
interface KafkaInstance {
  kafka: Kafka;
  config: ConnectionConfig;
  createdAt: Date;
  lastUsedAt: Date;
}

/**
 * Kafka 连接管理器类
 */
class KafkaConnectionManager {
  private connections: Map<string, KafkaInstance> = new Map();

  /**
   * 创建 Kafka 实例
   */
  private createKafkaInstance(config: ConnectionConfig): Kafka {
    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId || `kafka-client-${config.id}`,
      brokers: config.brokers,
      connectionTimeout: config.connectionTimeout || 10000,
      requestTimeout: config.requestTimeout || 30000,
    };

    // 配置 SASL 认证
    if (config.sasl) {
      kafkaConfig.sasl = {
        mechanism: config.sasl.mechanism as any,
        username: config.sasl.username,
        password: config.sasl.password,
      };
    }

    // 配置 SSL
    if (config.ssl?.enabled) {
      kafkaConfig.ssl = {
        rejectUnauthorized: config.ssl.rejectUnauthorized !== false,
      };

      // 如果提供了证书，添加证书配置
      if (config.ssl.ca) {
        kafkaConfig.ssl.ca = [config.ssl.ca];
      }
      if (config.ssl.cert) {
        kafkaConfig.ssl.cert = config.ssl.cert;
      }
      if (config.ssl.key) {
        kafkaConfig.ssl.key = config.ssl.key;
      }
    }

    return new Kafka(kafkaConfig);
  }

  /**
   * 获取或创建连接
   */
  getConnection(config: ConnectionConfig): Kafka {
    let instance = this.connections.get(config.id);

    if (!instance) {
      // 创建新连接
      const kafka = this.createKafkaInstance(config);
      instance = {
        kafka,
        config,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
      this.connections.set(config.id, instance);
    } else {
      // 更新最后使用时间
      instance.lastUsedAt = new Date();
    }

    return instance.kafka;
  }

  /**
   * 测试连接
   */
  async testConnection(config: ConnectionConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      // 创建临时 Kafka 实例
      const kafka = this.createKafkaInstance(config);
      const admin = kafka.admin();

      // 尝试连接并获取集群信息
      await admin.connect();

      try {
        // 获取集群元数据
        const cluster = await admin.describeCluster();
        const responseTime = Date.now() - startTime;

        return {
          success: true,
          message: '连接成功',
          brokerCount: cluster.brokers.length,
          controllerId: cluster.controller || undefined,
          clusterId: cluster.clusterId,
          responseTime,
        };
      } finally {
        // 断开连接
        await admin.disconnect();
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      return {
        success: false,
        message: `连接失败: ${errorMessage}`,
        responseTime,
      };
    }
  }

  /**
   * 关闭指定连接
   */
  async closeConnection(connectionId: string): Promise<void> {
    const instance = this.connections.get(connectionId);
    if (!instance) {
      return;
    }

    try {
      // Kafka 实例会在不再使用时自动断开
      // 这里只需要从映射中移除
      this.connections.delete(connectionId);
    } catch (error) {
      console.error(`关闭连接 ${connectionId} 失败:`, error);
    }
  }

  /**
   * 关闭所有连接
   */
  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map((id) =>
      this.closeConnection(id)
    );
    await Promise.all(closePromises);
  }

  /**
   * 清理长时间未使用的连接（超过 30 分钟）
   */
  cleanupIdleConnections(): void {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    for (const [id, instance] of this.connections.entries()) {
      if (now - instance.lastUsedAt.getTime() > thirtyMinutes) {
        this.closeConnection(id);
      }
    }
  }

  /**
   * 获取活跃连接数
   */
  getActiveConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * 检查连接是否存在
   */
  hasConnection(connectionId: string): boolean {
    return this.connections.has(connectionId);
  }
}

// 导出单例
export const kafkaConnectionManager = new KafkaConnectionManager();

// 定时清理空闲连接（每 10 分钟）
setInterval(() => {
  kafkaConnectionManager.cleanupIdleConnections();
}, 10 * 60 * 1000);
