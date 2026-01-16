/**
 * 消息消费页面
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Space,
  Radio,
  Alert,
  List,
  Tag,
  Typography,
  Divider,
  message,
  Empty,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ClearOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTopicStore } from '../../stores/topicStore';
import { useConsumerStore } from '../../stores/consumerStore';
import { MessageItem } from '../../components/MessageItem';
import type { ConsumeOptions } from '../../../../common/types/message';

const { Text, Paragraph } = Typography;

export function Consumer() {
  const { activeConnectionId } = useConnectionStore();
  const { topics, loadTopics } = useTopicStore();
  const {
    messages,
    currentSession,
    consuming,
    addMessage,
    clearMessages,
    startConsuming,
    pauseConsuming,
    resumeConsuming,
    stopConsuming,
  } = useConsumerStore();

  const [form] = Form.useForm();
  const [autoScroll, setAutoScroll] = useState(true);

  // 加载主题列表
  useEffect(() => {
    if (activeConnectionId) {
      loadTopics(activeConnectionId).catch(console.error);
    }
  }, [activeConnectionId]);

  // 监听消息推送
  useEffect(() => {
    const unsubscribe = window.kafkaApi.consumer.onMessage((data: any) => {
      if (data.sessionId === currentSession?.id) {
        addMessage(data.message);
        
        // 自动滚动到底部
        if (autoScroll) {
          setTimeout(() => {
            const container = document.getElementById('message-list-container');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 100);
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentSession, autoScroll, addMessage]);

  // 开始消费
  const handleStart = async (values: any) => {
    if (!activeConnectionId) {
      message.warning('请先连接到 Kafka 集群');
      return;
    }

    try {
      const options: ConsumeOptions = {
        topic: values.topic,
        fromBeginning: values.strategy === 'earliest',
        groupId: values.groupId || `kafka-client-${Date.now()}`,
        autoCommit: true,
      };

      await startConsuming(activeConnectionId, options);
      message.success('开始消费消息');
    } catch (error) {
      message.error('开始消费失败: ' + (error as Error).message);
    }
  };

  // 暂停消费
  const handlePause = async () => {
    try {
      await pauseConsuming();
      message.info('消费已暂停');
    } catch (error) {
      message.error('暂停失败: ' + (error as Error).message);
    }
  };

  // 恢复消费
  const handleResume = async () => {
    try {
      await resumeConsuming();
      message.success('消费已恢复');
    } catch (error) {
      message.error('恢复失败: ' + (error as Error).message);
    }
  };

  // 停止消费
  const handleStop = async () => {
    try {
      await stopConsuming();
      message.info('消费已停止');
    } catch (error) {
      message.error('停止失败: ' + (error as Error).message);
    }
  };

  // 清空消息
  const handleClear = () => {
    clearMessages();
    message.success('消息列表已清空');
  };

  // 导出消息
  const handleExport = () => {
    if (messages.length === 0) {
      message.warning('没有消息可以导出');
      return;
    }

    const json = JSON.stringify(messages, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kafka-messages-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('消息已导出');
  };

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>消息消费</Typography.Title>

      {!activeConnectionId && (
        <Alert
          message="未连接到 Kafka 集群"
          description="请先在连接管理中添加并连接到 Kafka 集群"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 消费配置 */}
      <Card title="消费配置" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleStart}
          initialValues={{
            strategy: 'latest',
            groupId: '',
          }}
        >
          <Form.Item
            label="主题"
            name="topic"
            rules={[{ required: true, message: '请选择主题' }]}
          >
            <Select
              placeholder="选择要消费的主题"
              style={{ width: 200 }}
              disabled={consuming}
              options={topics.map((topic) => ({
                label: topic.name,
                value: topic.name,
              }))}
            />
          </Form.Item>

          <Form.Item label="消费策略" name="strategy">
            <Radio.Group disabled={consuming}>
              <Radio value="latest">最新消息</Radio>
              <Radio value="earliest">最早消息</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="消费组ID" name="groupId">
            <Input
              placeholder="可选，默认自动生成"
              style={{ width: 200 }}
              disabled={consuming}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              {!consuming && (
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlayCircleOutlined />}
                  disabled={!activeConnectionId}
                >
                  开始消费
                </Button>
              )}
              
              {consuming && currentSession?.status === 'running' && (
                <Button icon={<PauseCircleOutlined />} onClick={handlePause}>
                  暂停
                </Button>
              )}
              
              {consuming && currentSession?.status === 'paused' && (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleResume}>
                  恢复
                </Button>
              )}
              
              {consuming && (
                <Button danger icon={<StopOutlined />} onClick={handleStop}>
                  停止
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 消息列表 */}
      <Card
        title={
          <Space>
            <span>消息列表</span>
            {messages.length > 0 && (
              <Tag color="blue">已接收 {messages.length} 条消息</Tag>
            )}
            {currentSession && (
              <Tag color={currentSession.status === 'running' ? 'success' : 'warning'}>
                {currentSession.status === 'running' ? '消费中' : '已暂停'}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              导出
            </Button>
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              清空
            </Button>
          </Space>
        }
      >
        <div
          id="message-list-container"
          style={{
            height: 500,
            overflow: 'auto',
            backgroundColor: '#fafafa',
            padding: 16,
            borderRadius: 4,
          }}
        >
          {messages.length === 0 ? (
            <Empty
              description={consuming ? '等待消息...' : '点击"开始消费"接收消息'}
              style={{ marginTop: 100 }}
            />
          ) : (
            <List
              dataSource={messages}
              renderItem={(msg, index) => (
                <MessageItem key={`${msg.offset}-${msg.partition}-${index}`} message={msg} index={index} />
              )}
            />
          )}
        </div>

        <Divider />

        <Space>
          <span>自动滚动:</span>
          <Radio.Group value={autoScroll} onChange={(e) => setAutoScroll(e.target.value)}>
            <Radio value={true}>开启</Radio>
            <Radio value={false}>关闭</Radio>
          </Radio.Group>
        </Space>
      </Card>
    </div>
  );
}
