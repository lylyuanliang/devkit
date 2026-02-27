import { create } from 'zustand';
import { TopicInfo } from '../types';

/**
 * Topic Management Store
 * Manages state for topic list, creation, deletion, and UI feedback
 */

interface TopicManagementState {
  // Topic list state
  topics: TopicInfo[];
  loading: boolean;
  error: string | null;
  searchQuery: string;

  // Modal state
  showCreateForm: boolean;
  showDeleteConfirm: boolean;
  selectedTopicForDelete: string | null;

  // Notification state
  notification: {
    type: 'success' | 'error' | null;
    message: string;
  };

  // Actions
  setTopics: (topics: TopicInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Modal actions
  openCreateForm: () => void;
  closeCreateForm: () => void;
  openDeleteConfirm: (topicName: string) => void;
  closeDeleteConfirm: () => void;

  // Notification actions
  showNotification: (type: 'success' | 'error', message: string) => void;
  clearNotification: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  topics: [],
  loading: false,
  error: null,
  searchQuery: '',
  showCreateForm: false,
  showDeleteConfirm: false,
  selectedTopicForDelete: null,
  notification: {
    type: null as const,
    message: '',
  },
};

export const useTopicStore = create<TopicManagementState>((set) => ({
  ...initialState,

  setTopics: (topics) => set({ topics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openCreateForm: () => set({ showCreateForm: true }),
  closeCreateForm: () => set({ showCreateForm: false }),

  openDeleteConfirm: (topicName) =>
    set({ showDeleteConfirm: true, selectedTopicForDelete: topicName }),
  closeDeleteConfirm: () =>
    set({ showDeleteConfirm: false, selectedTopicForDelete: null }),

  showNotification: (type, message) =>
    set({ notification: { type, message } }),
  clearNotification: () =>
    set({ notification: { type: null, message: '' } }),

  reset: () => set(initialState),
}));

export default useTopicStore;
