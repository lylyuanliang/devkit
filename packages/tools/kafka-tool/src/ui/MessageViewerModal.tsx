import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { KafkaMessage } from '../types';

interface MessageViewerModalProps {
  kafkaTool?: KafkaTool;
  topic: string;
  partition: number;
  currentOffset: number;
  onClose: () => void;
  isDarkMode?: boolean;
}

/**
 * Task 7.1-7.11: Message Viewer Modal
 * Shows messages from a topic/partition
 * Highlights current offset
 */
const MessageViewerModal: React.FC<MessageViewerModalProps> = ({
  kafkaTool,
  topic,
  partition,
  currentOffset,
  onClose,
  isDarkMode = false,
}) => {
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [fromOffset, setFromOffset] = useState(Math.max(0, currentOffset - 10));

  useEffect(() => {
    loadMessages();
  }, [topic, partition, kafkaTool]);

  const loadMessages = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a temporary consumer to fetch messages
      const consumer = await kafkaTool
        .getKafkaService()
        .getKafkaClient()
        .consumer({ groupId: `temp-viewer-${Date.now()}` });

      await consumer.connect();

      const messageList: KafkaMessage[] = [];
      let messageCount = 0;
      const maxMessages = 50; // Limit to 50 messages

      await consumer.subscribe({ topic });

      const consumePromise = new Promise<void>((resolve) => {
        consumer.run({
          eachMessage: async (payload) => {
            if (messageCount >= maxMessages) {
              resolve();
              return;
            }

            messageList.push({
              partition: payload.partition,
              offset: parseInt(payload.message.offset, 10),
              timestamp: payload.message.timestamp
                ? parseInt(payload.message.timestamp, 10)
                : Date.now(),
              key: payload.message.key?.toString() || null,
              value: payload.message.value?.toString() || null,
              headers: payload.message.headers
                ? Object.fromEntries(
                    Object.entries(payload.message.headers).map(([k, v]) => [
                      k,
                      v?.toString() || '',
                    ])
                  )
                : undefined,
              size: (payload.message.value?.length || 0) + (payload.message.key?.length || 0),
            });

            messageCount++;

            if (messageCount >= maxMessages) {
              resolve();
            }
          },
        });

        // Timeout after 5 seconds
        setTimeout(() => resolve(), 5000);
      });

      // Seek to starting offset
      await consumer.seek({
        topic,
        partition,
        offset: fromOffset.toString(),
      });

      await consumePromise;
      await consumer.stop();
      await consumer.disconnect();

      setMessages(messageList.filter((m) => m.partition === partition));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const tryFormatJson = (str: string): string => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '900px',
    display: 'flex',
    flexDirection: 'column',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    cursor: 'pointer',
    fontSize: '20px',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
  };

  const messageRowStyle = (isCurrentOffset: boolean): React.CSSProperties => ({
    padding: '12px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isCurrentOffset
      ? isDarkMode
        ? '#1e3a8a'
        : '#dbeafe'
      : isDarkMode
      ? '#111827'
      : '#f9fafb',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const messagePreviewStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    marginTop: '4px',
  };

  const expandedContentStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    borderRadius: '4px',
    marginTop: '8px',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    overflowX: 'auto',
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '24px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '24px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    borderBottom: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
    fontSize: '13px',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            消息：{topic} [分区 {partition}]
          </h3>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {/* Content */}
        <div style={contentStyle}>
          {loading ? (
            <div style={loadingStyle}>加载消息中...</div>
          ) : messages.length === 0 ? (
            <div style={emptyStyle}>没有找到消息</div>
          ) : (
            <div>
              {messages.map((msg, idx) => {
                const isCurrentOffset = msg.offset === currentOffset;
                return (
                  <div
                    key={idx}
                    style={messageRowStyle(isCurrentOffset)}
                    onClick={() =>
                      setExpandedMessage(expandedMessage === idx ? null : idx)
                    }
                    onMouseEnter={(e) => {
                      if (!isCurrentOffset) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                          ? '#1f2937'
                          : '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentOffset) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                          ? '#111827'
                          : '#f9fafb';
                      }
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      偏移量：<strong>{msg.offset}</strong>
                      {isCurrentOffset && (
                        <span
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                            color: '#ffffff',
                            borderRadius: '3px',
                            fontSize: '10px',
                          }}
                        >
                          当前
                        </span>
                      )}
                    </div>
                    <div style={messagePreviewStyle}>
                      键：{msg.key ? msg.key.substring(0, 50) : '(null)'}
                    </div>
                    <div style={messagePreviewStyle}>
                      值：{' '}
                      {msg.value ? msg.value.substring(0, 50) + (msg.value.length > 50 ? '...' : '') : '(null)'}
                    </div>
                    <div style={messagePreviewStyle}>
                      {new Date(msg.timestamp).toISOString()}
                    </div>

                    {expandedMessage === idx && msg.value && (
                      <pre
                        style={{
                          ...expandedContentStyle,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          margin: '8px 0 0 0',
                          padding: '12px',
                        }}
                      >
                        {tryFormatJson(msg.value)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageViewerModal;
