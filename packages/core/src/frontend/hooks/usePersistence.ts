import { useAppStore } from '../store';

export const usePersistence = () => {
  const saveSidebarState = (collapsed: boolean) => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  };

  const loadSidebarState = (): boolean => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  };

  const saveTabState = (tabs: any[], activeTabId: string | null) => {
    localStorage.setItem('tabs', JSON.stringify(tabs));
    localStorage.setItem('active-tab', JSON.stringify(activeTabId));
  };

  const loadTabState = (): { tabs: any[]; activeTabId: string | null } => {
    const tabs = localStorage.getItem('tabs');
    const activeTabId = localStorage.getItem('active-tab');
    return {
      tabs: tabs ? JSON.parse(tabs) : [],
      activeTabId: activeTabId ? JSON.parse(activeTabId) : null,
    };
  };

  const saveWindowState = (width: number, height: number) => {
    localStorage.setItem('window-size', JSON.stringify({ width, height }));
  };

  const loadWindowState = (): { width: number; height: number } | null => {
    const saved = localStorage.getItem('window-size');
    return saved ? JSON.parse(saved) : null;
  };

  const saveRecentTools = (tools: string[]) => {
    localStorage.setItem('recent-tools', JSON.stringify(tools));
  };

  const loadRecentTools = (): string[] => {
    const saved = localStorage.getItem('recent-tools');
    return saved ? JSON.parse(saved) : [];
  };

  return {
    saveSidebarState,
    loadSidebarState,
    saveTabState,
    loadTabState,
    saveWindowState,
    loadWindowState,
    saveRecentTools,
    loadRecentTools,
  };
};
