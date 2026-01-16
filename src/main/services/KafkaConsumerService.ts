/**
 * Kafka 消费者服务
 * 处理消息消费相关操作
 */

import { Consumer, EachMessagePayload } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { BrowserWindow } from 'electron';
import { kafkaConnectionManager } from './KafkaConnectionManager';
import { connectionStore, secureStore } from '../storage';
import type { ConsumeOptions, ConsumerSession, ConsumerMessage } from '../../common/types/message';
import { IPC_CHANNELS } from '../../common/constants/ipcChannels';

/**
 * 消费会话实例
 */
interface ConsumerSessionInstance {
  id: string;
  consumer: Consumer;
  connectionId: string;
  options: ConsumeOptions;
  status: 'running' | 'paused' | 'stopped';
  messageCount: number;
  createdAt: Date;
}

/**
 * Kafka消费者服务类
 */
class KafkaConsumerService {
  private sessions: Map<string, ConsumerSessionInstance> = new Map();
  private mainWindow: BrowserWindow | null = null;

  /**
   * 设置主窗口引用（用于消息推送）
   */
  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window;
  }

  /**
   * 创建消费会话
   */
  async createSession(
    connectionId: string,
    options: ConsumeOptions
  ): Promise<ConsumerSession> {
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

    // 生成会话ID
    const sessionId = uuidv4();
    const groupId = options.groupId || `kafka-client-${sessionId}`;

    // 获取Kafka实例
    const kafka = kafkaConnectionManager.getConnection(config);

    // 创建消费者
    const consumer = kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    // 连接消费者
    await consumer.connect();

    // 订阅主题
    await consumer.subscribe({
      topic: options.topic,
      fromBeginning: options.fromBeginning || false,
    });

    // 创建会话实例
    const session: ConsumerSessionInstance = {
      id: sessionId,
      consumer,
      connectionId,
      options,
      status: 'running',
      messageCount: 0,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // 开始消费
    this.startConsuming(session);

    console.log(`Consumer session created: ${sessionId}`);

    return {
      id: sessionId,
      connectionId,
      topic: options.topic,
      groupId,
      status: 'running',
      messageCount: 0,
      createdAt: new Date(),
    };
  }

  /**
   * 开始消费消息
   */
  private async startConsuming(session: ConsumerSessionInstance): Promise<void> {
    const { consumer, options } = session;

    try {
      await consumer.run({
        autoCommit: options.autoCommit !== false,
        eachMessage: async (payload: EachMessagePayload) => {
          // 检查会话状态
          if (session.status === 'stopped') {
            return;
          }

          if (session.status === 'paused') {
            // 暂停时不处理消息
            await consumer.pause([{ topic: options.topic }]);
            return;
          }

          // 构建消息对象
          const message: ConsumerMessage = {
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            key: payload.message.key?.toString() || null,
            value: payload.message.value?.toString() || '',
            headers: payload.message.headers
              ? Object.entries(payload.message.headers).map(([key, value]) => ({
                  key,
                  value: value?.toString() || '',
                }))
              : [],
            timestamp: payload.message.timestamp,
          };

          // 增加消息计数
          session.messageCount++;

          // 推送消息到渲染进程
          this.pushMessage(session.id, message);
        },
      });
    } catch (error) {
      console.error('消费消息失败:', error);
      session.status = 'stopped';
    }
  }

  /**
   * 推送消息到渲染进程
   */
  private pushMessage(sessionId: string, message: ConsumerMessage): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.CONSUMER_MESSAGE, {
        sessionId,
        message,
      });
    }
  }

  /**
   * 暂停消费
   */
  async pauseSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    if (session.status !== 'running') {
      throw new Error('会话未运行');
    }

    await session.consumer.pause([{ topic: session.options.topic }]);
    session.status = 'paused';
    console.log(`Consumer session paused: ${sessionId}`);
  }

  /**
   * 恢复消费
   */
  async resumeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    if (session.status !== 'paused') {
      throw new Error('会话未暂停');
    }

    await session.consumer.resume([{ topic: session.options.topic }]);
    session.status = 'running';
    console.log(`Consumer session resumed: ${sessionId}`);
  }

  /**
   * 停止消费
   */
  async stopSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    try {
      session.status = 'stopped';
      await session.consumer.disconnect();
      this.sessions.delete(sessionId);
      console.log(`Consumer session stopped: ${sessionId}`);
    } catch (error) {
      console.error('停止消费会话失败:', error);
      throw error;
    }
  }

  /**
   * Seek到指定offset
   */
  async seekToOffset(sessionId: string, partition: number, offset: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    await session.consumer.seek({
      topic: session.options.topic,
      partition,
      offset,
    });
  }

  /**
   * 获取会话信息
   */
  getSession(sessionId: string): ConsumerSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      connectionId: session.connectionId,
      topic: session.options.topic,
      groupId: session.options.groupId || '',
      status: session.status,
      messageCount: session.messageCount,
      createdAt: session.createdAt,
    };
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): ConsumerSession[] {
    return Array.from(this.sessions.values()).map((session) => ({
      id: session.id,
      connectionId: session.connectionId,
      topic: session.options.topic,
      groupId: session.options.groupId || '',
      status: session.status,
      messageCount: session.messageCount,
      createdAt: session.createdAt,
    }));
  }

  /**
   * 停止所有会话
   */
  async stopAllSessions(): Promise<void> {
    const stopPromises = Array.from(this.sessions.keys()).map((id) => this.stopSession(id));
    await Promise.all(stopPromises);
  }
}

// 导出单例
export const kafkaConsumerService = new KafkaConsumerService();
