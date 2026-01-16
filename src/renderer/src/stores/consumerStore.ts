/**
 * 消费者状态store
 */

import { create } from 'zustand';
import type { ConsumerMessage, ConsumeOptions, ConsumerSession } from '../../../common/types/message';

interface ConsumerStore {
  // 状态
  messages: ConsumerMessage[];
  currentSession: ConsumerSession | null;
  consuming: boolean;
  error: string | null;

  // 操作方法
  setMessages: (messages: ConsumerMessage[]) => void;
  addMessage: (message: ConsumerMessage) => void;
  clearMessages: () => void;
  setCurrentSession: (session: ConsumerSession | null) => void;
  setConsuming: (consuming: boolean) => void;
  setError: (error: string | null) => void;

  // 业务方法
  startConsuming: (connectionId: string, options: ConsumeOptions) => Promise<ConsumerSession>;
  pauseConsuming: () => Promise<void>;
  resumeConsuming: () => Promise<void>;
  stopConsuming: () => Promise<void>;
}

export const useConsumerStore = create<ConsumerStore>((set, get) => ({
  // 初始状态
  messages: [],
  currentSession: null,
  consuming: false,
  error: null,

  // 基础操作
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => {
    const currentMessages = get().messages;
    // 限制消息数量，最多保留1000条
    const newMessages = [...currentMessages, message];
    if (newMessages.length > 1000) {
      newMessages.shift(); // 移除最旧的消息
    }
    set({ messages: newMessages });
  },

  clearMessages: () => set({ messages: [] }),
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  setConsuming: (consuming) => set({ consuming }),
  
  setError: (error) => set({ error }),

  // 开始消费
  startConsuming: async (connectionId: string, options: ConsumeOptions) => {
    set({ consuming: true, error: null, messages: [] });
    try {
      const result = await window.kafkaApi.consumer.start(connectionId, options);
      set({ currentSession: result.session, consuming: true });
      return result.session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '开始消费失败';
      set({ error: errorMessage, consuming: false });
      throw error;
    }
  },

  // 暂停消费
  pauseConsuming: async () => {
    const session = get().currentSession;
    if (!session) {
      throw new Error('没有活跃的消费会话');
    }

    try {
      await window.kafkaApi.consumer.pause(session.id);
      set({
        currentSession: { ...session, status: 'paused' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '暂停消费失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  // 恢复消费
  resumeConsuming: async () => {
    const session = get().currentSession;
    if (!session) {
      throw new Error('没有活跃的消费会话');
    }

    try {
      await window.kafkaApi.consumer.resume(session.id);
      set({
        currentSession: { ...session, status: 'running' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '恢复消费失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  // 停止消费
  stopConsuming: async () => {
    const session = get().currentSession;
    if (!session) {
      return;
    }

    try {
      await window.kafkaApi.consumer.stop(session.id);
      set({
        currentSession: null,
        consuming: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '停止消费失败';
      set({ error: errorMessage });
      throw error;
    }
  },
}));
