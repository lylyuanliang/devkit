import React, { useState } from 'react';

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  connectionConfig?: any;
  monitoring?: any;
  description?: string;
  tags?: string[];
}

interface EnvironmentManagerProps {
  environments: KafkaEnvironmentConfig[];
  onAdd: (env: KafkaEnvironmentConfig) => Promise<void>;
  onEdit: (name: string, env: KafkaEnvironmentConfig) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onDuplicate: (name: string) => Promise<void>;
}

/**
 * EnvironmentManager 组件 (Task 6.2)
 * 支持 CRUD 操作：增加、编辑、删除、复制环境
 */
export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  environments,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEnv, setEditingEnv] = useState<KafkaEnvironmentConfig | null>(null);
  const [formData, setFormData] = useState<Partial<KafkaEnvironmentConfig>>({
    name: '',
    host: 'localhost',
    brokers: [],
    description: '',
    tags: [],
  });

  const handleAdd = async () => {
    if (!formData.name || !formData.host || !formData.brokers?.length) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onAdd(formData as KafkaEnvironmentConfig);
      resetForm();
      setShowForm(false);
    } catch (error) {
      alert(`Failed to add environment: ${error}`);
    }
  };

  const handleEdit = async () => {
    if (!editingEnv?.name || !formData.name || !formData.host) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onEdit(editingEnv.name, formData as KafkaEnvironmentConfig);
      resetForm();
      setShowForm(false);
    } catch (error) {
      alert(`Failed to edit environment: ${error}`);
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm(`Are you sure you want to delete environment "${name}"?`)) {
      try {
        await onDelete(name);
      } catch (error) {
        alert(`Failed to delete environment: ${error}`);
      }
    }
  };

  const handleDuplicate = async (name: string) => {
    const env = environments.find(e => e.name === name);
    if (!env) return;

    const newName = `${name}-copy`;
    try {
      await onDuplicate(name);
      resetForm();
    } catch (error) {
      alert(`Failed to duplicate environment: ${error}`);
    }
  };

  const resetForm = () => {
    setEditingEnv(null);
    setFormData({
      name: '',
      host: 'localhost',
      brokers: [],
      description: '',
      tags: [],
    });
  };

  const startEdit = (env: KafkaEnvironmentConfig) => {
    setEditingEnv(env);
    setFormData({ ...env });
    setShowForm(true);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>🔧 环境管理</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + 新建环境
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <h4>{editingEnv ? '编辑环境' : '新建环境'}</h4>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>环境名称 *</label>
            <input
              type="text"
              placeholder="e.g., production, staging, dev"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!!editingEnv}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Host *</label>
            <input
              type="text"
              placeholder="e.g., kafka.example.com"
              value={formData.host || ''}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Broker 列表 (逗号分隔) *</label>
            <textarea
              placeholder="e.g., kafka1:9092,kafka2:9092,kafka3:9092"
              value={formData.brokers?.join(',') || ''}
              onChange={(e) => setFormData({
                ...formData,
                brokers: e.target.value.split(',').map(b => b.trim()).filter(b => b),
              })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
                minHeight: '80px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>描述</label>
            <textarea
              placeholder="e.g., Production Kafka cluster in us-east-1"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={editingEnv ? handleEdit : handleAdd}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {editingEnv ? '保存修改' : '创建'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Environments List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {environments.map((env) => (
          <div
            key={env.name}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>{env.name}</h4>
                {env.description && (
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#6b7280' }}>
                    {env.description}
                  </p>
                )}
                <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
                  {env.host} • {env.brokers.length} broker(s)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => startEdit(env)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDuplicate(env.name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  复制
                </button>
                <button
                  onClick={() => handleDelete(env.name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentManager;
