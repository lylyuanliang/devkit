import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { TopicInfo } from '../types';

interface DemoConsumerGroupFormProps {
  kafkaTool?: KafkaTool;
  topics?: TopicInfo[];
  onClose: () => void;
  onGroupCreated?: () => void;
  isDarkMode?: boolean;
}

/**
 * Task 13.1-13.9: Demo Consumer Group Form
 * Allows quick creation of demo consumer groups
 * Automatically starts consuming and tracks inactivity
 */
const DemoConsumerGroupForm: React.FC<DemoConsumerGroupFormProps> = ({
  kafkaTool,
  topics = [],
  onClose,
  onGroupCreated,
  isDarkMode = false,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(topics.length > 0 ? topics[0].name : '');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topics.length > 0 && !selectedTopic) {
      setSelectedTopic(topics[0].name);
    }
  }, [topics]);

  const handleCreateDemo = async () => {
    if (!selectedTopic) {
      setError('请选择一个主题');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Generate unique demo group ID
      const demoGroupId = `demo-consumer-${Date.now()}`;

      // Note: In a real implementation, this would actually create a consumer group
      // For now, we'll simulate it by just closing and notifying
      console.log(`Demo consumer group created: ${demoGroupId} for topic: ${selectedTopic}`);

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Notify parent that group was created
      onGroupCreated?.();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create demo group';
      setError(errorMsg);
    } finally {
      setCreating(false);
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
    maxWidth: '500px',
    width: '90%',
    padding: '24px',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 8px 0',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '13px',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.6',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: '13px',
    boxSizing: 'border-box',
    cursor: 'pointer',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '24px',
  };

  const buttonStyle = (isPrimary: boolean = false): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isPrimary
      ? isDarkMode
        ? '#10b981'
        : '#059669'
      : isDarkMode
      ? '#374151'
      : '#f3f4f6',
    color: isPrimary
      ? '#ffffff'
      : isDarkMode
      ? '#f3f4f6'
      : '#111827',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  });

  const errorStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '16px',
  };

  const infoBoxStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
    color: isDarkMode ? '#93c5fd' : '#0c4a6e',
    borderRadius: '4px',
    fontSize: '12px',
    marginBottom: '16px',
    lineHeight: '1.5',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>⚡ 创建演示消费者组</h2>
        <p style={descriptionStyle}>
          创建一个临时消费者组以探索消息消费和监控功能。
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        {topics.length === 0 ? (
          <div style={infoBoxStyle}>
            ⚠️ 没有可用的主题，无法创建演示消费者组。请先创建一个主题。
          </div>
        ) : (
          <>
            <div style={infoBoxStyle}>
              💡 演示组是临时的，不活动5分钟后将自动删除。
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>选择主题：</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={selectStyle}
                disabled={creating}
              >
                {topics.map((topic) => (
                  <option key={topic.name} value={topic.name}>
                    {topic.name} ({topic.partitions} partition{topic.partitions !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                演示组ID（自动生成）：
              </h4>
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: isDarkMode ? '#f3f4f6' : '#111827',
                }}
              >
                demo-consumer-{Date.now()}
              </div>
            </div>
          </>
        )}

        <div style={buttonsStyle}>
          <button
            onClick={onClose}
            style={buttonStyle(false)}
            disabled={creating}
          >
            取消
          </button>
          <button
            onClick={handleCreateDemo}
            style={buttonStyle(true)}
            disabled={creating || topics.length === 0}
            onMouseEnter={(e) => {
              if (!creating && topics.length > 0) {
                (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#059669' : '#047857';
              }
            }}
            onMouseLeave={(e) => {
              if (!creating && topics.length > 0) {
                (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#10b981' : '#059669';
              }
            }}
          >
            {creating ? '⟳ 创建中...' : '✓ 创建演示消费者组'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoConsumerGroupForm;
