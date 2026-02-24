import React, { useState, useEffect } from 'react';
import EnvironmentSelector from './EnvironmentSelector';
import EnvironmentManager from './EnvironmentManager';

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  description?: string;
  tags?: string[];
}

interface EnvironmentPanelProps {
  environments: KafkaEnvironmentConfig[];
  activeEnvironment: string;
  isLoading?: boolean;
  onSwitch: (name: string) => Promise<void>;
  onAdd: (env: KafkaEnvironmentConfig) => Promise<void>;
  onEdit: (name: string, env: KafkaEnvironmentConfig) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onDuplicate: (name: string) => Promise<void>;
  error?: string;
}

/**
 * Environment Panel (Task 6.4-6.6)
 * 集成 EnvironmentSelector 和 EnvironmentManager
 * 提供加载状态、错误通知和完整的环境管理界面
 */
export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  environments,
  activeEnvironment,
  isLoading = false,
  onSwitch,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  error,
}) => {
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff' }}>
      {/* Header with Active Environment */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>🔌 环境管理</h2>
        {/* Environment Selector (Task 6.1 + 6.3) */}
        <EnvironmentSelector
          environments={environments}
          activeEnvironment={activeEnvironment}
          isLoading={isLoading}
          onSwitch={onSwitch}
        />
      </div>

      {/* Loading State (Task 6.4) */}
      {isLoading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          marginBottom: '16px',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⏳</span>
          <span>正在切换环境...</span>
        </div>
      )}

      {/* Error Notification (Task 6.5) */}
      {showError && error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          marginBottom: '16px',
          color: '#dc2626',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>❌ {error}</span>
          <button
            onClick={() => setShowError(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Active Environment Info */}
      {!isLoading && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#166534',
        }}>
          <p style={{ margin: '0 0 6px 0' }}>✓ 当前环境</p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {environments.find(e => e.name === activeEnvironment)?.name || 'Unknown'}
          </p>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>
            {environments.find(e => e.name === activeEnvironment)?.host}
          </p>
        </div>
      )}

      {/* Environment Manager (Task 6.2 + 6.6) */}
      <EnvironmentManager
        environments={environments}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
};

export default EnvironmentPanel;
