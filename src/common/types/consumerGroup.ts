/**
 * 消费组相关类型定义
 * 
 * 本文件定义了 Kafka 消费组、成员、Offset、Lag 等相关的 TypeScript 类型。
 * 这些类型用于消费组管理和 Offset 重置功能。
 */

/**
 * 消费组状态类型
 * 
 * Kafka 消费组的状态：
 * - 'STABLE': 稳定状态，所有成员正常运行
 * - 'DEAD': 死亡状态，消费组已不存在或所有成员都离开
 * - 'EMPTY': 空状态，消费组存在但没有活跃成员
 * - 'PREPARING_REBALANCE': 准备重平衡，正在协调成员
 * - 'COMPLETING_REBALANCE': 完成重平衡，正在分配分区
 * 
 * @example
 * const state: ConsumerGroupState = 'STABLE';
 */
export type ConsumerGroupState = 'STABLE' | 'DEAD' | 'EMPTY' | 'PREPARING_REBALANCE' | 'COMPLETING_REBALANCE';

/**
 * 消费组成员接口
 * 
 * 表示消费组中的一个消费者成员。
 * 包含成员标识、客户端信息和分区分配情况。
 * 
 * @property {string} memberId - 成员唯一标识符（Kafka 自动生成）
 * @property {string} clientId - 客户端 ID（消费者应用标识）
 * @property {string} clientHost - 客户端主机地址
 * @property {Array<{topic: string; partitions: number[]}>} memberAssignment - 分配给该成员的主题和分区
 *   每个元素表示一个主题及其分配的分区列表
 * 
 * @example
 * const member: ConsumerGroupMember = {
 *   memberId: 'consumer-1-abc123',
 *   clientId: 'my-consumer-app',
 *   clientHost: '192.168.1.100',
 *   memberAssignment: [
 *     { topic: 'user-events', partitions: [0, 1] },
 *     { topic: 'order-events', partitions: [2] }
 *   ]
 * };
 */
export interface ConsumerGroupMember {
  /** 成员唯一标识符（Kafka 自动生成） */
  memberId: string;
  /** 客户端 ID（消费者应用标识） */
  clientId: string;
  /** 客户端主机地址 */
  clientHost: string;
  /** 分配给该成员的主题和分区列表 */
  memberAssignment: {
    /** 主题名称 */
    topic: string;
    /** 分配给该成员的分区 ID 列表 */
    partitions: number[];
  }[];
}

/**
 * 消费组基本信息接口
 * 
 * 表示消费组的基本信息，用于消费组列表展示。
 * 
 * @property {string} groupId - 消费组 ID
 * @property {ConsumerGroupState} state - 消费组状态
 * @property {string} protocol - 消费协议类型（如 'consumer'）
 * @property {string} protocolType - 协议类型（通常为 'consumer'）
 * @property {ConsumerGroupMember[]} members - 消费组成员列表
 * 
 * @example
 * const group: ConsumerGroup = {
 *   groupId: 'my-consumer-group',
 *   state: 'STABLE',
 *   protocol: 'consumer',
 *   protocolType: 'consumer',
 *   members: [/* 成员列表 *\/]
 * };
 */
export interface ConsumerGroup {
  /** 消费组 ID */
  groupId: string;
  /** 消费组状态 */
  state: ConsumerGroupState;
  /** 消费协议类型（如 'consumer'） */
  protocol: string;
  /** 协议类型（通常为 'consumer'） */
  protocolType: string;
  /** 消费组成员列表 */
  members: ConsumerGroupMember[];
}

/**
 * 分区消费详情接口
 * 
 * 表示消费组在某个主题分区上的消费情况。
 * 包含当前 Offset、日志结束 Offset、Lag 等信息。
 * 
 * @property {string} topic - 主题名称
 * @property {number} partition - 分区 ID
 * @property {string} currentOffset - 当前消费的 Offset（字符串格式，支持大数）
 * @property {string} logEndOffset - 日志结束 Offset（最新消息的 Offset）
 * @property {number} lag - 消费延迟（Lag = logEndOffset - currentOffset）
 * @property {string} [memberId] - 负责消费该分区的成员 ID（可选）
 * @property {Date} [lastCommittedAt] - 最后提交 Offset 的时间（可选）
 * 
 * @example
 * const detail: PartitionConsumerDetail = {
 *   topic: 'user-events',
 *   partition: 0,
 *   currentOffset: '1000',
 *   logEndOffset: '1500',
 *   lag: 500,
 *   memberId: 'consumer-1-abc123',
 *   lastCommittedAt: new Date()
 * };
 */
export interface PartitionConsumerDetail {
  /** 主题名称 */
  topic: string;
  /** 分区 ID */
  partition: number;
  /** 当前消费的 Offset（字符串格式，支持大数） */
  currentOffset: string;
  /** 日志结束 Offset（最新消息的 Offset） */
  logEndOffset: string;
  /** 消费延迟（Lag = logEndOffset - currentOffset） */
  lag: number;
  /** 负责消费该分区的成员 ID（可选） */
  memberId?: string;
  /** 最后提交 Offset 的时间（可选） */
  lastCommittedAt?: Date;
}

/**
 * 消费组详细信息接口
 * 
 * 扩展了 ConsumerGroup 接口，包含所有分区的消费详情和总 Lag。
 * 用于消费组详情页面展示。
 * 
 * @extends ConsumerGroup
 * @property {PartitionConsumerDetail[]} partitionDetails - 所有分区的消费详情
 * @property {number} totalLag - 总消费延迟（所有分区的 Lag 之和）
 * 
 * @example
 * const detail: ConsumerGroupDetail = {
 *   groupId: 'my-group',
 *   state: 'STABLE',
 *   protocol: 'consumer',
 *   protocolType: 'consumer',
 *   members: [/* 成员列表 *\/],
 *   partitionDetails: [/* 分区详情 *\/],
 *   totalLag: 5000
 * };
 */
export interface ConsumerGroupDetail extends ConsumerGroup {
  /** 所有分区的消费详情 */
  partitionDetails: PartitionConsumerDetail[];
  /** 总消费延迟（所有分区的 Lag 之和） */
  totalLag: number;
}

/**
 * Offset 重置策略类型
 * 
 * 支持的重置 Offset 的策略：
 * - 'earliest': 重置到最早的消息（Offset = 0）
 * - 'latest': 重置到最新的消息（Offset = logEndOffset）
 * - 'timestamp': 重置到指定时间戳对应的 Offset
 * - 'offset': 重置到指定的 Offset 值
 * - 'shift': 在当前 Offset 基础上偏移指定数量
 * 
 * @example
 * const strategy: OffsetResetStrategy = 'earliest';
 */
export type OffsetResetStrategy = 'earliest' | 'latest' | 'timestamp' | 'offset' | 'shift';

/**
 * Offset 重置配置接口
 * 
 * 用于配置消费组 Offset 重置的参数。
 * 根据不同的策略，需要提供相应的参数。
 * 
 * @property {string} groupId - 消费组 ID
 * @property {string} topic - 主题名称
 * @property {number[]} [partitions] - 要重置的分区列表（可选，不指定则重置所有分区）
 * @property {OffsetResetStrategy} strategy - 重置策略
 * @property {number} [timestamp] - 时间戳（策略为 'timestamp' 时必需，Unix 毫秒时间戳）
 * @property {string} [offset] - 目标 Offset（策略为 'offset' 时必需，字符串格式）
 * @property {number} [shift] - 偏移量（策略为 'shift' 时必需，正数向前，负数向后）
 * 
 * @example
 * // 重置到最早
 * const config1: OffsetResetConfig = {
 *   groupId: 'my-group',
 *   topic: 'user-events',
 *   strategy: 'earliest'
 * };
 * 
 * // 重置到指定时间戳
 * const config2: OffsetResetConfig = {
 *   groupId: 'my-group',
 *   topic: 'user-events',
 *   strategy: 'timestamp',
 *   timestamp: 1640995200000
 * };
 * 
 * // 偏移当前 Offset
 * const config3: OffsetResetConfig = {
 *   groupId: 'my-group',
 *   topic: 'user-events',
 *   partitions: [0, 1],
 *   strategy: 'shift',
 *   shift: -100  // 向后偏移 100 条消息
 * };
 */
export interface OffsetResetConfig {
  /** 消费组 ID */
  groupId: string;
  /** 主题名称 */
  topic: string;
  /** 要重置的分区列表（可选，不指定则重置所有分区） */
  partitions?: number[];
  /** 重置策略 */
  strategy: OffsetResetStrategy;
  /** 时间戳（策略为 'timestamp' 时必需，Unix 毫秒时间戳） */
  timestamp?: number;
  /** 目标 Offset（策略为 'offset' 时必需，字符串格式） */
  offset?: string;
  /** 偏移量（策略为 'shift' 时必需，正数向前，负数向后） */
  shift?: number;
}
