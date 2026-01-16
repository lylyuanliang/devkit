/**
 * 消息项组件（优化版本）
 * 使用 React.memo 避免不必要的重渲染
 */

import React, { useMemo } from 'react';
import { Space, Tag, Typography } from 'antd';
import type { ConsumerMessage } from '../../../../common/types/message';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface MessageItemProps {
  message: ConsumerMessage;
  index: number;
}

export const MessageItem = React.memo<MessageItemProps>(({ message, index }) => {
  // 使用 useMemo 缓存格式化后的值
  const formattedValue = useMemo(() => {
    try {
      // 尝试格式化JSON
      const parsed = JSON.parse(message.value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // 如果不是JSON，直接显示
      return message.value;
    }
  }, [message.value]);

  const formattedTime = useMemo(() => {
    return dayjs(Number(message.timestamp)).format('HH:mm:ss.SSS');
  }, [message.timestamp]);

  return (
    <div
      key={index}
      style={{
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 12,
        borderRadius: 4,
        border: '1px solid #d9d9d9',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 消息头部信息 */}
        <Space wrap>
          <Tag color="blue">Offset: {message.offset}</Tag>
          <Tag>Partition: {message.partition}</Tag>
          <Text type="secondary">{formattedTime}</Text>
        </Space>

        {/* Key */}
        {message.key && (
          <div>
            <Text strong>Key: </Text>
            <Text code>{message.key}</Text>
          </div>
        )}

        {/* Headers */}
        {message.headers && message.headers.length > 0 && (
          <div>
            <Text strong>Headers: </Text>
            <Space size="small" wrap>
              {message.headers.map((header, idx) => (
                <Tag key={idx}>
                  {header.key}: {header.value}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Value */}
        <div>
          <Text strong>Value:</Text>
          <Paragraph
            code
            copyable
            style={{
              marginTop: 8,
              marginBottom: 0,
              backgroundColor: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
              maxHeight: 200,
              overflow: 'auto',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {formattedValue}
          </Paragraph>
        </div>
      </Space>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：只有当消息内容变化时才重新渲染
  return (
    prevProps.message.offset === nextProps.message.offset &&
    prevProps.message.value === nextProps.message.value &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.index === nextProps.index
  );
});

MessageItem.displayName = 'MessageItem';
