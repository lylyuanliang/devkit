/**
 * 导航标签页状态store
 */

import { create } from 'zustand';

export interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

interface NavigationStore {
  tabs: TabItem[];
  activeTab: string;
  addTab: (tab: TabItem) => void;
  removeTab: (key: string) => void;
  setActiveTab: (key: string) => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  tabs: [{ key: '/dashboard', label: '仪表盘', closable: false }], // 仪表盘默认打开且不可关闭
  activeTab: '/dashboard',

  addTab: (tab: TabItem) => {
    set((state) => {
      const exists = state.tabs.find((t) => t.key === tab.key);
      if (!exists) {
        return {
          tabs: [...state.tabs, tab],
          activeTab: tab.key,
        };
      }
      return { activeTab: tab.key };
    });
  },

  removeTab: (key: string) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.key !== key);
      
      // 如果关闭的是当前标签，切换到最后一个标签
      let newActiveTab = state.activeTab;
      if (key === state.activeTab && newTabs.length > 0) {
        newActiveTab = newTabs[newTabs.length - 1].key;
      }
      
      return {
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    });
  },

  setActiveTab: (key: string) => set({ activeTab: key }),
}));
