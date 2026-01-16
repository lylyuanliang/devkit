/**
 * 主题管理状态store
 */

import { create } from 'zustand';
import type { Topic, TopicDetail, CreateTopicConfig } from '../../../common/types/kafka';

interface TopicStore {
  // 状态
  topics: Topic[];
  currentTopic: TopicDetail | null;
  loading: boolean;
  error: string | null;

  // 操作方法
  setTopics: (topics: Topic[]) => void;
  setCurrentTopic: (topic: TopicDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 业务方法
  loadTopics: (connectionId: string) => Promise<void>;
  loadTopicDetail: (connectionId: string, topicName: string) => Promise<void>;
  createTopic: (connectionId: string, config: CreateTopicConfig) => Promise<void>;
  deleteTopic: (connectionId: string, topicName: string) => Promise<void>;
  updateTopicConfig: (connectionId: string, topicName: string, configs: Record<string, string>) => Promise<void>;
  addPartitions: (connectionId: string, topicName: string, count: number) => Promise<void>;
}

export const useTopicStore = create<TopicStore>((set, get) => ({
  // 初始状态
  topics: [],
  currentTopic: null,
  loading: false,
  error: null,

  // 基础操作
  setTopics: (topics) => set({ topics }),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 加载主题列表
  loadTopics: async (connectionId: string) => {
    set({ loading: true, error: null });
    try {
      const topics = await window.kafkaApi.topic.list(connectionId);
      set({ topics, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载主题列表失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 加载主题详情
  loadTopicDetail: async (connectionId: string, topicName: string) => {
    set({ loading: true, error: null });
    try {
      const detail = await window.kafkaApi.topic.detail(connectionId, topicName);
      set({ currentTopic: detail, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载主题详情失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 创建主题
  createTopic: async (connectionId: string, config: CreateTopicConfig) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.topic.create(connectionId, config);
      // 重新加载主题列表
      await get().loadTopics(connectionId);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建主题失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 删除主题
  deleteTopic: async (connectionId: string, topicName: string) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.topic.delete(connectionId, topicName);
      // 重新加载主题列表
      await get().loadTopics(connectionId);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除主题失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 更新主题配置
  updateTopicConfig: async (connectionId: string, topicName: string, configs: Record<string, string>) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.topic.updateConfig(connectionId, topicName, configs);
      // 重新加载主题详情
      await get().loadTopicDetail(connectionId, topicName);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新主题配置失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // 增加分区
  addPartitions: async (connectionId: string, topicName: string, count: number) => {
    set({ loading: true, error: null });
    try {
      await window.kafkaApi.topic.addPartitions(connectionId, topicName, count);
      // 重新加载主题详情
      await get().loadTopicDetail(connectionId, topicName);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '增加分区失败';
      set({ error: message, loading: false });
      throw error;
    }
  },
}));
