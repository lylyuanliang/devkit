import { Admin } from 'kafkajs';
import { LagMetrics } from '../types';

export interface LagAlertThreshold {
  consumerGroup: string;
  threshold: number;
}

export class LagMonitorService {
  private metrics: Map<string, LagMetrics[]> = new Map();
  private alertThresholds: Map<string, LagAlertThreshold> = new Map();
  private onAlert?: (groupId: string, totalLag: number) => void;

  constructor(private admin: Admin) {}

  /**
   * Calculate lag for a consumer group on specific topics
   */
  async calculateGroupLag(groupId: string, topics?: string[]): Promise<LagMetrics[]> {
    try {
      // Get consumer group offsets
      const groupOffsets = await this.admin.fetchOffsets(groupId);

      // Get latest offsets for all topics
      let topicsToFetch = topics;
      if (!topicsToFetch) {
        const metadata = await this.admin.fetchTopicMetadata();
        topicsToFetch = metadata.topics.map((t) => t.name);
      }

      const latestOffsetMap = new Map<string, Map<number, number>>();

      for (const topic of topicsToFetch) {
        const latestOffsets = await this.admin.fetchTopicOffsets(topic);
        const partitionMap = new Map<number, number>();
        latestOffsets.forEach((offset) => {
          partitionMap.set(offset.partition, parseInt(offset.high, 10));
        });
        latestOffsetMap.set(topic, partitionMap);
      }

      // Calculate lag
      const lagMetrics: LagMetrics[] = [];

      groupOffsets.forEach((offset) => {
        if (topics && !topics.includes(offset.topic)) {
          return;
        }

        const currentOffset = parseInt(offset.offset || '0', 10);
        const latestOffset =
          latestOffsetMap.get(offset.topic)?.get(offset.partition) || 0;
        const lag = Math.max(0, latestOffset - currentOffset);

        lagMetrics.push({
          consumerGroup: groupId,
          topic: offset.topic,
          partition: offset.partition,
          currentOffset,
          logEndOffset: latestOffset,
          lag,
          timestamp: Date.now(),
        });
      });

      // Store metrics for historical analysis
      this.metrics.set(groupId, lagMetrics);

      return lagMetrics;
    } catch (error) {
      throw new Error(`Failed to calculate lag: ${error}`);
    }
  }

  /**
   * Get total lag for a consumer group across all topics
   */
  async getTotalGroupLag(groupId: string, topics?: string[]): Promise<number> {
    try {
      const metrics = await this.calculateGroupLag(groupId, topics);
      return metrics.reduce((sum, m) => sum + m.lag, 0);
    } catch (error) {
      throw new Error(`Failed to get total lag: ${error}`);
    }
  }

  /**
   * Get lag metrics for a specific topic/partition
   */
  async getPartitionLag(
    groupId: string,
    topic: string,
    partition: number
  ): Promise<LagMetrics | null> {
    try {
      const metrics = await this.calculateGroupLag(groupId, [topic]);
      return metrics.find((m) => m.partition === partition) || null;
    } catch (error) {
      throw new Error(`Failed to get partition lag: ${error}`);
    }
  }

  /**
   * Get consumption rate (messages per second) for a consumer group
   */
  async getConsumptionRate(groupId: string, windowMs: number = 60000): Promise<number> {
    try {
      // This would require tracking offset changes over time
      // For now, return a placeholder
      // In a real implementation, you'd store historical data

      const metrics = await this.calculateGroupLag(groupId);
      const totalMessages = metrics.reduce((sum, m) => sum + m.currentOffset, 0);

      if (totalMessages === 0) return 0;

      return totalMessages / (windowMs / 1000);
    } catch (error) {
      throw new Error(`Failed to get consumption rate: ${error}`);
    }
  }

  /**
   * Get historical metrics for a consumer group (if stored)
   */
  getHistoricalMetrics(groupId: string): LagMetrics[] {
    return this.metrics.get(groupId) || [];
  }

  /**
   * Clear historical metrics for a consumer group
   */
  clearMetrics(groupId?: string): void {
    if (groupId) {
      this.metrics.delete(groupId);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Set alert threshold for a consumer group
   */
  setAlertThreshold(consumerGroup: string, threshold: number): void {
    this.alertThresholds.set(consumerGroup, { consumerGroup, threshold });
  }

  /**
   * Set callback for lag alerts
   */
  setAlertCallback(callback: (groupId: string, totalLag: number) => void): void {
    this.onAlert = callback;
  }

  /**
   * Check for lag alerts
   */
  async checkAlerts(groupId: string): Promise<void> {
    const threshold = this.alertThresholds.get(groupId);
    if (!threshold) return;

    try {
      const totalLag = await this.getTotalGroupLag(groupId);

      if (totalLag > threshold.threshold) {
        this.onAlert?.(groupId, totalLag);
      }
    } catch (error) {
      console.error(`Failed to check alerts for group ${groupId}:`, error);
    }
  }
}
