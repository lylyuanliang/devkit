/**
 * 仪表盘 Store
 */

import { create } from 'zustand';
import type { ClusterInfo, Broker } from '../../../../common/types/kafka';

interface DashboardStatistics {
  connectionCount: number;
  topicCount: number;
  consumerGroupCount: number;
  brokerCount: number;
}

interface DashboardState {
  // 状态
  statistics: DashboardStatistics;
  clusterInfo: ClusterInfo | null;
  brokers: Broker[];
  loading: boolean;
  error: string | null;

  // 操作方法
  loadStatistics: (connectionId: string) => Promise<void>;
  loadClusterInfo: (connectionId: string) => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // 初始状态
  statistics: {
    connectionCount: 0,
    topicCount: 0,
    consumerGroupCount: 0,
    brokerCount: 0,
  },
  clusterInfo: null,
  brokers: [],
  loading: false,
  error: null,

  // 加载统计数据
  loadStatistics: async (connectionId: string, connectionCount: number = 0) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    if (!connectionId) {
      // 如果没有活动连接，重置统计数据
      set({
        statistics: {
          connectionCount,
          topicCount: 0,
          consumerGroupCount: 0,
          brokerCount: 0,
        },
        clusterInfo: null,
        brokers: [],
        loading: false,
      });
      return;
    }

    set({ loading: true, error: null });

    try {
      // 并行获取所有统计数据
      const [topics, consumerGroups, clusterInfo] = await Promise.all([
        window.kafkaApi.topic.list(connectionId).catch(() => []),
        window.kafkaApi.consumerGroup.list(connectionId).catch(() => []),
        window.kafkaApi.cluster.getInfo(connectionId).catch(() => null),
      ]);

      set({
        statistics: {
          connectionCount,
          topicCount: topics.length,
          consumerGroupCount: consumerGroups.length,
          brokerCount: clusterInfo?.brokers?.length || 0,
        },
        clusterInfo,
        brokers: clusterInfo?.brokers || [],
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载统计数据失败';
      set({ error: errorMessage, loading: false });
    }
  },

  // 加载集群信息
  loadClusterInfo: async (connectionId: string) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const clusterInfo = await window.kafkaApi.cluster.getInfo(connectionId);
      set({
        clusterInfo,
        brokers: clusterInfo.brokers || [],
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载集群信息失败';
      set({ error: errorMessage, loading: false });
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));
