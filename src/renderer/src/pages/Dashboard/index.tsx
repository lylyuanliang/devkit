/**
 * 仪表盘页面
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Alert,
  Spin,
  Select,
  message,
} from 'antd';
import {
  ClusterOutlined,
  DatabaseOutlined,
  TeamOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  SendOutlined,
  InboxOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useConnectionStore } from '../../stores/connectionStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useTopicStore } from '../../stores/topicStore';
import { useConsumerGroupStore } from '../../stores/consumerGroupStore';
import type { Broker } from '../../../../common/types/kafka';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;

export function Dashboard() {
  const navigate = useNavigate();
  const { connections, activeConnectionId, loadConnections } = useConnectionStore();
  const { topics, loadTopics } = useTopicStore();
  const { groups, loadGroups } = useConsumerGroupStore();
  const {
    statistics,
    clusterInfo,
    brokers,
    loading,
    loadStatistics,
    loadClusterInfo,
  } = useDashboardStore();

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(activeConnectionId);

  // 加载连接列表
  useEffect(() => {
    loadConnections().catch(console.error);
  }, []);

  // 当活动连接变化时，更新统计数据
  useEffect(() => {
    setSelectedConnectionId(activeConnectionId);
    if (activeConnectionId) {
      // 并行加载所有数据
      Promise.all([
        loadStatistics(activeConnectionId, connections.length),
        loadClusterInfo(activeConnectionId).catch(console.error),
        loadTopics(activeConnectionId).catch(console.error),
        loadGroups(activeConnectionId).catch(console.error),
      ]);
    } else {
      loadStatistics('', connections.length);
    }
  }, [activeConnectionId, connections.length]);

  // 切换连接
  const handleSwitchConnection = async (connectionId: string) => {
    try {
      if (connectionId === activeConnectionId) {
        return;
      }

      // 断开当前连接
      if (activeConnectionId) {
        await useConnectionStore.getState().disconnectFromKafka(activeConnectionId);
      }

      // 连接新连接
      await useConnectionStore.getState().connectToKafka(connectionId);
      setSelectedConnectionId(connectionId);
      message.success('连接已切换');
    } catch (error) {
      message.error('切换连接失败: ' + (error as Error).message);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    if (activeConnectionId) {
      loadStatistics(activeConnectionId, connections.length);
      loadClusterInfo(activeConnectionId).catch(console.error);
    }
  };

  // Broker表格列定义
  const brokerColumns: ColumnsType<Broker> = [
    {
      title: '节点ID',
      dataIndex: 'nodeId',
      key: 'nodeId',
      width: 100,
      render: (nodeId: number, record) => (
        <Space>
          <Text strong>{nodeId}</Text>
          {clusterInfo?.controller === nodeId && (
            <Tag color="red">Controller</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
      render: (host: string) => <Text code>{host}</Text>,
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 100,
    },
    {
      title: 'Rack',
      dataIndex: 'rack',
      key: 'rack',
      render: (rack?: string) => rack || '-',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            📊 仪表盘
          </Title>
          <Paragraph style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            实时监控 Kafka 集群状态和统计信息
          </Paragraph>
        </div>
        <Space>
          {activeConnectionId && (
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          )}
        </Space>
      </div>

      {!activeConnectionId && (
        <Alert
          message="未连接到 Kafka 集群"
          description="请先在连接管理中添加并连接到 Kafka 集群，以查看集群统计信息"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => navigate('/connections')}
            >
              前往连接管理
            </Button>
          }
        />
      )}

      {/* 连接切换器 */}
      {connections.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Text strong>当前连接：</Text>
              <Select
                value={selectedConnectionId}
                onChange={handleSwitchConnection}
                style={{ width: 300 }}
                placeholder="选择连接"
                disabled={loading}
              >
                {connections.map((conn) => (
                  <Select.Option key={conn.id} value={conn.id}>
                    <Space>
                      {activeConnectionId === conn.id && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                      {conn.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Space>
            {activeConnectionId && (
              <Button
                icon={<SwapOutlined />}
                onClick={() => navigate('/connections')}
              >
                管理连接
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* 统计卡片 */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="连接数"
              value={statistics.connectionCount}
              prefix={<ClusterOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="主题数"
              value={statistics.topicCount}
              prefix={<DatabaseOutlined style={{ color: '#f5576c' }} />}
              valueStyle={{ color: '#f5576c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="消费组"
              value={statistics.consumerGroupCount}
              prefix={<TeamOutlined style={{ color: '#00f2fe' }} />}
              valueStyle={{ color: '#00f2fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Broker 数"
              value={statistics.brokerCount}
              prefix={<RocketOutlined style={{ color: '#38f9d7' }} />}
              valueStyle={{ color: '#38f9d7' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* 集群信息 */}
        <Col xs={24} lg={12}>
          <Card
            title="集群信息"
            extra={
              activeConnectionId && (
                <Button
                  type="link"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => loadClusterInfo(activeConnectionId)}
                  loading={loading}
                >
                  刷新
                </Button>
              )
            }
          >
            {loading && !clusterInfo ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : clusterInfo ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text type="secondary">集群ID：</Text>
                  <Text code>{clusterInfo.clusterId}</Text>
                </div>
                <div>
                  <Text type="secondary">Controller：</Text>
                  <Tag color="red">节点 {clusterInfo.controller}</Tag>
                </div>
                <div>
                  <Text type="secondary">Broker 数量：</Text>
                  <Text strong>{clusterInfo.brokers.length}</Text>
                </div>
              </Space>
            ) : (
              <Alert
                message="暂无集群信息"
                description="请连接到 Kafka 集群以查看集群信息"
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Broker 列表 */}
        <Col xs={24} lg={12}>
          <Card
            title="Broker 列表"
            extra={
              activeConnectionId && (
                <Button
                  type="link"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => loadClusterInfo(activeConnectionId)}
                  loading={loading}
                >
                  刷新
                </Button>
              )
            }
          >
            {loading && brokers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : brokers.length > 0 ? (
              <Table
                dataSource={brokers}
                columns={brokerColumns}
                rowKey="nodeId"
                pagination={false}
                size="small"
              />
            ) : (
              <Alert
                message="暂无 Broker 信息"
                description="请连接到 Kafka 集群以查看 Broker 列表"
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* 快速操作 */}
        <Col xs={24} lg={16}>
          <Card title="🚀 快速操作" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  连接到 Kafka 集群
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: 12 }}>
                  在"连接管理"中添加并连接到你的 Kafka 集群
                </Paragraph>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/connections')}
                >
                  前往连接管理
                </Button>
              </div>

              <div>
                <Title level={4}>
                  <DatabaseOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  管理主题
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: 12 }}>
                  创建、查看、删除 Kafka 主题
                </Paragraph>
                <Space>
                  <Button onClick={() => navigate('/topics')}>
                    主题管理
                  </Button>
                  {activeConnectionId && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/topics')}
                    >
                      创建主题
                    </Button>
                  )}
                </Space>
              </div>

              <div>
                <Title level={4}>
                  <RocketOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                  发送和接收消息
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: 12 }}>
                  在"消息生产"发送消息，在"消息消费"接收消息
                </Paragraph>
                <Space>
                  <Button
                    icon={<SendOutlined />}
                    onClick={() => navigate('/producer')}
                  >
                    消息生产
                  </Button>
                  <Button
                    icon={<InboxOutlined />}
                    onClick={() => navigate('/consumer')}
                  >
                    消息消费
                  </Button>
                </Space>
              </div>

              {activeConnectionId && (
                <div>
                  <Title level={4}>
                    <TeamOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                    消费组管理
                  </Title>
                  <Paragraph style={{ color: '#666', marginBottom: 12 }}>
                    查看和管理 Kafka 消费组
                  </Paragraph>
                  <Button onClick={() => navigate('/consumer-groups')}>
                    消费组管理
                  </Button>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 功能特性 */}
        <Col xs={24} lg={8}>
          <Card title="💡 功能特性" style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>多连接管理</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>SASL/SSL 认证</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>实时消息消费</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>JSON 格式验证</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>消息导出</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>消费组管理</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>Offset 重置</span>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ fontWeight: 500 }}>密码加密存储</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
