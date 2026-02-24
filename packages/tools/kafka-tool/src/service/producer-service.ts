import { Producer, ProducerRecord } from 'kafkajs';

export interface MessageSendResult {
  partition: number;
  offset: string;
  timestamp: string;
  errorCode?: number;
}

export class KafkaProducerService {
  constructor(private producer: Producer) {}

  /**
   * Send a single message to a topic
   */
  async sendMessage(
    topic: string,
    message: string,
    key?: string | null,
    headers?: Record<string, string>
  ): Promise<MessageSendResult[]> {
    try {
      const messages = [
        {
          key: key || undefined,
          value: message,
          headers: headers
            ? Object.entries(headers).reduce((acc, [k, v]) => {
                acc[k] = Buffer.from(v);
                return acc;
              }, {} as Record<string, Buffer>)
            : undefined,
        },
      ];

      const result = await this.producer.send({
        topic,
        messages,
      });

      return result[0]?.map((r) => ({
        partition: r.partition,
        offset: r.offset,
        timestamp: r.timestamp,
        errorCode: r.errorCode,
      })) || [];
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Send multiple messages to a topic in batch
   */
  async sendBatch(
    topic: string,
    messages: Array<{ value: string; key?: string | null; headers?: Record<string, string> }>
  ): Promise<MessageSendResult[]> {
    try {
      const formattedMessages = messages.map((msg) => ({
        key: msg.key || undefined,
        value: msg.value,
        headers: msg.headers
          ? Object.entries(msg.headers).reduce((acc, [k, v]) => {
              acc[k] = Buffer.from(v);
              return acc;
            }, {} as Record<string, Buffer>)
          : undefined,
      }));

      const result = await this.producer.send({
        topic,
        messages: formattedMessages,
      });

      return result[0]?.map((r) => ({
        partition: r.partition,
        offset: r.offset,
        timestamp: r.timestamp,
        errorCode: r.errorCode,
      })) || [];
    } catch (error) {
      throw new Error(`Failed to send batch: ${error}`);
    }
  }

  /**
   * Send messages to multiple topics (transactions not supported yet)
   */
  async sendToMultipleTopics(
    records: Array<{
      topic: string;
      messages: Array<{ value: string; key?: string | null; headers?: Record<string, string> }>;
    }>
  ): Promise<Map<string, MessageSendResult[]>> {
    const results = new Map<string, MessageSendResult[]>();

    try {
      for (const record of records) {
        const sendResult = await this.sendBatch(record.topic, record.messages);
        results.set(record.topic, sendResult);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to send to multiple topics: ${error}`);
    }
  }

  /**
   * Get producer metrics/stats
   */
  async getMetrics() {
    try {
      // kafkajs doesn't expose detailed metrics, but we can track basic info
      return {
        connected: this.producer ? true : false,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to get metrics: ${error}`);
    }
  }
}
