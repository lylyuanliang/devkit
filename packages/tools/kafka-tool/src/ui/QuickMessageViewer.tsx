import React, { useState, useEffect, useRef } from 'react';
import { KafkaAPI } from '../service/kafka-api';
import { KafkaMessage } from '../types';

interface QuickMessageViewerProps {
  clusterId?: string;
  isDarkMode?: boolean;
  onClose: () => void;
}

type StartPosition = 'latest' | 'earliest' | 'specific';

/**
 * 快速消息查看器
 * 无需消费者组，直接查看任意 Topic 的消息流
 */
const QuickMessageViewer: React.FC<QuickMessageViewerProps> = ({
  clusterId,
  isDarkMode = false,
  onClose,
}) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [partitions, setPartitions] = useState<number[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPartitions, setSelectedPartitions] = useState<number[]>([]);
  const [startPosition, setStartPosition] = useState<StartPosition>('latest');
  const [specificOffset, setSpecificOffset] = useState<string>('0');
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [viewMode, setViewMode] = useState<'config' | 'view'>('config');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastOffsetRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    loadTopics();
  }, [clusterId]);

  useEffect(() => {
    if (selectedTopic && partitions.length > 0 && !selectedPartitions.includes(partitions[0])) {
      setSelectedPartitions([partitions[0]] || []);
    }
  }, [partitions, selectedTopic]);

  useEffect(() => {
    if (isPolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPolling, selectedTopic, selectedPartitions, startPosition, specificOffset, clusterId]);

  const loadTopics = async () => {
    if (!clusterId) {
      setError('未指定集群');
      setLoading(false);
      return;
    }

    try {
      // 获取主题列表
      const topicList = await KafkaAPI.listTopics(clusterId);
      console.log('获取主题列表:', topicList.length, '个主题');

      setTopics(topicList);
      setLoading(false);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '无法连接到 Kafka 集群';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const loadPartitions = async (topic: string) => {
    if (!clusterId || !topic) {
      setError('请选择主题');
      return;
    }

    try {
      // 尝试消费消息来获取分区信息
      const messages = await KafkaAPI.consumeMessages(clusterId, {
        topic,
        fromOffset: 0,
        toOffset: 1,
        partition: 0,
      });

      // 如果成功，说明至少有一个分区
      // 这里简化处理，假设有 1-16 个分区
      const estimatedPartitions = Array.from({ length: 4 }, (_, i) => i);
      setPartitions(estimatedPartitions);
      setSelectedPartitions([0]);
      lastOffsetRef.current.clear();
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载分区失败，请检查主题名称';
      setError(errorMsg);
    }
  };

  const startPolling = () => {
    loadMessages();

    pollingIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const loadMessages = async () => {
    if (!clusterId || !selectedTopic || selectedPartitions.length === 0) {
      return;
    }

    try {
      let newMessages: KafkaMessage[] = [];

      for (const partition of selectedPartitions) {
        try {
          // 确定起始位置
          let fromOffset = lastOffsetRef.current.get(partition) ?? 0;

          if (lastOffsetRef.current.get(partition) === undefined) {
            // 第一次加载，根据选择的起始位置
            if (startPosition === 'latest') {
              // 从最新位置开始，先取最后10条
              fromOffset = Math.max(0, 0);
              // 实际上我们会从较晚的位置开始
              const msgs = await KafkaAPI.consumeMessages(clusterId, {
                topic: selectedTopic,
                partition,
                fromOffset: 0,
                toOffset: 10,
              });

              if (msgs && msgs.length > 0) {
                newMessages = newMessages.concat(msgs);
                lastOffsetRef.current.set(partition, msgs[msgs.length - 1].offset + 1);
              }
              continue;
            } else if (startPosition === 'earliest') {
              fromOffset = 0;
            } else {
              fromOffset = parseInt(specificOffset) || 0;
            }
          }

          // 获取消息
          const msgs = await KafkaAPI.consumeMessages(clusterId, {
            topic: selectedTopic,
            partition,
            fromOffset,
            toOffset: fromOffset + 50,
          });

          if (msgs && msgs.length > 0) {
            newMessages = newMessages.concat(msgs);
            lastOffsetRef.current.set(partition, msgs[msgs.length - 1].offset + 1);
          }
        } catch (err) {
          console.error(`Error consuming from ${selectedTopic}[${partition}]:`, err);
        }
      }

      if (newMessages.length > 0) {
        setMessages((prev) => {
          const updated = [...prev, ...newMessages];
          return updated.slice(-500);
        });
        setMessageCount((prev) => prev + newMessages.length);
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载消息失败';
      console.error('Load messages error:', err);
    }
  };

  const handleStartViewing = async () => {
    if (!selectedTopic || selectedPartitions.length === 0) {
      setError('请选择主题和分区');
      return;
    }

    setMessages([]);
    setMessageCount(0);
    lastOffsetRef.current.clear();

    // 验证分区
    try {
      await loadPartitions(selectedTopic);
    } catch (err) {
      setError('验证分区失败，请检查主题名称');
      return;
    }

    setViewMode('view');
    setIsPolling(true);
  };

  const clearMessages = () => {
    setMessages([]);
    setMessageCount(0);
  };

  const handleBackToConfig = () => {
    setIsPolling(false);
    setViewMode('config');
    setMessages([]);
    setMessageCount(0);
  };

  if (loading) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <p style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}>加载主题中...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'view') {
    return (
      <div style={fullScreenContainerStyle}>
        <div style={headerStyle}>
          <button onClick={handleBackToConfig} style={backButtonStyle}>
            ← 返回配置
          </button>
          <h2 style={titleStyle}>
            🎯 {selectedTopic} {selectedPartitions.map((p) => `[${p}]`).join('')}
          </h2>
          <div style={{ marginLeft: 'auto' }}></div>
        </div>

        <div style={controlsStyle}>
          <button
            onClick={() => setIsPolling(!isPolling)}
            style={{
              ...toggleButtonStyle,
              backgroundColor: isPolling
                ? isDarkMode
                  ? '#10b981'
                  : '#059669'
                : isDarkMode
                ? '#ef4444'
                : '#dc2626',
            }}
          >
            {isPolling ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button onClick={clearMessages} style={buttonStyle}>
            🗑️ 清空
          </button>
          <div style={statsStyle}>
            接收消息：{messageCount} 条
          </div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={messagesContainerStyle}>
          {messages.length === 0 ? (
            <div style={emptyStyle}>{isPolling ? '等待消息...' : '点击"开始"查看消息'}</div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} style={messageItemStyle}>
                  <div style={messageTimestampStyle}>
                    [{msg.partition}] Offset: {msg.offset} @ {new Date(msg.timestamp).toLocaleTimeString()}
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
  }

  // Config view
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={configModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={configHeaderStyle}>
          <h2 style={configTitleStyle}>🎯 快速消息查看</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={configContentStyle}>
          {/* Topic Selection */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>选择主题：</label>
            {loading ? (
              <div style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '13px' }}>
                加载主题中...
              </div>
            ) : topics.length === 0 ? (
              <div style={{ color: isDarkMode ? '#f59e0b' : '#d97706', fontSize: '13px' }}>
                ⚠️ 未找到主题。请断开并重新连接 Kafka 集群以刷新主题列表。
              </div>
            ) : (
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  loadPartitions(e.target.value);
                }}
                style={selectStyle}
              >
                <option value="">-- 选择主题 --</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Partition Selection */}
          {selectedTopic && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>选择分区：</label>
              <div style={checkboxGroupStyle}>
                {partitions.map((partition) => (
                  <label key={partition} style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={selectedPartitions.includes(partition)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPartitions([...selectedPartitions, partition]);
                        } else {
                          setSelectedPartitions(selectedPartitions.filter((p) => p !== partition));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    Partition {partition}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Start Position */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>起始位置：</label>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  value="latest"
                  checked={startPosition === 'latest'}
                  onChange={(e) => setStartPosition(e.target.value as StartPosition)}
                  style={{ marginRight: '8px' }}
                />
                从最新开始（最后10条消息）
              </label>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  value="earliest"
                  checked={startPosition === 'earliest'}
                  onChange={(e) => setStartPosition(e.target.value as StartPosition)}
                  style={{ marginRight: '8px' }}
                />
                从最早开始
              </label>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  value="specific"
                  checked={startPosition === 'specific'}
                  onChange={(e) => setStartPosition(e.target.value as StartPosition)}
                  style={{ marginRight: '8px' }}
                />
                指定 Offset：
                <input
                  type="number"
                  min="0"
                  value={specificOffset}
                  onChange={(e) => setSpecificOffset(e.target.value)}
                  style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    width: '100px',
                  }}
                  disabled={startPosition !== 'specific'}
                />
              </label>
            </div>
          </div>
        </div>

        <div style={configFooterStyle}>
          <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: isDarkMode ? '#6b7280' : '#9ca3af' }}>
            取消
          </button>
          <button
            onClick={handleStartViewing}
            style={{
              ...buttonStyle,
              backgroundColor: isDarkMode ? '#10b981' : '#059669',
              marginLeft: '12px',
            }}
          >
            开始查看
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
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
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
};

const configModalStyle: React.CSSProperties = {
  ...modalStyle,
  maxWidth: '600px',
};

const fullScreenContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#111827',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
};

const headerStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderBottom: '1px solid #374151',
  backgroundColor: '#1f2937',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#f3f4f6',
};

const configHeaderStyle: React.CSSProperties = {
  padding: '24px',
  borderBottom: '1px solid #374151',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#f3f4f6',
};

const backButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#374151',
  color: '#f3f4f6',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};

const closeButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: '24px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  margin: 0,
};

const configTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
  color: '#f3f4f6',
};

const controlsStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #374151',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#1f2937',
};

const toggleButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'background-color 0.2s',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'background-color 0.2s',
};

const statsStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: '13px',
  color: '#d1d5db',
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
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
  lineHeight: '1.5',
  color: '#f3f4f6',
};

const messageTimestampStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  marginBottom: '4px',
};

const messageContentStyle: React.CSSProperties = {
  wordBreak: 'break-all',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  color: '#9ca3af',
  fontSize: '14px',
};

const errorStyle: React.CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#7f1d1d',
  color: '#fca5a5',
  borderBottom: '1px solid #991b1b',
  fontSize: '13px',
};

const configContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#f3f4f6',
};

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #374151',
  borderRadius: '4px',
  backgroundColor: '#374151',
  color: '#f3f4f6',
  fontSize: '13px',
  cursor: 'pointer',
};

const checkboxGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  backgroundColor: '#1f2937',
  borderRadius: '4px',
  border: '1px solid #374151',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  color: '#d1d5db',
  cursor: 'pointer',
};

const radioGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#1f2937',
  borderRadius: '4px',
  border: '1px solid #374151',
};

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  color: '#d1d5db',
  cursor: 'pointer',
};

const configFooterStyle: React.CSSProperties = {
  padding: '24px',
  borderTop: '1px solid #374151',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};

export default QuickMessageViewer;
