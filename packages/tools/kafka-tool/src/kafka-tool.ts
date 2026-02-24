import { KafkaService } from './service/kafka-service';
import { EventEmitter } from 'events';
import { DatabaseService } from '@devkit/core';

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  connectionConfig?: any;
  monitoring?: any;
  description?: string;
  tags?: string[];
}

interface KafkaToolConfig {
  environments: KafkaEnvironmentConfig[];
  activeEnvironment: string;
}

/**
 * KafkaTool - Main tool instance supporting multi-environment
 * Task 3.1-3.6: Tool initialization with multi-environment support
 */
export class KafkaTool {
  private kafkaService: KafkaService;
  private eventEmitter: EventEmitter;
  private database: DatabaseService;
  private toolId: string = 'kafka-tool';
  private workspaceState: Map<string, any> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.kafkaService = new KafkaService();
    this.eventEmitter = new EventEmitter();
    this.database = new DatabaseService();
  }

  /**
   * Initialize tool with multi-environment config (Task 3.1-3.2)
   */
  async init(config: KafkaToolConfig): Promise<void> {
    try {
      console.log(`Initializing KafkaTool with ${config.environments.length} environment(s)`);

      // Load all environments into service
      await this.kafkaService.loadEnvironments(config.environments);

      // Connect to active environment
      const activeEnv = config.environments.find(e => e.name === config.activeEnvironment);
      if (!activeEnv) {
        throw new Error(`Active environment "${config.activeEnvironment}" not found`);
      }

      // Switch to active environment (handles connection)
      const result = await this.kafkaService.switchEnvironment(config.activeEnvironment);
      if (!result.success) {
        throw new Error(`Failed to connect to active environment: ${result.error}`);
      }

      // Save to database
      for (const env of config.environments) {
        this.database.saveKafkaEnvironment(this.toolId, env);
      }
      this.database.setActiveKafkaEnvironment(this.toolId, config.activeEnvironment);

      this.initialized = true;
      this.eventEmitter.emit('initialized', { environment: config.activeEnvironment });

      console.log(`KafkaTool initialized with active environment: ${config.activeEnvironment}`);
    } catch (error) {
      console.error('Failed to initialize KafkaTool:', error);
      throw error;
    }
  }

  /**
   * Get tool status (Task 3.3)
   */
  async getStatus(): Promise<{
    connected: boolean;
    environment?: string;
    cluster?: any;
  }> {
    return {
      connected: this.kafkaService.isConnected(),
      environment: this.kafkaService.getActiveEnvironment() || undefined,
      cluster: this.kafkaService.getCurrentCluster() || undefined,
    };
  }

  /**
   * Switch to a different environment (Task 3.4)
   */
  async switchEnvironment(environmentName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Emit switching event (Task 4.1)
      this.eventEmitter.emit('kafka:environment:switching', {
        from: this.kafkaService.getActiveEnvironment(),
        to: environmentName,
      });

      // Save current workspace state before switching
      this.preserveWorkspaceState();

      // Perform switch
      const result = await this.kafkaService.switchEnvironment(environmentName);

      if (result.success) {
        // Update database
        this.database.setActiveKafkaEnvironment(this.toolId, environmentName);

        // Restore workspace state for new environment
        this.restoreWorkspaceState(environmentName);

        // Emit switched event (Task 4.2)
        this.eventEmitter.emit('kafka:environment:switched', {
          environment: environmentName,
          success: true,
        });
      } else {
        // Emit error event
        this.eventEmitter.emit('kafka:environment:switched', {
          environment: environmentName,
          success: false,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.eventEmitter.emit('kafka:environment:switched', {
        environment: environmentName,
        success: false,
        error: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Preserve workspace state across environment switches (Task 3.5)
   */
  private preserveWorkspaceState(): void {
    const activeEnv = this.kafkaService.getActiveEnvironment();
    if (!activeEnv) return;

    // Save current state indexed by environment
    this.workspaceState.set(activeEnv, {
      timestamp: Date.now(),
      // UI state like opened topics, consumer groups, filters, etc.
      // This would be populated by the UI layer
    });
  }

  /**
   * Restore workspace state for an environment (Task 3.5)
   */
  private restoreWorkspaceState(environmentName: string): void {
    const saved = this.workspaceState.get(environmentName);
    if (saved) {
      this.eventEmitter.emit('workspace:state:restored', {
        environment: environmentName,
        state: saved,
      });
    }
  }

  /**
   * Get workspace state for current environment
   */
  getWorkspaceState(environmentName: string): any {
    return this.workspaceState.get(environmentName) || null;
  }

  /**
   * Update workspace state for current environment
   */
  updateWorkspaceState(environmentName: string, state: any): void {
    this.workspaceState.set(environmentName, {
      ...this.workspaceState.get(environmentName),
      ...state,
      timestamp: Date.now(),
    });
  }

  /**
   * Destroy tool and clean up resources (Task 3.6)
   */
  async destroy(): Promise<void> {
    try {
      // Save workspace state
      this.preserveWorkspaceState();

      // Disconnect from Kafka
      await this.kafkaService.cleanup();

      // Close database
      this.database.close();

      // Clear state
      this.workspaceState.clear();
      this.eventEmitter.removeAllListeners();

      this.initialized = false;
      console.log('KafkaTool destroyed');
    } catch (error) {
      console.error('Error destroying KafkaTool:', error);
      throw error;
    }
  }

  /**
   * Save environment with secure credential storage (Task 5.1-5.3)
   */
  async saveEnvironmentSecure(env: KafkaEnvironmentConfig): Promise<void> {
    try {
      // Split storage: plaintext + encrypted
      const plaintext = {
        name: env.name,
        host: env.host,
        brokers: env.brokers,
        connectionConfig: env.connectionConfig || {},
        monitoring: env.monitoring || {},
        description: env.description || '',
        tags: env.tags || [],
      };

      // Save plaintext to database
      this.database.saveKafkaEnvironment(this.toolId, plaintext);

      // Save sensitive fields (auth, TLS) with encryption
      if (env.connectionConfig?.auth) {
        const authKey = `${this.toolId}-env-${env.name}-auth`;
        this.database.saveSecure(authKey, env.connectionConfig.auth);
      }

      if (env.connectionConfig?.tls) {
        const tlsKey = `${this.toolId}-env-${env.name}-tls`;
        this.database.saveSecure(tlsKey, env.connectionConfig.tls);
      }

      console.log(`Environment "${env.name}" saved securely`);
    } catch (error) {
      console.error('Failed to save environment securely:', error);
      throw error;
    }
  }

  /**
   * Load environment with decrypted credentials (Task 5.3)
   */
  async loadEnvironmentSecure(environmentName: string): Promise<KafkaEnvironmentConfig | null> {
    try {
      // Load plaintext from database
      const env = this.database.getKafkaEnvironment(this.toolId, environmentName);
      if (!env) return null;

      // Load and decrypt sensitive fields
      const authKey = `${this.toolId}-env-${environmentName}-auth`;
      const tlsKey = `${this.toolId}-env-${environmentName}-tls`;

      const auth = this.database.loadSecure(authKey);
      const tls = this.database.loadSecure(tlsKey);

      return {
        ...env,
        connectionConfig: {
          ...env.connectionConfig,
          ...(auth && { auth }),
          ...(tls && { tls }),
        },
      };
    } catch (error) {
      console.error('Failed to load environment securely:', error);
      throw error;
    }
  }

  /**
   * Get database service instance
   */
  getDatabase(): DatabaseService {
    return this.database;
  }

  /**
   * Event management
   */
  on(event: string, handler: Function): void {
    this.eventEmitter.on(event, handler as any);
  }

  off(event: string, handler: Function): void {
    this.eventEmitter.off(event, handler as any);
  }

  emit(event: string, data: any): void {
    this.eventEmitter.emit(event, data);
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export factory
export function createKafkaTool(): KafkaTool {
  return new KafkaTool();
}

// Export types
export { KafkaEnvironmentConfig, KafkaToolConfig };
