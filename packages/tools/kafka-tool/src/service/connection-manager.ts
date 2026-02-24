import { Kafka, Admin, Producer, Consumer } from 'kafkajs';
import { KafkaClusterConfig } from '../types';

export class KafkaConnectionManager {
  private kafka: Kafka | null = null;
  private admin: Admin | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private currentCluster: KafkaClusterConfig | null = null;

  /**
   * Initialize connection to a Kafka cluster
   */
  async connect(cluster: KafkaClusterConfig, password?: string): Promise<void> {
    try {
      const kafkaConfig: any = {
        clientId: 'devkit-kafka-client',
        brokers: cluster.brokers,
        retry: {
          initialRetryTime: 100,
          retries: 8,
          randomizationFactor: 0.2,
        },
      };

      // Configure SASL authentication if provided
      if (cluster.sasl && password) {
        kafkaConfig.sasl = {
          mechanism: cluster.sasl.mechanism,
          username: cluster.sasl.username,
          password: password,
        };
      }

      // Configure SSL/TLS if provided
      if (cluster.ssl) {
        kafkaConfig.ssl = {
          rejectUnauthorized: cluster.ssl.rejectUnauthorized !== false,
          ca: cluster.ssl.ca ? [Buffer.from(cluster.ssl.ca)] : undefined,
          key: cluster.ssl.key ? Buffer.from(cluster.ssl.key) : undefined,
          cert: cluster.ssl.cert ? Buffer.from(cluster.ssl.cert) : undefined,
        };
      }

      this.kafka = new Kafka(kafkaConfig);
      this.currentCluster = cluster;

      // Test connection by fetching cluster metadata
      this.admin = this.kafka.admin();
      await this.admin.connect();
      await this.admin.fetchTopicMetadata();

      console.log(`Connected to Kafka cluster: ${cluster.name}`);
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to connect to Kafka cluster: ${error}`);
    }
  }

  /**
   * Disconnect from Kafka cluster
   */
  async disconnect(): Promise<void> {
    await this.cleanup();
    this.currentCluster = null;
  }

  /**
   * Get the Admin client
   */
  getAdmin(): Admin {
    if (!this.admin) {
      throw new Error('Not connected to Kafka cluster');
    }
    return this.admin;
  }

  /**
   * Get the Producer client, creating if necessary
   */
  async getProducer(): Promise<Producer> {
    if (!this.kafka) {
      throw new Error('Not connected to Kafka cluster');
    }

    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }

    return this.producer;
  }

  /**
   * Get the Consumer client, creating if necessary
   */
  async getConsumer(groupId: string): Promise<Consumer> {
    if (!this.kafka) {
      throw new Error('Not connected to Kafka cluster');
    }

    // For simplicity, we create a new consumer for each group
    // In production, you might want to manage consumers differently
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    return consumer;
  }

  /**
   * Check if connected to a cluster
   */
  isConnected(): boolean {
    return this.kafka !== null && this.admin !== null;
  }

  /**
   * Get current cluster
   */
  getCurrentCluster(): KafkaClusterConfig | null {
    return this.currentCluster;
  }

  /**
   * Cleanup all connections
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        this.producer = null;
      }

      if (this.consumer) {
        await this.consumer.disconnect();
        this.consumer = null;
      }

      if (this.admin) {
        await this.admin.disconnect();
        this.admin = null;
      }

      this.kafka = null;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
