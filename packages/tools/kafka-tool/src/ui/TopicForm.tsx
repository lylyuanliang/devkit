import React, { useState } from 'react';
import { KafkaTool } from '../kafka-tool';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Advanced configuration
  const [retentionMs, setRetentionMs] = useState('');
  const [compressionType, setCompressionType] = useState('none');
  const [cleanupPolicy, setCleanupPolicy] = useState('delete');
  const [minInsyncReplicas, setMinInsyncReplicas] = useState('');

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

      // Build configuration object
      const config: Record<string, string> = {};
      if (retentionMs) config['retention.ms'] = retentionMs;
      if (compressionType !== 'none') config['compression.type'] = compressionType;
      if (cleanupPolicy !== 'delete') config['cleanup.policy'] = cleanupPolicy;
      if (minInsyncReplicas) config['min.insync.replicas'] = minInsyncReplicas;

      const adminService = kafkaTool.getKafkaService().getAdminService();
      await adminService.createTopic(
        topicName.trim(),
        partitions,
        replicationFactor,
        Object.keys(config).length > 0 ? config : undefined
      );

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

      {/* Basic Configuration */}
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
          <label htmlFor="partitions">
            Partitions
            <span className="help-text" title="Number of partitions for the topic">?</span>
          </label>
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
          <label htmlFor="replicationFactor">
            Replication Factor
            <span className="help-text" title="Number of replicas for each partition">?</span>
          </label>
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

      {/* Advanced Configuration */}
      <div className="form-section">
        <button
          type="button"
          className="btn-toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-config">
            <div className="form-group">
              <label htmlFor="retentionMs">
                Retention Time (ms)
                <span className="help-text" title="How long to retain messages (-1 for unlimited)">?</span>
              </label>
              <input
                id="retentionMs"
                type="text"
                value={retentionMs}
                onChange={(e) => setRetentionMs(e.target.value)}
                placeholder="e.g., 86400000 (1 day) or -1 (unlimited)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="compressionType">
                Compression Type
                <span className="help-text" title="Compression algorithm for messages">?</span>
              </label>
              <select
                id="compressionType"
                value={compressionType}
                onChange={(e) => setCompressionType(e.target.value)}
              >
                <option value="none">None</option>
                <option value="gzip">GZIP</option>
                <option value="snappy">Snappy</option>
                <option value="lz4">LZ4</option>
                <option value="zstd">Zstd</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cleanupPolicy">
                Cleanup Policy
                <span className="help-text" title="How to clean up old messages">?</span>
              </label>
              <select
                id="cleanupPolicy"
                value={cleanupPolicy}
                onChange={(e) => setCleanupPolicy(e.target.value)}
              >
                <option value="delete">Delete</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="minInsyncReplicas">
                Min In-Sync Replicas
                <span className="help-text" title="Minimum replicas that must acknowledge writes">?</span>
              </label>
              <input
                id="minInsyncReplicas"
                type="number"
                min="1"
                value={minInsyncReplicas}
                onChange={(e) => setMinInsyncReplicas(e.target.value)}
                placeholder="e.g., 2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      {showAdvanced && (Object.keys({
        'retention.ms': retentionMs,
        'compression.type': compressionType !== 'none' ? compressionType : '',
        'cleanup.policy': cleanupPolicy !== 'delete' ? cleanupPolicy : '',
        'min.insync.replicas': minInsyncReplicas,
      }).filter(k => Object.values({
        'retention.ms': retentionMs,
        'compression.type': compressionType !== 'none' ? compressionType : '',
        'cleanup.policy': cleanupPolicy !== 'delete' ? cleanupPolicy : '',
        'min.insync.replicas': minInsyncReplicas,
      })[k]).length > 0) && (
        <div className="config-summary">
          <p className="summary-title">Configuration Summary:</p>
          <ul>
            {retentionMs && <li>Retention: {retentionMs}ms</li>}
            {compressionType !== 'none' && <li>Compression: {compressionType}</li>}
            {cleanupPolicy !== 'delete' && <li>Cleanup: {cleanupPolicy}</li>}
            {minInsyncReplicas && <li>Min ISR: {minInsyncReplicas}</li>}
          </ul>
        </div>
      )}

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
