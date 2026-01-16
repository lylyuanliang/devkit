/**
 * Kafka 相关类型定义
 * 
 * 本文件定义了 Kafka 主题、分区、Broker、集群等相关的 TypeScript 类型。
 * 这些类型用于在应用的不同层之间传递 Kafka 元数据信息。
 */

/**
 * 主题基本信息接口
 * 
 * 表示 Kafka 主题的基本信息，用于主题列表展示。
 * 
 * @property {string} name - 主题名称
 * @property {number} partitions - 分区数量
 * @property {number} replicationFactor - 副本因子（每个分区的副本数）
 * @property {boolean} internal - 是否为内部主题（Kafka 系统主题）
 * 
 * @example
 * const topic: Topic = {
 *   name: 'user-events',
 *   partitions: 6,
 *   replicationFactor: 3,
 *   internal: false
 * };
 */
export interface Topic {
  /** 主题名称 */
  name: string;
  /** 分区数量 */
  partitions: number;
  /** 副本因子（每个分区的副本数） */
  replicationFactor: number;
  /** 是否为内部主题（Kafka 系统主题，如 __consumer_offsets） */
  internal: boolean;
}

/**
 * 分区详细信息接口
 * 
 * 表示 Kafka 主题中单个分区的详细信息，包括 Leader、副本、ISR 等。
 * 
 * @property {number} partitionId - 分区 ID（从 0 开始）
 * @property {number} leader - Leader Broker 的节点 ID
 * @property {number[]} replicas - 所有副本所在的 Broker 节点 ID 列表
 * @property {number[]} isr - In-Sync Replicas（同步副本）节点 ID 列表
 * @property {number[]} offlineReplicas - 离线副本节点 ID 列表
 * @property {string} earliestOffset - 最早消息的 Offset（字符串格式，支持大数）
 * @property {string} latestOffset - 最新消息的 Offset（字符串格式，支持大数）
 * 
 * @example
 * const partition: Partition = {
 *   partitionId: 0,
 *   leader: 1,
 *   replicas: [1, 2, 3],
 *   isr: [1, 2],
 *   offlineReplicas: [3],
 *   earliestOffset: '0',
 *   latestOffset: '1000000'
 * };
 */
export interface Partition {
  /** 分区 ID（从 0 开始） */
  partitionId: number;
  /** Leader Broker 的节点 ID */
  leader: number;
  /** 所有副本所在的 Broker 节点 ID 列表 */
  replicas: number[];
  /** In-Sync Replicas（同步副本）节点 ID 列表 */
  isr: number[];
  /** 离线副本节点 ID 列表 */
  offlineReplicas: number[];
  /** 最早消息的 Offset（字符串格式，支持大数） */
  earliestOffset: string;
  /** 最新消息的 Offset（字符串格式，支持大数） */
  latestOffset: string;
}

/**
 * 主题详细信息接口
 * 
 * 扩展了 Topic 接口，包含分区的详细信息和配置信息。
 * 用于主题详情页面展示。
 * 
 * @extends Topic
 * @property {Partition[]} partitionDetails - 所有分区的详细信息
 * @property {ConfigEntry[]} configs - 主题配置项列表
 * 
 * @example
 * const topicDetail: TopicDetail = {
 *   name: 'user-events',
 *   partitions: 6,
 *   replicationFactor: 3,
 *   internal: false,
 *   partitionDetails: [/* 分区详情 *\/],
 *   configs: [/* 配置项 *\/]
 * };
 */
export interface TopicDetail extends Topic {
  /** 所有分区的详细信息 */
  partitionDetails: Partition[];
  /** 主题配置项列表 */
  configs: ConfigEntry[];
}

/**
 * 配置项接口
 * 
 * 表示 Kafka 主题或 Broker 的配置项。
 * 
 * @property {string} name - 配置项名称（如 'retention.ms', 'max.message.bytes'）
 * @property {string} value - 配置项值
 * @property {string} source - 配置来源（如 'DEFAULT_CONFIG', 'TOPIC_CONFIG'）
 * @property {boolean} isSensitive - 是否为敏感配置（如密码，值会被隐藏）
 * @property {boolean} isReadOnly - 是否为只读配置（不可修改）
 * 
 * @example
 * const config: ConfigEntry = {
 *   name: 'retention.ms',
 *   value: '604800000',
 *   source: 'TOPIC_CONFIG',
 *   isSensitive: false,
 *   isReadOnly: false
 * };
 */
export interface ConfigEntry {
  /** 配置项名称（如 'retention.ms', 'max.message.bytes'） */
  name: string;
  /** 配置项值 */
  value: string;
  /** 配置来源（如 'DEFAULT_CONFIG', 'TOPIC_CONFIG'） */
  source: string;
  /** 是否为敏感配置（如密码，值会被隐藏） */
  isSensitive: boolean;
  /** 是否为只读配置（不可修改） */
  isReadOnly: boolean;
}

/**
 * 创建主题配置接口
 * 
 * 用于创建新 Kafka 主题时的配置参数。
 * 
 * @property {string} topic - 主题名称（必须符合 Kafka 命名规范）
 * @property {number} numPartitions - 分区数量（必须大于 0）
 * @property {number} replicationFactor - 副本因子（必须大于 0，且不超过 Broker 数量）
 * @property {Array<{name: string; value: string}>} [configEntries] - 高级配置项（可选）
 * 
 * @example
 * const createConfig: CreateTopicConfig = {
 *   topic: 'new-topic',
 *   numPartitions: 3,
 *   replicationFactor: 2,
 *   configEntries: [
 *     { name: 'retention.ms', value: '604800000' },
 *     { name: 'compression.type', value: 'snappy' }
 *   ]
 * };
 */
export interface CreateTopicConfig {
  /** 主题名称（必须符合 Kafka 命名规范） */
  topic: string;
  /** 分区数量（必须大于 0） */
  numPartitions: number;
  /** 副本因子（必须大于 0，且不超过 Broker 数量） */
  replicationFactor: number;
  /** 高级配置项（可选） */
  configEntries?: Array<{
    /** 配置项名称 */
    name: string;
    /** 配置项值 */
    value: string;
  }>;
}

/**
 * Broker 信息接口
 * 
 * 表示 Kafka 集群中的单个 Broker 节点信息。
 * 
 * @property {number} nodeId - Broker 节点 ID（Kafka 内部标识）
 * @property {string} host - Broker 主机地址
 * @property {number} port - Broker 端口号
 * @property {string} [rack] - Rack 标识（用于机架感知，可选）
 * 
 * @example
 * const broker: Broker = {
 *   nodeId: 1,
 *   host: 'kafka-broker-1',
 *   port: 9092,
 *   rack: 'rack-1'
 * };
 */
export interface Broker {
  /** Broker 节点 ID（Kafka 内部标识） */
  nodeId: number;
  /** Broker 主机地址 */
  host: string;
  /** Broker 端口号 */
  port: number;
  /** Rack 标识（用于机架感知，可选） */
  rack?: string;
}

/**
 * 集群信息接口
 * 
 * 表示整个 Kafka 集群的基本信息。
 * 
 * @property {Broker[]} brokers - 集群中所有 Broker 节点列表
 * @property {number} controller - Controller 节点的 ID（负责集群管理）
 * @property {string} clusterId - 集群唯一标识符
 * 
 * @example
 * const clusterInfo: ClusterInfo = {
 *   brokers: [
 *     { nodeId: 1, host: 'kafka1', port: 9092 },
 *     { nodeId: 2, host: 'kafka2', port: 9092 }
 *   ],
 *   controller: 1,
 *   clusterId: 'cluster-abc123'
 * };
 */
export interface ClusterInfo {
  /** 集群中所有 Broker 节点列表 */
  brokers: Broker[];
  /** Controller 节点的 ID（负责集群管理） */
  controller: number;
  /** 集群唯一标识符 */
  clusterId: string;
}
