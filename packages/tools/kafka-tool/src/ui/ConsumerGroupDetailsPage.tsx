import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';
import OverviewTab from './OverviewTab';
import ProgressTab from './ProgressTab';
import MonitoringTab from './MonitoringTab';
import RealtimeMessagesTab from './RealtimeMessagesTab';
import OffsetResetModal from './OffsetResetModal';

interface ConsumerGroupDetailsPageProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  onBack: () => void;
  isDarkMode?: boolean;
}

/**
 * Task 4.1-4.5: Consumer Group Details Page
 * Multi-tab interface for displaying consumer group information
 * Tabs: Overview, Progress, Monitoring
 */
const ConsumerGroupDetailsPage: React.FC<ConsumerGroupDetailsPageProps> = ({
  kafkaTool,
  groupId,
  onBack,
  isDarkMode = false,
}) => {
  const [
    selectedGroupInfo,
    currentTab,
    setCurrentTab,
    setSelectedGroupInfo,
    setLoading,
    setError,
    loading,
    error,
  ] = useConsumerGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showOffsetReset, setShowOffsetReset] = useState(false);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId, kafkaTool]);

  const loadGroupDetails = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const info = await groupService.getConsumerGroupInfo(groupId);
      setSelectedGroupInfo(info);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load group details';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGroupDetails();
    } finally {
      setRefreshing(false);
    }
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: isDarkMode ? '#f3f4f6' : '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const stateBadgeStyle = (state: string): React.CSSProperties => {
    let bgColor = isDarkMode ? '#4b5563' : '#e5e7eb';
    if (state === 'stable') bgColor = isDarkMode ? '#10b981' : '#d1fae5';
    if (state === 'rebalancing') bgColor = isDarkMode ? '#f59e0b' : '#fef3c7';
    if (state === 'dead') bgColor = isDarkMode ? '#ef4444' : '#fee2e2';

    let textColor = isDarkMode ? '#ffffff' : '#111827';
    if (state === 'stable') textColor = isDarkMode ? '#ffffff' : '#065f46';
    if (state === 'rebalancing') textColor = isDarkMode ? '#ffffff' : '#78350f';
    if (state === 'dead') textColor = isDarkMode ? '#ffffff' : '#7f1d1d';

    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '4px',
      backgroundColor: bgColor,
      color: textColor,
      fontSize: '12px',
      fontWeight: 500,
    };
  };

  const headerButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    padding: '0 24px',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive
      ? isDarkMode
        ? '#3b82f6'
        : '#2563eb'
      : isDarkMode
      ? '#9ca3af'
      : '#6b7280',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    borderBottom: isActive ? `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}` : 'none',
    transition: 'all 0.2s',
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    borderBottom: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
    fontSize: '13px',
  };

  if (loading && !selectedGroupInfo) {
    return (
      <div style={{ padding: '24px', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
        加载消费者组详情...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button
            onClick={onBack}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
            }}
            title="返回消费者组列表"
          >
            ←
          </button>
          <span>{groupId}</span>
          {selectedGroupInfo && (
            <span style={stateBadgeStyle(selectedGroupInfo.state)}>
              {selectedGroupInfo.state}
            </span>
          )}
        </div>
        <div style={headerButtonsStyle}>
          <button onClick={handleRefresh} disabled={refreshing} style={buttonStyle}>
            {refreshing ? '⟳' : '🔄'} 刷新
          </button>
          <button
            onClick={() => setShowOffsetReset(true)}
            style={buttonStyle}
          >
            ⬅️ 重置偏移量
          </button>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Tab Navigation */}
      <div style={tabsStyle}>
        <button
          style={tabButtonStyle(currentTab === 'overview')}
          onClick={() => setCurrentTab('overview')}
        >
          Overview
        </button>
        <button
          style={tabButtonStyle(currentTab === 'progress')}
          onClick={() => setCurrentTab('progress')}
        >
          Progress
        </button>
        <button
          style={tabButtonStyle(currentTab === 'monitoring')}
          onClick={() => setCurrentTab('monitoring')}
        >
          Monitoring
        </button>
        <button
          style={tabButtonStyle(currentTab === 'realtime')}
          onClick={() => setCurrentTab('realtime')}
        >
          🔴 实时消费
        </button>
      </div>

      {/* Tab Content */}
      <div style={contentStyle}>
        {currentTab === 'overview' && (
          <OverviewTab kafkaTool={kafkaTool} groupId={groupId} isDarkMode={isDarkMode} />
        )}
        {currentTab === 'progress' && (
          <ProgressTab kafkaTool={kafkaTool} groupId={groupId} isDarkMode={isDarkMode} />
        )}
        {currentTab === 'monitoring' && (
          <MonitoringTab kafkaTool={kafkaTool} groupId={groupId} isDarkMode={isDarkMode} />
        )}
        {currentTab === 'realtime' && (
          <RealtimeMessagesTab kafkaTool={kafkaTool} groupId={groupId} isDarkMode={isDarkMode} />
        )}
      </div>

      {/* Offset Reset Modal */}
      {showOffsetReset && (
        <OffsetResetModal
          kafkaTool={kafkaTool}
          groupId={groupId}
          topics={selectedGroupInfo?.topics || []}
          onClose={() => setShowOffsetReset(false)}
          onReset={async () => {
            setShowOffsetReset(false);
            await loadGroupDetails();
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ConsumerGroupDetailsPage;
