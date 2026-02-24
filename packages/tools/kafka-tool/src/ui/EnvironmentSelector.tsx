import React, { useState } from 'react';

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  description?: string;
  tags?: string[];
}

interface EnvironmentSelectorProps {
  environments: KafkaEnvironmentConfig[];
  activeEnvironment: string;
  isLoading?: boolean;
  onSwitch: (name: string) => Promise<void>;
}

/**
 * EnvironmentSelector 组件 (Task 6.1)
 * 显示所有已保存的环境，支持快速切换
 */
export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  activeEnvironment,
  isLoading = false,
  onSwitch,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (name: string) => {
    if (name === activeEnvironment) {
      setIsOpen(false);
      return;
    }

    try {
      await onSwitch(name);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch environment:', error);
    }
  };

  const activeEnv = environments.find(e => e.name === activeEnvironment);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Active Environment Display (Task 6.3) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{
          padding: '8px 12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <>⏳ 切换中...</>
        ) : (
          <>
            🔌 {activeEnv?.name || 'No environment'}
            <span style={{ marginLeft: '8px' }}>▼</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: '250px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {environments.map((env) => (
            <button
              key={env.name}
              onClick={() => handleSwitch(env.name)}
              disabled={isLoading}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                backgroundColor: env.name === activeEnvironment ? '#f0f9ff' : '#fff',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                textAlign: 'left',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <div style={{ fontWeight: env.name === activeEnvironment ? 600 : 400 }}>
                {env.name === activeEnvironment ? '✓ ' : '  '}
                {env.name}
              </div>
              {env.description && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {env.description}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {env.host}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnvironmentSelector;
