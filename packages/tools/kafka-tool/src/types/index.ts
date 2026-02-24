// Cluster configuration
export interface KafkaClusterConfig {
  id: string;
  name: string;
  brokers: string[];
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    // password is stored separately in encrypted storage
  };
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string[];
    key?: string;
    cert?: string;
  };
  createdAt: number;
  updatedAt: number;
}

// Topic information
export interface TopicInfo {
  name: string;
  partitions: number;
  replicationFactor: number;
  leader?: number;
  isr?: number[];
  replicas?: number[];
  config?: Record<string, string>;
}

// Message envelope
export interface KafkaMessage {
  partition: number;
  offset: number;
  timestamp: number;
  key: string | null;
  value: string | null;
  headers?: Record<string, string>;
  size: number;
}

// Consumer group info
export interface ConsumerGroupInfo {
  groupId: string;
  state: 'stable' | 'rebalancing' | 'dead' | 'unknown';
  members: ConsumerGroupMember[];
  topics: string[];
}

export interface ConsumerGroupMember {
  memberId: string;
  clientId: string;
  host: string;
  topicPartitions: { topic: string; partition: number }[];
}

// Consumer group offset
export interface ConsumerGroupOffset {
  topic: string;
  partition: number;
  offset: number;
  lag: number;
}

// Lag monitoring data
export interface LagMetrics {
  consumerGroup: string;
  topic: string;
  partition: number;
  currentOffset: number;
  logEndOffset: number;
  lag: number;
  timestamp: number;
}

// Alert configuration
export interface LagAlertConfig {
  id: string;
  consumerGroup: string;
  lagThreshold: number;
  enabled: boolean;
  createdAt: number;
}

// Consumption state (for UI persistence)
export interface ConsumptionState {
  topic: string;
  partition: number;
  lastOffset: number;
  timestamp: number;
}
