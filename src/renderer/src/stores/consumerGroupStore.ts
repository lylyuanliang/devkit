/**
 * 消费组管理 Store
 */

import { create } from 'zustand';
import type {
  ConsumerGroup,
  ConsumerGroupDetail,
  OffsetResetConfig,
} from '../../../../common/types/consumerGroup';

interface ConsumerGroupState {
  // 状态
  groups: ConsumerGroup[];
  currentGroupDetail: ConsumerGroupDetail | null;
  loading: boolean;
  error: string | null;

  // 操作方法
  loadGroups: (connectionId: string) => Promise<void>;
  loadGroupDetail: (connectionId: string, groupId: string) => Promise<void>;
  resetOffset: (connectionId: string, config: OffsetResetConfig) => Promise<void>;
  deleteGroup: (connectionId: string, groupId: string) => Promise<void>;
  clearError: () => void;
}

export const useConsumerGroupStore = create<ConsumerGroupState>((set) => ({
  // 初始状态
  groups: [],
  currentGroupDetail: null,
  loading: false,
  error: null,

  // 加载消费组列表
  loadGroups: async (connectionId: string) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const groups = await window.kafkaApi.consumerGroup.list(connectionId);
      set({ groups, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载消费组列表失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 加载消费组详情
  loadGroupDetail: async (connectionId: string, groupId: string) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const detail = await window.kafkaApi.consumerGroup.detail(connectionId, groupId);
      set({ currentGroupDetail: detail, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载消费组详情失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 重置Offset
  resetOffset: async (connectionId: string, config: OffsetResetConfig) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      await window.kafkaApi.consumerGroup.resetOffset(connectionId, config);
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重置Offset失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 删除消费组
  deleteGroup: async (connectionId: string, groupId: string) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      await window.kafkaApi.consumerGroup.delete(connectionId, groupId);
      // 从列表中移除
      set((state) => ({
        groups: state.groups.filter((g) => g.groupId !== groupId),
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除消费组失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));
