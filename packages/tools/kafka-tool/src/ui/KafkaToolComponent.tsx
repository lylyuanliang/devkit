import React, { useState, useEffect } from 'react';
import { KafkaAPI } from '../service/kafka-api';

interface Cluster {
  id: string;
  name: string;
  brokers: string[];
  connected?: boolean;
  topics?: string[];
}

// Validate JSON format
const validateJSON = (content: string): { valid: boolean; error?: string } => {
  return {
    valid: KafkaAPI.isValidJSON(content),
    error: KafkaAPI.isValidJSON(content) ? undefined : 'Invalid JSON',
  };
};

// 创建主题感知的样式
const createThemeStyles = (isDarkMode: boolean) => {
  const colors = isDarkMode ? {
    containerBg: '#111827',
    headerBg: '#1f2937',
    sidebarBg: '#1f2937',
    cardBg: '#273142',
    textPrimary: '#f3f4f6',
    textSecondary: '#d1d5db',
    border: '#374151',
    accent: '#3b82f6',
    inputBg: '#1f2937',
    inputBorder: '#374151',
    topicCardBg: '#1e3a5f',
    topicCardBorder: '#1e4d7b',
    emptyBg: '#0f172a',
    emptyBorder: '#1e3a5f',
    emptyText: '#60a5fa',
    hoverBg: '#374151',
  } : {
    containerBg: '#f9fafb',
    headerBg: '#ffffff',
    sidebarBg: '#f3f4f6',
    cardBg: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    topicCardBg: '#f0f9ff',
    topicCardBorder: '#bfdbfe',
    emptyBg: '#eff6ff',
    emptyBorder: '#bfdbfe',
    emptyText: '#1e40af',
    hoverBg: '#f0f0f0',
  };

  return {
    // Color utilities
    accent: colors.accent,
    border: colors.border,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,

    container: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.containerBg,
      display: 'flex',
      flexDirection: 'column' as const,
      transition: 'background-color 0.2s',
    },
    header: {
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${colors.border}`,
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background-color 0.2s, border-color 0.2s',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      color: colors.textPrimary,
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: colors.textSecondary,
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: colors.border,
    },
    mainContainer: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    sidebar: {
      width: '200px',
      backgroundColor: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      overflowY: 'auto' as const,
      transition: 'background-color 0.2s, border-color 0.2s',
    },
    navItem: {
      display: 'block',
      width: '100%',
      padding: '12px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      textAlign: 'left' as const,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s',
      borderLeft: '3px solid transparent',
    },
    navItemActive: {
      backgroundColor: colors.hoverBg,
      color: colors.accent,
      borderLeftColor: colors.accent,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '24px',
      backgroundColor: colors.containerBg,
      transition: 'background-color 0.2s',
    },
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      transition: 'background-color 0.2s, border-color 0.2s',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      marginBottom: '8px',
      color: colors.textPrimary,
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box' as const,
      backgroundColor: colors.inputBg,
      color: colors.textPrimary,
      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
    },
    button: {
      padding: '10px 16px',
      backgroundColor: colors.accent,
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 500,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    topicGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    },
    topicCard: {
      backgroundColor: colors.topicCardBg,
      border: `1px solid ${colors.topicCardBorder}`,
      borderRadius: '6px',
      padding: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    topicCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    topicName: {
      fontWeight: 600,
      color: colors.accent,
      marginBottom: '4px',
    },
    emptyMessage: {
      padding: '16px',
      backgroundColor: colors.emptyBg,
      border: `1px solid ${colors.emptyBorder}`,
      borderRadius: '6px',
      color: colors.emptyText,
      fontSize: '14px',
      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
    },
  };
};

const KafkaToolComponent: React.FC = () => {
  const [activeView, setActiveView] = useState<'clusters' | 'topics' | 'consumer-groups' | 'produce' | 'monitoring' | 'settings'>('clusters');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterBrokers, setNewClusterBrokers] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Tab/History state
  interface TabItem {
    id: string;
    label: string;
  }
  const [openTabs, setOpenTabs] = useState<TabItem[]>([
    { id: 'clusters', label: '📦 集群管理' }
  ]);

  // Produce view state
  const [produceTopic, setProduceTopic] = useState('');
  const [produceContent, setProduceContent] = useState('');
  const [produceFormat, setProduceFormat] = useState<'json' | 'text'>('text');
  const [produceKey, setProduceKey] = useState('');
  const [producePartition, setProducePartition] = useState<string>('');
  const [produceError, setProduceError] = useState('');
  const [produceSending, setProduceSending] = useState(false);
  const [produceSuccess, setProduceSuccess] = useState<{ partition: number; offset: string; timestamp: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Consumer view state
  const [consumeMessages, setConsumeMessages] = useState<Array<{
    partition: number;
    offset: string | number;
    timestamp: string | number;
    key: string | null;
    value: string;
  }>>([]);
  const [consumeLoading, setConsumeLoading] = useState(false);
  const [consumeError, setConsumeError] = useState('');
  const [consumeStartPosition, setConsumeStartPosition] = useState<'latest' | 'earliest' | 'offset' | 'timestamp'>('latest');
  const [consumeStartOffset, setConsumeStartOffset] = useState('');
  const [consumeStartTimestamp, setConsumeStartTimestamp] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1);
  const [consumeSearchKey, setConsumeSearchKey] = useState('');
  const [consumeSearchContent, setConsumeSearchContent] = useState('');
  const [consumeSearchCaseSensitive, setConsumeSearchCaseSensitive] = useState(false);
  const [consumeSearchOffsetMin, setConsumeSearchOffsetMin] = useState('');
  const [consumeSearchOffsetMax, setConsumeSearchOffsetMax] = useState('');
  const [messageDisplayFormat, setMessageDisplayFormat] = useState<'text' | 'json' | 'base64' | 'hex'>('text');
  const [consumeTopicStats, setConsumeTopicStats] = useState<{ totalMessages: number; minOffset: number; maxOffset: number } | null>(null);
  const [consumePartition, setConsumePartition] = useState<number | 'all'>(0);

  // 计算连接的集群（放在状态声明之后，useEffect之前）
  const connectedCluster = clusters.find(c => c.connected);

  // 检查是否是深色模式
  useEffect(() => {
    const checkDarkMode = () => {
      const savedTheme = localStorage.getItem('devkit-theme');
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
    };

    // 初始检查
    checkDarkMode();

    // 监听自定义主题变化事件（从主应用派发）
    const handleThemeChange = () => {
      checkDarkMode();
    };
    window.addEventListener('devkit-theme-changed', handleThemeChange);

    // 也监听 body class 变化（备用方案）
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
      window.removeEventListener('devkit-theme-changed', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // Reset produce view when cluster changes
  useEffect(() => {
    if (!connectedCluster) {
      setProduceTopic('');
      setProduceContent('');
      setProduceKey('');
      setProducePartition('');
      setProduceError('');
      setProduceSuccess(null);
    }
  }, [connectedCluster?.id]);

  // 从 localStorage 读取保存的集群配置
  useEffect(() => {
    const loadClustersAndReconnect = async () => {
      try {
        const saved = localStorage.getItem('kafka-clusters');
        if (saved) {
          const parsed = JSON.parse(saved);
          setClusters(parsed);

          // 自动重连之前连接过的集群
          const connectedClusters = parsed.filter((c: any) => c.connected);
          for (const cluster of connectedClusters) {
            try {
              await KafkaAPI.connectCluster(cluster.id, cluster.brokers);
              console.log(`自动重连集群成功: ${cluster.name}`);
            } catch (error) {
              console.error(`自动重连集群失败: ${cluster.name}`, error);
              // 如果自动重连失败，更新状态
              setClusters((prevClusters) =>
                prevClusters.map((c) =>
                  c.id === cluster.id ? { ...c, connected: false } : c
                )
              );
            }
          }
        }
      } catch (error) {
        console.error('读取集群配置失败:', error);
      }
    };
    loadClustersAndReconnect();
  }, []);

  // 当 clusters 变化时保存到 localStorage
  useEffect(() => {
    if (clusters.length > 0) {
      try {
        localStorage.setItem('kafka-clusters', JSON.stringify(clusters));
      } catch (error) {
        console.error('保存集群配置失败:', error);
      }
    }
  }, [clusters]);

  // 根据主题动态生成样式
  const styles = createThemeStyles(isDarkMode);

  const handleAddCluster = () => {
    if (newClusterName.trim() && newClusterBrokers.trim()) {
      const newCluster: Cluster = {
        id: Date.now().toString(),
        name: newClusterName,
        brokers: newClusterBrokers.split(',').map(b => b.trim()),
        connected: false,
        topics: [],
      };
      setClusters([...clusters, newCluster]);
      setNewClusterName('');
      setNewClusterBrokers('');
    }
  };

  const handleConnectCluster = async (clusterId: string) => {
    setConnecting(clusterId);
    try {
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) {
        throw new Error('Cluster not found');
      }

      // Connect to real Kafka cluster
      await KafkaAPI.connectCluster(clusterId, cluster.brokers);

      // Fetch real topics from cluster
      // For now, we'll use a placeholder list since we don't have admin API in KafkaAPI yet
      const topics = ['__consumer_offsets', 'devkit-test', 'orders', 'payments', 'users', 'logs'];

      setClusters(clusters.map(c =>
        c.id === clusterId ? { ...c, connected: true, topics } : c
      ));
    } catch (error) {
      console.error('连接失败:', error);
      // Show error to user
      alert(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectCluster = async (clusterId: string) => {
    try {
      await KafkaAPI.disconnectCluster(clusterId);
      setClusters(clusters.map(c =>
        c.id === clusterId ? { ...c, connected: false, topics: [] } : c
      ));
    } catch (error) {
      console.error('断开连接失败:', error);
      alert(`断开连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleDeleteCluster = async (clusterId: string) => {
    // Disconnect if connected
    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster?.connected) {
      try {
        await KafkaAPI.disconnectCluster(clusterId);
      } catch (error) {
        console.error('断开连接失败:', error);
      }
    }

    setClusters(clusters.filter(c => c.id !== clusterId));
  };

  // Handle message production
  const handleProduceSend = async () => {
    setProduceError('');
    setProduceSuccess(null);

    // Validation
    if (!produceTopic.trim()) {
      setProduceError('Please select a topic');
      return;
    }
    if (!produceContent.trim()) {
      setProduceError('Message content is required');
      return;
    }

    if (!connectedCluster) {
      setProduceError('Not connected to a cluster');
      return;
    }

    // Validate JSON if format is JSON
    if (produceFormat === 'json') {
      const validation = validateJSON(produceContent);
      if (!validation.valid) {
        setProduceError(`Invalid JSON: ${validation.error}`);
        return;
      }
    }

    // Check message size
    const msgSize = new Blob([produceContent]).size;
    if (msgSize > 1024 * 1024) {
      setProduceError('Message exceeds 1MB limit');
      return;
    }

    setProduceSending(true);
    try {
      // Call actual Kafka Producer Service via API
      const result = await KafkaAPI.produceMessage(connectedCluster.id, {
        topic: produceTopic,
        value: produceContent,
        key: produceKey || undefined,
        partition: producePartition ? parseInt(producePartition) : undefined,
      });

      setProduceSuccess(result);
      setProduceContent('');
    } catch (error) {
      setProduceError(`Send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProduceSending(false);
    }
  };

  // Handle message consumption - fetch messages from topic
  const handleConsumeTopic = async (topic: string) => {
    if (!connectedCluster) {
      setConsumeError('Not connected to a cluster');
      return;
    }

    setConsumeLoading(true);
    setConsumeError('');
    setConsumeMessages([]);
    setSelectedMessage(null);
    setSelectedMessageIndex(-1);

    try {
      // Call actual Kafka Consumer Service via API
      const response = await KafkaAPI.consumeMessages(connectedCluster.id, {
        topic,
        partition: consumePartition === 'all' ? undefined : (consumePartition as number),
        fromBeginning: consumeStartPosition === 'earliest',
        startOffset: consumeStartPosition === 'offset' ? parseInt(consumeStartOffset) : undefined,
        limit: 1000,
      });

      setConsumeMessages(response.messages as any);
      if (response.messages && response.messages.length > 0) {
        const minOffset = Math.min(...response.messages.map(m => typeof m.offset === 'string' ? parseInt(m.offset) : m.offset));
        const maxOffset = Math.max(...response.messages.map(m => typeof m.offset === 'string' ? parseInt(m.offset) : m.offset));
        setConsumeTopicStats({
          totalMessages: response.totalMessages || 0,
          minOffset,
          maxOffset,
        });
      }
    } catch (error) {
      setConsumeError(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setConsumeLoading(false);
    }
  };

  // Handle message navigation (previous/next)
  const handleNavigateToPreviousMessage = () => {
    if (selectedMessageIndex > 0) {
      const newIndex = selectedMessageIndex - 1;
      setSelectedMessageIndex(newIndex);
      setSelectedMessage(consumeMessages[newIndex]);
      setMessageDisplayFormat('text');
    }
  };

  const handleNavigateToNextMessage = () => {
    if (selectedMessageIndex < consumeMessages.length - 1) {
      const newIndex = selectedMessageIndex + 1;
      setSelectedMessageIndex(newIndex);
      setSelectedMessage(consumeMessages[newIndex]);
      setMessageDisplayFormat('text');
    }
  };

  // Handle offset jump
  const handleJumpToOffset = async (offset: number) => {
    if (!connectedCluster || !selectedTopic) {
      setConsumeError('Cannot jump - topic not selected');
      return;
    }

    setConsumeLoading(true);
    setConsumeError('');
    setConsumeMessages([]);
    setSelectedMessage(null);

    try {
      const response = await KafkaAPI.consumeMessages(connectedCluster.id, {
        topic: selectedTopic,
        startOffset: offset,
        partition: consumePartition === 'all' ? undefined : (consumePartition as number),
        limit: 1000,
      });

      setConsumeMessages(response.messages as any);
    } catch (error) {
      setConsumeError(`Failed to jump to offset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setConsumeLoading(false);
    }
  };

  // Format message value based on selected display format
  const formatMessageValue = (value: string) => {
    try {
      switch (messageDisplayFormat) {
        case 'json':
          if (KafkaAPI.isValidJSON(value)) {
            return KafkaAPI.formatJSON(value);
          }
          return `(Not valid JSON)\n${value}`;
        case 'base64':
          return KafkaAPI.toBase64(value);
        case 'hex':
          return KafkaAPI.formatHex(KafkaAPI.toHex(value));
        case 'text':
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  // 导航项目
  const navItems = [
    { id: 'clusters', label: '📦 集群管理', icon: '📦' },
    { id: 'topics', label: '📚 Topics', icon: '📚' },
    { id: 'consumer-groups', label: '👥 消费者组', icon: '👥' },
    { id: 'produce', label: '📤 生产消息', icon: '📤' },
    { id: 'monitoring', label: '📊 监控', icon: '📊' },
    { id: 'settings', label: '⚙️ 设置', icon: '⚙️' },
  ];

  // Handle navigation and tab history
  const handleNavigate = (itemId: string) => {
    const item = navItems.find(n => n.id === itemId);
    if (!item) return;

    setActiveView(itemId as any);

    // Add to open tabs if not already there
    if (!openTabs.find(tab => tab.id === itemId)) {
      setOpenTabs([...openTabs, { id: itemId, label: item.label }]);
    }
  };

  // Handle tab close
  const handleCloseTab = (tabId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);

    // If closing the active tab, switch to another tab
    if (activeView === tabId && newTabs.length > 0) {
      const previousTab = newTabs[newTabs.length - 1];
      setActiveView(previousTab.id as any);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔄 Kafka Client</h1>
        <div style={styles.status}>
          {connectedCluster ? (
            <>
              <span style={{ ...styles.statusDot, backgroundColor: '#10b981' }}></span>
              <span style={{ color: '#059669' }}>连接: {connectedCluster.name}</span>
            </>
          ) : (
            <>
              <span style={styles.statusDot}></span>
              <span>未连接</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Sidebar */}
        <div style={{
          width: sidebarExpanded ? '200px' : '50px',
          backgroundColor: styles.sidebar.backgroundColor,
          borderRight: styles.sidebar.borderRight,
          overflowY: 'auto' as const,
          overflowX: 'hidden' as const,
          transition: 'width 0.3s ease, background-color 0.2s, border-color 0.2s',
          display: 'flex',
          flexDirection: 'column' as const,
        }}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            style={{
              width: '100%',
              padding: sidebarExpanded ? '12px' : '8px 4px',
              border: 'none',
              backgroundColor: styles.status.color === '#d1d5db' ? '#374151' : '#f0f0f0',
              color: styles.status.color,
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              borderBottom: styles.sidebar.borderRight,
              fontWeight: 'bold',
              minHeight: '44px',
            }}
            title={sidebarExpanded ? '收拢菜单' : '展开菜单'}
          >
            ☰
          </button>

          {/* Nav Items */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                ...styles.navItem,
                ...(activeView === item.id ? styles.navItemActive : {}),
                padding: sidebarExpanded ? '12px 16px' : '12px',
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              }}
              title={sidebarExpanded ? '' : item.label}
              onMouseOver={(e) => {
                if (activeView !== item.id) {
                  (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#e5e7eb';
                }
              }}
              onMouseOut={(e) => {
                if (activeView !== item.id) {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {item.id === 'clusters' && '📦'}
                {item.id === 'topics' && '📚'}
                {item.id === 'consumer-groups' && '👥'}
                {item.id === 'produce' && '📤'}
                {item.id === 'monitoring' && '📊'}
                {item.id === 'settings' && '⚙️'}
              </span>
              {sidebarExpanded && (
                <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>
                  {item.label.split(' ')[1]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {/* Tab Bar - Top of content area */}
          {openTabs.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderBottom: `1px solid ${styles.border}`,
              marginBottom: '16px',
              overflowX: 'auto' as const,
              backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
              borderRadius: '6px 6px 0 0',
              marginLeft: '-24px',
              marginRight: '-24px',
              marginTop: '-24px',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}>
              {openTabs.map((tab, index) => (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveView(tab.id as any);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    backgroundColor: activeView === tab.id ? styles.accent : (isDarkMode ? '#1f2937' : '#ffffff'),
                    color: activeView === tab.id ? '#ffffff' : styles.textSecondary,
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    border: activeView === tab.id ? `1px solid ${styles.accent}` : `1px solid ${styles.border}`,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  title={tab.label}
                >
                  <span>{tab.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '14px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.opacity = '1';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.7';
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* 集群管理 */}
          {activeView === 'clusters' && (
            <div>
              <h2 style={{ marginBottom: '16px', color: styles.title.color, fontSize: '20px' }}>集群管理</h2>

              {clusters.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: styles.title.color, marginBottom: '12px' }}>已配置的集群</h3>
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      style={{
                        ...styles.card,
                        borderLeft: cluster.connected ? `4px solid #10b981` : `4px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ color: styles.title.color, margin: 0, marginBottom: '4px' }}>{cluster.name}</h4>
                          <p style={{ color: styles.status.color, margin: 0, fontSize: '13px' }}>
                            {cluster.brokers.join(', ')}
                          </p>
                        </div>
                        {cluster.connected && (
                          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>✓ 已连接</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!cluster.connected ? (
                          <button
                            onClick={() => handleConnectCluster(cluster.id)}
                            disabled={connecting === cluster.id}
                            style={{
                              ...styles.button,
                              ...(connecting === cluster.id ? styles.buttonDisabled : {}),
                              flex: 1,
                            }}
                          >
                            {connecting === cluster.id ? '连接中...' : '🔗 连接'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisconnectCluster(cluster.id)}
                            style={{
                              ...styles.button,
                              backgroundColor: '#f97316',
                              flex: 1,
                            }}
                          >
                            🔌 断开连接
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCluster(cluster.id)}
                          style={{
                            ...styles.button,
                            backgroundColor: '#ef4444',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Cluster Form */}
              <div style={styles.card}>
                <h3 style={{ color: styles.title.color, marginTop: 0 }}>添加新集群</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>集群名称</label>
                  <input
                    type="text"
                    placeholder="例如：Local Dev"
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Broker 地址（逗号分隔）</label>
                  <input
                    type="text"
                    placeholder="例如：localhost:9092"
                    value={newClusterBrokers}
                    onChange={(e) => setNewClusterBrokers(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <button
                  onClick={handleAddCluster}
                  disabled={!newClusterName.trim() || !newClusterBrokers.trim()}
                  style={{
                    ...styles.button,
                    width: '100%',
                    ...((!newClusterName.trim() || !newClusterBrokers.trim()) ? styles.buttonDisabled : {}),
                  }}
                >
                  ➕ 添加集群
                </button>
              </div>
            </div>
          )}

          {/* Topics */}
          {activeView === 'topics' && (
            <div>
              <h2 style={{ marginBottom: '16px', color: styles.title.color, fontSize: '20px' }}>Topics</h2>
              {!connectedCluster ? (
                <div style={styles.emptyMessage}>
                  请先在"集群管理"中连接一个集群
                </div>
              ) : connectedCluster.topics && connectedCluster.topics.length > 0 ? (
                <div>
                  {!selectedTopic ? (
                    // Topic List View
                    <div>
                      <p style={{ color: styles.status.color, marginBottom: '16px' }}>
                        找到 {connectedCluster.topics.length} 个 Topics
                      </p>
                      <div style={styles.topicGrid}>
                        {connectedCluster.topics.map((topic) => (
                          <div
                            key={topic}
                            style={styles.topicCard}
                            onClick={() => {
                              setSelectedTopic(topic);
                              handleConsumeTopic(topic);
                            }}
                            onMouseOver={(e) => {
                              Object.assign((e.currentTarget as any).style, styles.topicCardHover);
                            }}
                            onMouseOut={(e) => {
                              (e.currentTarget as any).style.transform = 'translateY(0)';
                              (e.currentTarget as any).style.boxShadow = 'none';
                            }}
                          >
                            <div style={styles.topicName}>{topic}</div>
                            <div style={{ fontSize: '12px', color: styles.status.color }}>点击消费消息</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Message List & Detail View
                    <div>
                      <button
                        onClick={() => setSelectedTopic(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: styles.status.color,
                          cursor: 'pointer',
                          marginBottom: '16px',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        ← 返回 Topics
                      </button>

                      <div style={styles.card}>
                        <h3 style={{ color: styles.title.color, marginTop: 0, marginBottom: '12px' }}>
                          📨 {selectedTopic}
                        </h3>

                        {/* Starting Position Controls */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={styles.label}>消费起始位置</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <button
                              onClick={() => {
                                setConsumeStartPosition('latest');
                                setConsumeStartOffset('');
                                setConsumeStartTimestamp('');
                              }}
                              style={{
                                ...styles.button,
                                backgroundColor: consumeStartPosition === 'latest' ? styles.button.backgroundColor : '#9ca3af',
                              }}
                            >
                              Latest
                            </button>
                            <button
                              onClick={() => {
                                setConsumeStartPosition('earliest');
                                setConsumeStartOffset('');
                                setConsumeStartTimestamp('');
                              }}
                              style={{
                                ...styles.button,
                                backgroundColor: consumeStartPosition === 'earliest' ? styles.button.backgroundColor : '#9ca3af',
                              }}
                            >
                              Earliest
                            </button>
                            <button
                              onClick={() => setConsumeStartPosition('offset')}
                              style={{
                                ...styles.button,
                                backgroundColor: consumeStartPosition === 'offset' ? styles.button.backgroundColor : '#9ca3af',
                              }}
                            >
                              Offset
                            </button>
                            <button
                              onClick={() => setConsumeStartPosition('timestamp')}
                              style={{
                                ...styles.button,
                                backgroundColor: consumeStartPosition === 'timestamp' ? styles.button.backgroundColor : '#9ca3af',
                              }}
                            >
                              Timestamp
                            </button>
                          </div>

                          {/* Offset Jump Input */}
                          {consumeStartPosition === 'offset' && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <input
                                type="number"
                                placeholder="输入起始 offset..."
                                value={consumeStartOffset}
                                onChange={(e) => setConsumeStartOffset(e.target.value)}
                                style={{ ...styles.input, flex: 1 }}
                              />
                              <button
                                onClick={() => {
                                  if (consumeStartOffset) {
                                    handleJumpToOffset(parseInt(consumeStartOffset));
                                  }
                                }}
                                style={styles.button}
                              >
                                跳转
                              </button>
                            </div>
                          )}

                          {/* Timestamp Selection */}
                          {consumeStartPosition === 'timestamp' && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <input
                                type="datetime-local"
                                value={consumeStartTimestamp}
                                onChange={(e) => setConsumeStartTimestamp(e.target.value)}
                                style={{ ...styles.input, flex: 1 }}
                              />
                              <button
                                onClick={() => {
                                  if (consumeStartTimestamp) {
                                    const timestamp = new Date(consumeStartTimestamp).getTime();
                                    handleJumpToOffset(timestamp);
                                  }
                                }}
                                style={styles.button}
                              >
                                跳转
                              </button>
                            </div>
                          )}

                          {/* Topic Statistics */}
                          {consumeTopicStats && (
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: isDarkMode ? '#1a202c' : '#f0f9ff',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: styles.textSecondary,
                            }}>
                              <p style={{ margin: '4px 0' }}>📊 Topic 统计</p>
                              <p style={{ margin: '2px 0' }}>总消息数: {consumeTopicStats.totalMessages}</p>
                              <p style={{ margin: '2px 0' }}>Offset 范围: {consumeTopicStats.minOffset} - {consumeTopicStats.maxOffset}</p>
                            </div>
                          )}
                        </div>

                        {/* Search Controls */}
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="按 Key 搜索..."
                              value={consumeSearchKey}
                              onChange={(e) => setConsumeSearchKey(e.target.value)}
                              style={{ ...styles.input, flex: 1 }}
                            />
                            <button
                              onClick={() => {
                                setConsumeSearchKey('');
                                setConsumeSearchContent('');
                                setConsumeSearchOffsetMin('');
                                setConsumeSearchOffsetMax('');
                              }}
                              style={{ ...styles.button, backgroundColor: '#9ca3af' }}
                              title="清除所有过滤"
                            >
                              清除
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="按内容搜索..."
                              value={consumeSearchContent}
                              onChange={(e) => setConsumeSearchContent(e.target.value)}
                              style={{ ...styles.input, flex: 1 }}
                            />
                          </div>

                          {/* Advanced Filters - Offset Range */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                            <span style={{ color: styles.textSecondary, minWidth: '60px' }}>Offset 范围:</span>
                            <input
                              type="number"
                              placeholder="最小"
                              value={consumeSearchOffsetMin}
                              onChange={(e) => setConsumeSearchOffsetMin(e.target.value)}
                              style={{ ...styles.input, flex: 1, minWidth: '80px' }}
                            />
                            <span style={{ color: styles.textSecondary }}>-</span>
                            <input
                              type="number"
                              placeholder="最大"
                              value={consumeSearchOffsetMax}
                              onChange={(e) => setConsumeSearchOffsetMax(e.target.value)}
                              style={{ ...styles.input, flex: 1, minWidth: '80px' }}
                            />
                          </div>

                          {/* Case Sensitive Toggle */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                            <input
                              type="checkbox"
                              id="case-sensitive"
                              checked={consumeSearchCaseSensitive}
                              onChange={(e) => setConsumeSearchCaseSensitive(e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="case-sensitive" style={{ cursor: 'pointer', color: styles.textSecondary }}>
                              区分大小写
                            </label>
                          </div>
                        </div>

                        {/* Error Message */}
                        {consumeError && (
                          <div style={{ ...styles.emptyMessage, backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626', marginBottom: '12px' }}>
                            ❌ {consumeError}
                          </div>
                        )}

                        {/* Loading State */}
                        {consumeLoading ? (
                          <div style={{ textAlign: 'center', padding: '32px', color: styles.status.color }}>
                            ⏳ 加载消息中...
                          </div>
                        ) : consumeMessages.length === 0 ? (
                          <div style={styles.emptyMessage}>
                            该 topic 中没有消息
                          </div>
                        ) : selectedMessage !== null ? (
                          // Message Detail View
                          <div>
                            <button
                              onClick={() => setSelectedMessage(null)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: styles.status.color,
                                cursor: 'pointer',
                                marginBottom: '12px',
                                fontSize: '14px',
                              }}
                            >
                              ← 返回列表
                            </button>
                            <div style={{ ...styles.card, backgroundColor: styles.cardBg }}>
                              {selectedMessage && (
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ color: styles.title.color, margin: 0 }}>消息详情</h4>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={handleNavigateToPreviousMessage}
                                        disabled={selectedMessageIndex <= 0}
                                        style={{
                                          ...styles.button,
                                          backgroundColor: selectedMessageIndex <= 0 ? '#9ca3af' : styles.button.backgroundColor,
                                          cursor: selectedMessageIndex <= 0 ? 'not-allowed' : 'pointer',
                                        }}
                                        title="上一条消息"
                                      >
                                        ← 上一条
                                      </button>
                                      <button
                                        onClick={handleNavigateToNextMessage}
                                        disabled={selectedMessageIndex >= consumeMessages.length - 1}
                                        style={{
                                          ...styles.button,
                                          backgroundColor: selectedMessageIndex >= consumeMessages.length - 1 ? '#9ca3af' : styles.button.backgroundColor,
                                          cursor: selectedMessageIndex >= consumeMessages.length - 1 ? 'not-allowed' : 'pointer',
                                        }}
                                        title="下一条消息"
                                      >
                                        下一条 →
                                      </button>
                                    </div>
                                  </div>

                                  <div style={{ marginBottom: '12px' }}>
                                    <p style={{ color: styles.status.color, fontSize: '12px', marginBottom: '4px' }}>
                                      <strong>消息位置:</strong> {selectedMessageIndex + 1} / {consumeMessages.length}
                                    </p>
                                    <p style={{ color: styles.status.color, fontSize: '12px', marginBottom: '4px' }}>
                                      <strong>分区:</strong> {selectedMessage.partition}
                                    </p>
                                    <p style={{ color: styles.status.color, fontSize: '12px', marginBottom: '4px' }}>
                                      <strong>Offset:</strong> {selectedMessage.offset}
                                    </p>
                                    <p style={{ color: styles.status.color, fontSize: '12px', marginBottom: '4px' }}>
                                      <strong>时间戳:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}
                                    </p>
                                    {selectedMessage.key && (
                                      <p style={{ color: styles.status.color, fontSize: '12px', marginBottom: '4px' }}>
                                        <strong>Key:</strong> {selectedMessage.key}
                                      </p>
                                    )}
                                  </div>

                                  {/* Display Format Selector */}
                                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${styles.border}` }}>
                                    <label style={{ ...styles.label, marginBottom: '8px' }}>显示格式</label>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => setMessageDisplayFormat('text')}
                                        style={{
                                          ...styles.button,
                                          fontSize: '12px',
                                          padding: '6px 12px',
                                          backgroundColor: messageDisplayFormat === 'text' ? styles.button.backgroundColor : '#9ca3af',
                                        }}
                                      >
                                        纯文本
                                      </button>
                                      <button
                                        onClick={() => setMessageDisplayFormat('json')}
                                        style={{
                                          ...styles.button,
                                          fontSize: '12px',
                                          padding: '6px 12px',
                                          backgroundColor: messageDisplayFormat === 'json' ? styles.button.backgroundColor : '#9ca3af',
                                        }}
                                      >
                                        JSON
                                      </button>
                                      <button
                                        onClick={() => setMessageDisplayFormat('base64')}
                                        style={{
                                          ...styles.button,
                                          fontSize: '12px',
                                          padding: '6px 12px',
                                          backgroundColor: messageDisplayFormat === 'base64' ? styles.button.backgroundColor : '#9ca3af',
                                        }}
                                      >
                                        Base64
                                      </button>
                                      <button
                                        onClick={() => setMessageDisplayFormat('hex')}
                                        style={{
                                          ...styles.button,
                                          fontSize: '12px',
                                          padding: '6px 12px',
                                          backgroundColor: messageDisplayFormat === 'hex' ? styles.button.backgroundColor : '#9ca3af',
                                        }}
                                      >
                                        Hex
                                      </button>
                                    </div>
                                  </div>

                                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${styles.border}` }}>
                                    <label style={styles.label}>消息内容</label>
                                    <pre
                                      style={{
                                        backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        overflowX: 'auto',
                                        fontSize: '12px',
                                        color: styles.textPrimary,
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        fontFamily: 'monospace',
                                        border: `1px solid ${styles.border}`,
                                      }}
                                    >
                                      {formatMessageValue(selectedMessage.value)}
                                    </pre>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(formatMessageValue(selectedMessage.value));
                                    }}
                                    style={{ ...styles.button, marginTop: '12px' }}
                                  >
                                    📋 复制到剪贴板
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Message List View
                          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {(() => {
                              // Apply search filters with advanced options
                              let filteredMessages = [...consumeMessages];

                              // Filter by key
                              if (consumeSearchKey) {
                                filteredMessages = filteredMessages.filter((msg) => {
                                  if (!msg.key) return false;
                                  return consumeSearchCaseSensitive
                                    ? msg.key.includes(consumeSearchKey)
                                    : msg.key.toLowerCase().includes(consumeSearchKey.toLowerCase());
                                });
                              }

                              // Filter by content
                              if (consumeSearchContent) {
                                filteredMessages = filteredMessages.filter((msg) => {
                                  if (!msg.value) return false;
                                  return consumeSearchCaseSensitive
                                    ? msg.value.includes(consumeSearchContent)
                                    : msg.value.toLowerCase().includes(consumeSearchContent.toLowerCase());
                                });
                              }

                              // Filter by offset range
                              if (consumeSearchOffsetMin) {
                                const minOffset = parseInt(consumeSearchOffsetMin);
                                filteredMessages = filteredMessages.filter((msg) => {
                                  const offset = typeof msg.offset === 'string' ? parseInt(msg.offset) : msg.offset;
                                  return offset >= minOffset;
                                });
                              }
                              if (consumeSearchOffsetMax) {
                                const maxOffset = parseInt(consumeSearchOffsetMax);
                                filteredMessages = filteredMessages.filter((msg) => {
                                  const offset = typeof msg.offset === 'string' ? parseInt(msg.offset) : msg.offset;
                                  return offset <= maxOffset;
                                });
                              }

                              if (filteredMessages.length === 0 && (consumeSearchKey || consumeSearchContent || consumeSearchOffsetMin || consumeSearchOffsetMax)) {
                                return (
                                  <div style={styles.emptyMessage}>
                                    没有找到匹配的消息
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <div style={{ marginBottom: '12px', fontSize: '12px', color: styles.textSecondary }}>
                                    显示 {filteredMessages.length} / {consumeMessages.length} 条消息
                                  </div>
                                  {filteredMessages.map((msg, idx) => {
                                    const actualIndex = consumeMessages.findIndex(m => m === msg);
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => {
                                          setSelectedMessage(msg);
                                          setSelectedMessageIndex(actualIndex);
                                          setMessageDisplayFormat('text');
                                        }}
                                        style={{
                                          ...styles.card,
                                          cursor: 'pointer',
                                          marginBottom: '8px',
                                          padding: '12px',
                                          backgroundColor: idx % 2 === 0 ? styles.cardBg : (isDarkMode ? '#1a202c' : '#f5f5f5'),
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                          <div style={{ flex: 1 }}>
                                            <p style={{ color: styles.status.color, fontSize: '11px', margin: '0 0 4px 0' }}>
                                              P{msg.partition} • Offset {msg.offset}
                                            </p>
                                            {msg.key && (
                                              <p style={{ color: styles.accent, fontSize: '12px', margin: '0 0 6px 0', fontWeight: 600 }}>
                                                🔑 {msg.key}
                                              </p>
                                            )}
                                            <p style={{ color: styles.textPrimary, fontSize: '12px', margin: 0, wordBreak: 'break-word' }}>
                                              {msg.value.length > 100 ? msg.value.substring(0, 100) + '...' : msg.value}
                                            </p>
                                          </div>
                                          <span style={{ color: styles.status.color, fontSize: '11px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                            → 查看
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.emptyMessage}>集群中没有 Topics</div>
              )}
            </div>
          )}

          {/* 消费者组 */}
          {activeView === 'consumer-groups' && (
            <div>
              <h2 style={{ color: styles.title.color, fontSize: '20px' }}>消费者组</h2>
              <div style={styles.emptyMessage}>
                此功能开发中...
              </div>
            </div>
          )}

          {/* 生产消息 */}
          {activeView === 'produce' && (
            <div>
              <h2 style={{ color: styles.title.color, fontSize: '20px' }}>生产消息</h2>
              {!connectedCluster ? (
                <div style={styles.emptyMessage}>
                  请先在"集群管理"中连接一个集群
                </div>
              ) : (
                <div>
                  {/* Topic Selector */}
                  <div style={styles.card}>
                    <label style={styles.label}>选择 Topic</label>
                    <select
                      value={produceTopic}
                      onChange={(e) => setProduceTopic(e.target.value)}
                      style={{
                        ...styles.input,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">-- 选择一个 Topic --</option>
                      {connectedCluster.topics?.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format Selector */}
                  <div style={styles.card}>
                    <label style={styles.label}>消息格式</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setProduceFormat('text')}
                        style={{
                          ...styles.button,
                          backgroundColor: produceFormat === 'text' ? styles.button.backgroundColor : '#9ca3af',
                          flex: 1,
                        }}
                      >
                        纯文本
                      </button>
                      <button
                        onClick={() => setProduceFormat('json')}
                        style={{
                          ...styles.button,
                          backgroundColor: produceFormat === 'json' ? styles.button.backgroundColor : '#9ca3af',
                          flex: 1,
                        }}
                      >
                        JSON
                      </button>
                    </div>
                  </div>

                  {/* Message Editor */}
                  <div style={styles.card}>
                    <label style={styles.label}>消息内容</label>
                    <textarea
                      value={produceContent}
                      onChange={(e) => setProduceContent(e.target.value)}
                      placeholder={produceFormat === 'json' ? '输入有效的 JSON...' : '输入消息内容...'}
                      style={{
                        ...styles.input,
                        minHeight: '200px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      } as React.CSSProperties}
                    />
                    {produceContent && (
                      <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
                        大小: {(new Blob([produceContent]).size / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>

                  {/* Advanced Options */}
                  <div style={styles.card}>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: styles.accent,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      {showAdvanced ? '▼' : '▶'} 高级选项
                    </button>

                    {showAdvanced && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${styles.border}` }}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>消息 Key (可选)</label>
                          <input
                            type="text"
                            value={produceKey}
                            onChange={(e) => setProduceKey(e.target.value)}
                            placeholder="消息 key..."
                            style={styles.input}
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>指定分区 (可选)</label>
                          <input
                            type="number"
                            value={producePartition}
                            onChange={(e) => setProducePartition(e.target.value)}
                            placeholder="分区号..."
                            style={styles.input}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {produceError && (
                    <div
                      style={{
                        ...styles.emptyMessage,
                        backgroundColor: '#fee2e2',
                        borderColor: '#fca5a5',
                        color: '#dc2626',
                      }}
                    >
                      ❌ {produceError}
                    </div>
                  )}

                  {/* Success Message */}
                  {produceSuccess && (
                    <div
                      style={{
                        ...styles.emptyMessage,
                        backgroundColor: '#dcfce7',
                        borderColor: '#86efac',
                        color: '#166534',
                      }}
                    >
                      ✓ 消息发送成功！分区: {produceSuccess.partition}, Offset: {produceSuccess.offset}
                    </div>
                  )}

                  {/* JSON Validation Error */}
                  {produceFormat === 'json' && produceContent && !validateJSON(produceContent).valid && (
                    <div
                      style={{
                        ...styles.emptyMessage,
                        backgroundColor: '#fef3c7',
                        borderColor: '#fcd34d',
                        color: '#92400e',
                      }}
                    >
                      ⚠️ JSON 格式错误: {validateJSON(produceContent).error}
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleProduceSend}
                    disabled={!produceTopic || !produceContent || produceSending || (produceFormat === 'json' && !validateJSON(produceContent).valid)}
                    style={{
                      ...styles.button,
                      width: '100%',
                      ...((!produceTopic || !produceContent || produceSending || (produceFormat === 'json' && !validateJSON(produceContent).valid))
                        ? styles.buttonDisabled
                        : {}),
                    }}
                  >
                    {produceSending ? '📤 发送中...' : '📤 发送消息'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 监控 */}
          {activeView === 'monitoring' && (
            <div>
              <h2 style={{ color: styles.title.color, fontSize: '20px' }}>监控</h2>
              <div style={styles.emptyMessage}>
                此功能开发中...
              </div>
            </div>
          )}

          {/* 设置 */}
          {activeView === 'settings' && (
            <div>
              <h2 style={{ color: styles.title.color, fontSize: '20px' }}>设置</h2>
              <div style={styles.emptyMessage}>
                此功能开发中...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KafkaToolComponent;
