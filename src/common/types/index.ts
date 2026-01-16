/**
 * 类型定义统一导出
 * 
 * 本文件统一导出所有类型定义，方便其他模块导入使用。
 * 
 * 导出的类型包括：
 * - connection.ts: 连接相关类型（ConnectionConfig, SaslConfig, SslConfig 等）
 * - kafka.ts: Kafka 相关类型（Topic, Partition, Broker, ClusterInfo 等）
 * - message.ts: 消息相关类型（ProducerMessage, ConsumerMessage, ConsumeOptions 等）
 * - consumerGroup.ts: 消费组相关类型（ConsumerGroup, OffsetResetConfig 等）
 * 
 * @example
 * // 导入连接配置类型
 * import type { ConnectionConfig } from './common/types';
 * 
 * // 导入消息类型
 * import type { ProducerMessage, ConsumerMessage } from './common/types';
 * 
 * // 导入消费组类型
 * import type { ConsumerGroup, OffsetResetConfig } from './common/types';
 */
export * from './connection';
export * from './kafka';
export * from './message';
export * from './consumerGroup';
