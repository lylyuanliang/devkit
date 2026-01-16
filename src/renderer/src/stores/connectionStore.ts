/**
 * 连接管理状态store
 * 使用 Zustand 进行状态管理
 */

import { create } from 'zustand';
import type { ConnectionConfig } from '../../../common/types/connection';

interface ConnectionStore {
  // 状态
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  loading: boolean;
  error: string | null;

  // 操作方法
  setConnections: (connections: ConnectionConfig[]) => void;
  setActiveConnectionId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 业务方法
  loadConnections: () => Promise<void>;
  createConnection: (config: Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateConnection: (id: string, updates: Partial<ConnectionConfig>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  testConnection: (config: any) => Promise<any>;
  connectToKafka: (id: string) => Promise<void>;
  disconnectFromKafka: (id: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  // 初始状态
  connections: [],
  activeConnectionId: null,
  loading: false,
  error: null,

  // 基础操作
  setConnections: (connections) => set({ connections }),
  setActiveConnectionId: (id) => set({ activeConnectionId: id }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 加载连接列表
  loadConnections: async () => {
    if (!window.kafkaApi?.connection) {
      console.error('kafkaApi not available');
      return;
    }
    set({ loading: true, error: null });
    try {
      const connections = await window.kafkaApi.connection.list();
      set({ connections, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载连接列表失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 创建连接
  createConnection: async (config) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.connection.create(config);
      // 重新加载连接列表
      await get().loadConnections();
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建连接失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 更新连接
  updateConnection: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.connection.update(id, updates);
      // 重新加载连接列表
      await get().loadConnections();
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新连接失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 删除连接
  deleteConnection: async (id) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.connection.delete(id);
      // 重新加载连接列表
      await get().loadConnections();
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除连接失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 测试连接
  testConnection: async (config) => {
    try {
      const result = await window.kafkaApi.connection.test(config);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : '测试连接失败';
      throw new Error(message);
    }
  },

  // 连接到Kafka
  connectToKafka: async (id) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.connection.connect(id);
      set({ activeConnectionId: id, loading: false });
      // 重新加载连接列表以更新状态
      await get().loadConnections();
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 断开连接
  disconnectFromKafka: async (id) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.connection.disconnect(id);
      if (get().activeConnectionId === id) {
        set({ activeConnectionId: null });
      }
      set({ loading: false });
      // 重新加载连接列表以更新状态
      await get().loadConnections();
    } catch (error) {
      const message = error instanceof Error ? error.message : '断开连接失败';
      set({ error: message, loading: false });
      throw error;
    }
  },
}));
