import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { LagMetrics } from '../types';

interface MonitoringDashboardProps {
  kafkaTool?: KafkaTool;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ kafkaTool }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [lagMetrics, setLagMetrics] = useState<LagMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    loadConsumerGroups();
  }, [kafkaTool]);

  useEffect(() => {
    if (selectedGroup) {
      loadLagMetrics();
    }
  }, [selectedGroup]);

  const loadConsumerGroups = async () => {
    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        return;
      }

      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const groupList = await groupService.listConsumerGroups();
      setGroups(groupList);
      if (groupList.length > 0) {
        setSelectedGroup(groupList[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consumer groups');
    }
  };

  const loadLagMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const lagService = kafkaTool.getKafkaService().getLagMonitorService();
      const metrics = await lagService.calculateGroupLag(selectedGroup);
      setLagMetrics(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lag metrics');
    } finally {
      setLoading(false);
    }
  };

  const totalLag = lagMetrics.reduce((sum, m) => sum + m.lag, 0);
  const maxLag = Math.max(...lagMetrics.map((m) => m.lag), 0);

  return (
    <div className="monitoring-dashboard">
      <h3>Consumer Lag Monitoring</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-controls">
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <button onClick={loadLagMetrics} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {selectedGroup && (
        <div className="metrics-summary">
          <div className="metric-card">
            <div className="metric-label">Total Lag</div>
            <div className="metric-value">{totalLag.toLocaleString()}</div>
            <div className="metric-unit">messages</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Max Partition Lag</div>
            <div className="metric-value">{maxLag.toLocaleString()}</div>
            <div className="metric-unit">messages</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Partitions</div>
            <div className="metric-value">{lagMetrics.length}</div>
            <div className="metric-unit">tracked</div>
          </div>
        </div>
      )}

      {lagMetrics.length > 0 && (
        <div className="lag-metrics-table">
          <h4>Partition Lag Details</h4>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Partition</th>
                <th>Current Offset</th>
                <th>Latest Offset</th>
                <th>Lag</th>
              </tr>
            </thead>
            <tbody>
              {lagMetrics.map((metric, idx) => (
                <tr key={idx} className={metric.lag > 1000 ? 'high-lag' : ''}>
                  <td>{metric.topic}</td>
                  <td>{metric.partition}</td>
                  <td>{metric.currentOffset.toLocaleString()}</td>
                  <td>{metric.logEndOffset.toLocaleString()}</td>
                  <td className="lag-value">{metric.lag.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
