/**
 * IPC 处理器初始化
 */

import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { IPC_CHANNELS } from '../../common/constants/ipcChannels';
import { connectionStore, secureStore } from '../storage';
import { kafkaConnectionManager } from '../services/KafkaConnectionManager';
import { kafkaAdminService } from '../services/KafkaAdminService';
import { kafkaProducerService } from '../services/KafkaProducerService';
import { kafkaConsumerService } from '../services/KafkaConsumerService';
import { formatKafkaError, getUserFriendlyKafkaMessage } from '../utils/errorHandler';
import type { ConnectionConfig } from '../../common/types/connection';
import type { CreateTopicConfig } from '../../common/types/kafka';
import type { ProducerMessage, ConsumeOptions } from '../../common/types/message';

/**
 * 初始化所有 IPC 处理器
 */
export function initializeIpcHandlers(): void {
  console.log('Initializing IPC handlers...');

  // 连接管理处理器
  registerConnectionHandlers();

  // 主题管理处理器
  registerTopicHandlers();

  // 生产者处理器
  registerProducerHandlers();

  // 消费者处理器
  registerConsumerHandlers();

  // 消费组处理器
  registerConsumerGroupHandlers();

  // 集群信息处理器
  registerClusterHandlers();

  // 应用设置处理器
  registerSettingsHandlers();

  console.log('IPC handlers initialized');
}

/**
 * 连接管理处理器
 */
function registerConnectionHandlers(): void {
  // 获取所有连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_LIST, async () => {
    try {
      const connections = connectionStore.getAllConnections();
      
      // 移除敏感信息（密码）后返回
      return connections.map((conn) => {
        const { sasl, ...rest } = conn;
        if (sasl) {
          return {
            ...rest,
            sasl: {
              mechanism: sasl.mechanism,
              username: sasl.username,
              // 不返回密码，只标识是否有密码
              password: secureStore.hasPassword(conn.id) ? '***' : '',
            },
          };
        }
        return rest;
      });
    } catch (error) {
      console.error('获取连接列表失败:', error);
      throw new Error('获取连接列表失败');
    }
  });

  // 创建新连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_CREATE, async (_event, configData) => {
    try {
      // 检查连接名称是否已存在
      if (connectionStore.isConnectionNameExists(configData.name)) {
        throw new Error('连接名称已存在');
      }

      // 生成连接 ID
      const id = uuidv4();
      const now = new Date();

      // 处理密码存储
      let password = '';
      if (configData.sasl?.password) {
        password = configData.sasl.password;
        // 保存加密密码
        secureStore.setPassword(id, password);
      }

      // 创建连接配置（不包含密码）
      const config: ConnectionConfig = {
        ...configData,
        id,
        createdAt: now,
        updatedAt: now,
        sasl: configData.sasl
          ? {
              mechanism: configData.sasl.mechanism,
              username: configData.sasl.username,
              password: '', // 不存储明文密码
            }
          : undefined,
      };

      // 保存连接配置
      connectionStore.addConnection(config);

      return { success: true, id };
    } catch (error) {
      console.error('创建连接失败:', error);
      const message = error instanceof Error ? error.message : '创建连接失败';
      throw new Error(message);
    }
  });

  // 更新连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_UPDATE, async (_event, id, updates) => {
    try {
      // 检查连接是否存在
      const existingConnection = connectionStore.getConnectionById(id);
      if (!existingConnection) {
        throw new Error('连接不存在');
      }

      // 检查名称是否与其他连接冲突
      if (updates.name && connectionStore.isConnectionNameExists(updates.name, id)) {
        throw new Error('连接名称已存在');
      }

      // 处理密码更新
      if (updates.sasl?.password) {
        secureStore.setPassword(id, updates.sasl.password);
        // 移除密码字段，不保存到配置中
        updates.sasl = {
          ...updates.sasl,
          password: '',
        };
      }

      // 更新连接配置
      const success = connectionStore.updateConnection(id, updates);

      if (!success) {
        throw new Error('更新连接失败');
      }

      // 如果连接已存在活跃实例，关闭它以便下次使用新配置
      if (kafkaConnectionManager.hasConnection(id)) {
        await kafkaConnectionManager.closeConnection(id);
      }

      return { success: true };
    } catch (error) {
      console.error('更新连接失败:', error);
      const message = error instanceof Error ? error.message : '更新连接失败';
      throw new Error(message);
    }
  });

  // 删除连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_DELETE, async (_event, id) => {
    try {
      // 关闭活跃连接
      if (kafkaConnectionManager.hasConnection(id)) {
        await kafkaConnectionManager.closeConnection(id);
      }

      // 删除存储的密码
      secureStore.deletePassword(id);

      // 删除连接配置
      const success = connectionStore.deleteConnection(id);

      if (!success) {
        throw new Error('连接不存在');
      }

      return { success: true };
    } catch (error) {
      console.error('删除连接失败:', error);
      const message = error instanceof Error ? error.message : '删除连接失败';
      throw new Error(message);
    }
  });

  // 测试连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_TEST, async (_event, configData) => {
    try {
      // 构建临时配置（包含密码）
      const tempConfig: ConnectionConfig = {
        ...configData,
        id: 'temp-test-connection',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 如果配置中没有密码但有连接 ID，从安全存储中获取
      if (configData.id && configData.sasl && !configData.sasl.password) {
        const password = secureStore.getPassword(configData.id);
        if (password && tempConfig.sasl) {
          tempConfig.sasl.password = password;
        }
      }

      // 执行连接测试
      const result = await kafkaConnectionManager.testConnection(tempConfig);
      return result;
    } catch (error) {
      console.error('测试连接失败:', error);
      const message = error instanceof Error ? error.message : '测试连接失败';
      return {
        success: false,
        message: `连接失败: ${message}`,
      };
    }
  });

  // 连接到 Kafka
  ipcMain.handle(IPC_CHANNELS.CONNECTION_CONNECT, async (_event, id) => {
    try {
      const config = connectionStore.getConnectionById(id);
      if (!config) {
        throw new Error('连接不存在');
      }

      // 如果有 SASL 认证，加载密码
      if (config.sasl) {
        const password = secureStore.getPassword(id);
        if (password) {
          config.sasl.password = password;
        }
      }

      // 创建或获取连接实例（实际连接在使用时才建立）
      kafkaConnectionManager.getConnection(config);

      // 设置为活跃连接
      connectionStore.setActiveConnectionId(id);

      return { success: true };
    } catch (error) {
      console.error('连接 Kafka 失败:', error);
      const message = error instanceof Error ? error.message : '连接失败';
      throw new Error(message);
    }
  });

  // 断开连接
  ipcMain.handle(IPC_CHANNELS.CONNECTION_DISCONNECT, async (_event, id) => {
    try {
      await kafkaConnectionManager.closeConnection(id);

      // 如果是活跃连接，清除活跃状态
      if (connectionStore.getActiveConnectionId() === id) {
        connectionStore.setActiveConnectionId(null);
      }

      return { success: true };
    } catch (error) {
      console.error('断开连接失败:', error);
      const message = error instanceof Error ? error.message : '断开连接失败';
      throw new Error(message);
    }
  });
}

/**
 * 主题管理处理器
 */
function registerTopicHandlers(): void {
  // 获取主题列表
  ipcMain.handle(IPC_CHANNELS.TOPIC_LIST, async (_event, connectionId) => {
    try {
      const topics = await kafkaAdminService.listTopics(connectionId);
      return topics;
    } catch (error) {
      console.error('获取主题列表失败:', error);
      const message = error instanceof Error ? error.message : '获取主题列表失败';
      throw new Error(message);
    }
  });

  // 获取主题详情
  ipcMain.handle(IPC_CHANNELS.TOPIC_DETAIL, async (_event, connectionId, topicName) => {
    try {
      const detail = await kafkaAdminService.getTopicDetail(connectionId, topicName);
      return detail;
    } catch (error) {
      console.error('获取主题详情失败:', error);
      const message = error instanceof Error ? error.message : '获取主题详情失败';
      throw new Error(message);
    }
  });

  // 创建主题
  ipcMain.handle(IPC_CHANNELS.TOPIC_CREATE, async (_event, connectionId, config: CreateTopicConfig) => {
    try {
      await kafkaAdminService.createTopic(connectionId, config);
      return { success: true };
    } catch (error) {
      console.error('创建主题失败:', error);
      const message = error instanceof Error ? error.message : '创建主题失败';
      throw new Error(message);
    }
  });

  // 删除主题
  ipcMain.handle(IPC_CHANNELS.TOPIC_DELETE, async (_event, connectionId, topicName) => {
    try {
      await kafkaAdminService.deleteTopic(connectionId, topicName);
      return { success: true };
    } catch (error) {
      console.error('删除主题失败:', error);
      const message = error instanceof Error ? error.message : '删除主题失败';
      throw new Error(message);
    }
  });

  // 更新主题配置
  ipcMain.handle(
    IPC_CHANNELS.TOPIC_CONFIG_UPDATE,
    async (_event, connectionId, topicName, configs) => {
      try {
        await kafkaAdminService.updateTopicConfig(connectionId, topicName, configs);
        return { success: true };
      } catch (error) {
        console.error('更新主题配置失败:', error);
        const message = error instanceof Error ? error.message : '更新主题配置失败';
        throw new Error(message);
      }
    }
  );

  // 增加分区
  ipcMain.handle(
    IPC_CHANNELS.TOPIC_PARTITION_ADD,
    async (_event, connectionId, topicName, count) => {
      try {
        await kafkaAdminService.addPartitions(connectionId, topicName, count);
        return { success: true };
      } catch (error) {
        console.error('增加分区失败:', error);
        const message = error instanceof Error ? error.message : '增加分区失败';
        throw new Error(message);
      }
    }
  );
}

/**
 * 生产者处理器
 */
function registerProducerHandlers(): void {
  // 发送单条消息
  ipcMain.handle(IPC_CHANNELS.PRODUCER_SEND, async (_event, connectionId, message: ProducerMessage) => {
    try {
      const result = await kafkaProducerService.sendMessage(connectionId, message);
      
      if (!result.success) {
        throw new Error(result.error || '发送消息失败');
      }
      
      return result;
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      throw new Error(errorMessage);
    }
  });

  // 批量发送消息
  ipcMain.handle(IPC_CHANNELS.PRODUCER_SEND_BATCH, async (_event, connectionId, messages: ProducerMessage[]) => {
    try {
      const result = await kafkaProducerService.sendBatchMessages(connectionId, messages);
      return result;
    } catch (error) {
      console.error('批量发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '批量发送消息失败';
      throw new Error(errorMessage);
    }
  });
}

/**
 * 消费者处理器
 */
function registerConsumerHandlers(): void {
  // 开始消费
  ipcMain.handle(IPC_CHANNELS.CONSUMER_START, async (_event, connectionId, options: ConsumeOptions) => {
    try {
      const session = await kafkaConsumerService.createSession(connectionId, options);
      return { success: true, session };
    } catch (error) {
      console.error('开始消费失败:', error);
      const errorMessage = error instanceof Error ? error.message : '开始消费失败';
      throw new Error(errorMessage);
    }
  });

  // 暂停消费
  ipcMain.handle(IPC_CHANNELS.CONSUMER_PAUSE, async (_event, sessionId) => {
    try {
      await kafkaConsumerService.pauseSession(sessionId);
      return { success: true };
    } catch (error) {
      console.error('暂停消费失败:', error);
      const errorMessage = error instanceof Error ? error.message : '暂停消费失败';
      throw new Error(errorMessage);
    }
  });

  // 恢复消费
  ipcMain.handle(IPC_CHANNELS.CONSUMER_RESUME, async (_event, sessionId) => {
    try {
      await kafkaConsumerService.resumeSession(sessionId);
      return { success: true };
    } catch (error) {
      console.error('恢复消费失败:', error);
      const errorMessage = error instanceof Error ? error.message : '恢复消费失败';
      throw new Error(errorMessage);
    }
  });

  // 停止消费
  ipcMain.handle(IPC_CHANNELS.CONSUMER_STOP, async (_event, sessionId) => {
    try {
      await kafkaConsumerService.stopSession(sessionId);
      return { success: true };
    } catch (error) {
      console.error('停止消费失败:', error);
      const errorMessage = error instanceof Error ? error.message : '停止消费失败';
      throw new Error(errorMessage);
    }
  });

  // Seek操作
  ipcMain.handle(IPC_CHANNELS.CONSUMER_SEEK, async (_event, sessionId, partition, offset) => {
    try {
      await kafkaConsumerService.seekToOffset(sessionId, partition, offset);
      return { success: true };
    } catch (error) {
      console.error('Seek操作失败:', error);
      const errorMessage = error instanceof Error ? error.message : 'Seek操作失败';
      throw new Error(errorMessage);
    }
  });
}

/**
 * 消费组处理器
 */
function registerConsumerGroupHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONSUMER_GROUP_LIST, async (_event, connectionId) => {
    try {
      const { kafkaConsumerGroupService } = await import('../services/KafkaConsumerGroupService');
      return await kafkaConsumerGroupService.listConsumerGroups(connectionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取消费组列表失败';
      throw new Error(errorMessage);
    }
  });

  ipcMain.handle(IPC_CHANNELS.CONSUMER_GROUP_DETAIL, async (_event, connectionId, groupId) => {
    try {
      const { kafkaConsumerGroupService } = await import('../services/KafkaConsumerGroupService');
      return await kafkaConsumerGroupService.getConsumerGroupDetail(connectionId, groupId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取消费组详情失败';
      throw new Error(errorMessage);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.CONSUMER_GROUP_RESET_OFFSET,
    async (_event, connectionId, config) => {
      try {
        const { kafkaConsumerGroupService } = await import('../services/KafkaConsumerGroupService');
        await kafkaConsumerGroupService.resetOffset(connectionId, config);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '重置Offset失败';
        throw new Error(errorMessage);
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.CONSUMER_GROUP_DELETE, async (_event, connectionId, groupId) => {
    try {
      const { kafkaConsumerGroupService } = await import('../services/KafkaConsumerGroupService');
      await kafkaConsumerGroupService.deleteConsumerGroup(connectionId, groupId);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除消费组失败';
      throw new Error(errorMessage);
    }
  });
}

/**
 * 集群信息处理器
 */
function registerClusterHandlers(): void {
  // 获取集群信息
  ipcMain.handle(IPC_CHANNELS.CLUSTER_INFO, async (_event, connectionId) => {
    try {
      const clusterInfo = await kafkaAdminService.getClusterInfo(connectionId);
      return clusterInfo;
    } catch (error) {
      console.error('获取集群信息失败:', error);
      const message = error instanceof Error ? error.message : '获取集群信息失败';
      throw new Error(message);
    }
  });

  // 获取Broker列表
  ipcMain.handle(IPC_CHANNELS.BROKER_LIST, async (_event, connectionId) => {
    try {
      const clusterInfo = await kafkaAdminService.getClusterInfo(connectionId);
      return clusterInfo.brokers;
    } catch (error) {
      console.error('获取Broker列表失败:', error);
      const message = error instanceof Error ? error.message : '获取Broker列表失败';
      throw new Error(message);
    }
  });
}

/**
 * 应用设置处理器
 */
function registerSettingsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    try {
      const { settingsStore } = await import('../storage/SettingsStore');
      return settingsStore.getAllSettings();
    } catch (error) {
      console.error('获取设置失败:', error);
      const message = error instanceof Error ? error.message : '获取设置失败';
      throw new Error(message);
    }
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings) => {
    try {
      const { settingsStore } = await import('../storage/SettingsStore');
      settingsStore.updateSettings(settings);
      return { success: true };
    } catch (error) {
      console.error('保存设置失败:', error);
      const message = error instanceof Error ? error.message : '保存设置失败';
      throw new Error(message);
    }
  });
}
