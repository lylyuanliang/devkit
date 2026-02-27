import { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaMessage } from '../types';

/**
 * Task 10.1: Message window configuration for performance
 * Limits the number of messages kept in memory to prevent memory bloat
 */
export interface MessageWindowConfig {
  maxMessages?: number; // Default: 1000
  maxSizeBytes?: number; // Default: 50MB
}

export class KafkaConsumerService {
  private running: boolean = false;
  private messageHandler?: (message: KafkaMessage) => void;
  private messageWindow: KafkaMessage[] = [];
  private totalMessagesConsumed: number = 0;
  private windowConfig: MessageWindowConfig = {
    maxMessages: 1000,
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
  };

  // Task 10.3: Partition metadata caching
  private partitionMetadataCache: Map<string, any> = new Map();
  private metadataCacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private lastMetadataFetch: Map<string, number> = new Map();

  constructor(private consumer: Consumer, config?: MessageWindowConfig) {
    if (config) {
      this.windowConfig = { ...this.windowConfig, ...config };
    }
  }

  /**
   * Subscribe to a topic and start consuming messages
   */
  async subscribe(
    topic: string,
    onMessage: (message: KafkaMessage) => void,
    options?: { fromBeginning?: boolean }
  ): Promise<void> {
    try {
      this.messageHandler = onMessage;

      await this.consumer.subscribe({
        topic,
        fromBeginning: options?.fromBeginning || false,
      });

      this.running = true;

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const message: KafkaMessage = {
            partition: payload.partition,
            offset: parseInt(payload.message.offset, 10),
            timestamp: payload.message.timestamp
              ? parseInt(payload.message.timestamp, 10)
              : Date.now(),
            key: payload.message.key?.toString() || null,
            value: payload.message.value?.toString() || null,
            headers: payload.message.headers
              ? Object.fromEntries(
                  Object.entries(payload.message.headers).map(([k, v]) => [
                    k,
                    v?.toString() || '',
                  ])
                )
              : undefined,
            size: (payload.message.value?.length || 0) + (payload.message.key?.length || 0),
          };

          // Task 10.1: Maintain message window size limit
          this.messageWindow.push(message);
          this.totalMessagesConsumed++;

          // Remove old messages if window exceeds max size
          while (this.messageWindow.length > (this.windowConfig.maxMessages || 1000)) {
            this.messageWindow.shift();
          }

          this.messageHandler?.(message);
        },
      });
    } catch (error) {
      throw new Error(`Failed to subscribe to topic: ${error}`);
    }
  }

  /**
   * Seek to a specific offset
   */
  async seekToOffset(
    topic: string,
    partition: number,
    offset: number
  ): Promise<void> {
    try {
      await this.consumer.seek({ topic, partition, offset: offset.toString() });
    } catch (error) {
      throw new Error(`Failed to seek to offset: ${error}`);
    }
  }

  /**
   * Seek to beginning (offset 0)
   */
  async seekToBeginning(topic: string, partitions?: number[]): Promise<void> {
    try {
      await this.consumer.seekToBeginning(
        partitions ? [{ topic, partitions }] : [{ topic }]
      );
    } catch (error) {
      throw new Error(`Failed to seek to beginning: ${error}`);
    }
  }

  /**
   * Seek to end (latest offset)
   */
  async seekToEnd(topic: string, partitions?: number[]): Promise<void> {
    try {
      await this.consumer.seekToEnd(
        partitions ? [{ topic, partitions }] : [{ topic }]
      );
    } catch (error) {
      throw new Error(`Failed to seek to end: ${error}`);
    }
  }

  /**
   * Task 10.3, 10.5: Get metadata with caching support
   * Caches partition metadata to reduce metadata requests
   */
  async getPartitionMetadata(topic: string): Promise<any> {
    const cacheKey = topic;
    const now = Date.now();
    const lastFetch = this.lastMetadataFetch.get(cacheKey) || 0;

    // Return cached metadata if still valid
    if (
      this.partitionMetadataCache.has(cacheKey) &&
      now - lastFetch < this.metadataCacheTTL
    ) {
      return this.partitionMetadataCache.get(cacheKey);
    }

    // Fetch fresh metadata
    try {
      const admin = this.consumer.admin();
      const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
      const topicMetadata = metadata.topics[0];

      // Cache the metadata
      this.partitionMetadataCache.set(cacheKey, topicMetadata);
      this.lastMetadataFetch.set(cacheKey, now);

      return topicMetadata;
    } catch (error) {
      throw new Error(`Failed to fetch partition metadata: ${error}`);
    }
  }

  /**
   * Task 10.1: Get message window statistics
   * Returns info about messages currently in memory
   */
  getWindowStats(): {
    windowSize: number;
    totalConsumed: number;
    maxMessages: number;
    oldestOffset: number | null;
    newestOffset: number | null;
  } {
    return {
      windowSize: this.messageWindow.length,
      totalConsumed: this.totalMessagesConsumed,
      maxMessages: this.windowConfig.maxMessages || 1000,
      oldestOffset: this.messageWindow[0]?.offset || null,
      newestOffset:
        this.messageWindow[this.messageWindow.length - 1]?.offset || null,
    };
  }

  /**
   * Task 10.2: Get current message window
   * Used for testing virtual scrolling with large sets
   */
  getMessageWindow(): KafkaMessage[] {
    return [...this.messageWindow];
  }

  /**
   * Task 10.6: Clear message window
   * Allows controlled memory management for incremental rendering
   */
  clearMessageWindow(): void {
    this.messageWindow = [];
    this.totalMessagesConsumed = 0;
  }

  /**
   * Task 10.3: Clear metadata cache
   * Forces fresh metadata fetch on next request
   */
  clearMetadataCache(topic?: string): void {
    if (topic) {
      this.partitionMetadataCache.delete(topic);
      this.lastMetadataFetch.delete(topic);
    } else {
      this.partitionMetadataCache.clear();
      this.lastMetadataFetch.clear();
    }
  }

  /**
   * Stop the consumer
   */
  async stop(): Promise<void> {
    try {
      this.running = false;
      await this.consumer.stop();
    } catch (error) {
      throw new Error(`Failed to stop consumer: ${error}`);
    }
  }

  /**
   * Get consumer group ID
   */
  getGroupId(): string {
    return this.consumer.groupId;
  }

  /**
   * Check if consumer is running
   */
  isRunning(): boolean {
    return this.running;
  }
}
