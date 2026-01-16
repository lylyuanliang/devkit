/**
 * 主题管理页面
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Space,
  Input,
  Modal,
  message,
  Tag,
  Popconfirm,
  Tooltip,
  Alert,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTopicStore } from '../../stores/topicStore';
import { CreateTopicForm } from '../../components/CreateTopicForm';
import { TopicDetailDrawer } from '../../components/TopicDetailDrawer';
import type { Topic } from '../../../../common/types/kafka';

const { Search } = Input;

export function Topics() {
  const { activeConnectionId } = useConnectionStore();
  const { topics, loading, loadTopics, deleteTopic } = useTopicStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTopicName, setSelectedTopicName] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  // 加载主题列表
  const handleLoadTopics = async () => {
    if (!activeConnectionId) {
      message.warning('请先连接到 Kafka 集群');
      return;
    }

    try {
      await loadTopics(activeConnectionId);
    } catch (error) {
      message.error('加载主题列表失败: ' + (error as Error).message);
    }
  };

  // 自动加载
  useEffect(() => {
    if (activeConnectionId) {
      handleLoadTopics();
    }
  }, [activeConnectionId]);

  // 打开创建对话框
  const handleCreate = () => {
    if (!activeConnectionId) {
      message.warning('请先连接到 Kafka 集群');
      return;
    }
    setIsCreateModalOpen(true);
  };

  // 创建成功回调
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    message.success('主题已创建');
  };

  // 查看详情
  const handleViewDetail = (topicName: string) => {
    setSelectedTopicName(topicName);
    setIsDetailDrawerOpen(true);
  };

  // 删除主题
  const handleDelete = async (topicName: string) => {
    if (!activeConnectionId) {
      return;
    }

    try {
      await deleteTopic(activeConnectionId, topicName);
      message.success('主题已删除');
    } catch (error) {
      message.error('删除主题失败: ' + (error as Error).message);
    }
  };

  // 过滤主题
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 表格列定义
  const columns: ColumnsType<Topic> = [
    {
      title: '主题名称',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (name: string, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.internal && <Tag color="orange">内部</Tag>}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '分区数',
      dataIndex: 'partitions',
      key: 'partitions',
      width: '15%',
      sorter: (a, b) => a.partitions - b.partitions,
    },
    {
      title: '副本因子',
      dataIndex: 'replicationFactor',
      key: 'replicationFactor',
      width: '15%',
      sorter: (a, b) => a.replicationFactor - b.replicationFactor,
    },
    {
      title: '操作',
      key: 'action',
      width: '30%',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(record.name)}
            >
              详情
            </Button>
          </Tooltip>
          {!record.internal && (
            <Popconfirm
              title="确定要删除这个主题吗？"
              description={
                <div>
                  <p>此操作将删除主题的所有数据，且不可恢复。</p>
                  <p style={{ color: 'red', fontWeight: 500 }}>
                    主题名称: {record.name}
                  </p>
                </div>
              }
              onConfirm={() => handleDelete(record.name)}
              okText="确定删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="删除主题">
                <Button size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>主题管理</Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleLoadTopics} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建主题
          </Button>
        </Space>
      </div>

      {!activeConnectionId && (
        <Alert
          message="未连接到 Kafka 集群"
          description="请先在连接管理中添加并连接到 Kafka 集群"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {activeConnectionId && (
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索主题名称"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <span style={{ marginLeft: 16, color: '#666' }}>
            共 {filteredTopics.length} 个主题
            {searchText && ` (已过滤)`}
          </span>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredTopics}
        rowKey="name"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个主题`,
        }}
      />

      {/* 创建主题对话框 */}
      <Modal
        title="创建主题"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CreateTopicForm
          connectionId={activeConnectionId || ''}
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* 主题详情抽屉 */}
      <TopicDetailDrawer
        open={isDetailDrawerOpen}
        topicName={selectedTopicName}
        connectionId={activeConnectionId || ''}
        onClose={() => setIsDetailDrawerOpen(false)}
      />
    </div>
  );
}
