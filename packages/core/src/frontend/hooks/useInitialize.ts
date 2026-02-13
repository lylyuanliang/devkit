import { useEffect } from 'react';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { usePersistence } from './usePersistence';

export const useInitialize = () => {
  const setAvailableTools = useAppStore((state) => state.setAvailableTools);
  const setRecentTools = useAppStore((state) => state.setRecentTools);
  const { loadSidebarState, loadTabState, loadRecentTools } = usePersistence();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load tools
        const tools = await apiClient.getAvailableTools();
        setAvailableTools(tools);

        // Load persisted state
        const sidebarCollapsed = loadSidebarState();
        const { tabs, activeTabId } = loadTabState();
        const recentTools = loadRecentTools();

        setRecentTools(recentTools);

        // Restore tabs if any
        if (tabs.length > 0) {
          tabs.forEach((tab: any) => {
            useAppStore.setState((state) => ({
              tabs: [...state.tabs, tab],
            }));
          });
          if (activeTabId) {
            useAppStore.setState({ activeTabId });
          }
        }

        // Restore sidebar state
        if (sidebarCollapsed) {
          useAppStore.setState({ sidebarCollapsed });
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, []);
};
