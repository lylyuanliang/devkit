import { ToolConfig, ToolInstance, ToolRegistry } from '@devkit/shared';
import { EventBus, CORE_EVENTS } from './event-bus';

export class ToolRegistryImpl implements ToolRegistry {
  private tools: Map<string, ToolConfig> = new Map();
  private factories: Map<string, () => ToolInstance> = new Map();
  private instances: Map<string, ToolInstance> = new Map();
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  register(tool: ToolConfig, factory: () => ToolInstance): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool ${tool.id} already registered`);
      return;
    }
    this.tools.set(tool.id, tool);
    this.factories.set(tool.id, factory);
  }

  get(id: string): ToolInstance | null {
    return this.instances.get(id) || null;
  }

  list(): ToolConfig[] {
    return Array.from(this.tools.values());
  }

  async createInstance(toolId: string, config?: any): Promise<ToolInstance> {
    const factory = this.factories.get(toolId);
    if (!factory) {
      throw new Error(`Tool ${toolId} not found`);
    }

    const instance = factory();
    this.instances.set(toolId, instance);

    try {
      await instance.init(config || {});
      this.eventBus.emit(CORE_EVENTS.TOOL_LOADED, { toolId });
    } catch (error) {
      this.instances.delete(toolId);
      throw error;
    }

    return instance;
  }

  async destroyInstance(toolId: string): Promise<void> {
    const instance = this.instances.get(toolId);
    if (!instance) {
      return;
    }

    try {
      await instance.destroy();
    } finally {
      this.instances.delete(toolId);
      this.eventBus.emit(CORE_EVENTS.TOOL_UNLOADED, { toolId });
    }
  }

  async destroyAll(): Promise<void> {
    const toolIds = Array.from(this.instances.keys());
    for (const toolId of toolIds) {
      await this.destroyInstance(toolId);
    }
  }

  getToolConfig(toolId: string): ToolConfig | undefined {
    return this.tools.get(toolId);
  }
}
