import { invoke } from '@tauri-apps/api/tauri';
import { ToolConfig, ToolStatus } from '@devkit/shared';

export const apiClient = {
  async getAvailableTools(): Promise<ToolConfig[]> {
    return invoke('get_available_tools');
  },

  async openTool(toolId: string, config?: any): Promise<void> {
    return invoke('open_tool', { toolId, config });
  },

  async closeTool(toolId: string): Promise<void> {
    return invoke('close_tool', { toolId });
  },

  async getToolStatus(toolId: string): Promise<ToolStatus> {
    return invoke('get_tool_status', { toolId });
  },

  async updateToolConfig(toolId: string, config: any): Promise<void> {
    return invoke('update_tool_config', { toolId, config });
  },

  async getAppState(): Promise<any> {
    return invoke('get_app_state');
  },

  async saveAppState(state: any): Promise<void> {
    return invoke('save_app_state', { state });
  },
};
