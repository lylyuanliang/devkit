import React, { useState, useMemo } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';
import { ConsumerGroupInfo } from '../types';

interface ConsumerGroupListViewProps {
  kafkaTool?: KafkaTool;
  groups: string[];
  loading: boolean;
  onRefresh: () => void;
  isDarkMode?: boolean;
}

/**
 * Task 3.1-3.6: Consumer Group List View
 * Displays list of consumer groups with search, selection, and refresh
 */
const ConsumerGroupListView: React.FC<ConsumerGroupListViewProps> = ({
  kafkaTool,
  groups,
  loading,
  onRefresh,
  isDarkMode = false,
}) => {
  const { selectedGroupId, setSelectedGroup } = useConsumerGroupStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupInfoCache, setGroupInfoCache] = useState<Map<string, ConsumerGroupInfo>>(
    new Map()
  );
  const [loadingGroupInfo, setLoadingGroupInfo] = useState<Map<string, boolean>>(new Map());

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const handleSelectGroup = async (groupId: string) => {
    setSelectedGroup(groupId);

    // Load group info if not cached
    if (!groupInfoCache.has(groupId) && kafkaTool?.getKafkaService().isConnected()) {
      setLoadingGroupInfo((prev) => new Map(prev).set(groupId, true));
      try {
        const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
        const info = await groupService.getConsumerGroupInfo(groupId);
        setGroupInfoCache((prev) => new Map(prev).set(groupId, info));
      } catch (err) {
        console.error(`Failed to load info for group ${groupId}:`, err);
      } finally {
        setLoadingGroupInfo((prev) => new Map(prev).set(groupId, false));
      }
    }
  };

  const getGroupState = (groupId: string): string => {
    const info = groupInfoCache.get(groupId);
    return info?.state || 'unknown';
  };

  const getStateBadgeColor = (state: string): string => {
    switch (state) {
      case 'stable':
        return isDarkMode ? '#10b981' : '#059669';
      case 'rebalancing':
        return isDarkMode ? '#f59e0b' : '#d97706';
      case 'dead':
        return isDarkMode ? '#ef4444' : '#dc2626';
      default:
        return isDarkMode ? '#6b7280' : '#9ca3af';
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
  };

  const searchStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const itemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '12px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    cursor: 'pointer',
    backgroundColor: isSelected
      ? isDarkMode
        ? '#1e3a8a'
        : '#e0e7ff'
      : isDarkMode
      ? '#1f2937'
      : '#f9fafb',
    transition: 'background-color 0.2s',
  });

  const groupNameStyle: React.CSSProperties = {
    fontWeight: 500,
    marginBottom: '4px',
    fontSize: '13px',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const groupMetaStyle: React.CSSProperties = {
    fontSize: '11px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: color,
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 500,
  });

  const emptyStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '12px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <input
          type="text"
          placeholder="搜索消费者组..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchStyle}
        />
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '加载中...' : '🔄 刷新'}
        </button>
      </div>

      <ul style={listStyle}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const state = getGroupState(group);
            const isSelected = selectedGroupId === group;
            const isLoading = loadingGroupInfo.get(group) || false;

            return (
              <li
                key={group}
                style={itemStyle(isSelected)}
                onClick={() => handleSelectGroup(group)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                      ? '#374151'
                      : '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                      ? '#1f2937'
                      : '#f9fafb';
                  }
                }}
              >
                <div style={groupNameStyle} title={group}>
                  {group}
                </div>
                <div style={groupMetaStyle}>
                  <span style={badgeStyle(getStateBadgeColor(state))}>
                    {isLoading ? '...' : state}
                  </span>
                </div>
              </li>
            );
          })
        ) : (
          <div style={emptyStyle}>
            {groups.length === 0 ? '没有消费者组' : '没有匹配的消费者组'}
          </div>
        )}
      </ul>
    </div>
  );
};

export default ConsumerGroupListView;
