import { KafkaMessage } from '../types';

/**
 * Frontend API wrapper for Kafka service calls via Tauri IPC
 * This module provides a simple interface for the React component
 * to communicate with the Kafka backend services running in Node.js
 */

export interface ProduceMessageRequest {
  topic: string;
  value: string;
  key?: string | null;
  partition?: number;
}

export interface ProduceMessageResponse {
  partition: number;
  offset: string;
  timestamp: string;
}

export interface ConsumeMessagesRequest {
  topic: string;
  partition?: number;
  startOffset?: number;
  limit?: number;
  fromBeginning?: boolean;
}

export interface ConsumeMessagesResponse {
  messages: KafkaMessage[];
  totalMessages: number;
  hasMore: boolean;
}

export interface SearchMessagesRequest {
  messages: KafkaMessage[];
  keyFilter?: string;
  contentFilter?: string;
}

export class KafkaAPI {
  /**
   * Connect to a Kafka cluster via Tauri IPC
   */
  static async connectCluster(clusterId: string, brokers: string[]): Promise<void> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('kafka_connect', { clusterId, brokers });
    } catch (error) {
      throw new Error(`Failed to connect to cluster: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from a Kafka cluster via Tauri IPC
   */
  static async disconnectCluster(clusterId: string): Promise<void> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('kafka_disconnect', { clusterId });
    } catch (error) {
      console.error(`Error disconnecting cluster: ${error}`);
    }
  }

  /**
   * Produce a message to a Kafka topic via Tauri IPC
   */
  static async produceMessage(clusterId: string, request: ProduceMessageRequest): Promise<ProduceMessageResponse> {
    try {
      // Validate input
      if (!request.topic || !request.value) {
        throw new Error('Topic and value are required');
      }

      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<ProduceMessageResponse>('kafka_produce_message', {
        clusterId,
        request: {
          topic: request.topic,
          value: request.value,
          key: request.key || null,
          partition: request.partition || null,
        },
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      // Provide helpful error messages
      if (errorMsg.includes('not connected')) {
        throw new Error(`${errorMsg}. 请先在"集群管理"中连接一个 Kafka 集群。`);
      }

      throw new Error(`Failed to produce message: ${errorMsg}`);
    }
  }

  /**
   * Consume messages from a Kafka topic via Tauri IPC
   */
  static async consumeMessages(clusterId: string, request: ConsumeMessagesRequest): Promise<ConsumeMessagesResponse> {
    try {
      if (!request.topic) {
        throw new Error('Topic is required');
      }

      const { invoke } = await import('@tauri-apps/api/core');
      const response = await invoke<ConsumeMessagesResponse>('kafka_consume_messages', {
        clusterId,
        request: {
          topic: request.topic,
          partition: request.partition || null,
          from_beginning: request.fromBeginning || false,
          limit: request.limit || 100,
        },
      });

      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      // Provide helpful error messages
      if (errorMsg.includes('not connected')) {
        throw new Error(`${errorMsg}. 请先在"集群管理"中连接一个 Kafka 集群。`);
      }

      throw new Error(`Failed to consume messages: ${errorMsg}`);
    }
  }

  /**
   * Search messages in an array
   */
  static searchMessages(request: SearchMessagesRequest): KafkaMessage[] {
    const { messages, keyFilter, contentFilter } = request;

    return messages.filter((msg) => {
      // Filter by key if provided
      if (keyFilter && msg.key) {
        if (!msg.key.toLowerCase().includes(keyFilter.toLowerCase())) {
          return false;
        }
      }

      // Filter by content if provided
      if (contentFilter && msg.value) {
        if (!msg.value.toLowerCase().includes(contentFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Validate JSON string
   */
  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format JSON string with indentation
   */
  static formatJSON(str: string): string {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  }

  /**
   * Save consumption state to localStorage
   */
  static saveConsumptionState(topic: string, partition: number, offset: number): void {
    try {
      const key = `kafka-consume-state-${topic}-${partition}`;
      localStorage.setItem(key, JSON.stringify({ offset, timestamp: Date.now() }));
    } catch (error) {
      console.error('Failed to save consumption state:', error);
    }
  }

  /**
   * Load consumption state from localStorage
   */
  static loadConsumptionState(topic: string, partition: number): { offset: number; timestamp: number } | null {
    try {
      const key = `kafka-consume-state-${topic}-${partition}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load consumption state:', error);
      return null;
    }
  }

  /**
   * Clear consumption state from localStorage
   */
  static clearConsumptionState(topic: string, partition: number): void {
    try {
      const key = `kafka-consume-state-${topic}-${partition}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear consumption state:', error);
    }
  }

  /**
   * Convert string to Base64
   */
  static toBase64(str: string): string {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return str;
    }
  }

  /**
   * Convert Base64 to string
   */
  static fromBase64(base64: string): string {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return base64;
    }
  }

  /**
   * Convert string to Hex
   */
  static toHex(str: string): string {
    try {
      let hex = '';
      for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
      }
      return hex;
    } catch {
      return str;
    }
  }

  /**
   * Convert Hex to string
   */
  static fromHex(hex: string): string {
    try {
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    } catch {
      return hex;
    }
  }

  /**
   * Format hex string with spaces
   */
  static formatHex(hex: string, groupSize: number = 16): string {
    const groups = [];
    for (let i = 0; i < hex.length; i += groupSize) {
      groups.push(hex.substring(i, i + groupSize));
    }
    return groups.join(' ');
  }
}
