/**
 * 设置 Store
 */

import { create } from 'zustand';
import { message } from 'antd';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'zh-CN' | 'en-US';

export interface AppSettings {
  // 界面设置
  theme: Theme;
  language: Language;
  fontSize: number;

  // 行为设置
  defaultConsumeStrategy: 'latest' | 'earliest';
  messageFormat: 'json' | 'text';
  maxMessages: number;
  autoReconnect: boolean;
}

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;

  // 操作方法
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  clearError: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'zh-CN',
  fontSize: 14,
  defaultConsumeStrategy: 'latest',
  messageFormat: 'json',
  maxMessages: 1000,
  autoReconnect: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // 初始状态
  settings: null,
  loading: false,
  error: null,

  // 加载设置
  loadSettings: async () => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化', settings: defaultSettings });
      return;
    }

    set({ loading: true, error: null });

    try {
      const settings = await window.kafkaApi.settings.get();
      set({ settings: settings as AppSettings, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载设置失败';
      set({ error: errorMessage, settings: defaultSettings, loading: false });
      message.error('加载设置失败: ' + errorMessage);
    }
  },

  // 更新设置
  updateSettings: async (newSettings: Partial<AppSettings>) => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      await window.kafkaApi.settings.set(newSettings);
      const currentSettings = get().settings || defaultSettings;
      const updatedSettings = { ...currentSettings, ...newSettings };
      set({ settings: updatedSettings, loading: false });
      message.success('设置已保存');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存设置失败';
      set({ error: errorMessage, loading: false });
      message.error('保存设置失败: ' + errorMessage);
    }
  },

  // 重置设置
  resetSettings: async () => {
    if (!window.kafkaApi) {
      set({ error: 'Kafka API 未初始化' });
      return;
    }

    set({ loading: true, error: null });

    try {
      await window.kafkaApi.settings.set(defaultSettings);
      set({ settings: defaultSettings, loading: false });
      message.success('设置已重置为默认值');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重置设置失败';
      set({ error: errorMessage, loading: false });
      message.error('重置设置失败: ' + errorMessage);
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));
