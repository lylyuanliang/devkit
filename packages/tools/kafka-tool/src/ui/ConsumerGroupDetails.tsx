import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { ConsumerGroupInfo, ConsumerGroupOffset } from '../types';

interface ConsumerGroupDetailsProps {
  kafkaTool?: KafkaTool;
  groupId: string;
}

const ConsumerGroupDetails: React.FC<ConsumerGroupDetailsProps> = ({ kafkaTool, groupId }) => {
  const [groupInfo, setGroupInfo] = useState<ConsumerGroupInfo | null>(null);
  const [offsets, setOffsets] = useState<ConsumerGroupOffset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId, kafkaTool]);

  const loadGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const info = await groupService.getConsumerGroupInfo(groupId);
      const groupOffsets = await groupService.getConsumerGroupOffsets(groupId);

      setGroupInfo(info);
      setOffsets(groupOffsets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consumer-group-details">
      <h3>Consumer Group: {groupId}</h3>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading group details...</p>
      ) : (
        <>
          {groupInfo && (
            <div className="group-info">
              <div className="info-item">
                <span className="label">State:</span>
                <span className="value">{groupInfo.state}</span>
              </div>
              <div className="info-item">
                <span className="label">Members:</span>
                <span className="value">{groupInfo.members.length}</span>
              </div>
              <div className="info-item">
                <span className="label">Topics:</span>
                <span className="value">{groupInfo.topics.join(', ') || 'N/A'}</span>
              </div>
            </div>
          )}

          <div className="offsets-table">
            <h4>Partition Offsets</h4>
            {offsets.length === 0 ? (
              <p className="empty-text">No partition offsets</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Partition</th>
                    <th>Offset</th>
                    <th>Lag</th>
                  </tr>
                </thead>
                <tbody>
                  {offsets.map((offset, idx) => (
                    <tr key={idx}>
                      <td>{offset.topic}</td>
                      <td>{offset.partition}</td>
                      <td>{offset.offset}</td>
                      <td>{offset.lag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button onClick={loadGroupDetails} disabled={loading}>
            Refresh
          </button>
        </>
      )}
    </div>
  );
};

export default ConsumerGroupDetails;
