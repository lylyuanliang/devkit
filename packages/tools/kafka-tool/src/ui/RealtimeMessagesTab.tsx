import React, { useState, useEffect, useRef } from 'react';
import { KafkaTool } from '../index';
import { KafkaMessage } from '../types';

interface RealtimeMessagesTabProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  isDarkMode?: boolean;
}

/**
 * 实时消费消息标签页
 * 显示消费者组正在消费的消息流
 */
const RealtimeMessagesTab: React.FC<RealtimeMessagesTabProps> = ({
  kafkaTool,
  groupId,
  isDarkMode = false,
}) => {
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastOffsetRef = useRef<Map<string, Map<number, number>>>(new Map());

  useEffect(() => {
    if (isPolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPolling, groupId]);

  const startPolling = () => {
    // 初始加载
    loadRecentMessages();

    // 设置轮询间隔（每2秒获取一次新消息）
    pollingIntervalRef.current = setInterval(() => {
      loadRecentMessages();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const loadRecentMessages = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('未连接到 Kafka 集群');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // 获取消费者组的偏移量信息
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const offsets = await groupService.getConsumerGroupOffsets(groupId);

      if (offsets.length === 0) {
        setError('该消费者组没有订阅任何主题');
        setLoading(false);
        return;
      }

      // 获取新消息
      let newMessages: KafkaMessage[] = [];

      for (const offset of offsets) {
        const topic = offset.topic;
        const partition = offset.partition;
        const currentOffset = offset.offset;

        // 跟踪上次读取的位置
        if (!lastOffsetRef.current.has(topic)) {
          lastOffsetRef.current.set(topic, new Map());
        }

        const topicPartitions = lastOffsetRef.current.get(topic)!;
        const lastReadOffset = topicPartitions.get(partition) ?? currentOffset;

        // 如果有新消息（offset 有变化）
        if (currentOffset > lastReadOffset) {
          try {
            // 消费从 lastReadOffset 到 currentOffset 之间的消息
            const consumerService = kafkaTool.getKafkaService().getConsumerService();
            const msgs = await consumerService.consume({
              topic,
              partition,
              fromOffset: lastReadOffset,
              toOffset: currentOffset,
            });

            newMessages = newMessages.concat(msgs || []);
            topicPartitions.set(partition, currentOffset);
          } catch (err) {
            console.error(`Error consuming from ${topic}[${partition}]:`, err);
          }
        }
      }

      // 更新消息列表（保留最多500条消息）
      if (newMessages.length > 0) {
        setMessages((prev) => {
          const updated = [...prev, ...newMessages];
          return updated.slice(-500);
        });
        setMessageCount((prev) => prev + newMessages.length);
      }

      setLoading(false);

      // 自动滚动到最新消息
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载消息失败';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setMessageCount(0);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const controlsStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  };

  const toggleButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isPolling ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#ef4444' : '#dc2626'),
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  };

  const statsStyle: React.CSSProperties = {
    marginLeft: 'auto',
    fontSize: '13px',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const messageItemStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    lineHeight: '1.5',
  };

  const messageTimestampStyle: React.CSSProperties = {
    fontSize: '11px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '4px',
  };

  const messageContentStyle: React.CSSProperties = {
    color: isDarkMode ? '#f3f4f6' : '#111827',
    wordBreak: 'break-all',
  };

  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '14px',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    borderBottom: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
    fontSize: '13px',
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Controls */}
      <div style={controlsStyle}>
        <button
          onClick={() => setIsPolling(!isPolling)}
          style={toggleButtonStyle}
        >
          {isPolling ? '⏸ 暂停' : '▶ 开始'}
        </button>
        <button onClick={clearMessages} style={buttonStyle}>
          🗑️ 清空
        </button>
        <div style={statsStyle}>
          接收消息：{messageCount} 条 {loading && '(加载中...)'}
        </div>
      </div>

      {/* Messages */}
      <div style={messagesContainerStyle}>
        {messages.length === 0 ? (
          <div style={emptyStyle}>
            {loading ? '加载中...' : '等待新消息...'}
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} style={messageItemStyle}>
                <div style={messageTimestampStyle}>
                  {msg.topic}[{msg.partition}] Offset: {msg.offset} @ {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div style={messageContentStyle}>
                  <div>Key: {msg.key || '(null)'}</div>
                  <div>Value: {msg.value || '(null)'}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default RealtimeMessagesTab;
