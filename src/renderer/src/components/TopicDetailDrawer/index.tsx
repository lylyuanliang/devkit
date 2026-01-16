/**
 * 主题详情抽屉组件
 */

import { useEffect } from 'react';
import { Drawer, Descriptions, Table, Spin, Alert, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTopicStore } from '../../stores/topicStore';
import type { Partition, ConfigEntry } from '../../../../common/types/kafka';

interface TopicDetailDrawerProps {
  open: boolean;
  topicName: string;
  connectionId: string;
  onClose: () => void;
}

export function TopicDetailDrawer({
  open,
  topicName,
  connectionId,
  onClose,
}: TopicDetailDrawerProps) {
  const { currentTopic, loading, loadTopicDetail } = useTopicStore();

  // 加载主题详情
  useEffect(() => {
    if (open && topicName && connectionId) {
      loadTopicDetail(connectionId, topicName).catch((error) => {
        console.error('加载主题详情失败:', error);
      });
    }
  }, [open, topicName, connectionId]);

  // 分区列定义
  const partitionColumns: ColumnsType<Partition> = [
    {
      title: '分区ID',
      dataIndex: 'partitionId',
      key: 'partitionId',
      width: 100,
    },
    {
      title: 'Leader',
      dataIndex: 'leader',
      key: 'leader',
      width: 100,
    },
    {
      title: 'Replicas',
      dataIndex: 'replicas',
      key: 'replicas',
      render: (replicas: number[]) => replicas.join(', '),
    },
    {
      title: 'ISR',
      dataIndex: 'isr',
      key: 'isr',
      render: (isr: number[]) => isr.join(', '),
    },
  ];

  // 配置列定义
  const configColumns: ColumnsType<ConfigEntry> = [
    {
      title: '配置项',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: '60%',
      render: (value: string, record) => {
        if (record.isSensitive) {
          return '***';
        }
        return value || '-';
      },
    },
  ];

  return (
    <Drawer
      title={`主题详情: ${topicName}`}
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      )}

      {!loading && currentTopic && (
        <>
          <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="主题名称">{currentTopic.name}</Descriptions.Item>
            <Descriptions.Item label="内部主题">
              {currentTopic.internal ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item label="分区数">{currentTopic.partitions}</Descriptions.Item>
            <Descriptions.Item label="副本因子">
              {currentTopic.replicationFactor}
            </Descriptions.Item>
          </Descriptions>

          <Tabs
            defaultActiveKey="partitions"
            items={[
              {
                key: 'partitions',
                label: '分区详情',
                children: (
                  <Table
                    columns={partitionColumns}
                    dataSource={currentTopic.partitionDetails}
                    rowKey="partitionId"
                    pagination={false}
                    size="small"
                  />
                ),
              },
              {
                key: 'configs',
                label: '配置信息',
                children: (
                  <Table
                    columns={configColumns}
                    dataSource={currentTopic.configs}
                    rowKey="name"
                    pagination={false}
                    size="small"
                    scroll={{ y: 400 }}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      {!loading && !currentTopic && (
        <Alert message="加载失败" description="无法加载主题详情" type="error" showIcon />
      )}
    </Drawer>
  );
}
