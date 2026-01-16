/**
 * 创建主题表单组件
 */

import { Form, Input, InputNumber, Button, Space, Collapse, message } from 'antd';
import { useTopicStore } from '../../stores/topicStore';
import type { CreateTopicConfig } from '../../../../common/types/kafka';

const { Panel } = Collapse;

interface CreateTopicFormProps {
  connectionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateTopicForm({ connectionId, onSuccess, onCancel }: CreateTopicFormProps) {
  const { createTopic } = useTopicStore();
  const [form] = Form.useForm();

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      const config: CreateTopicConfig = {
        topic: values.topicName.trim(),
        numPartitions: values.numPartitions,
        replicationFactor: values.replicationFactor,
      };

      // 添加高级配置
      const configEntries: Array<{ name: string; value: string }> = [];

      if (values.retentionMs) {
        configEntries.push({
          name: 'retention.ms',
          value: values.retentionMs.toString(),
        });
      }

      if (values.retentionBytes) {
        configEntries.push({
          name: 'retention.bytes',
          value: values.retentionBytes.toString(),
        });
      }

      if (values.cleanupPolicy) {
        configEntries.push({
          name: 'cleanup.policy',
          value: values.cleanupPolicy,
        });
      }

      if (values.compressionType) {
        configEntries.push({
          name: 'compression.type',
          value: values.compressionType,
        });
      }

      if (configEntries.length > 0) {
        config.configEntries = configEntries;
      }

      await createTopic(connectionId, config);
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || '创建主题失败');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        numPartitions: 3,
        replicationFactor: 1,
        cleanupPolicy: 'delete',
        compressionType: 'producer',
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="主题名称"
        name="topicName"
        rules={[
          { required: true, message: '请输入主题名称' },
          {
            pattern: /^[a-zA-Z0-9._-]+$/,
            message: '主题名称只能包含字母、数字、点、下划线和连字符',
          },
        ]}
      >
        <Input placeholder="例如: user-events" />
      </Form.Item>

      <Form.Item
        label="分区数"
        name="numPartitions"
        rules={[{ required: true, message: '请输入分区数' }]}
        extra="分区数决定了并行处理能力，创建后只能增加不能减少"
      >
        <InputNumber min={1} max={1000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="副本因子"
        name="replicationFactor"
        rules={[{ required: true, message: '请输入副本因子' }]}
        extra="副本因子决定了数据的冗余度，不能超过Broker数量"
      >
        <InputNumber min={1} max={10} style={{ width: '100%' }} />
      </Form.Item>

      <Collapse ghost>
        <Panel header="高级配置（可选）" key="advanced">
          <Form.Item
            label="数据保留时间 (ms)"
            name="retentionMs"
            extra="消息保留时长，-1表示永久保留。默认: 7天(604800000ms)"
          >
            <InputNumber
              min={-1}
              placeholder="604800000"
              style={{ width: '100%' }}
              formatter={(value) => {
                if (!value) return '';
                const days = Math.floor(Number(value) / (1000 * 60 * 60 * 24));
                return `${value} (约${days}天)`;
              }}
            />
          </Form.Item>

          <Form.Item
            label="数据保留大小 (bytes)"
            name="retentionBytes"
            extra="分区最大数据大小，-1表示无限制"
          >
            <InputNumber
              min={-1}
              placeholder="-1"
              style={{ width: '100%' }}
              formatter={(value) => {
                if (!value || value === -1) return '-1 (无限制)';
                const mb = (Number(value) / 1024 / 1024).toFixed(2);
                return `${value} (${mb}MB)`;
              }}
            />
          </Form.Item>

          <Form.Item
            label="清理策略"
            name="cleanupPolicy"
            extra="delete: 删除旧数据, compact: 压缩保留最新值"
          >
            <Input placeholder="delete" />
          </Form.Item>

          <Form.Item
            label="压缩类型"
            name="compressionType"
            extra="producer: 使用生产者压缩, gzip/snappy/lz4/zstd: 强制压缩"
          >
            <Input placeholder="producer" />
          </Form.Item>
        </Panel>
      </Collapse>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            创建主题
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
