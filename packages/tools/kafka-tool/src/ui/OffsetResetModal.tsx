import React, { useState } from 'react';
import { KafkaTool } from '../index';

interface OffsetResetModalProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  topics?: string[];
  onClose: () => void;
  onReset?: () => void;
  isDarkMode?: boolean;
}

/**
 * Task 15.1-15.4: Offset Reset Integration
 * Modal wrapper around OffsetResetForm for details page integration
 */
const OffsetResetModal: React.FC<OffsetResetModalProps> = ({
  kafkaTool,
  groupId,
  topics = [],
  onClose,
  onReset,
  isDarkMode = false,
}) => {
  const [strategy, setStrategy] = useState<'earliest' | 'latest'>('earliest');
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setError(null);
    setResetting(true);

    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();

      if (strategy === 'earliest') {
        await groupService.resetOffsetToEarliest(groupId, topics.length > 0 ? topics : undefined);
      } else {
        await groupService.resetOffsetToLatest(groupId, topics.length > 0 ? topics : undefined);
      }

      onReset?.();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset offset';
      setError(errorMsg);
    } finally {
      setResetting(false);
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
    marginBottom: '20px',
    lineHeight: '1.6',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '16px',
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

  const infoBoxStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
    color: isDarkMode ? '#fca5a5' : '#b91c1c',
    borderRadius: '4px',
    fontSize: '12px',
    marginBottom: '16px',
    lineHeight: '1.5',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '24px',
  };

  const buttonStyle = (isDanger: boolean = false): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDanger
      ? isDarkMode
        ? '#dc2626'
        : '#ef4444'
      : isDarkMode
      ? '#374151'
      : '#f3f4f6',
    color: isDanger
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>⬅️ 重置消费者组 Offset</h2>
        <p style={descriptionStyle}>
          重置消费者组 <strong>{groupId}</strong> 的 offset。这影响该组如何消费消息。
        </p>

        <div style={infoBoxStyle}>
          ⚠️ 警告：此操作将更改消费者组开始读取消息的位置。组中的所有消费者将跳转到新的 offset。
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={formGroupStyle}>
          <label style={labelStyle}>重置策略：</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as 'earliest' | 'latest')}
            style={selectStyle}
            disabled={resetting}
          >
            <option value="earliest">重置为最早（主题开头）</option>
            <option value="latest">重置为最新（主题结尾）</option>
          </select>
        </div>

        {topics.length > 0 && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>要重置的主题：</label>
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                borderRadius: '4px',
                fontSize: '12px',
                color: isDarkMode ? '#d1d5db' : '#6b7280',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {topics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                    color: isDarkMode ? '#93c5fd' : '#0c4a6e',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={buttonsStyle}>
          <button
            onClick={onClose}
            style={buttonStyle(false)}
            disabled={resetting}
          >
            取消
          </button>
          <button
            onClick={handleReset}
            style={buttonStyle(true)}
            disabled={resetting}
            onMouseEnter={(e) => {
              if (!resetting) {
                (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#b91c1c' : '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              if (!resetting) {
                (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#dc2626' : '#ef4444';
              }
            }}
          >
            {resetting ? '⟳ 重置中...' : `✓ 重置为${strategy === 'earliest' ? '最早' : '最新'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffsetResetModal;
