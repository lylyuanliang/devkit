import { create } from 'zustand';

/**
 * Workspace State Store (Task 7.1-7.5)
 * 跨环境保留工作区状态：打开的主题、消费者组、查询历史、滚动位置、过滤器等
 */

interface WorkspaceStatePerEnv {
  environment: string;
  openedTopics: string[];
  selectedTopic: string | null;
  consumerGroups: string[];
  selectedConsumerGroup: string | null;
  queryHistory: Array<{ query: string; timestamp: number }>;
  scrollPositions: Record<string, number>;
  filters: Record<string, any>;
  uiPreferences: {
    sidebarWidth?: number;
    viewMode?: 'list' | 'table' | 'tree';
  };
  timestamp: number;
}

interface WorkspaceStore {
  // State per environment
  envStates: Map<string, WorkspaceStatePerEnv>;
  currentEnvironment: string | null;

  // Actions
  setCurrentEnvironment: (env: string) => void;
  getEnvironmentState: (env: string) => WorkspaceStatePerEnv | undefined;
  updateEnvironmentState: (env: string, state: Partial<WorkspaceStatePerEnv>) => void;

  // Topic management
  addOpenedTopic: (env: string, topic: string) => void;
  removeOpenedTopic: (env: string, topic: string) => void;
  setSelectedTopic: (env: string, topic: string | null) => void;

  // Consumer groups
  updateConsumerGroups: (env: string, groups: string[]) => void;
  setSelectedConsumerGroup: (env: string, group: string | null) => void;

  // Query history
  addToQueryHistory: (env: string, query: string) => void;
  getQueryHistory: (env: string) => Array<{ query: string; timestamp: number }>;

  // Filters
  setFilter: (env: string, key: string, value: any) => void;
  getFilter: (env: string, key: string) => any;

  // Scroll position
  setScrollPosition: (env: string, key: string, position: number) => void;
  getScrollPosition: (env: string, key: string) => number;

  // UI preferences
  updateUIPreferences: (env: string, prefs: any) => void;

  // Cleanup
  clearEnvironmentState: (env: string) => void;
  clearAllState: () => void;
}

const createInitialState = (env: string): WorkspaceStatePerEnv => ({
  environment: env,
  openedTopics: [],
  selectedTopic: null,
  consumerGroups: [],
  selectedConsumerGroup: null,
  queryHistory: [],
  scrollPositions: {},
  filters: {},
  uiPreferences: {
    viewMode: 'list',
  },
  timestamp: Date.now(),
});

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  envStates: new Map(),
  currentEnvironment: null,

  setCurrentEnvironment: (env: string) => {
    set({ currentEnvironment: env });
    // Initialize state if first time
    const state = get().envStates.get(env);
    if (!state) {
      const newState = new Map(get().envStates);
      newState.set(env, createInitialState(env));
      set({ envStates: newState });
    }
  },

  getEnvironmentState: (env: string) => {
    const state = get().envStates.get(env);
    if (!state) {
      const newState = new Map(get().envStates);
      newState.set(env, createInitialState(env));
      set({ envStates: newState });
      return newState.get(env);
    }
    return state;
  },

  updateEnvironmentState: (env: string, updates: Partial<WorkspaceStatePerEnv>) => {
    const current = get().getEnvironmentState(env) || createInitialState(env);
    const updated = { ...current, ...updates, timestamp: Date.now() };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  addOpenedTopic: (env: string, topic: string) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    if (!state.openedTopics.includes(topic)) {
      const updated = {
        ...state,
        openedTopics: [...state.openedTopics, topic],
        timestamp: Date.now(),
      };

      const newState = new Map(get().envStates);
      newState.set(env, updated);
      set({ envStates: newState });
    }
  },

  removeOpenedTopic: (env: string, topic: string) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    const updated = {
      ...state,
      openedTopics: state.openedTopics.filter(t => t !== topic),
      timestamp: Date.now(),
    };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  setSelectedTopic: (env: string, topic: string | null) => {
    get().updateEnvironmentState(env, { selectedTopic: topic });
  },

  updateConsumerGroups: (env: string, groups: string[]) => {
    get().updateEnvironmentState(env, { consumerGroups: groups });
  },

  setSelectedConsumerGroup: (env: string, group: string | null) => {
    get().updateEnvironmentState(env, { selectedConsumerGroup: group });
  },

  addToQueryHistory: (env: string, query: string) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    const updated = {
      ...state,
      queryHistory: [
        { query, timestamp: Date.now() },
        ...state.queryHistory.slice(0, 49), // Keep last 50
      ],
      timestamp: Date.now(),
    };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  getQueryHistory: (env: string) => {
    return (get().getEnvironmentState(env) || createInitialState(env)).queryHistory;
  },

  setFilter: (env: string, key: string, value: any) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    const updated = {
      ...state,
      filters: { ...state.filters, [key]: value },
      timestamp: Date.now(),
    };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  getFilter: (env: string, key: string) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    return state.filters[key];
  },

  setScrollPosition: (env: string, key: string, position: number) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    const updated = {
      ...state,
      scrollPositions: { ...state.scrollPositions, [key]: position },
      timestamp: Date.now(),
    };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  getScrollPosition: (env: string, key: string) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    return state.scrollPositions[key] || 0;
  },

  updateUIPreferences: (env: string, prefs: any) => {
    const state = get().getEnvironmentState(env) || createInitialState(env);
    const updated = {
      ...state,
      uiPreferences: { ...state.uiPreferences, ...prefs },
      timestamp: Date.now(),
    };

    const newState = new Map(get().envStates);
    newState.set(env, updated);
    set({ envStates: newState });
  },

  clearEnvironmentState: (env: string) => {
    const newState = new Map(get().envStates);
    newState.delete(env);
    set({ envStates: newState });
  },

  clearAllState: () => {
    set({ envStates: new Map(), currentEnvironment: null });
  },
}));

export default useWorkspaceStore;
