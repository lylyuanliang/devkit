import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { KafkaService } from './kafka-service';

describe('KafkaService - Multi-Environment Support', () => {
  let kafkaService: KafkaService;

  beforeEach(() => {
    kafkaService = new KafkaService();
  });

  afterEach(async () => {
    await kafkaService.cleanup();
  });

  describe('Environment Loading', () => {
    it('should load multiple environments', async () => {
      const envs = [
        { name: 'dev', host: 'kafka-dev', brokers: ['kafka-dev:9092'], connectionConfig: {}, monitoring: {} },
        { name: 'prod', host: 'kafka-prod', brokers: ['kafka-prod:9092'], connectionConfig: {}, monitoring: {} },
      ];

      await kafkaService.loadEnvironments(envs);
      const loaded = kafkaService.listEnvironments();

      expect(loaded).toHaveLength(2);
      expect(loaded.map(e => e.name)).toEqual(['dev', 'prod']);
    });
  });

  describe('Environment Switching', () => {
    it('should handle environment switching lifecycle', async () => {
      const envs = [
        { name: 'env1', host: 'host1', brokers: ['host1:9092'], connectionConfig: {}, monitoring: {} },
      ];

      await kafkaService.loadEnvironments(envs);
      const result = await kafkaService.switchEnvironment('env1');

      expect(result.success).toBe(true);
      expect(kafkaService.getActiveEnvironment()).toBe('env1');
    });

    it('should return error for non-existent environment', async () => {
      const envs = [
        { name: 'existing', host: 'localhost', brokers: ['localhost:9092'], connectionConfig: {}, monitoring: {} },
      ];

      await kafkaService.loadEnvironments(envs);
      const result = await kafkaService.switchEnvironment('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    it('should cleanup all resources on destroy', async () => {
      const envs = [
        { name: 'test', host: 'localhost', brokers: ['localhost:9092'], connectionConfig: {}, monitoring: {} },
      ];

      await kafkaService.loadEnvironments(envs);
      await kafkaService.cleanup();

      expect(kafkaService.getActiveEnvironment()).toBeNull();
      expect(kafkaService.listEnvironments()).toHaveLength(0);
    });
  });
});
