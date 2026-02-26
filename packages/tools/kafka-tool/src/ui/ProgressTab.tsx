import React, { useState, useEffect, useMemo } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';
import { ConsumerGroupOffset } from '../types';
import MessageViewerModal from './MessageViewerModal';

interface ProgressTabProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  isDarkMode?: boolean;
}

type SortField = 'topic' | 'partition' | 'offset' | 'lag' | 'leo';
type SortDirection = 'asc' | 'desc';

/**
 * Task 6.1-6.7: Progress Tab
 * Shows consumption progress with sortable table
 * Can click row to view messages in MessageViewerModal
 */
const ProgressTab: React.FC<ProgressTabProps> = ({ kafkaTool, groupId, isDarkMode = false }) => {
  const { offsets, loading, setOffsets, setLoading, setError } = useConsumerGroupStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('topic');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [selectedMessage, setSelectedMessage] = useState<{
    topic: string;
    partition: number;
    currentOffset: number;
  } | null>(null);
  const [leo, setLeo] = useState<Map<string, Map<number, number>>>(new Map());
  const [leoLoading, setLeoLoading] = useState(true);

  useEffect(() => {
    loadOffsets();
  }, [groupId, kafkaTool]);

  const loadOffsets = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    try {
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const data = await groupService.getConsumerGroupOffsets(groupId);
      setOffsets(data);

      // Load LEO for each partition
      await loadLeoForPartitions(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load offsets';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadLeoForPartitions = async (offsetData: ConsumerGroupOffset[]) => {
    if (!kafkaTool?.getKafkaService().isConnected()) return;

    setLeoLoading(true);
    try {
      const adminService = kafkaTool.getKafkaService().getAdminService();
      const newLeo = new Map<string, Map<number, number>>();

      // Group offsets by topic
      const byTopic = new Map<string, Set<number>>();
      offsetData.forEach((o) => {
        if (!byTopic.has(o.topic)) {
          byTopic.set(o.topic, new Set());
        }
        byTopic.get(o.topic)!.add(o.partition);
      });

      // Fetch LEO for each topic
      for (const [topic] of byTopic) {
        try {
          const leoData = await adminService.getTopicOffsets(topic);
          const partitionLeo = new Map<number, number>();
          leoData.forEach((offset) => {
            partitionLeo.set(offset.partition, parseInt(offset.high || '0', 10));
          });
          newLeo.set(topic, partitionLeo);
        } catch (err) {
          console.error(`Failed to load LEO for topic ${topic}:`, err);
        }
      }

      setLeo(newLeo);
    } finally {
      setLeoLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = offsets.filter(
      (o) =>
        o.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.partition.toString().includes(searchQuery)
    );

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'leo') {
        const aLeo = leo.get(a.topic)?.get(a.partition) || 0;
        const bLeo = leo.get(b.topic)?.get(b.partition) || 0;
        aVal = aLeo;
        bVal = bLeo;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [offsets, searchQuery, sortField, sortDir, leo]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    overflow: 'hidden',
    fontSize: '13px',
  };

  const headerCellStyle = (field: SortField): React.CSSProperties => ({
    padding: '12px 16px',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s',
  });

  const bodyCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    color: isDarkMode ? '#e5e7eb' : '#111827',
  };

  const rowStyle: React.CSSProperties = {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const controlsStyle: React.CSSProperties = {
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  };

  const emptyStyle: React.CSSProperties = {
    padding: '32px',
    textAlign: 'center',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '14px',
  };

  const getLagColor = (lag: number): string => {
    if (lag < 50) return isDarkMode ? '#10b981' : '#059669';
    if (lag < 200) return isDarkMode ? '#f59e0b' : '#d97706';
    return isDarkMode ? '#ef4444' : '#dc2626';
  };

  if (loading && offsets.length === 0) {
    return <div style={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}>加载 offsets...</div>;
  }

  return (
    <div>
      <div style={controlsStyle}>
        <input
          type="text"
          placeholder="按主题或分区搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={inputStyle}
        />
        <button onClick={loadOffsets} disabled={loading} style={buttonStyle}>
          {loading ? '⟳' : '🔄'} 刷新
        </button>
      </div>

      {filteredAndSorted.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
                <th
                  style={headerCellStyle('topic')}
                  onClick={() => handleSort('topic')}
                  title="点击排序"
                >
                  Topic {sortField === 'topic' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  style={headerCellStyle('partition')}
                  onClick={() => handleSort('partition')}
                  title="点击排序"
                >
                  Partition {sortField === 'partition' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  style={headerCellStyle('offset')}
                  onClick={() => handleSort('offset')}
                  title="点击排序"
                >
                  Current Offset {sortField === 'offset' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  style={headerCellStyle('leo')}
                  onClick={() => handleSort('leo')}
                  title="点击排序"
                >
                  LEO {sortField === 'leo' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  style={headerCellStyle('lag')}
                  onClick={() => handleSort('lag')}
                  title="点击排序"
                >
                  Lag {sortField === 'lag' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((offset, idx) => {
                const leo_val = leo.get(offset.topic)?.get(offset.partition) || 0;
                const lag = Math.max(0, leo_val - offset.offset);
                const lagColor = getLagColor(lag);

                return (
                  <tr
                    key={idx}
                    style={{
                      ...rowStyle,
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    }}
                    onClick={() =>
                      setSelectedMessage({
                        topic: offset.topic,
                        partition: offset.partition,
                        currentOffset: offset.offset,
                      })
                    }
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                        ? '#374151'
                        : '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = isDarkMode
                        ? '#1f2937'
                        : '#ffffff';
                    }}
                  >
                    <td style={bodyCellStyle}>{offset.topic}</td>
                    <td style={bodyCellStyle}>{offset.partition}</td>
                    <td style={bodyCellStyle}>{offset.offset}</td>
                    <td style={bodyCellStyle}>{leo_val}</td>
                    <td style={{ ...bodyCellStyle, color: lagColor, fontWeight: 500 }}>
                      {lag}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={emptyStyle}>
          {offsets.length === 0 ? '没有分区 offsets' : '没有匹配的分区'}
        </div>
      )}

      {selectedMessage && (
        <MessageViewerModal
          kafkaTool={kafkaTool}
          topic={selectedMessage.topic}
          partition={selectedMessage.partition}
          currentOffset={selectedMessage.currentOffset}
          onClose={() => setSelectedMessage(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ProgressTab;
