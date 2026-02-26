import React, { useEffect } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';

interface OverviewTabProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  isDarkMode?: boolean;
}

/**
 * Task 5.1-5.6: Overview Tab
 * Displays consumer group information:
 * - Group ID, State, Topics
 * - Member list with partition assignments
 */
const OverviewTab: React.FC<OverviewTabProps> = ({ kafkaTool, groupId, isDarkMode = false }) => {
  const { selectedGroupInfo, loading, setSelectedGroupInfo, setLoading, setError } =
    useConsumerGroupStore();

  useEffect(() => {
    if (!selectedGroupInfo) {
      loadGroupInfo();
    }
  }, [groupId, kafkaTool]);

  const loadGroupInfo = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    try {
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const info = await groupService.getConsumerGroupInfo(groupId);
      setSelectedGroupInfo(info);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load group info';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    display: 'flex',
    alignItems: 'center',
  };

  const infoTableStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const rowStyle = (isHeader: boolean = false): React.CSSProperties => ({
    display: 'flex',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isHeader
      ? isDarkMode
        ? '#111827'
        : '#f9fafb'
      : isDarkMode
      ? '#1f2937'
      : '#ffffff',
  });

  const cellStyle = (isHeader: boolean = false): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    fontSize: '13px',
    color: isHeader
      ? isDarkMode
        ? '#9ca3af'
        : '#6b7280'
      : isDarkMode
      ? '#e5e7eb'
      : '#111827',
    fontWeight: isHeader ? 600 : 400,
    wordBreak: 'break-word',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    minWidth: '120px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '13px',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontWeight: 500,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '3px',
    backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
    color: isDarkMode ? '#93c5fd' : '#0c4a6e',
    fontSize: '12px',
    fontWeight: 500,
  };

  const memberRowStyle = (index: number): React.CSSProperties => ({
    borderBottom:
      index === (selectedGroupInfo?.members.length || 0) - 1
        ? 'none'
        : `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    ...rowStyle(false),
  });

  const memberCellStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    fontSize: '13px',
    color: isDarkMode ? '#e5e7eb' : '#111827',
  };

  if (loading && !selectedGroupInfo) {
    return <div style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}>加载 Overview...</div>;
  }

  if (!selectedGroupInfo) {
    return <div style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}>没有可用的消费者组信息</div>;
  }

  return (
    <div>
      {/* Basic Info Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span style={{ marginRight: '8px' }}>ℹ️</span> 消费者组信息
        </div>
        <div style={infoTableStyle}>
          <div style={rowStyle(true)}>
            <div style={{ ...cellStyle(true), minWidth: '150px', flex: 0 }}>属性</div>
            <div style={cellStyle(true)}>值</div>
          </div>

          <div style={rowStyle(false)}>
            <div style={{ ...cellStyle(false), minWidth: '150px', flex: 0 }}>
              <span style={labelStyle}>消费者组ID</span>
            </div>
            <div style={cellStyle(false)}>
              <span style={valueStyle}>{selectedGroupInfo.groupId}</span>
            </div>
          </div>

          <div style={rowStyle(false)}>
            <div style={{ ...cellStyle(false), minWidth: '150px', flex: 0 }}>
              <span style={labelStyle}>状态</span>
            </div>
            <div style={cellStyle(false)}>
              <span
                style={{
                  ...badgeStyle,
                  backgroundColor:
                    selectedGroupInfo.state === 'stable'
                      ? isDarkMode
                        ? '#10b981'
                        : '#d1fae5'
                      : selectedGroupInfo.state === 'rebalancing'
                      ? isDarkMode
                        ? '#f59e0b'
                        : '#fef3c7'
                      : isDarkMode
                      ? '#ef4444'
                      : '#fee2e2',
                  color:
                    selectedGroupInfo.state === 'stable'
                      ? isDarkMode
                        ? '#ffffff'
                        : '#065f46'
                      : selectedGroupInfo.state === 'rebalancing'
                      ? isDarkMode
                        ? '#ffffff'
                        : '#78350f'
                      : isDarkMode
                      ? '#ffffff'
                      : '#7f1d1d',
                }}
              >
                {selectedGroupInfo.state}
              </span>
            </div>
          </div>

          <div style={rowStyle(false)}>
            <div style={{ ...cellStyle(false), minWidth: '150px', flex: 0 }}>
              <span style={labelStyle}>成员</span>
            </div>
            <div style={cellStyle(false)}>
              <span style={valueStyle}>{selectedGroupInfo.members.length}</span>
            </div>
          </div>

          <div style={rowStyle(false)}>
            <div style={{ ...cellStyle(false), minWidth: '150px', flex: 0 }}>
              <span style={labelStyle}>主题</span>
            </div>
            <div style={cellStyle(false)}>
              {selectedGroupInfo.topics.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedGroupInfo.topics.map((topic) => (
                    <span key={topic} style={badgeStyle}>
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={valueStyle}>没有主题</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      {selectedGroupInfo.members.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ marginRight: '8px' }}>👥</span> 成员 ({selectedGroupInfo.members.length})
          </div>
          <div style={infoTableStyle}>
            <div style={rowStyle(true)}>
              <div style={{ ...cellStyle(true), flex: 0.5 }}>成员ID</div>
              <div style={{ ...cellStyle(true), flex: 0.5 }}>客户端ID</div>
              <div style={{ ...cellStyle(true), flex: 0.8 }}>主机</div>
              <div style={{ ...cellStyle(true), flex: 0.7 }}>分区</div>
            </div>

            {selectedGroupInfo.members.map((member, idx) => (
              <div key={member.memberId} style={memberRowStyle(idx)}>
                <div style={{ ...memberCellStyle, flex: 0.5, wordBreak: 'break-all' }}>
                  {member.memberId}
                </div>
                <div style={{ ...memberCellStyle, flex: 0.5 }}>{member.clientId}</div>
                <div style={{ ...memberCellStyle, flex: 0.8 }}>{member.host}</div>
                <div style={{ ...memberCellStyle, flex: 0.7 }}>
                  {member.topicPartitions.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {member.topicPartitions.map((tp, i) => (
                        <span key={i} style={badgeStyle}>
                          {tp.topic}:{tp.partition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>无</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
