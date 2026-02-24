import React, { useState } from 'react';
import { KafkaTool } from '../index';

interface TopicFormProps {
  kafkaTool?: KafkaTool;
  onSave?: () => void;
  onCancel?: () => void;
  initialTopic?: string;
}

const TopicForm: React.FC<TopicFormProps> = ({ kafkaTool, onSave, onCancel, initialTopic }) => {
  const [topicName, setTopicName] = useState(initialTopic || '');
  const [partitions, setPartitions] = useState(1);
  const [replicationFactor, setReplicationFactor] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!topicName.trim()) {
        throw new Error('Topic name is required');
      }

      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const adminService = kafkaTool.getKafkaService().getAdminService();
      await adminService.createTopic(topicName.trim(), partitions, replicationFactor);

      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="topic-form">
      <h4>{initialTopic ? 'Edit Topic' : 'Create New Topic'}</h4>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="topicName">Topic Name *</label>
        <input
          id="topicName"
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g., orders, user-events"
          required
          disabled={!!initialTopic}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="partitions">Partitions</label>
          <input
            id="partitions"
            type="number"
            min="1"
            max="100"
            value={partitions}
            onChange={(e) => setPartitions(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="replicationFactor">Replication Factor</label>
          <input
            id="replicationFactor"
            type="number"
            min="1"
            max="10"
            value={replicationFactor}
            onChange={(e) => setReplicationFactor(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Topic'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TopicForm;
