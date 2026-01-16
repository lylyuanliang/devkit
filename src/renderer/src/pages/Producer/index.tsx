/**
 * 消息生产页面
 */

import { useState, useEffect } from 'react';
import {
  Form,
  Select,
  Input,
  Button,
  Space,
  Card,
  message,
  Alert,
  Radio,
  InputNumber,
  Tag,
  Typography,
} from 'antd';
import { SendOutlined, ClearOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import { useTopicStore } from '../../stores/topicStore';
import { useProducerStore } from '../../stores/producerStore';
import { showError } from '../../utils/errorHandler';
import type { ProducerMessage, MessageHeader } from '../../../../common/types/message';

const { TextArea } = Input;

export function Producer() {
  const { activeConnectionId } = useConnectionStore();
  const { topics, loadTopics } = useTopicStore();
  const { sending, sendMessage } = useProducerStore();

  const [form] = Form.useForm();
  const [headers, setHeaders] = useState<MessageHeader[]>([]);
  const [partitionStrategy, setPartitionStrategy] = useState<'auto' | 'manual'>('auto');
  const [messageFormat, setMessageFormat] = useState<'json' | 'text'>('json');

  // 加载主题列表
  useEffect(() => {
    if (activeConnectionId) {
      loadTopics(activeConnectionId).catch((error) => {
        console.error('加载主题列表失败:', error);
      });
    }
  }, [activeConnectionId]);

  // 添加Header
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  // 删除Header
  const handleRemoveHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  // 更新Header
  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  // 验证JSON格式
  const validateJSON = (value: string) => {
    if (!value || messageFormat !== 'json') {
      return true;
    }
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  // 清空表单
  const handleClear = () => {
    form.resetFields();
    setHeaders([]);
    setPartitionStrategy('auto');
    setMessageFormat('json');
  };

  // 发送消息
  const handleSend = async (values: any) => {
    if (!activeConnectionId) {
      message.warning('请先连接到 Kafka 集群');
      return;
    }

    // 验证JSON格式
    if (messageFormat === 'json' && values.value) {
      if (!validateJSON(values.value)) {
        message.error('消息内容不是有效的 JSON 格式');
        return;
      }
    }

    try {
      // 构建消息
      const producerMessage: ProducerMessage = {
        topic: values.topic,
        key: values.key || undefined,
        value: values.value,
        headers: headers.filter((h) => h.key && h.value),
        partition: partitionStrategy === 'manual' ? values.partition : undefined,
      };

      // 发送消息
      const result = await sendMessage(activeConnectionId, producerMessage);

      message.success(
        <span>
          消息发送成功！
          <br />
          分区: {result.partition}, Offset: {result.offset}
        </span>
      );
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>消息生产</Typography.Title>

      {!activeConnectionId && (
        <Alert
          message="未连接到 Kafka 集群"
          description="请先在连接管理中添加并连接到 Kafka 集群"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
          initialValues={{
            messageFormat: 'json',
            value: '{\n  "message": "Hello Kafka!",\n  "timestamp": ' + Date.now() + '\n}',
          }}
        >
          {/* 主题选择 */}
          <Form.Item
            label="主题"
            name="topic"
            rules={[{ required: true, message: '请选择主题' }]}
          >
            <Select
              placeholder="选择要发送的主题"
              showSearch
              disabled={!activeConnectionId}
              loading={!activeConnectionId}
              options={topics.map((topic) => ({
                label: topic.name,
                value: topic.name,
              }))}
            />
          </Form.Item>

          {/* Key 输入 */}
          <Form.Item label="Key (可选)" name="key">
            <Input placeholder="消息的Key，用于分区策略和日志压缩" />
          </Form.Item>

          {/* Headers */}
          <Form.Item label="Headers (可选)">
            <Space direction="vertical" style={{ width: '100%' }}>
              {headers.map((header, index) => (
                <Space key={index} style={{ width: '100%' }}>
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveHeader(index)}
                    danger
                  />
                </Space>
              ))}
              <Button icon={<PlusOutlined />} onClick={handleAddHeader} type="dashed">
                添加 Header
              </Button>
            </Space>
          </Form.Item>

          {/* 分区策略 */}
          <Form.Item label="分区策略">
            <Radio.Group
              value={partitionStrategy}
              onChange={(e) => setPartitionStrategy(e.target.value)}
            >
              <Radio value="auto">自动分配</Radio>
              <Radio value="manual">指定分区</Radio>
            </Radio.Group>
          </Form.Item>

          {partitionStrategy === 'manual' && (
            <Form.Item
              label="分区"
              name="partition"
              rules={[{ required: true, message: '请输入分区号' }]}
            >
              <InputNumber min={0} placeholder="分区号从0开始" style={{ width: '100%' }} />
            </Form.Item>
          )}

          {/* 消息格式 */}
          <Form.Item label="消息格式">
            <Radio.Group
              value={messageFormat}
              onChange={(e) => setMessageFormat(e.target.value)}
            >
              <Radio value="json">JSON</Radio>
              <Radio value="text">纯文本</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 消息内容 */}
          <Form.Item
            label="消息内容"
            name="value"
            rules={[
              { required: true, message: '请输入消息内容' },
              {
                validator: (_, value) => {
                  if (messageFormat === 'json' && value) {
                    if (!validateJSON(value)) {
                      return Promise.reject('请输入有效的 JSON 格式');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TextArea
              rows={8}
              placeholder={
                messageFormat === 'json'
                  ? '{\n  "key": "value"\n}'
                  : '输入消息内容...'
              }
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
          </Form.Item>

          {messageFormat === 'json' && (
            <div style={{ marginTop: -16, marginBottom: 16 }}>
              <Tag color="blue">提示: 消息内容将自动验证JSON格式</Tag>
            </div>
          )}

          {/* 操作按钮 */}
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={sending}
                disabled={!activeConnectionId}
                size="large"
              >
                发送消息
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleClear} size="large">
                清空
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
