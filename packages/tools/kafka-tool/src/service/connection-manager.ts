import { Kafka, Admin, Producer, Consumer } from 'kafkajs';
import { KafkaClusterConfig } from '../types';

/**
 * Task 9.4, 9.5: Error classification for connection failures
 */
export enum ConnectionErrorType {
  TIMEOUT = 'TIMEOUT',
  BROKER_UNREACHABLE = 'BROKER_UNREACHABLE',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  SSL_ERROR = 'SSL_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ConnectionError {
  type: ConnectionErrorType;
  message: string;
  originalError: Error;
  retryable: boolean;
}

export class KafkaConnectionManager {
  private kafka: Kafka | null = null;
  private admin: Admin | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private currentCluster: KafkaClusterConfig | null = null;

  /**
   * Classify connection errors for better user feedback
   * Tasks 9.4, 9.5: Handle connection timeout and broker unreachable errors
   */
  private classifyConnectionError(error: any): ConnectionError {
    const errorStr = error.toString().toLowerCase();
    const message = error.message || '';

    if (
      errorStr.includes('timeout') ||
      errorStr.includes('econnrefused') ||
      message.includes('timeout')
    ) {
      return {
        type: ConnectionErrorType.TIMEOUT,
        message:
          '连接超时：无法在规定时间内连接到 Broker。请检查网络连接和 Broker 地址',
        originalError: error,
        retryable: true,
      };
    }

    if (
      errorStr.includes('enotfound') ||
      errorStr.includes('getaddrinfo') ||
      errorStr.includes('unknown host')
    ) {
      return {
        type: ConnectionErrorType.BROKER_UNREACHABLE,
        message:
          'Broker 不可达：无法解析主机名或连接被拒绝。请检查 Broker 地址和防火墙规则',
        originalError: error,
        retryable: true,
      };
    }

    if (
      errorStr.includes('auth') ||
      errorStr.includes('sasl') ||
      errorStr.includes('unauthorized')
    ) {
      return {
        type: ConnectionErrorType.AUTHENTICATION_FAILED,
        message: '认证失败：用户名或密码错误',
        originalError: error,
        retryable: false,
      };
    }

    if (errorStr.includes('ssl') || errorStr.includes('certificate')) {
      return {
        type: ConnectionErrorType.SSL_ERROR,
        message:
          'SSL/TLS 错误：证书验证失败或配置不正确',
        originalError: error,
        retryable: false,
      };
    }

    return {
      type: ConnectionErrorType.UNKNOWN,
      message: `连接失败：${message}`,
      originalError: error,
      retryable: true,
    };
  }

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
      // Task 9.4, 9.5: Classify and handle connection errors
      const classifiedError = this.classifyConnectionError(error as Error);
      console.error(`Connection error (${classifiedError.type}):`, classifiedError.message);
      throw classifiedError;
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
