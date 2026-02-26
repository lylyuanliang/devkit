import React, { useState } from 'react';
import { KafkaTool } from '../index';
import UsageGuideModal from './UsageGuideModal';
import DemoConsumerGroupForm from './DemoConsumerGroupForm';

interface ConsumerGroupOnboardingProps {
  kafkaTool?: KafkaTool;
  isDarkMode?: boolean;
  onGroupCreated?: () => void;
  clusterId?: string;
}

/**
 * Task 11.1-14.5: Onboarding Interface
 * Shows when no consumer groups exist
 * Three main options: Guide, Demo, System Topic
 */
const ConsumerGroupOnboarding: React.FC<ConsumerGroupOnboardingProps> = ({
  kafkaTool,
  isDarkMode = false,
  onGroupCreated,
  clusterId,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px 20px',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
    textAlign: 'center',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    textAlign: 'center',
    marginBottom: '40px',
    maxWidth: '600px',
  };

  const optionsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    width: '100%',
  };

  const optionCardStyle: React.CSSProperties = {
    padding: '24px',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const optionIconStyle: React.CSSProperties = {
    fontSize: '32px',
    marginBottom: '8px',
  };

  const optionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const optionDescStyle: React.CSSProperties = {
    fontSize: '13px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    lineHeight: '1.5',
  };

  const optionButtonStyle: React.CSSProperties = {
    padding: '10px 16px',
    marginTop: 'auto',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '12px',
    color: isDarkMode ? '#6b7280' : '#9ca3af',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>👋 欢迎使用消息消费者</h1>
      <p style={descriptionStyle}>
        开始创建你的第一个消费者组。选择下面的一个选项：
      </p>

      <div style={optionsContainerStyle}>
        {/* Usage Guide Option */}
        <div
          style={optionCardStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#3b82f6' : '#2563eb';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#1e3a8a' : '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
          }}
        >
          <div style={optionIconStyle}>📚</div>
          <h3 style={optionTitleStyle}>查看使用指南</h3>
          <p style={optionDescStyle}>
            学习如何使用Node.js、Python、Java等代码示例创建消费者组。
          </p>
          <button
            onClick={() => setShowGuide(true)}
            style={optionButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#1d4ed8' : '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#3b82f6' : '#2563eb';
            }}
          >
            📖 查看指南
          </button>
        </div>

        {/* Demo Consumer Group Option */}
        <div
          style={optionCardStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#10b981' : '#059669';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#064e3b' : '#f0fdf4';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
          }}
        >
          <div style={optionIconStyle}>⚡</div>
          <h3 style={optionTitleStyle}>创建演示组</h3>
          <p style={optionDescStyle}>
            快速创建临时消费者组以探索监控功能。不活动后自动删除。
          </p>
          <button
            onClick={() => setShowDemo(true)}
            style={{ ...optionButtonStyle, backgroundColor: isDarkMode ? '#10b981' : '#059669' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#047857' : '#047857';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#10b981' : '#059669';
            }}
          >
            ⚡ 创建演示
          </button>
        </div>

        {/* System Topic Option */}
        <div
          style={optionCardStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#f59e0b' : '#d97706';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#78350f' : '#fffbeb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
            (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
          }}
        >
          <div style={optionIconStyle}>🔍</div>
          <h3 style={optionTitleStyle}>查看系统主题</h3>
          <p style={optionDescStyle}>
            探索__consumer_offsets系统主题以查看消费者组偏移量管理的实际应用。
          </p>
          <button
            onClick={() => {
              // This would navigate to topic list in a real app
              console.log('Navigate to system topic');
            }}
            style={{ ...optionButtonStyle, backgroundColor: isDarkMode ? '#f59e0b' : '#d97706' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#d97706' : '#b45309';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode ? '#f59e0b' : '#d97706';
            }}
          >
            🔍 查看主题
          </button>
        </div>
      </div>

      <div style={footerStyle}>
        💡 提示：创建你的第一个消费者组以开始监控消费进度和滞后指标。
      </div>

      {/* Modals */}
      {showGuide && <UsageGuideModal onClose={() => setShowGuide(false)} isDarkMode={isDarkMode} />}
      {showDemo && (
        <DemoConsumerGroupForm
          kafkaTool={kafkaTool}
          clusterId={clusterId}
          onClose={() => setShowDemo(false)}
          onGroupCreated={() => {
            setShowDemo(false);
            onGroupCreated?.();
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ConsumerGroupOnboarding;
