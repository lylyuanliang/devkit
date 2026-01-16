/**
 * 生产者状态store
 */

import { create } from 'zustand';
import type { ProducerMessage } from '../../../common/types/message';

interface ProducerStore {
  // 状态
  sending: boolean;
  lastSentMessage: ProducerMessage | null;
  error: string | null;

  // 操作方法
  setSending: (sending: boolean) => void;
  setLastSentMessage: (message: ProducerMessage | null) => void;
  setError: (error: string | null) => void;

  // 业务方法
  sendMessage: (connectionId: string, message: ProducerMessage) => Promise<any>;
  sendBatchMessages: (connectionId: string, messages: ProducerMessage[]) => Promise<any>;
}

export const useProducerStore = create<ProducerStore>((set) => ({
  // 初始状态
  sending: false,
  lastSentMessage: null,
  error: null,

  // 基础操作
  setSending: (sending) => set({ sending }),
  setLastSentMessage: (message) => set({ lastSentMessage: message }),
  setError: (error) => set({ error }),

  // 发送单条消息
  sendMessage: async (connectionId: string, message: ProducerMessage) => {
    set({ sending: true, error: null });
    try {
      const result = await window.kafkaApi.producer.send(connectionId, message);
      set({ sending: false, lastSentMessage: message });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      set({ error: errorMessage, sending: false });
      throw error;
    }
  },

  // 批量发送消息
  sendBatchMessages: async (connectionId: string, messages: ProducerMessage[]) => {
    set({ sending: true, error: null });
    try {
      const result = await window.kafkaApi.producer.sendBatch(connectionId, messages);
      set({ sending: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量发送失败';
      set({ error: errorMessage, sending: false });
      throw error;
    }
  },
}));
