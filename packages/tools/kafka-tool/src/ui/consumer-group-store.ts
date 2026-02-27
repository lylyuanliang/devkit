import { create } from 'zustand';
import { ConsumerGroupInfo, ConsumerGroupOffset } from '../types';

/**
 * Task 1.1-1.4: Consumer Group Store
 * Manages state for consumer group details page:
 * - Selected consumer group
 * - Current tab (Overview, Progress, Monitoring)
 * - Loading/error states
 * - Lag history data (for chart rendering)
 */

export interface LagHistoryEntry {
  timestamp: number;
  topic: string;
  partition: number;
  lag: number;
  offset: number;
  leo: number; // Log End Offset
}

export interface LagMetricsData {
  topic: string;
  partition: number;
  currentOffset: number;
  logEndOffset: number;
  lag: number;
  timestamp: number;
}

export interface ConsumerGroupStoreState {
  // Selected group and info
  selectedGroupId: string | null;
  selectedGroupInfo: ConsumerGroupInfo | null;
  offsets: ConsumerGroupOffset[];

  // UI state
  currentTab: 'overview' | 'progress' | 'monitoring' | 'realtime';
  loading: boolean;
  error: string | null;

  // Lag history (max 180 entries = 30 minutes at 10-second intervals)
  lagHistory: LagHistoryEntry[];
  lagHistoryMaxSize: number; // = 180

  // Current lag metrics (for monitoring tab)
  currentLagMetrics: LagMetricsData[];
  lastLagUpdateTime: number | null;

  // Demo group tracking
  isDemoGroup: boolean;
  demoGroupCreatedAt: number | null;

  // Actions
  setSelectedGroup: (groupId: string | null) => void;
  setSelectedGroupInfo: (info: ConsumerGroupInfo | null) => void;
  setOffsets: (offsets: ConsumerGroupOffset[]) => void;
  setCurrentTab: (tab: 'overview' | 'progress' | 'monitoring' | 'realtime') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Lag history management
  addLagHistory: (entries: LagHistoryEntry[]) => void;
  clearLagHistory: () => void;
  getLagHistoryForPartition: (topic: string, partition: number) => LagHistoryEntry[];

  // Lag metrics management
  setCurrentLagMetrics: (metrics: LagMetricsData[]) => void;
  setLastLagUpdateTime: (time: number) => void;

  // Demo group management
  setIsDemoGroup: (isDemo: boolean, createdAt?: number) => void;

  // Clear all state for this group
  clearGroupState: () => void;
}

export const useConsumerGroupStore = create<ConsumerGroupStoreState>((set, get) => ({
  selectedGroupId: null,
  selectedGroupInfo: null,
  offsets: [],
  currentTab: 'overview',
  loading: false,
  error: null,
  lagHistory: [],
  lagHistoryMaxSize: 180,
  currentLagMetrics: [],
  lastLagUpdateTime: null,
  isDemoGroup: false,
  demoGroupCreatedAt: null,

  setSelectedGroup: (groupId: string | null) => {
    set({ selectedGroupId: groupId });
  },

  setSelectedGroupInfo: (info: ConsumerGroupInfo | null) => {
    set({ selectedGroupInfo: info });
  },

  setOffsets: (offsets: ConsumerGroupOffset[]) => {
    set({ offsets });
  },

  setCurrentTab: (tab: 'overview' | 'progress' | 'monitoring' | 'realtime') => {
    set({ currentTab: tab });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  addLagHistory: (entries: LagHistoryEntry[]) => {
    const current = get();
    const updated = [...current.lagHistory, ...entries];

    // Keep only the last N entries (max 180)
    if (updated.length > current.lagHistoryMaxSize) {
      const excess = updated.length - current.lagHistoryMaxSize;
      updated.splice(0, excess);
    }

    set({ lagHistory: updated });
  },

  clearLagHistory: () => {
    set({ lagHistory: [] });
  },

  getLagHistoryForPartition: (topic: string, partition: number) => {
    const current = get();
    return current.lagHistory.filter(
      (entry) => entry.topic === topic && entry.partition === partition
    );
  },

  setCurrentLagMetrics: (metrics: LagMetricsData[]) => {
    set({ currentLagMetrics: metrics });
  },

  setLastLagUpdateTime: (time: number) => {
    set({ lastLagUpdateTime: time });
  },

  setIsDemoGroup: (isDemo: boolean, createdAt?: number) => {
    set({
      isDemoGroup: isDemo,
      demoGroupCreatedAt: isDemo ? (createdAt || Date.now()) : null,
    });
  },

  clearGroupState: () => {
    set({
      selectedGroupId: null,
      selectedGroupInfo: null,
      offsets: [],
      currentTab: 'overview',
      loading: false,
      error: null,
      lagHistory: [],
      currentLagMetrics: [],
      lastLagUpdateTime: null,
      isDemoGroup: false,
      demoGroupCreatedAt: null,
    });
  },
}));

export default useConsumerGroupStore;
