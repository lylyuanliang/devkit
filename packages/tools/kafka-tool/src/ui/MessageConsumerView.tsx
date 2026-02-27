import React, { useState, useEffect } from 'react';
import { KafkaAPI } from '../service/kafka-api';
import ConsumerGroupListView from './ConsumerGroupListView';
import ConsumerGroupDetailsPage from './ConsumerGroupDetailsPage';
import ConsumerGroupOnboarding from './ConsumerGroupOnboarding';
import { useConsumerGroupStore } from './consumer-group-store';
import { TopicInfo } from '../types';

interface MessageConsumerViewProps {
  clusterId: string;
  styles: any;
  isDarkMode?: boolean;
}

/**
 * Adapter version of MessageConsumer that uses KafkaAPI
 * Compatible with KafkaToolComponent architecture
 */
const MessageConsumerView: React.FC<MessageConsumerViewProps> = ({
  clusterId,
  styles,
  isDarkMode = false,
}) => {
  const { selectedGroupId, clearGroupState } = useConsumerGroupStore();
  const [groups, setGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [topics, setTopics] = useState<TopicInfo[]>([]);

  useEffect(() => {
    loadConsumerGroups();
    loadTopics();
  }, [clusterId]);

  const loadTopics = async () => {
    try {
      // 使用 KafkaAPI 获取主题列表
      const topicList = await KafkaAPI.listTopics(clusterId);
      console.log('MessageConsumerView: 获取到', topicList.length, '个主题');

      // 转换为 TopicInfo 格式（只需要 name 字段）
      const topicInfos: TopicInfo[] = topicList.map(name => ({
        name,
        partitions: 0,
        replicationFactor: 0,
      }));
      setTopics(topicInfos);
    } catch (err) {
      console.error('加载主题失败:', err);
      setTopics([]);
    }
  };

  const loadConsumerGroups = async () => {
    setLoadingGroups(true);
    setError(null);

    try {
      const groupList = await KafkaAPI.listConsumerGroups(clusterId);
      setGroups(groupList);
      setShowOnboarding(groupList.length === 0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载消费者组失败';
      setError(errorMsg);
    } finally {
      setLoadingGroups(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  // Onboarding state
  if (showOnboarding && groups.length === 0) {
    return (
      <div style={containerStyle}>
        <ConsumerGroupOnboarding
          kafkaTool={undefined}
          isDarkMode={isDarkMode}
          topics={topics}
          clusterId={clusterId}
          onGroupCreated={loadConsumerGroups}
        />
      </div>
    );
  }

  // List + Details layout
  return (
    <div style={containerStyle}>
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
            color: isDarkMode ? '#fca5a5' : '#dc2626',
            borderBottom: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
          }}
        >
          <strong>错误：</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar - Group List */}
        <div
          style={{
            width: '250px',
            borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            overflowY: 'auto',
            backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
          }}
        >
          <ConsumerGroupListView
            kafkaTool={undefined}
            groups={groups}
            loading={loadingGroups}
            onRefresh={loadConsumerGroups}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Main Panel - Details or Empty Message */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {selectedGroupId ? (
            <ConsumerGroupDetailsPage
              kafkaTool={undefined}
              groupId={selectedGroupId}
              onBack={clearGroupState}
              isDarkMode={isDarkMode}
              clusterId={clusterId}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontSize: '14px',
              }}
            >
              选择一个消费者组以查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageConsumerView;
