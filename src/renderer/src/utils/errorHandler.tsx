/**
 * 统一错误处理工具
 *
 * 提供统一的错误处理函数，用于格式化错误信息、分类错误类型、
 * 提供用户友好的错误提示等。
 */

import React from 'react';
import { message, notification } from 'antd';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** Kafka 连接错误 */
  KAFKA_CONNECTION = 'KAFKA_CONNECTION',
  /** Kafka 操作错误 */
  KAFKA_OPERATION = 'KAFKA_OPERATION',
  /** IPC 通信错误 */
  IPC = 'IPC',
  /** 数据验证错误 */
  VALIDATION = 'VALIDATION',
  /** 权限错误 */
  PERMISSION = 'PERMISSION',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /** 错误类型 */
  type: ErrorType;
  /** 错误消息 */
  message: string;
  /** 原始错误对象 */
  originalError?: Error;
  /** 错误代码（如果有） */
  code?: string;
  /** 是否可重试 */
  retryable?: boolean;
  /** 建议操作 */
  suggestion?: string;
}

/**
 * 解析错误类型
 *
 * 根据错误消息和错误对象判断错误类型。
 */
export function parseErrorType(error: Error | string): ErrorType {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // 网络相关错误
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('enotfound')
  ) {
    return ErrorType.NETWORK;
  }

  // Kafka 连接错误
  if (
    lowerMessage.includes('connection') ||
    lowerMessage.includes('broker') ||
    lowerMessage.includes('kafka') ||
    lowerMessage.includes('sasl') ||
    lowerMessage.includes('ssl')
  ) {
    return ErrorType.KAFKA_CONNECTION;
  }

  // Kafka 操作错误
  if (
    lowerMessage.includes('topic') ||
    lowerMessage.includes('partition') ||
    lowerMessage.includes('offset') ||
    lowerMessage.includes('consumer group')
  ) {
    return ErrorType.KAFKA_OPERATION;
  }

  // IPC 错误
  if (lowerMessage.includes('ipc') || lowerMessage.includes('invoke')) {
    return ErrorType.IPC;
  }

  // 验证错误
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('required')
  ) {
    return ErrorType.VALIDATION;
  }

  // 权限错误
  if (
    lowerMessage.includes('permission') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('forbidden')
  ) {
    return ErrorType.PERMISSION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 格式化错误信息
 *
 * 将错误对象转换为统一的错误信息格式。
 */
export function formatError(error: unknown): ErrorInfo {
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

  const type = parseErrorType(errorMessage);
  const lowerMessage = errorMessage.toLowerCase();

  // 根据错误类型提供建议
  let suggestion: string | undefined;
  let retryable = false;

  switch (type) {
    case ErrorType.NETWORK:
      suggestion = '请检查网络连接，确保可以访问 Kafka 集群';
      retryable = true;
      break;
    case ErrorType.KAFKA_CONNECTION:
      suggestion = '请检查连接配置，确保 Broker 地址、认证信息正确';
      retryable = true;
      break;
    case ErrorType.KAFKA_OPERATION:
      suggestion = '请检查操作参数，确保主题、分区等信息正确';
      retryable = false;
      break;
    case ErrorType.VALIDATION:
      suggestion = '请检查输入数据格式是否正确';
      retryable = false;
      break;
    case ErrorType.PERMISSION:
      suggestion = '请检查用户权限，确保有执行该操作的权限';
      retryable = false;
      break;
    default:
      suggestion = '如果问题持续存在，请尝试刷新页面或重启应用';
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
export function getUserFriendlyMessage(errorInfo: ErrorInfo): string {
  const { type, message: errorMessage, suggestion } = errorInfo;

  // 根据错误类型提供友好的消息
  switch (type) {
    case ErrorType.NETWORK:
      return '网络连接失败，请检查网络设置';
    case ErrorType.KAFKA_CONNECTION:
      return '无法连接到 Kafka 集群，请检查连接配置';
    case ErrorType.KAFKA_OPERATION:
      return `Kafka 操作失败: ${errorMessage}`;
    case ErrorType.VALIDATION:
      return `数据验证失败: ${errorMessage}`;
    case ErrorType.PERMISSION:
      return '权限不足，无法执行该操作';
    default:
      return errorMessage || '发生未知错误';
  }
}

/**
 * 显示错误提示（使用 message）
 *
 * 用于显示简短的错误提示，自动消失。
 */
export function showError(error: unknown, duration: number = 4.5): void {
  const errorInfo = formatError(error);
  const friendlyMessage = getUserFriendlyMessage(errorInfo);

  message.error({
    content: (
      <div>
        <div>{friendlyMessage}</div>
        {errorInfo.suggestion && (
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{errorInfo.suggestion}</div>
        )}
      </div>
    ),
    duration,
  });
}

/**
 * 显示错误通知（使用 notification）
 *
 * 用于显示详细的错误通知，需要手动关闭。
 */
export function showErrorNotification(error: unknown, title: string = '操作失败'): void {
  const errorInfo = formatError(error);
  const friendlyMessage = getUserFriendlyMessage(errorInfo);

  notification.error({
    message: title,
    description: (
      <div>
        <div>{friendlyMessage}</div>
        {errorInfo.suggestion && (
          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>💡 {errorInfo.suggestion}</div>
        )}
        {errorInfo.retryable && (
          <div style={{ fontSize: 12, color: '#1890ff', marginTop: 8 }}>可以尝试重试此操作</div>
        )}
      </div>
    ),
    duration: 0, // 不自动关闭
    placement: 'topRight',
  });
}

/**
 * 处理异步操作的错误
 *
 * 包装异步函数，自动捕获和显示错误。
 */
export function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  onError?: (error: ErrorInfo) => void
): Promise<T | null> {
  return asyncFn().catch((error) => {
    const errorInfo = formatError(error);

    // 显示错误提示
    showError(errorInfo);

    // 调用自定义错误处理
    if (onError) {
      onError(errorInfo);
    }

    return null;
  });
}
