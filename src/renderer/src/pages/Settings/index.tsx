/**
 * 设置页面
 */

import { useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  InputNumber,
  Switch,
  Typography,
  Space,
  Divider,
  Alert,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  BulbOutlined,
  GlobalOutlined,
  FontSizeOutlined,
  SettingOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useSettingsStore, type Theme, type Language } from '../../stores/settingsStore';

const { Title, Text } = Typography;

export function Settings() {
  const [form] = Form.useForm();
  const { settings, loading, loadSettings, updateSettings, resetSettings } = useSettingsStore();

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  // 当设置加载完成后，填充表单
  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  // 保存设置
  const handleSave = async (values: unknown) => {
    await updateSettings(values as Partial<typeof settings>);
  };

  // 重置设置
  const handleReset = async () => {
    form.setFieldsValue({
      theme: 'auto',
      language: 'zh-CN',
      fontSize: 14,
      defaultConsumeStrategy: 'latest',
      messageFormat: 'json',
      maxMessages: 1000,
      autoReconnect: true,
    });
    await resetSettings();
  };

  if (loading && !settings) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">加载设置中...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            ⚙️ 设置
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            配置应用偏好和行为设置
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadSettings} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings || undefined}
      >
        <Row gutter={[24, 24]}>
          {/* 界面设置 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BulbOutlined />
                  <span>界面设置</span>
                </Space>
              }
            >
              <Form.Item
                label="主题"
                name="theme"
                tooltip="选择应用的主题样式"
              >
                <Select<Theme>
                  options={[
                    { label: '亮色', value: 'light' },
                    { label: '暗色', value: 'dark' },
                    { label: '跟随系统', value: 'auto' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="语言"
                name="language"
                tooltip="选择应用界面语言"
              >
                <Select<Language>
                  options={[
                    { label: '简体中文', value: 'zh-CN' },
                    { label: 'English', value: 'en-US' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="字体大小"
                name="fontSize"
                tooltip="设置应用字体大小（像素）"
              >
                <InputNumber
                  min={10}
                  max={24}
                  style={{ width: '100%' }}
                  addonAfter="px"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* 行为设置 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  <span>行为设置</span>
                </Space>
              }
            >
              <Form.Item
                label="默认消费策略"
                name="defaultConsumeStrategy"
                tooltip="消息消费时的默认起始位置"
              >
                <Select
                  options={[
                    { label: '最新 (latest)', value: 'latest' },
                    { label: '最早 (earliest)', value: 'earliest' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="消息格式"
                name="messageFormat"
                tooltip="默认的消息格式"
              >
                <Select
                  options={[
                    { label: 'JSON', value: 'json' },
                    { label: '文本', value: 'text' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="最大消息数"
                name="maxMessages"
                tooltip="消息消费时保留的最大消息数量"
              >
                <InputNumber
                  min={100}
                  max={10000}
                  step={100}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="自动重连"
                name="autoReconnect"
                valuePropName="checked"
                tooltip="连接断开时自动尝试重连"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* 操作按钮 */}
        <Card>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              保存设置
            </Button>
            <Button
              icon={<UndoOutlined />}
              onClick={handleReset}
              loading={loading}
              size="large"
            >
              重置为默认值
            </Button>
          </Space>
        </Card>

        {/* 提示信息 */}
        <Alert
          message="设置说明"
          description="设置会在保存后立即生效。某些设置（如主题和语言）可能需要重启应用才能完全生效。"
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Form>
    </div>
  );
}
