import { create } from 'zustand';
import { KafkaClusterConfig, KafkaMessage } from './types';

export interface KafkaToolState {
  // Cluster state
  selectedClusterId: string | null;
  clusters: Map<string, KafkaClusterConfig>;
  setSelectedCluster: (clusterId: string) => void;
  setClusters: (clusters: KafkaClusterConfig[]) => void;
  addCluster: (cluster: KafkaClusterConfig) => void;
  removeCluster: (clusterId: string) => void;

  // Topic state
  topics: string[];
  setTopics: (topics: string[]) => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string) => void;

  // Message state
  messages: KafkaMessage[];
  addMessage: (message: KafkaMessage) => void;
  clearMessages: () => void;
  setMessages: (messages: KafkaMessage[]) => void;

  // Consumer group state
  consumerGroups: string[];
  setConsumerGroups: (groups: string[]) => void;
  selectedGroup: string | null;
  setSelectedGroup: (group: string) => void;

  // UI state
  activeTab: 'clusters' | 'topics' | 'produce' | 'consume' | 'groups' | 'monitoring';
  setActiveTab: (tab: KafkaToolState['activeTab']) => void;
  showClusterForm: boolean;
  setShowClusterForm: (show: boolean) => void;
  showTopicForm: boolean;
  setShowTopicForm: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useKafkaToolStore = create<KafkaToolState>((set) => ({
  // Cluster state
  selectedClusterId: null,
  clusters: new Map(),
  setSelectedCluster: (clusterId) => set({ selectedClusterId: clusterId }),
  setClusters: (clusters) =>
    set({
      clusters: new Map(clusters.map((c) => [c.id, c])),
    }),
  addCluster: (cluster) =>
    set((state) => {
      const newClusters = new Map(state.clusters);
      newClusters.set(cluster.id, cluster);
      return { clusters: newClusters };
    }),
  removeCluster: (clusterId) =>
    set((state) => {
      const newClusters = new Map(state.clusters);
      newClusters.delete(clusterId);
      return { clusters: newClusters };
    }),

  // Topic state
  topics: [],
  setTopics: (topics) => set({ topics }),
  selectedTopic: null,
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),

  // Message state
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages) => set({ messages }),

  // Consumer group state
  consumerGroups: [],
  setConsumerGroups: (groups) => set({ consumerGroups: groups }),
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  // UI state
  activeTab: 'clusters',
  setActiveTab: (tab) => set({ activeTab: tab }),
  showClusterForm: false,
  setShowClusterForm: (show) => set({ showClusterForm: show }),
  showTopicForm: false,
  setShowTopicForm: (show) => set({ showTopicForm: show }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
