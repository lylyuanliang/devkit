import { ToolConfig, ToolStatus } from '@devkit/shared';
import { ConsumerGroup, ConsumerGroupDetails, PartitionOffset, ResetOffsetsRequest } from '../../types/consumer-groups';

// 通过 window.__TAURI__ 访问 invoke，避免 import 问题
const getInvoke = () => {
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    return (window as any).__TAURI__.invoke;
  }
  return null;
};

export const apiClient = {
  async getAvailableTools(): Promise<ToolConfig[]> {
    const invoke = getInvoke();
    if (!invoke) {
      // 开发环境降级方案
      return [
        {
          id: 'kafka-tool',
          name: 'Kafka Client',
          category: 'Data Streaming',
          icon: '🔄',
          version: '0.1.0',
        } as any,
      ];
    }
    return invoke('get_available_tools');
  },

  async openTool(toolId: string, config?: any): Promise<void> {
    const invoke = getInvoke();
    if (!invoke) return Promise.resolve();
    return invoke('open_tool', { toolId, config });
  },

  async closeTool(toolId: string): Promise<void> {
    const invoke = getInvoke();
    if (!invoke) return Promise.resolve();
    return invoke('close_tool', { toolId });
  },

  async getToolStatus(toolId: string): Promise<ToolStatus> {
    const invoke = getInvoke();
    if (!invoke) return 'disconnected';
    return invoke('get_tool_status', { toolId });
  },

  async updateToolConfig(toolId: string, config: any): Promise<void> {
    const invoke = getInvoke();
    if (!invoke) return Promise.resolve();
    return invoke('update_tool_config', { toolId, config });
  },

  async getAppState(): Promise<any> {
    const invoke = getInvoke();
    if (!invoke) return {};
    return invoke('get_app_state');
  },

  async saveAppState(state: any): Promise<void> {
    const invoke = getInvoke();
    if (!invoke) return Promise.resolve();
    return invoke('save_app_state', { state });
  },

  // Consumer Groups API
  async listConsumerGroups(clusterId: string): Promise<ConsumerGroup[]> {
    const invoke = getInvoke();
    if (!invoke) return [];
    return invoke('kafka_list_consumer_groups', { cluster_id: clusterId });
  },

  async getConsumerGroupDetails(clusterId: string, groupId: string): Promise<ConsumerGroupDetails> {
    const invoke = getInvoke();
    if (!invoke) throw new Error('Tauri not available');
    return invoke('kafka_get_consumer_group_details', { cluster_id: clusterId, group_id: groupId });
  },

  async getConsumerGroupLag(clusterId: string, groupId: string): Promise<PartitionOffset[]> {
    const invoke = getInvoke();
    if (!invoke) return [];
    return invoke('kafka_get_consumer_group_lag', { cluster_id: clusterId, group_id: groupId });
  },

  async deleteConsumerGroup(clusterId: string, groupId: string): Promise<void> {
    const invoke = getInvoke();
    if (!invoke) return Promise.resolve();
    return invoke('kafka_delete_consumer_group', { cluster_id: clusterId, group_id: groupId });
  },

  async resetConsumerGroupOffsets(clusterId: string, request: ResetOffsetsRequest): Promise<PartitionOffset[]> {
    const invoke = getInvoke();
    if (!invoke) return [];
    return invoke('kafka_reset_consumer_group_offsets', { cluster_id: clusterId, request });
  },
};
