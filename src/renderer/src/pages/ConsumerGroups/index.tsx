/**
 * 消费组管理页面
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Space,
  Input,
  message,
  Tag,
  Popconfirm,
  Tooltip,
  Alert,
  Typography,
  Drawer,
  Descriptions,
  Card,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Select,
  InputNumber,
  Radio,
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConnectionStore } from '../../stores/connectionStore';
import { useConsumerGroupStore } from '../../stores/consumerGroupStore';
import type { ConsumerGroup } from '../../../../common/types/consumerGroup';
import type { OffsetResetConfig } from '../../../../common/types/consumerGroup';

const { Search } = Input;

export function ConsumerGroups() {
  const { activeConnectionId } = useConnectionStore();
  const {
    groups,
    currentGroupDetail,
    loading,
    loadGroups,
    loadGroupDetail,
    resetOffset,
    deleteGroup,
  } = useConsumerGroupStore();

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetForm] = Form.useForm();

  // 加载消费组列表
  const handleLoadGroups = async () => {
    if (!activeConnectionId) {
      message.warning('请先连接到 Kafka 集群');
      return;
    }

    try {
      await loadGroups(activeConnectionId);
    } catch (error) {
      message.error('加载消费组列表失败: ' + (error as Error).message);
    }
  };

  // 自动加载
  useEffect(() => {
    if (activeConnectionId) {
      handleLoadGroups();
    }
  }, [activeConnectionId]);

  // 查看详情
  const handleViewDetail = async (groupId: string) => {
    if (!activeConnectionId) {
      return;
    }

    setSelectedGroupId(groupId);
    setIsDetailDrawerOpen(true);

    try {
      await loadGroupDetail(activeConnectionId, groupId);
    } catch (error) {
      message.error('加载消费组详情失败: ' + (error as Error).message);
    }
  };

  // 删除消费组
  const handleDelete = async (groupId: string) => {
    if (!activeConnectionId) {
      return;
    }

    try {
      await deleteGroup(activeConnectionId, groupId);
      message.success('消费组已删除');
    } catch (error) {
      message.error('删除消费组失败: ' + (error as Error).message);
    }
  };

  // 打开重置Offset对话框
  const handleOpenResetModal = (groupId: string) => {
    if (!activeConnectionId) {
      return;
    }

    setSelectedGroupId(groupId);
    resetForm.resetFields();
    resetForm.setFieldsValue({
      groupId,
      strategy: 'latest',
    });
    setIsResetModalOpen(true);
  };

  // 重置Offset
  const handleResetOffset = async (values: any) => {
    if (!activeConnectionId) {
      return;
    }

    try {
      const config: OffsetResetConfig = {
        groupId: values.groupId,
        topic: values.topic,
        partitions: values.partitions,
        strategy: values.strategy,
        timestamp: values.timestamp,
        offset: values.offset,
        shift: values.shift,
      };

      await resetOffset(activeConnectionId, config);
      message.success('Offset 重置成功');
      setIsResetModalOpen(false);
      resetForm.resetFields();

      // 刷新详情
      if (isDetailDrawerOpen) {
        await loadGroupDetail(activeConnectionId, selectedGroupId);
      }
    } catch (error) {
      message.error('重置Offset失败: ' + (error as Error).message);
    }
  };

  // 过滤消费组
  const filteredGroups = groups.filter((group) =>
    group.groupId.toLowerCase().includes(searchText.toLowerCase())
  );

  // 获取状态颜色
  const getStateColor = (state: string) => {
    switch (state) {
      case 'STABLE':
        return 'success';
      case 'DEAD':
        return 'error';
      case 'EMPTY':
        return 'default';
      case 'PREPARING_REBALANCE':
      case 'COMPLETING_REBALANCE':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<ConsumerGroup> = [
    {
      title: '消费组ID',
      dataIndex: 'groupId',
      key: 'groupId',
      width: '40%',
      render: (groupId: string) => (
        <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{groupId}</span>
      ),
      sorter: (a, b) => a.groupId.localeCompare(b.groupId),
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: '20%',
      render: (state: string) => <Tag color={getStateColor(state)}>{state}</Tag>,
    },
    {
      title: '协议类型',
      dataIndex: 'protocolType',
      key: 'protocolType',
      width: '15%',
    },
    {
      title: '成员数',
      key: 'memberCount',
      width: '10%',
      render: (_, record) => record.members.length,
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(record.groupId)}
            >
              详情
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除这个消费组吗？"
            description="此操作不可恢复"
            onConfirm={() => handleDelete(record.groupId)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除消费组">
              <Button size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>消费组管理</Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={handleLoadGroups} loading={loading}>
          刷新
        </Button>
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
            placeholder="搜索消费组ID"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <span style={{ marginLeft: 16, color: '#666' }}>
            共 {filteredGroups.length} 个消费组
            {searchText && ` (已过滤)`}
          </span>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredGroups}
        rowKey="groupId"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个消费组`,
        }}
      />

      {/* 消费组详情抽屉 */}
      <Drawer
        title={`消费组详情: ${selectedGroupId}`}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={800}
      >
        {currentGroupDetail ? (
          <div>
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总Lag"
                    value={currentGroupDetail.totalLag}
                    valueStyle={{ color: currentGroupDetail.totalLag > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="成员数" value={currentGroupDetail.members.length} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="分区数" value={currentGroupDetail.partitionDetails.length} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="状态"
                    value={currentGroupDetail.state}
                    valueStyle={{ color: getStateColor(currentGroupDetail.state) === 'success' ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 基本信息 */}
            <Descriptions title="基本信息" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="消费组ID">{currentGroupDetail.groupId}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStateColor(currentGroupDetail.state)}>
                  {currentGroupDetail.state}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="协议类型">{currentGroupDetail.protocolType}</Descriptions.Item>
              <Descriptions.Item label="协议">{currentGroupDetail.protocol}</Descriptions.Item>
            </Descriptions>

            {/* 分区消费详情 */}
            <Card title="分区消费详情" style={{ marginBottom: 24 }}>
              <Table
                dataSource={currentGroupDetail.partitionDetails}
                rowKey={(record) => `${record.topic}-${record.partition}`}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '主题',
                    dataIndex: 'topic',
                    key: 'topic',
                  },
                  {
                    title: '分区',
                    dataIndex: 'partition',
                    key: 'partition',
                  },
                  {
                    title: '当前Offset',
                    dataIndex: 'currentOffset',
                    key: 'currentOffset',
                    render: (offset) => <span style={{ fontFamily: 'monospace' }}>{offset}</span>,
                  },
                  {
                    title: '日志结束Offset',
                    dataIndex: 'logEndOffset',
                    key: 'logEndOffset',
                    render: (offset) => <span style={{ fontFamily: 'monospace' }}>{offset}</span>,
                  },
                  {
                    title: 'Lag',
                    dataIndex: 'lag',
                    key: 'lag',
                    render: (lag) => (
                      <Tag color={lag > 0 ? 'error' : 'success'}>{lag}</Tag>
                    ),
                  },
                  {
                    title: '成员ID',
                    dataIndex: 'memberId',
                    key: 'memberId',
                    render: (memberId) => memberId || '-',
                  },
                ]}
              />
            </Card>

            {/* 成员信息 */}
            {currentGroupDetail.members.length > 0 && (
              <Card title="成员信息" style={{ marginBottom: 24 }}>
                <Table
                  dataSource={currentGroupDetail.members}
                  rowKey="memberId"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: '成员ID',
                      dataIndex: 'memberId',
                      key: 'memberId',
                      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>,
                    },
                    {
                      title: '客户端ID',
                      dataIndex: 'clientId',
                      key: 'clientId',
                    },
                    {
                      title: '客户端主机',
                      dataIndex: 'clientHost',
                      key: 'clientHost',
                    },
                  ]}
                />
              </Card>
            )}

            {/* 操作按钮 */}
            <Space>
              <Button
                type="primary"
                icon={<RedoOutlined />}
                onClick={() => handleOpenResetModal(selectedGroupId)}
              >
                重置Offset
              </Button>
              <Button onClick={() => handleLoadGroups()}>刷新列表</Button>
            </Space>
          </div>
        ) : (
          <div>加载中...</div>
        )}
      </Drawer>

      {/* 重置Offset对话框 */}
      <Modal
        title="重置Offset"
        open={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
        onOk={() => resetForm.submit()}
        width={600}
      >
        <Form
          form={resetForm}
          layout="vertical"
          onFinish={handleResetOffset}
          initialValues={{
            strategy: 'latest',
          }}
        >
          <Form.Item label="消费组ID" name="groupId">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="主题"
            name="topic"
            rules={[{ required: true, message: '请选择主题' }]}
          >
            <Input placeholder="输入主题名称" />
          </Form.Item>

          <Form.Item label="分区" name="partitions">
            <Select
              mode="multiple"
              placeholder="选择分区（留空表示所有分区）"
              allowClear
            >
              {/* 这里可以根据主题动态加载分区 */}
            </Select>
          </Form.Item>

          <Form.Item
            label="重置策略"
            name="strategy"
            rules={[{ required: true, message: '请选择重置策略' }]}
          >
            <Radio.Group>
              <Radio value="earliest">最早</Radio>
              <Radio value="latest">最新</Radio>
              <Radio value="offset">指定Offset</Radio>
              <Radio value="timestamp">指定时间戳</Radio>
              <Radio value="shift">偏移量</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.strategy !== currentValues.strategy
            }
          >
            {({ getFieldValue }) => {
              const strategy = getFieldValue('strategy');
              if (strategy === 'offset') {
                return (
                  <Form.Item
                    label="Offset"
                    name="offset"
                    rules={[{ required: true, message: '请输入Offset' }]}
                  >
                    <Input placeholder="输入Offset值" />
                  </Form.Item>
                );
              }
              if (strategy === 'timestamp') {
                return (
                  <Form.Item
                    label="时间戳"
                    name="timestamp"
                    rules={[{ required: true, message: '请输入时间戳' }]}
                  >
                    <InputNumber
                      placeholder="输入Unix时间戳（毫秒）"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                );
              }
              if (strategy === 'shift') {
                return (
                  <Form.Item
                    label="偏移量"
                    name="shift"
                    rules={[{ required: true, message: '请输入偏移量' }]}
                  >
                    <InputNumber
                      placeholder="输入偏移量（正数向前，负数向后）"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
