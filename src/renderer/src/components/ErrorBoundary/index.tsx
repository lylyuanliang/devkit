/**
 * 全局错误边界组件
 * 
 * 用于捕获 React 组件树中的 JavaScript 错误，记录错误信息，并显示降级 UI。
 * 防止整个应用因单个组件错误而崩溃。
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Space, Card } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  /** 是否发生错误 */
  hasError: boolean;
  /** 错误对象 */
  error: Error | null;
  /** 错误信息 */
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 
 * 使用类组件实现，因为 React 错误边界必须是类组件。
 * 捕获子组件树中的错误，显示友好的错误页面。
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 捕获子组件抛出的错误
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 错误发生时调用
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息到控制台
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);

    // 更新状态
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 可以在这里发送错误报告到日志服务
    // this.logErrorToService(error, errorInfo);
  }

  /**
   * 重新加载页面
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.hash = '/dashboard';
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 重置错误状态（尝试恢复）
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#f5f7fa',
          }}
        >
          <Card style={{ maxWidth: 800, width: '100%' }}>
            <Result
              status="error"
              title="应用出现错误"
              subTitle="抱歉，应用遇到了一个错误。请尝试刷新页面或返回首页。"
              icon={<BugOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
              extra={
                <Space size="middle">
                  <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                    刷新页面
                  </Button>
                  <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                    返回首页
                  </Button>
                  <Button onClick={this.handleReset}>重试</Button>
                </Space>
              }
            >
              <div style={{ marginTop: 24 }}>
                <Paragraph strong>错误详情：</Paragraph>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#fff2f0',
                    borderColor: '#ffccc7',
                    marginTop: 12,
                  }}
                >
                  <Paragraph code copyable style={{ marginBottom: 8 }}>
                    {error?.message || '未知错误'}
                  </Paragraph>
                  {errorInfo && (
                    <details style={{ marginTop: 12 }}>
                      <summary style={{ cursor: 'pointer', color: '#666' }}>
                        <Text type="secondary">查看错误堆栈</Text>
                      </summary>
                      <pre
                        style={{
                          marginTop: 8,
                          padding: 12,
                          backgroundColor: '#fff',
                          borderRadius: 4,
                          fontSize: 12,
                          overflow: 'auto',
                          maxHeight: 300,
                        }}
                      >
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </Card>
              </div>
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
