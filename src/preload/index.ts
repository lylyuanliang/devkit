/**
 * Preload 脚本
 * 在渲染进程中暴露安全的 API
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../common/constants/ipcChannels';
import type {
  ConnectionConfig,
  ConnectionTestResult,
  CreateTopicConfig,
  ProducerMessage,
  ConsumeOptions,
  OffsetResetConfig,
} from '../common/types';

/**
 * 暴露给渲染进程的 API
 */
const kafkaApi = {
  // ==================== 连接管理 ====================
  connection: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_LIST),

    create: (config: Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_CREATE, config),

    update: (id: string, config: Partial<ConnectionConfig>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_UPDATE, id, config),

    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_DELETE, id),

    test: (config: Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_TEST, config) as Promise<ConnectionTestResult>,

    connect: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_CONNECT, id),

    disconnect: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_DISCONNECT, id),
  },

  // ==================== 主题管理 ====================
  topic: {
    list: (connectionId: string) => ipcRenderer.invoke(IPC_CHANNELS.TOPIC_LIST, connectionId),

    detail: (connectionId: string, topicName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_DETAIL, connectionId, topicName),

    create: (connectionId: string, config: CreateTopicConfig) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_CREATE, connectionId, config),

    delete: (connectionId: string, topicName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_DELETE, connectionId, topicName),

    updateConfig: (connectionId: string, topicName: string, configs: Record<string, string>) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_CONFIG_UPDATE, connectionId, topicName, configs),

    addPartitions: (connectionId: string, topicName: string, count: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_PARTITION_ADD, connectionId, topicName, count),
  },

  // ==================== 生产者 ====================
  producer: {
    send: (connectionId: string, message: ProducerMessage) =>
      ipcRenderer.invoke(IPC_CHANNELS.PRODUCER_SEND, connectionId, message),

    sendBatch: (connectionId: string, messages: ProducerMessage[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.PRODUCER_SEND_BATCH, connectionId, messages),
  },

  // ==================== 消费者 ====================
  consumer: {
    start: (connectionId: string, options: ConsumeOptions) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_START, connectionId, options),

    pause: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_PAUSE, sessionId),

    resume: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_RESUME, sessionId),

    stop: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_STOP, sessionId),

    seek: (sessionId: string, offset: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_SEEK, sessionId, offset),

    onMessage: (callback: (message: unknown) => void) => {
      const subscription = (_event: Electron.IpcRendererEvent, message: unknown) => {
        callback(message);
      };
      ipcRenderer.on(IPC_CHANNELS.CONSUMER_MESSAGE, subscription);

      // 返回取消订阅函数
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.CONSUMER_MESSAGE, subscription);
      };
    },
  },

  // ==================== 消费组管理 ====================
  consumerGroup: {
    list: (connectionId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_GROUP_LIST, connectionId),

    detail: (connectionId: string, groupId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_GROUP_DETAIL, connectionId, groupId),

    resetOffset: (connectionId: string, config: OffsetResetConfig) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_GROUP_RESET_OFFSET, connectionId, config),

    delete: (connectionId: string, groupId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_GROUP_DELETE, connectionId, groupId),
  },

  // ==================== 集群信息 ====================
  cluster: {
    getInfo: (connectionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CLUSTER_INFO, connectionId),

    listBrokers: (connectionId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.BROKER_LIST, connectionId),
  },

  // ==================== 应用设置 ====================
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),

    set: (settings: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  },

  // ==================== 文件操作 ====================
  file: {
    select: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT, options),

    save: (content: string, filename: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, content, filename),
  },
};

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('kafkaApi', kafkaApi);

// TypeScript 类型定义（供渲染进程使用）
export type KafkaApi = typeof kafkaApi;
