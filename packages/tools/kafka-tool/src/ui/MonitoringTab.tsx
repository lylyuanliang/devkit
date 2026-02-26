import React, { useState, useEffect, useRef } from 'react';
import { KafkaTool } from '../index';
import { useConsumerGroupStore } from './consumer-group-store';
import { ConsumerGroupOffset } from '../types';
import LagTrendChart from './LagTrendChart';

interface MonitoringTabProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  isDarkMode?: boolean;
}

/**
 * Task 8.1-8.7: Monitoring Tab
 * Displays lag metrics with 10-second polling
 * Shows lag trend chart (via LagTrendChart component)
 */
const MonitoringTab: React.FC<MonitoringTabProps> = ({
  kafkaTool,
  groupId,
  isDarkMode = false,
}) => {
  const {
    offsets,
    currentLagMetrics,
    lastLagUpdateTime,
    setCurrentLagMetrics,
    setLastLagUpdateTime,
    addLagHistory,
    lagHistory,
  } = useConsumerGroupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leo, setLeo] = useState<Map<string, Map<number, number>>>(new Map());
  const [pollingActive, setPollingActive] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial load
    loadLagMetrics();

    // Set up polling (10 seconds)
    if (pollingActive) {
      pollingIntervalRef.current = setInterval(() => {
        loadLagMetrics();
      }, 10000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [groupId, kafkaTool, pollingActive]);

  const loadLagMetrics = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const offsetData = await groupService.getConsumerGroupOffsets(groupId);

      // Load LEO for each partition
      const adminService = kafkaTool.getKafkaService().getAdminService();
      const newLeo = new Map<string, Map<number, number>>();
      const metricsData = [];
      const historyEntries = [];

      for (const offset of offsetData) {
        try {
          if (!newLeo.has(offset.topic)) {
            const leoData = await adminService.getTopicOffsets(offset.topic);
            const partitionLeo = new Map<number, number>();
            leoData.forEach((o) => {
              partitionLeo.set(o.partition, parseInt(o.high || '0', 10));
            });
            newLeo.set(offset.topic, partitionLeo);
          }

          const leoVal = newLeo.get(offset.topic)?.get(offset.partition) || 0;
          const lag = Math.max(0, leoVal - offset.offset);

          metricsData.push({
            topic: offset.topic,
            partition: offset.partition,
            currentOffset: offset.offset,
            logEndOffset: leoVal,
            lag,
            timestamp: Date.now(),
          });

          historyEntries.push({
            timestamp: Date.now(),
            topic: offset.topic,
            partition: offset.partition,
            lag,
            offset: offset.offset,
            leo: leoVal,
          });
        } catch (err) {
          console.error(`Failed to load metrics for ${offset.topic}:${offset.partition}:`, err);
        }
      }

      setLeo(newLeo);
      setCurrentLagMetrics(metricsData);
      setLastLagUpdateTime(Date.now());
      addLagHistory(historyEntries);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load lag metrics';
      setError(errorMsg);
    } finally {
      setLoading(false);
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

  const headerCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontWeight: 600,
    textAlign: 'left',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    color: isDarkMode ? '#e5e7eb' : '#111827',
  };

  const getLagSeverityColor = (lag: number): string => {
    if (lag < 50) return isDarkMode ? '#10b981' : '#059669'; // Green
    if (lag < 200) return isDarkMode ? '#f59e0b' : '#d97706'; // Yellow
    return isDarkMode ? '#ef4444' : '#dc2626'; // Red
  };

  const lagBadgeStyle = (lag: number): React.CSSProperties => {
    const color = getLagSeverityColor(lag);
    return {
      padding: '4px 12px',
      borderRadius: '4px',
      backgroundColor: color,
      color: '#ffffff',
      fontWeight: 500,
      display: 'inline-block',
    };
  };

  const controlsStyle: React.CSSProperties = {
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
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

  const toggleButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: pollingActive ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#6b7280' : '#9ca3af'),
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginTop: '8px',
  };

  const emptyStyle: React.CSSProperties = {
    padding: '32px',
    textAlign: 'center',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '14px',
  };

  return (
    <div>
      {/* Controls */}
      <div style={controlsStyle}>
        <button
          onClick={() => setPollingActive(!pollingActive)}
          style={toggleButtonStyle}
        >
          {pollingActive ? '⏸' : '▶'} {pollingActive ? '轮询中' : '轮询暂停'}
        </button>
        <button onClick={loadLagMetrics} disabled={loading} style={buttonStyle}>
          {loading ? '⟳' : '🔄'} 加载指标
        </button>
        {lastLagUpdateTime && (
          <span style={metaStyle}>
            最后更新：{new Date(lastLagUpdateTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
            color: isDarkMode ? '#fca5a5' : '#dc2626',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Lag Trend Chart */}
      {lagHistory.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
            Lag 趋势
          </h4>
          <LagTrendChart
            lagHistory={lagHistory}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Metrics Table */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
          当前 Lag 指标
        </h4>
        {currentLagMetrics.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
                  <th style={headerCellStyle}>主题</th>
                  <th style={headerCellStyle}>分区</th>
                  <th style={headerCellStyle}>当前 Offset</th>
                  <th style={headerCellStyle}>LEO</th>
                  <th style={headerCellStyle}>Lag</th>
                  <th style={headerCellStyle}>严重程度</th>
                </tr>
              </thead>
              <tbody>
                {currentLagMetrics.map((metric, idx) => {
                  const severity =
                    metric.lag < 50 ? '健康' : metric.lag < 200 ? '警告' : '严重';

                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      }}
                    >
                      <td style={bodyCellStyle}>{metric.topic}</td>
                      <td style={bodyCellStyle}>{metric.partition}</td>
                      <td style={bodyCellStyle}>{metric.currentOffset}</td>
                      <td style={bodyCellStyle}>{metric.logEndOffset}</td>
                      <td style={bodyCellStyle}>
                        <span style={lagBadgeStyle(metric.lag)}>{metric.lag}</span>
                      </td>
                      <td style={bodyCellStyle}>{severity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={emptyStyle}>
            {loading ? '加载指标中...' : '没有可用的 Lag 指标'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringTab;
