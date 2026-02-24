import { KafkaConnectionManager } from './connection-manager';
import { KafkaAdminService } from './admin-service';
import { KafkaProducerService } from './producer-service';
import { KafkaConsumerService } from './consumer-service';
import { ConsumerGroupService } from './consumer-group-service';
import { LagMonitorService } from './lag-monitor-service';
import { KafkaClusterConfig } from '../types';

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  connectionConfig?: any;
  monitoring?: any;
  description?: string;
  tags?: string[];
}

/**
 * Main Kafka service orchestrating all sub-services
 * Supports multiple environments with connection switching
 */
export class KafkaService {
  private connectionManager: KafkaConnectionManager;
  private adminService: KafkaAdminService | null = null;
  private producerService: KafkaProducerService | null = null;
  private consumerServices: Map<string, KafkaConsumerService> = new Map();
  private consumerGroupService: ConsumerGroupService | null = null;
  private lagMonitorService: LagMonitorService | null = null;

  // Multi-environment support
  private environments: Map<string, KafkaEnvironmentConfig> = new Map();
  private activeEnvironment: string | null = null;

  constructor() {
    this.connectionManager = new KafkaConnectionManager();
  }

  /**
   * Load all environments from database (Task 2.2)
   */
  async loadEnvironments(envConfigs: KafkaEnvironmentConfig[]): Promise<void> {
    this.environments.clear();
    for (const env of envConfigs) {
      this.environments.set(env.name, env);
    }
  }

  /**
   * Get a single environment configuration (Task 2.3)
   */
  getEnvironment(name: string): KafkaEnvironmentConfig | null {
    return this.environments.get(name) || null;
  }

  /**
   * Switch to a different environment (Task 2.4)
   * Handles disconnect old -> connect new -> emit events
   */
  async switchEnvironment(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const environment = this.environments.get(name);
      if (!environment) {
        return { success: false, error: `Environment "${name}" not found` };
      }

      // Emit switching event
      const oldEnv = this.activeEnvironment;
      console.log(`Switching from ${oldEnv} to ${name}`);

      // Disconnect old environment
      if (this.activeEnvironment && this.activeEnvironment !== name) {
        await this.disconnectEnvironment(this.activeEnvironment);
      }

      // Connect new environment
      await this.createConnection(environment);
      this.activeEnvironment = name;

      console.log(`Successfully switched to environment: ${name}`);
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to switch environment: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Create connection to an environment (Task 2.5)
   */
  private async createConnection(environment: KafkaEnvironmentConfig): Promise<void> {
    const clusterConfig: KafkaClusterConfig = {
      brokers: environment.brokers,
      host: environment.host,
    };

    await this.connectionManager.connect(clusterConfig);

    // Initialize services
    const admin = this.connectionManager.getAdmin();
    this.adminService = new KafkaAdminService(admin);
    this.consumerGroupService = new ConsumerGroupService(admin);
    this.lagMonitorService = new LagMonitorService(admin);
  }

  /**
   * Disconnect from an environment (Task 2.6)
   */
  private async disconnectEnvironment(name: string): Promise<void> {
    try {
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

      console.log(`Disconnected from environment: ${name}`);
    } catch (error) {
      console.error(`Error disconnecting from ${name}:`, error);
    }
  }

  /**
   * Connect to a Kafka cluster (legacy single-connection)
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
    if (this.activeEnvironment) {
      await this.disconnectEnvironment(this.activeEnvironment);
    }
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
   * Get active environment name
   */
  getActiveEnvironment(): string | null {
    return this.activeEnvironment;
  }

  /**
   * List all available environments
   */
  listEnvironments(): KafkaEnvironmentConfig[] {
    return Array.from(this.environments.values());
  }

  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    await this.disconnect();
    this.environments.clear();
  }
}
