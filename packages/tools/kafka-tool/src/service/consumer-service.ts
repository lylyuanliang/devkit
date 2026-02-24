import { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaMessage } from '../types';

export class KafkaConsumerService {
  private running: boolean = false;
  private messageHandler?: (message: KafkaMessage) => void;

  constructor(private consumer: Consumer) {}

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
   * Stop consuming
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
