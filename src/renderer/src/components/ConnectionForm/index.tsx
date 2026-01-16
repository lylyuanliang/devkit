/**
 * 连接表单组件
 * 用于新建和编辑连接配置
 */

import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Space,
  message,
  Collapse,
  InputNumber,
  Switch,
  Modal,
  Spin,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useConnectionStore } from '../../stores/connectionStore';
import type { ConnectionConfig, SaslMechanism } from '../../../../common/types/connection';

const { TextArea } = Input;
const { Panel } = Collapse;

interface ConnectionFormProps {
  connection?: ConnectionConfig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConnectionForm({ connection, onSuccess, onCancel }: ConnectionFormProps) {
  const { createConnection, updateConnection, testConnection } = useConnectionStore();
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // 初始值
  const initialValues = connection
    ? {
        ...connection,
        brokers: connection.brokers.join('\n'),
        saslEnabled: !!connection.sasl,
        saslMechanism: connection.sasl?.mechanism || 'plain',
        saslUsername: connection.sasl?.username || '',
        saslPassword: '', // 密码不回显
        sslEnabled: connection.ssl?.enabled || false,
      }
    : {
        name: '',
        brokers: '',
        clientId: '',
        saslEnabled: false,
        saslMechanism: 'plain',
        saslUsername: '',
        saslPassword: '',
        sslEnabled: false,
        connectionTimeout: 10000,
        requestTimeout: 30000,
      };

  // 测试连接
  const handleTest = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setTesting(true);
      setTestResult(null);

      // 构建测试配置
      const testConfig: any = {
        id: connection?.id,
        name: values.name,
        brokers: values.brokers.split('\n').filter((b: string) => b.trim()),
        clientId: values.clientId,
        connectionTimeout: values.connectionTimeout,
        requestTimeout: values.requestTimeout,
      };

      if (values.saslEnabled) {
        testConfig.sasl = {
          mechanism: values.saslMechanism,
          username: values.saslUsername,
          password: values.saslPassword,
        };
      }

      if (values.sslEnabled) {
        testConfig.ssl = { enabled: true };
      }

      const result = await testConnection(testConfig);
      setTestResult(result);

      if (result.success) {
        message.success('连接测试成功');
      } else {
        message.error('连接测试失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写必填项');
      } else {
        message.error('测试失败: ' + error.message);
        setTestResult({ success: false, message: error.message });
      }
    } finally {
      setTesting(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      // 构建连接配置
      const config: any = {
        name: values.name.trim(),
        brokers: values.brokers.split('\n').filter((b: string) => b.trim()),
        clientId: values.clientId?.trim() || undefined,
        connectionTimeout: values.connectionTimeout,
        requestTimeout: values.requestTimeout,
      };

      // SASL认证
      if (values.saslEnabled) {
        config.sasl = {
          mechanism: values.saslMechanism as SaslMechanism,
          username: values.saslUsername.trim(),
          password: values.saslPassword,
        };
      }

      // SSL配置
      if (values.sslEnabled) {
        config.ssl = { enabled: true };
      }

      // 创建或更新
      if (connection) {
        await updateConnection(connection.id, config);
      } else {
        await createConnection(config);
      }

      onSuccess();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="连接名称"
        name="name"
        rules={[{ required: true, message: '请输入连接名称' }]}
      >
        <Input placeholder="例如: Local Kafka" />
      </Form.Item>

      <Form.Item
        label="Broker地址"
        name="brokers"
        rules={[
          { required: true, message: '请输入Broker地址' },
          {
            validator: (_, value) => {
              const brokers = value.split('\n').filter((b: string) => b.trim());
              if (brokers.length === 0) {
                return Promise.reject('至少需要一个Broker地址');
              }
              // 验证格式: host:port
              const invalidBrokers = brokers.filter((b: string) => !/^.+:\d+$/.test(b.trim()));
              if (invalidBrokers.length > 0) {
                return Promise.reject('Broker地址格式应为: host:port');
              }
              return Promise.resolve();
            },
          },
        ]}
        extra="每行一个地址，格式: host:port"
      >
        <TextArea rows={3} placeholder="localhost:9092&#10;localhost:9093" />
      </Form.Item>

      <Form.Item label="Client ID" name="clientId">
        <Input placeholder="可选，默认自动生成" />
      </Form.Item>

      <Collapse ghost>
        <Panel header="SASL认证配置" key="sasl">
          <Form.Item name="saslEnabled" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.saslEnabled !== curr.saslEnabled}>
            {({ getFieldValue }) =>
              getFieldValue('saslEnabled') ? (
                <>
                  <Form.Item label="认证机制" name="saslMechanism">
                    <Select>
                      <Select.Option value="plain">PLAIN</Select.Option>
                      <Select.Option value="scram-sha-256">SCRAM-SHA-256</Select.Option>
                      <Select.Option value="scram-sha-512">SCRAM-SHA-512</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="用户名"
                    name="saslUsername"
                    rules={[
                      {
                        required: getFieldValue('saslEnabled'),
                        message: '请输入用户名',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="密码"
                    name="saslPassword"
                    rules={[
                      {
                        required: getFieldValue('saslEnabled') && !connection,
                        message: '请输入密码',
                      },
                    ]}
                    extra={connection ? '留空则保持原密码不变' : ''}
                  >
                    <Input.Password />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Panel>

        <Panel header="SSL配置" key="ssl">
          <Form.Item name="sslEnabled" valuePropName="checked" label="启用SSL/TLS">
            <Switch />
          </Form.Item>
        </Panel>

        <Panel header="高级设置" key="advanced">
          <Form.Item label="连接超时(ms)" name="connectionTimeout">
            <InputNumber min={1000} max={60000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="请求超时(ms)" name="requestTimeout">
            <InputNumber min={1000} max={120000} style={{ width: '100%' }} />
          </Form.Item>
        </Panel>
      </Collapse>

      {/* 测试结果显示 */}
      {testResult && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 4,
            backgroundColor: testResult.success ? '#f6ffed' : '#fff2f0',
            border: `1px solid ${testResult.success ? '#b7eb8f' : '#ffccc7'}`,
          }}
        >
          <Space>
            {testResult.success ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            )}
            <div>
              <div style={{ fontWeight: 500 }}>{testResult.message}</div>
              {testResult.success && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {testResult.brokerCount && `Broker数量: ${testResult.brokerCount}`}
                  {testResult.responseTime && ` | 响应时间: ${testResult.responseTime}ms`}
                </div>
              )}
            </div>
          </Space>
        </div>
      )}

      {/* 操作按钮 */}
      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            {connection ? '更新' : '创建'}
          </Button>
          <Button onClick={handleTest} loading={testing}>
            测试连接
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
