import React, { useState } from 'react';
import { KafkaTool } from '../index';

interface OffsetResetFormProps {
  kafkaTool?: KafkaTool;
  groupId: string;
  topics?: string[];
  onReset?: () => void;
}

const OffsetResetForm: React.FC<OffsetResetFormProps> = ({ kafkaTool, groupId, topics = [], onReset }) => {
  const [strategy, setStrategy] = useState<'earliest' | 'latest'>('earliest');
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setError(null);
    setResetting(true);

    try {
      if (!kafkaTool?.getKafkaService().isConnected()) {
        throw new Error('Not connected to Kafka cluster');
      }

      const groupService = kafkaTool.getKafkaService().getConsumerGroupService();

      if (strategy === 'earliest') {
        await groupService.resetOffsetToEarliest(groupId, topics.length > 0 ? topics : undefined);
      } else {
        await groupService.resetOffsetToLatest(groupId, topics.length > 0 ? topics : undefined);
      }

      onReset?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset offset');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="offset-reset-form">
      <h4>Reset Consumer Group Offset</h4>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>Reset Strategy</label>
        <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
          <option value="earliest">Reset to Earliest</option>
          <option value="latest">Reset to Latest</option>
        </select>
      </div>

      <p className="info-text">
        This will reset the offset for consumer group <strong>{groupId}</strong> to the {strategy} position.
      </p>

      <button onClick={handleReset} disabled={resetting} className="reset-button">
        {resetting ? 'Resetting...' : `Reset to ${strategy.toUpperCase()}`}
      </button>
    </div>
  );
};

export default OffsetResetForm;
