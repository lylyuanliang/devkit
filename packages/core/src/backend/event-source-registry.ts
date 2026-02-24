import { EventSource } from '@devkit/shared';

export class EventSourceRegistry {
  private static currentSource: EventSource | null = null;

  /**
   * Set the current event source for the entire application
   */
  static setCurrent(source: EventSource): void {
    EventSourceRegistry.currentSource = source;
  }

  /**
   * Get the current event source
   * @throws Error if no event source is configured
   */
  static getCurrent(): EventSource {
    if (!EventSourceRegistry.currentSource) {
      throw new Error('No event source configured. Please configure an event source tool.');
    }
    return EventSourceRegistry.currentSource;
  }

  /**
   * Check if an event source is currently configured
   */
  static isConfigured(): boolean {
    return EventSourceRegistry.currentSource !== null;
  }

  /**
   * Reset the event source (typically for testing or shutdown)
   */
  static reset(): void {
    EventSourceRegistry.currentSource = null;
  }
}
