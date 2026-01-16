/**
 * 应用设置存储服务
 * 使用 electron-store 实现用户偏好设置持久化
 */

import Store from 'electron-store';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US';

/**
 * 设置数据结构
 */
interface SettingsSchema {
  // 界面设置
  theme: Theme;
  language: Language;
  fontSize: number;

  // 行为设置
  defaultConsumeStrategy: 'latest' | 'earliest';
  messageFormat: 'json' | 'text';
  maxMessages: number;
  autoReconnect: boolean;

  // 窗口状态
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    isMaximized: boolean;
  };
}

/**
 * 设置存储类
 */
class SettingsStore {
  private store: Store<SettingsSchema>;

  constructor() {
    this.store = new Store<SettingsSchema>({
      name: 'settings',
      defaults: {
        // 界面设置默认值
        theme: 'auto',
        language: 'zh-CN',
        fontSize: 14,

        // 行为设置默认值
        defaultConsumeStrategy: 'latest',
        messageFormat: 'json',
        maxMessages: 1000,
        autoReconnect: true,

        // 窗口状态默认值
        windowState: {
          width: 1200,
          height: 800,
          isMaximized: false,
        },
      },
    });
  }

  /**
   * 获取所有设置
   */
  getAllSettings(): SettingsSchema {
    return this.store.store;
  }

  /**
   * 获取主题
   */
  getTheme(): Theme {
    return this.store.get('theme');
  }

  /**
   * 设置主题
   */
  setTheme(theme: Theme): void {
    this.store.set('theme', theme);
  }

  /**
   * 获取语言
   */
  getLanguage(): Language {
    return this.store.get('language');
  }

  /**
   * 设置语言
   */
  setLanguage(language: Language): void {
    this.store.set('language', language);
  }

  /**
   * 获取字体大小
   */
  getFontSize(): number {
    return this.store.get('fontSize');
  }

  /**
   * 设置字体大小
   */
  setFontSize(size: number): void {
    this.store.set('fontSize', size);
  }

  /**
   * 获取窗口状态
   */
  getWindowState(): SettingsSchema['windowState'] {
    return this.store.get('windowState');
  }

  /**
   * 保存窗口状态
   */
  saveWindowState(state: Partial<SettingsSchema['windowState']>): void {
    const currentState = this.getWindowState();
    this.store.set('windowState', { ...currentState, ...state });
  }

  /**
   * 更新设置（批量）
   */
  updateSettings(settings: Partial<SettingsSchema>): void {
    Object.keys(settings).forEach((key) => {
      const value = settings[key as keyof SettingsSchema];
      if (value !== undefined) {
        this.store.set(key as keyof SettingsSchema, value as never);
      }
    });
  }

  /**
   * 重置为默认设置
   */
  reset(): void {
    this.store.clear();
  }
}

// 导出单例
export const settingsStore = new SettingsStore();
