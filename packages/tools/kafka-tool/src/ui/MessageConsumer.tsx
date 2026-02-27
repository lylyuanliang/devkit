import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';
import ConsumerGroupListView from './ConsumerGroupListView';
import ConsumerGroupDetailsPage from './ConsumerGroupDetailsPage';
import ConsumerGroupOnboarding from './ConsumerGroupOnboarding';

interface MessageConsumerProps {
  kafkaTool?: KafkaTool;
  onError?: (error: string) => void;
  isDarkMode?: boolean;
}

/**
 * Task 2.1-2.5: MessageConsumer Container
 * Main container for consumer group management
 * Shows onboarding if no groups, else shows list and details
 */
const MessageConsumer: React.FC<MessageConsumerProps> = ({
  kafkaTool,
  onError,
  isDarkMode = false,
}) => {
  const { selectedGroupId, clearGroupState } = useConsumerGroupStore();
  const [groups, setGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load consumer groups on mount
  useEffect(() => {
    loadConsumerGroups();
  }, [kafkaTool]);

  const loadConsumerGroups = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    setError(null);

    try {
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const groupList = await groupService.listConsumerGroups();
      setGroups(groupList);
      setShowOnboarding(groupList.length === 0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load consumer groups';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleBackToGroups = () => {
    clearGroupState();
  };

  const handleGroupCreated = () => {
    setShowOnboarding(false);
    loadConsumerGroups();
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  // Onboarding state - no consumer groups exist
  if (showOnboarding && groups.length === 0) {
    return (
      <div style={containerStyle}>
        <ConsumerGroupOnboarding
          kafkaTool={kafkaTool}
          isDarkMode={isDarkMode}
          onGroupCreated={handleGroupCreated}
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
          <strong>Error:</strong> {error}
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
            kafkaTool={kafkaTool}
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
              kafkaTool={kafkaTool}
              groupId={selectedGroupId}
              onBack={handleBackToGroups}
              isDarkMode={isDarkMode}
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
              Select a consumer group to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageConsumer;
