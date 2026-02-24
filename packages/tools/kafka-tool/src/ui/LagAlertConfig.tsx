import React, { useState } from 'react';
import { LagAlertConfig } from '../types';

interface LagAlertConfigProps {
  onSave?: (config: LagAlertConfig) => void;
  initialConfig?: LagAlertConfig;
}

const LagAlertConfigComponent: React.FC<LagAlertConfigProps> = ({ onSave, initialConfig }) => {
  const [consumerGroup, setConsumerGroup] = useState(initialConfig?.consumerGroup || '');
  const [lagThreshold, setLagThreshold] = useState(initialConfig?.lagThreshold || 10000);
  const [enabled, setEnabled] = useState(initialConfig?.enabled !== false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consumerGroup.trim()) {
      setError('Consumer group is required');
      return;
    }

    if (lagThreshold < 0) {
      setError('Lag threshold must be positive');
      return;
    }

    const config: LagAlertConfig = {
      id: initialConfig?.id || `alert-${Date.now()}`,
      consumerGroup: consumerGroup.trim(),
      lagThreshold,
      enabled,
      createdAt: initialConfig?.createdAt || Date.now(),
    };

    onSave?.(config);
  };

  return (
    <form onSubmit={handleSubmit} className="lag-alert-form">
      <h4>Configure Lag Alert</h4>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="group">Consumer Group *</label>
        <input
          id="group"
          type="text"
          value={consumerGroup}
          onChange={(e) => setConsumerGroup(e.target.value)}
          placeholder="e.g., my-consumer-group"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="threshold">Lag Threshold (messages) *</label>
        <input
          id="threshold"
          type="number"
          min="0"
          value={lagThreshold}
          onChange={(e) => setLagThreshold(Math.max(0, parseInt(e.target.value) || 0))}
          required
        />
        <small>Alert will trigger when lag exceeds this value</small>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enable Alert
        </label>
      </div>

      <button type="submit">Save Alert Configuration</button>
    </form>
  );
};

export default LagAlertConfigComponent;
