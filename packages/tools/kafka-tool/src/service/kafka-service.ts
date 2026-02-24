import { KafkaConnectionManager } from './connection-manager';
import { KafkaAdminService } from './admin-service';
import { KafkaProducerService } from './producer-service';
import { KafkaConsumerService } from './consumer-service';
import { ConsumerGroupService } from './consumer-group-service';
import { LagMonitorService } from './lag-monitor-service';
import { KafkaClusterConfig } from '../types';

/**
 * Main Kafka service orchestrating all sub-services
 */
export class KafkaService {
  private connectionManager: KafkaConnectionManager;
  private adminService: KafkaAdminService | null = null;
  private producerService: KafkaProducerService | null = null;
  private consumerServices: Map<string, KafkaConsumerService> = new Map();
  private consumerGroupService: ConsumerGroupService | null = null;
  private lagMonitorService: LagMonitorService | null = null;

  constructor() {
    this.connectionManager = new KafkaConnectionManager();
  }

  /**
   * Connect to a Kafka cluster
   */
  async connect(cluster: KafkaClusterConfig, password?: string): Promise<void> {
    await this.connectionManager.connect(cluster, password);

    // Initialize services after connection
    const admin = this.connectionManager.getAdmin();
    this.adminService = new KafkaAdminService(admin);
    this.consumerGroupService = new ConsumerGroupService(admin);
    this.lagMonitorService = new LagMonitorService(admin);
  }

  /**
   * Disconnect from the current cluster
   */
  async disconnect(): Promise<void> {
    // Cleanup consumer services
    for (const consumer of this.consumerServices.values()) {
      await consumer.stop();
    }
    this.consumerServices.clear();

    await this.connectionManager.disconnect();

    this.adminService = null;
    this.producerService = null;
    this.consumerGroupService = null;
    this.lagMonitorService = null;
  }

  /**
   * Get admin service
   */
  getAdminService(): KafkaAdminService {
    if (!this.adminService) {
      throw new Error('Not connected to Kafka cluster');
    }
    return this.adminService;
  }

  /**
   * Get producer service
   */
  async getProducerService(): Promise<KafkaProducerService> {
    if (!this.producerService) {
      const producer = await this.connectionManager.getProducer();
      this.producerService = new KafkaProducerService(producer);
    }
    return this.producerService;
  }

  /**
   * Get or create consumer service for a group
   */
  async getConsumerService(groupId: string): Promise<KafkaConsumerService> {
    if (!this.consumerServices.has(groupId)) {
      const consumer = await this.connectionManager.getConsumer(groupId);
      const consumerService = new KafkaConsumerService(consumer);
      this.consumerServices.set(groupId, consumerService);
    }
    return this.consumerServices.get(groupId)!;
  }

  /**
   * Get consumer group service
   */
  getConsumerGroupService(): ConsumerGroupService {
    if (!this.consumerGroupService) {
      throw new Error('Not connected to Kafka cluster');
    }
    return this.consumerGroupService;
  }

  /**
   * Get lag monitor service
   */
  getLagMonitorService(): LagMonitorService {
    if (!this.lagMonitorService) {
      throw new Error('Not connected to Kafka cluster');
    }
    return this.lagMonitorService;
  }

  /**
   * Check if connected to a cluster
   */
  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Get current cluster
   */
  getCurrentCluster(): KafkaClusterConfig | null {
    return this.connectionManager.getCurrentCluster();
  }

  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    await this.disconnect();
  }
}
