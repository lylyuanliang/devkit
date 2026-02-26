import React, { useState, useEffect } from 'react';
import { KafkaAPI } from '../service/kafka-api';

interface ConsumerGroupsViewProps {
  clusterId: string;
  styles: any;
}

export const ConsumerGroupsView: React.FC<ConsumerGroupsViewProps> = ({ clusterId, styles }) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConsumerGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await KafkaAPI.listConsumerGroups(clusterId);
      setGroups(groupList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consumer groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumerGroups();
  }, [clusterId]);

  const filteredGroups = groups.filter(g =>
    g.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索消费者组..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...styles.input,
            flex: 1,
          }}
        />
        <button
          onClick={loadConsumerGroups}
          disabled={loading}
          style={{
            ...styles.button,
            minWidth: '100px',
          }}
          title="刷新消费者组列表"
        >
          {loading ? '加载中...' : '🔄 刷新'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {filteredGroups.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: styles.headerBg }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>消费者组 ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyMessage}>
          {loading ? '加载中...' : '没有找到消费者组'}
        </div>
      )}
    </div>
  );
};
