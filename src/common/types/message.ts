/**
 * 消息相关类型定义
 * 
 * 本文件定义了 Kafka 消息生产、消费、模板等相关的 TypeScript 类型。
 * 这些类型用于在消息发送、接收和模板管理中确保类型安全。
 */

/**
 * 消息格式类型
 * 
 * 支持的消息序列化格式：
 * - 'json': JSON 格式（最常用）
 * - 'text': 纯文本格式
 * - 'avro': Avro 序列化格式（需要 Schema Registry）
 * - 'base64': Base64 编码格式
 * 
 * @example
 * const format: MessageFormat = 'json';
 */
export type MessageFormat = 'json' | 'text' | 'avro' | 'base64';

/**
 * 消息 Header 接口
 * 
 * Kafka 消息可以包含自定义的 Header 键值对，用于传递元数据。
 * Header 不会影响消息的路由，但可以在消费端用于过滤和处理。
 * 
 * @property {string} key - Header 键名
 * @property {string} value - Header 值
 * 
 * @example
 * const header: MessageHeader = {
 *   key: 'trace-id',
 *   value: 'abc123'
 * };
 */
export interface MessageHeader {
  /** Header 键名 */
  key: string;
  /** Header 值 */
  value: string;
}

/**
 * 生产者消息接口
 * 
 * 用于发送消息到 Kafka 主题的完整消息结构。
 * 
 * @property {string} topic - 目标主题名称
 * @property {string} [key] - 消息 Key（可选，用于分区路由）
 * @property {string} value - 消息内容（字符串格式）
 * @property {MessageHeader[]} [headers] - 消息 Header 列表（可选）
 * @property {number} [partition] - 目标分区（可选，不指定则自动选择）
 * @property {string} [timestamp] - 消息时间戳（可选，ISO 8601 格式）
 * 
 * @example
 * const message: ProducerMessage = {
 *   topic: 'user-events',
 *   key: 'user-123',
 *   value: JSON.stringify({ userId: 123, action: 'login' }),
 *   headers: [
 *     { key: 'source', value: 'web' },
 *     { key: 'version', value: '1.0' }
 *   ]
 * };
 */
export interface ProducerMessage {
  /** 目标主题名称 */
  topic: string;
  /** 消息 Key（可选，用于分区路由） */
  key?: string;
  /** 消息内容（字符串格式） */
  value: string;
  /** 消息 Header 列表（可选） */
  headers?: MessageHeader[];
  /** 目标分区（可选，不指定则自动选择） */
  partition?: number;
  /** 消息时间戳（可选，ISO 8601 格式） */
  timestamp?: string;
}

/**
 * 消费者消息接口
 * 
 * 从 Kafka 主题消费到的消息结构。
 * 包含完整的消息元数据，如分区、Offset、时间戳等。
 * 
 * @property {string} topic - 消息所属主题
 * @property {number} partition - 消息所在分区
 * @property {string} offset - 消息 Offset（字符串格式，支持大数）
 * @property {string | null} key - 消息 Key（可能为 null）
 * @property {string} value - 消息内容（字符串格式）
 * @property {MessageHeader[]} headers - 消息 Header 列表
 * @property {string} timestamp - 消息时间戳（字符串格式，Unix 毫秒时间戳）
 * 
 * @example
 * const message: ConsumerMessage = {
 *   topic: 'user-events',
 *   partition: 0,
 *   offset: '12345',
 *   key: 'user-123',
 *   value: '{"userId": 123, "action": "login"}',
 *   headers: [
 *     { key: 'source', value: 'web' }
 *   ],
 *   timestamp: '1640995200000'
 * };
 */
export interface ConsumerMessage {
  /** 消息所属主题 */
  topic: string;
  /** 消息所在分区 */
  partition: number;
  /** 消息 Offset（字符串格式，支持大数） */
  offset: string;
  /** 消息 Key（可能为 null） */
  key: string | null;
  /** 消息内容（字符串格式） */
  value: string;
  /** 消息 Header 列表 */
  headers: MessageHeader[];
  /** 消息时间戳（字符串格式，Unix 毫秒时间戳） */
  timestamp: string;
}

/**
 * 消费选项接口
 * 
 * 配置消息消费行为的参数。
 * 
 * @property {string} topic - 要消费的主题名称
 * @property {number[]} [partitions] - 指定消费的分区列表（可选，不指定则消费所有分区）
 * @property {boolean} [fromBeginning] - 是否从最早的消息开始消费（默认 false，从最新开始）
 * @property {string} [fromOffset] - 从指定 Offset 开始消费（可选，优先级高于 fromBeginning）
 * @property {string} [groupId] - 消费组 ID（可选，不指定则自动生成）
 * @property {boolean} [autoCommit] - 是否自动提交 Offset（默认 true）
 * 
 * @example
 * const options: ConsumeOptions = {
 *   topic: 'user-events',
 *   partitions: [0, 1, 2],
 *   fromBeginning: false,
 *   groupId: 'my-consumer-group',
 *   autoCommit: true
 * };
 */
export interface ConsumeOptions {
  /** 要消费的主题名称 */
  topic: string;
  /** 指定消费的分区列表（可选，不指定则消费所有分区） */
  partitions?: number[];
  /** 是否从最早的消息开始消费（默认 false，从最新开始） */
  fromBeginning?: boolean;
  /** 从指定 Offset 开始消费（可选，优先级高于 fromBeginning） */
  fromOffset?: string;
  /** 消费组 ID（可选，不指定则自动生成） */
  groupId?: string;
  /** 是否自动提交 Offset（默认 true） */
  autoCommit?: boolean;
}

/**
 * 消费会话接口
 * 
 * 表示一个活跃的消息消费会话。
 * 用于跟踪和管理消费状态。
 * 
 * @property {string} id - 会话唯一标识符
 * @property {string} connectionId - 关联的连接 ID
 * @property {string} topic - 消费的主题名称
 * @property {string} groupId - 消费组 ID
 * @property {'running' | 'paused' | 'stopped'} status - 会话状态
 *   - 'running': 正在消费
 *   - 'paused': 已暂停
 *   - 'stopped': 已停止
 * @property {number} messageCount - 已接收的消息数量
 * @property {Date} createdAt - 会话创建时间
 * 
 * @example
 * const session: ConsumerSession = {
 *   id: 'session-123',
 *   connectionId: 'conn-456',
 *   topic: 'user-events',
 *   groupId: 'my-group',
 *   status: 'running',
 *   messageCount: 1000,
 *   createdAt: new Date()
 * };
 */
export interface ConsumerSession {
  /** 会话唯一标识符 */
  id: string;
  /** 关联的连接 ID */
  connectionId: string;
  /** 消费的主题名称 */
  topic: string;
  /** 消费组 ID */
  groupId: string;
  /** 会话状态：'running' 正在消费，'paused' 已暂停，'stopped' 已停止 */
  status: 'running' | 'paused' | 'stopped';
  /** 已接收的消息数量 */
  messageCount: number;
  /** 会话创建时间 */
  createdAt: Date;
}

/**
 * 消息模板接口
 * 
 * 用于保存和复用常用的消息格式。
 * 用户可以创建模板，快速发送相似的消息。
 * 
 * @property {string} id - 模板唯一标识符
 * @property {string} name - 模板名称（用户自定义）
 * @property {string} topic - 默认主题名称
 * @property {string} [key] - 默认消息 Key（可选）
 * @property {string} value - 消息内容模板（支持变量占位符）
 * @property {MessageHeader[]} [headers] - 默认 Header 列表（可选）
 * @property {MessageFormat} format - 消息格式
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 最后更新时间
 * 
 * @example
 * const template: MessageTemplate = {
 *   id: 'template-1',
 *   name: '用户登录事件',
 *   topic: 'user-events',
 *   key: 'user-{userId}',
 *   value: JSON.stringify({ userId: '{userId}', action: 'login', timestamp: '{timestamp}' }),
 *   headers: [{ key: 'source', value: 'web' }],
 *   format: 'json',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 */
export interface MessageTemplate {
  /** 模板唯一标识符 */
  id: string;
  /** 模板名称（用户自定义） */
  name: string;
  /** 默认主题名称 */
  topic: string;
  /** 默认消息 Key（可选） */
  key?: string;
  /** 消息内容模板（支持变量占位符） */
  value: string;
  /** 默认 Header 列表（可选） */
  headers?: MessageHeader[];
  /** 消息格式 */
  format: MessageFormat;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}
