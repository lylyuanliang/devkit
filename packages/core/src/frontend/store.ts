import { create } from 'zustand';
import { ToolConfig, ToolStatus } from '@devkit/shared';
import { themeRegistry } from './styles/themes';

export type ThemeName = string;

export interface Tab {
  id: string;
  toolId: string;
  toolName: string;
}

export interface AppState {
  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Tools
  availableTools: ToolConfig[];
  setAvailableTools: (tools: ToolConfig[]) => void;

  // Recent tools
  recentTools: string[];
  setRecentTools: (tools: string[]) => void;

  // Tool status
  toolStatus: Record<string, ToolStatus>;
  setToolStatus: (toolId: string, status: ToolStatus) => void;

  // Theme
  currentTheme: ThemeName;
  availableThemes: ThemeName[];
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
  getAvailableThemes: () => ThemeName[];
}

export const useAppStore = create<AppState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    })),
  removeTab: (tabId) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const newActiveTabId =
        state.activeTabId === tabId ? newTabs[newTabs.length - 1]?.id || null : state.activeTabId;
      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }),
  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  availableTools: [],
  setAvailableTools: (tools) => set({ availableTools: tools }),

  recentTools: [],
  setRecentTools: (tools) => set({ recentTools: tools }),

  toolStatus: {},
  setToolStatus: (toolId, status) =>
    set((state) => ({
      toolStatus: { ...state.toolStatus, [toolId]: status },
    })),

  currentTheme: 'light',
  availableThemes: themeRegistry.getIds(),
  setTheme: (themeName) => set({ currentTheme: themeName }),
  toggleTheme: () =>
    set((state) => {
      const themes = state.availableThemes;
      const currentIndex = themes.indexOf(state.currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      return { currentTheme: themes[nextIndex] };
    }),
  getAvailableThemes: () => themeRegistry.getIds(),
}));
