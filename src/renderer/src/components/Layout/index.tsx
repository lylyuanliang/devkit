/**
 * 主布局组件
 */

import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { Layout as AntLayout, Menu, theme, Tabs, Typography, Tag, Space, Spin } from 'antd';
import {
  DashboardOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  SendOutlined,
  InboxOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationStore, type TabItem } from '../../stores/navigationStore';

// 代码分割：使用 React.lazy 懒加载页面组件
const Dashboard = lazy(() => import('../../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Connections = lazy(() => import('../../pages/Connections').then(m => ({ default: m.Connections })));
const Topics = lazy(() => import('../../pages/Topics').then(m => ({ default: m.Topics })));
const Producer = lazy(() => import('../../pages/Producer').then(m => ({ default: m.Producer })));
const Consumer = lazy(() => import('../../pages/Consumer').then(m => ({ default: m.Consumer })));
const ConsumerGroups = lazy(() => import('../../pages/ConsumerGroups').then(m => ({ default: m.ConsumerGroups })));
const Settings = lazy(() => import('../../pages/Settings').then(m => ({ default: m.Settings })));

// 加载中占位组件
const LoadingPlaceholder = () => (
  <div style={{ textAlign: 'center', padding: 100 }}>
    <Spin size="large" />
  </div>
);

const { Text } = Typography;

const { Header, Sider, Content } = AntLayout;

const tabConfig: Record<string, { label: string; closable: boolean }> = {
  '/dashboard': { label: '仪表盘', closable: false },
  '/connections': { label: '连接管理', closable: true },
  '/topics': { label: '主题管理', closable: true },
  '/producer': { label: '消息生产', closable: true },
  '/consumer': { label: '消息消费', closable: true },
  '/consumer-groups': { label: '消费组', closable: true },
  '/settings': { label: '设置', closable: true },
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { tabs, activeTab, addTab, removeTab, setActiveTab } = useNavigationStore();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 当路由变化时，添加标签页
  useEffect(() => {
    const config = tabConfig[location.pathname];
    if (config) {
      const tab: TabItem = {
        key: location.pathname,
        label: config.label,
        closable: config.closable,
      };
      addTab(tab);
    }
  }, [location.pathname, addTab]);

  // 使用 useMemo 缓存菜单项
  const menuItems = useMemo(() => [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/connections',
      icon: <ClusterOutlined />,
      label: '连接管理',
    },
    {
      key: '/topics',
      icon: <DatabaseOutlined />,
      label: '主题管理',
    },
    {
      key: '/producer',
      icon: <SendOutlined />,
      label: '消息生产',
    },
    {
      key: '/consumer',
      icon: <InboxOutlined />,
      label: '消息消费',
    },
    {
      key: '/consumer-groups',
      icon: <TeamOutlined />,
      label: '消费组',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ], []);

  // 使用 useCallback 缓存事件处理函数
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
  }, [navigate]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    navigate(key);
  }, [navigate, setActiveTab]);

  const handleTabEdit = useCallback((targetKey: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
    if (action === 'remove') {
      removeTab(targetKey as string);
      // 如果删除的是当前标签，跳转到最后一个标签
      if (targetKey === activeTab && tabs.length > 1) {
        const lastTab = tabs[tabs.length - 2];
        navigate(lastTab.key);
      }
    }
  }, [activeTab, tabs, navigate, removeTab]);

  // 使用 useMemo 缓存标签页配置
  const tabItems = useMemo(() => tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    closable: tab.closable,
  })), [tabs]);

  // 使用 useMemo 缓存组件映射
  const componentMap = useMemo(() => ({
    '/dashboard': Dashboard,
    '/connections': Connections,
    '/topics': Topics,
    '/producer': Producer,
    '/consumer': Consumer,
    '/consumer-groups': ConsumerGroups,
    '/settings': Settings,
  }), []);

  return (
    <AntLayout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Text 
            strong 
            style={{ 
              color: '#fff', 
              fontSize: collapsed ? 20 : 18,
              whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? '🚀' : '🚀 DevKit'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header 
          style={{ 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            height: 64,
            flexShrink: 0,
          }}
        >
          {/* 标签页导航 */}
          <div style={{ flex: 1, height: '100%' }}>
            <Tabs
              type="editable-card"
              activeKey={activeTab}
              onChange={handleTabChange}
              onEdit={handleTabEdit}
              items={tabItems}
              hideAdd
              style={{ 
                height: '100%',
                paddingLeft: 16,
              }}
            />
          </div>
          
          {/* 版本标签 */}
          <Space style={{ marginRight: 24 }}>
            <Tag color="#667eea" style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
              v0.11.0
            </Tag>
          </Space>
        </Header>
        <Content style={{ 
          margin: 24, 
          overflow: 'auto',
          flex: 1,
          minHeight: 0,
        }}>
          <div
            style={{
              padding: 24,
              minHeight: 'fit-content',
            }}
          >
            {/* 渲染所有已打开的标签页，用 display 控制显示隐藏，保持组件状态 */}
            {tabs.length > 0 ? (
              tabs.map((tab) => {
                const isActive = location.pathname === tab.key;
                const Component = componentMap[tab.key as keyof typeof componentMap];

                if (!Component) return null;

                return (
                  <div
                    key={tab.key}
                    style={{
                      display: isActive ? 'block' : 'none',
                    }}
                  >
                    <Suspense fallback={<LoadingPlaceholder />}>
                      <Component />
                    </Suspense>
                  </div>
                );
              })
            ) : (
              // 兜底：如果 tabs 为空，直接渲染当前路由对应的组件
              <div>
                <Suspense fallback={<LoadingPlaceholder />}>
                  {location.pathname === '/dashboard' && <Dashboard />}
                  {location.pathname === '/connections' && <Connections />}
                  {location.pathname === '/topics' && <Topics />}
                  {location.pathname === '/producer' && <Producer />}
                  {location.pathname === '/consumer' && <Consumer />}
                  {location.pathname === '/consumer-groups' && <ConsumerGroups />}
                  {location.pathname === '/settings' && <Settings />}
                </Suspense>
              </div>
            )}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
