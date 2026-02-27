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
  const [loadingAssignments, setLoadingAssignments] = useState(false);
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
      setGroupInfo(info);

      setLoadingAssignments(true);
      const groupOffsets = await groupService.getConsumerGroupOffsets(groupId);
      setOffsets(groupOffsets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group details');
    } finally {
      setLoading(false);
      setLoadingAssignments(false);
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
            {loadingAssignments ? (
              <p className="loading-text">Loading partition assignments...</p>
            ) : offsets.length === 0 ? (
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

          {groupInfo && groupInfo.members.length > 0 && (
            <div className="members-table">
              <h4>Member Partition Assignments</h4>
              {groupInfo.members.some((m) => m.topicPartitions.length > 0) ? (
                <table>
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Client ID</th>
                      <th>Topic</th>
                      <th>Partition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupInfo.members.map((member) =>
                      member.topicPartitions.length > 0 ? (
                        member.topicPartitions.map((tp, idx) => (
                          <tr key={`${member.memberId}-${idx}`}>
                            <td>{member.memberId}</td>
                            <td>{member.clientId}</td>
                            <td>{tp.topic}</td>
                            <td>{tp.partition}</td>
                          </tr>
                        ))
                      ) : (
                        <tr key={member.memberId}>
                          <td>{member.memberId}</td>
                          <td>{member.clientId}</td>
                          <td colSpan={2} className="empty-text">
                            No partitions assigned
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">No partition assignments available</p>
              )}
            </div>
          )}

          <button onClick={loadGroupDetails} disabled={loading}>
            Refresh
          </button>
        </>
      )}
    </div>
  );
};

export default ConsumerGroupDetails;
