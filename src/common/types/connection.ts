/**
 * 连接相关类型定义
 * 
 * 本文件定义了 Kafka 连接配置、认证、SSL 等相关的 TypeScript 类型。
 * 这些类型用于主进程和渲染进程之间的数据传递，确保类型安全。
 */

/**
 * SASL 认证机制类型
 * 
 * Kafka 支持三种 SASL 认证机制：
 * - 'plain': 简单的用户名密码认证（PLAIN）
 * - 'scram-sha-256': SCRAM-SHA-256 认证机制（更安全）
 * - 'scram-sha-512': SCRAM-SHA-512 认证机制（最安全）
 * 
 * @example
 * const mechanism: SaslMechanism = 'scram-sha-256';
 */
export type SaslMechanism = 'plain' | 'scram-sha-256' | 'scram-sha-512';

/**
 * SASL 认证配置接口
 * 
 * 用于配置 Kafka 连接的 SASL 认证信息。
 * 密码会在主进程中通过 Electron safeStorage 加密存储。
 * 
 * @property {SaslMechanism} mechanism - 认证机制类型
 * @property {string} username - 用户名
 * @property {string} password - 密码（明文，存储前会被加密）
 * 
 * @example
 * const saslConfig: SaslConfig = {
 *   mechanism: 'scram-sha-256',
 *   username: 'kafka-user',
 *   password: 'secure-password'
 * };
 */
export interface SaslConfig {
  /** 认证机制类型 */
  mechanism: SaslMechanism;
  /** 用户名 */
  username: string;
  /** 密码（明文，存储前会被加密） */
  password: string;
}

/**
 * SSL/TLS 配置接口
 * 
 * 用于配置 Kafka 连接的 SSL/TLS 加密。
 * 支持自定义 CA 证书、客户端证书和私钥。
 * 
 * @property {boolean} enabled - 是否启用 SSL/TLS
 * @property {boolean} [rejectUnauthorized] - 是否拒绝未授权的证书（默认 true）
 * @property {string} [ca] - CA 证书内容（PEM 格式）
 * @property {string} [cert] - 客户端证书内容（PEM 格式）
 * @property {string} [key] - 客户端私钥内容（PEM 格式）
 * 
 * @example
 * const sslConfig: SslConfig = {
 *   enabled: true,
 *   rejectUnauthorized: true,
 *   ca: '-----BEGIN CERTIFICATE-----\n...'
 * };
 */
export interface SslConfig {
  /** 是否启用 SSL/TLS */
  enabled: boolean;
  /** 是否拒绝未授权的证书（默认 true） */
  rejectUnauthorized?: boolean;
  /** CA 证书内容（PEM 格式） */
  ca?: string;
  /** 客户端证书内容（PEM 格式） */
  cert?: string;
  /** 客户端私钥内容（PEM 格式） */
  key?: string;
}

/**
 * Kafka 连接配置接口
 * 
 * 完整的 Kafka 连接配置，包括 Broker 地址、认证信息、SSL 配置等。
 * 此配置会被持久化存储，密码会单独加密存储。
 * 
 * @property {string} id - 连接唯一标识符（UUID）
 * @property {string} name - 连接名称（用户自定义）
 * @property {string[]} brokers - Broker 地址列表，格式：['host:port', ...]
 * @property {string} [clientId] - 客户端 ID（可选，默认自动生成）
 * @property {SaslConfig} [sasl] - SASL 认证配置（可选）
 * @property {SslConfig} [ssl] - SSL/TLS 配置（可选）
 * @property {number} [connectionTimeout] - 连接超时时间（毫秒，默认 3000）
 * @property {number} [requestTimeout] - 请求超时时间（毫秒，默认 30000）
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 最后更新时间
 * 
 * @example
 * const config: ConnectionConfig = {
 *   id: 'uuid-123',
 *   name: '生产环境',
 *   brokers: ['kafka1:9092', 'kafka2:9092'],
 *   clientId: 'kafka-client-1',
 *   sasl: {
 *     mechanism: 'scram-sha-256',
 *     username: 'user',
 *     password: 'pass'
 *   },
 *   ssl: { enabled: true },
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 */
export interface ConnectionConfig {
  /** 连接唯一标识符（UUID） */
  id: string;
  /** 连接名称（用户自定义） */
  name: string;
  /** Broker 地址列表，格式：['host:port', ...] */
  brokers: string[];
  /** 客户端 ID（可选，默认自动生成） */
  clientId?: string;
  /** SASL 认证配置（可选） */
  sasl?: SaslConfig;
  /** SSL/TLS 配置（可选） */
  ssl?: SslConfig;
  /** 连接超时时间（毫秒，默认 3000） */
  connectionTimeout?: number;
  /** 请求超时时间（毫秒，默认 30000） */
  requestTimeout?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 连接测试结果接口
 * 
 * 用于返回 Kafka 连接测试的结果信息。
 * 包含测试是否成功、错误信息、集群信息等。
 * 
 * @property {boolean} success - 连接是否成功
 * @property {string} message - 结果消息（成功或错误信息）
 * @property {number} [brokerCount] - Broker 数量（成功时返回）
 * @property {number} [controllerId] - Controller 节点 ID（成功时返回）
 * @property {string} [clusterId] - 集群 ID（成功时返回）
 * @property {number} [responseTime] - 响应时间（毫秒）
 * 
 * @example
 * const result: ConnectionTestResult = {
 *   success: true,
 *   message: '连接成功',
 *   brokerCount: 3,
 *   controllerId: 1,
 *   clusterId: 'cluster-123',
 *   responseTime: 150
 * };
 */
export interface ConnectionTestResult {
  /** 连接是否成功 */
  success: boolean;
  /** 结果消息（成功或错误信息） */
  message: string;
  /** Broker 数量（成功时返回） */
  brokerCount?: number;
  /** Controller 节点 ID（成功时返回） */
  controllerId?: number;
  /** 集群 ID（成功时返回） */
  clusterId?: string;
  /** 响应时间（毫秒） */
  responseTime?: number;
}

/**
 * 连接状态类型
 * 
 * 表示 Kafka 连接的当前状态：
 * - 'connected': 已连接
 * - 'disconnected': 已断开
 * - 'connecting': 连接中
 * - 'error': 连接错误
 * 
 * @example
 * const status: ConnectionStatus = 'connected';
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
