/**
 * 主进程错误处理工具
 * 
 * 提供统一的错误处理函数，用于格式化错误信息、分类错误类型等。
 */

/**
 * Kafka 错误类型枚举
 */
export enum KafkaErrorType {
  /** 连接错误 */
  CONNECTION = 'CONNECTION',
  /** 认证错误 */
  AUTHENTICATION = 'AUTHENTICATION',
  /** 主题不存在 */
  TOPIC_NOT_FOUND = 'TOPIC_NOT_FOUND',
  /** 分区不存在 */
  PARTITION_NOT_FOUND = 'PARTITION_NOT_FOUND',
  /** 消费组不存在 */
  CONSUMER_GROUP_NOT_FOUND = 'CONSUMER_GROUP_NOT_FOUND',
  /** 权限错误 */
  PERMISSION = 'PERMISSION',
  /** 超时错误 */
  TIMEOUT = 'TIMEOUT',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误信息接口
 */
export interface KafkaErrorInfo {
  /** 错误类型 */
  type: KafkaErrorType;
  /** 错误消息 */
  message: string;
  /** 原始错误对象 */
  originalError?: Error;
  /** 是否可重试 */
  retryable: boolean;
  /** 建议操作 */
  suggestion?: string;
}

/**
 * 解析 Kafka 错误类型
 * 
 * 根据错误消息判断 Kafka 错误类型。
 */
export function parseKafkaErrorType(error: Error | string): KafkaErrorType {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // 连接错误
  if (
    lowerMessage.includes('connection') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('enotfound') ||
    lowerMessage.includes('econnreset')
  ) {
    return KafkaErrorType.CONNECTION;
  }

  // 认证错误
  if (
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('sasl') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('invalid credentials')
  ) {
    return KafkaErrorType.AUTHENTICATION;
  }

  // 主题不存在
  if (
    lowerMessage.includes('topic') &&
    (lowerMessage.includes('not exist') ||
      lowerMessage.includes('not found') ||
      lowerMessage.includes('unknown topic'))
  ) {
    return KafkaErrorType.TOPIC_NOT_FOUND;
  }

  // 分区不存在
  if (
    lowerMessage.includes('partition') &&
    (lowerMessage.includes('not exist') || lowerMessage.includes('not found'))
  ) {
    return KafkaErrorType.PARTITION_NOT_FOUND;
  }

  // 消费组不存在
  if (
    lowerMessage.includes('consumer group') &&
    (lowerMessage.includes('not exist') || lowerMessage.includes('not found'))
  ) {
    return KafkaErrorType.CONSUMER_GROUP_NOT_FOUND;
  }

  // 权限错误
  if (
    lowerMessage.includes('permission') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('authorization')
  ) {
    return KafkaErrorType.PERMISSION;
  }

  // 超时错误
  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('etimedout')
  ) {
    return KafkaErrorType.TIMEOUT;
  }

  return KafkaErrorType.UNKNOWN;
}

/**
 * 格式化 Kafka 错误信息
 * 
 * 将 Kafka 错误转换为统一的错误信息格式。
 */
export function formatKafkaError(error: unknown): KafkaErrorInfo {
  let errorMessage = '发生未知错误';
  let originalError: Error | undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
    originalError = error;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  }

  const type = parseKafkaErrorType(errorMessage);
  const lowerMessage = errorMessage.toLowerCase();

  // 根据错误类型提供建议和重试性
  let suggestion: string | undefined;
  let retryable = false;

  switch (type) {
    case KafkaErrorType.CONNECTION:
      suggestion = '请检查 Broker 地址和网络连接';
      retryable = true;
      break;
    case KafkaErrorType.AUTHENTICATION:
      suggestion = '请检查用户名和密码是否正确';
      retryable = false;
      break;
    case KafkaErrorType.TOPIC_NOT_FOUND:
      suggestion = '请确认主题名称是否正确，或先创建该主题';
      retryable = false;
      break;
    case KafkaErrorType.PARTITION_NOT_FOUND:
      suggestion = '请确认分区 ID 是否正确';
      retryable = false;
      break;
    case KafkaErrorType.CONSUMER_GROUP_NOT_FOUND:
      suggestion = '请确认消费组 ID 是否正确';
      retryable = false;
      break;
    case KafkaErrorType.PERMISSION:
      suggestion = '请检查用户权限配置';
      retryable = false;
      break;
    case KafkaErrorType.TIMEOUT:
      suggestion = '操作超时，请检查网络连接或增加超时时间';
      retryable = true;
      break;
    default:
      suggestion = '请查看错误详情或联系管理员';
      retryable = true;
  }

  return {
    type,
    message: errorMessage,
    originalError,
    retryable,
    suggestion,
  };
}

/**
 * 获取用户友好的错误消息
 * 
 * 将技术错误消息转换为用户友好的提示。
 */
export function getUserFriendlyKafkaMessage(errorInfo: KafkaErrorInfo): string {
  const { type, message: errorMessage } = errorInfo;

  switch (type) {
    case KafkaErrorType.CONNECTION:
      return '无法连接到 Kafka 集群';
    case KafkaErrorType.AUTHENTICATION:
      return '认证失败，请检查用户名和密码';
    case KafkaErrorType.TOPIC_NOT_FOUND:
      return '主题不存在';
    case KafkaErrorType.PARTITION_NOT_FOUND:
      return '分区不存在';
    case KafkaErrorType.CONSUMER_GROUP_NOT_FOUND:
      return '消费组不存在';
    case KafkaErrorType.PERMISSION:
      return '权限不足';
    case KafkaErrorType.TIMEOUT:
      return '操作超时';
    default:
      return errorMessage || '发生未知错误';
  }
}
