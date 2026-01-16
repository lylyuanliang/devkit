/**
 * 连接管理页面
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Space,
  Modal,
  message,
  Tag,
  Popconfirm,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConnectionStore } from '../../stores/connectionStore';
import { ConnectionForm } from '../../components/ConnectionForm';
import { showError } from '../../utils/errorHandler';
import type { ConnectionConfig } from '../../../../common/types/connection';

export function Connections() {
  const {
    connections,
    activeConnectionId,
    loading,
    loadConnections,
    deleteConnection,
    connectToKafka,
    disconnectFromKafka,
  } = useConnectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | null>(null);

  // 加载连接列表
  useEffect(() => {
    loadConnections().catch((error) => {
      showError(error);
    });
  }, [loadConnections]);

  // 打开新建对话框
  const handleCreate = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (connection: ConnectionConfig) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  // 关闭对话框
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingConnection(null);
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingConnection(null);
    message.success(editingConnection ? '连接已更新' : '连接已创建');
  };

  // 删除连接
  const handleDelete = async (id: string) => {
    try {
      await deleteConnection(id);
      message.success('连接已删除');
    } catch (error) {
      message.error('删除连接失败: ' + (error as Error).message);
    }
  };

  // 连接/断开
  const handleToggleConnection = async (connection: ConnectionConfig) => {
    try {
      if (activeConnectionId === connection.id) {
        await disconnectFromKafka(connection.id);
        message.success('已断开连接');
      } else {
        await connectToKafka(connection.id);
        message.success('连接成功');
      }
    } catch (error) {
      showError(error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<ConnectionConfig> = [
    {
      title: '连接名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          {activeConnectionId === record.id ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
          )}
          <span style={{ fontWeight: activeConnectionId === record.id ? 600 : 400 }}>
            {name}
          </span>
          {activeConnectionId === record.id && <Tag color="success">已连接</Tag>}
        </Space>
      ),
    },
    {
      title: 'Broker地址',
      dataIndex: 'brokers',
      key: 'brokers',
      render: (brokers: string[]) => brokers.join(', '),
    },
    {
      title: '认证',
      key: 'auth',
      render: (_, record) => {
        if (record.sasl) {
          return <Tag color="blue">SASL/{record.sasl.mechanism.toUpperCase()}</Tag>;
        }
        if (record.ssl?.enabled) {
          return <Tag color="cyan">SSL</Tag>;
        }
        return <Tag>无</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={activeConnectionId === record.id ? '断开连接' : '连接'}>
            <Button
              type={activeConnectionId === record.id ? 'default' : 'primary'}
              size="small"
              icon={<ApiOutlined />}
              onClick={() => handleToggleConnection(record)}
            >
              {activeConnectionId === record.id ? '断开' : '连接'}
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个连接吗？"
            description="此操作不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>连接管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建连接
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={connections}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个连接`,
        }}
      />

      <Modal
        title={editingConnection ? '编辑连接' : '新建连接'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ConnectionForm
          connection={editingConnection}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}
