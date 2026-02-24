import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';

interface ConsumerGroupListProps {
  kafkaTool?: KafkaTool;
  onSelectGroup?: (groupId: string) => void;
}

const ConsumerGroupList: React.FC<ConsumerGroupListProps> = ({ kafkaTool, onSelectGroup }) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [kafkaTool]);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();
      const groupList = await groupService.listConsumerGroups();
      setGroups(groupList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consumer groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consumer-group-list">
      <div className="list-header">
        <h3>Consumer Groups</h3>
        <button onClick={loadGroups} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading consumer groups...</p>
      ) : groups.length === 0 ? (
        <p className="empty-text">No consumer groups found</p>
      ) : (
        <div className="group-items">
          {groups.map((groupId) => (
            <div
              key={groupId}
              className="group-item"
              onClick={() => onSelectGroup?.(groupId)}
              role="button"
              tabIndex={0}
            >
              <div className="group-name">{groupId}</div>
              <div className="group-action">View Details →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerGroupList;
