import { ToolRegistryImpl } from './tool-registry';
import KafkaTool from '@devkit/kafka-tool';

/**
 * Register all built-in tools with the tool registry
 */
export function registerBuiltInTools(registry: ToolRegistryImpl): void {
  // Register Kafka Tool
  registry.register(
    {
      id: 'kafka-tool',
      name: 'Kafka Client',
      category: 'messaging',
      icon: '📨',
      version: '0.1.0',
    },
    () => new KafkaTool()
  );

  // Additional tools can be registered here
  console.log('Built-in tools registered');
}
