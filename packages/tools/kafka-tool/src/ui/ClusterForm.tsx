import React, { useState } from 'react';
import { KafkaTool } from '../index';
import { KafkaClusterConfig } from '../types';

interface ClusterFormProps {
  kafkaTool?: KafkaTool;
  onSave?: () => void;
  onCancel?: () => void;
  initialCluster?: KafkaClusterConfig;
}

const ClusterForm: React.FC<ClusterFormProps> = ({ kafkaTool, onSave, onCancel, initialCluster }) => {
  const [name, setName] = useState(initialCluster?.name || '');
  const [brokers, setBrokers] = useState(initialCluster?.brokers?.join(', ') || '');
  const [useSasl, setUseSasl] = useState(!!initialCluster?.sasl);
  const [saslMechanism, setSaslMechanism] = useState<'plain' | 'scram-sha-256' | 'scram-sha-512'>(
    initialCluster?.sasl?.mechanism || 'plain'
  );
  const [username, setUsername] = useState(initialCluster?.sasl?.username || '');
  const [password, setPassword] = useState('');
  const [useSsl, setUseSsl] = useState(!!initialCluster?.ssl);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!name.trim()) {
        throw new Error('Cluster name is required');
      }

      if (!brokers.trim()) {
        throw new Error('At least one broker address is required');
      }

      const brokerList = brokers.split(',').map((b) => b.trim());

      const cluster: KafkaClusterConfig = {
        id: initialCluster?.id || `cluster-${Date.now()}`,
        name: name.trim(),
        brokers: brokerList,
        sasl: useSasl ? { mechanism: saslMechanism, username } : undefined,
        ssl: useSsl ? { rejectUnauthorized: true } : undefined,
        createdAt: initialCluster?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      if (kafkaTool) {
        await kafkaTool.saveCluster(cluster, useSasl ? password : undefined);
        onSave?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cluster');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cluster-form">
      <h4>{initialCluster ? 'Edit Cluster' : 'Add New Cluster'}</h4>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Cluster Name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production, Local Dev"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="brokers">Broker Addresses *</label>
        <input
          id="brokers"
          type="text"
          value={brokers}
          onChange={(e) => setBrokers(e.target.value)}
          placeholder="e.g., localhost:9092, kafka1:9092, kafka2:9092"
          required
        />
        <small>Comma-separated list of broker addresses</small>
      </div>

      <div className="form-section">
        <label className="checkbox-label">
          <input type="checkbox" checked={useSasl} onChange={(e) => setUseSasl(e.target.checked)} />
          Use SASL Authentication
        </label>

        {useSasl && (
          <>
            <div className="form-group">
              <label htmlFor="mechanism">SASL Mechanism</label>
              <select
                id="mechanism"
                value={saslMechanism}
                onChange={(e) => setSaslMechanism(e.target.value as any)}
              >
                <option value="plain">PLAIN</option>
                <option value="scram-sha-256">SCRAM-SHA-256</option>
                <option value="scram-sha-512">SCRAM-SHA-512</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="SASL username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SASL password (encrypted)"
              />
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <label className="checkbox-label">
          <input type="checkbox" checked={useSsl} onChange={(e) => setUseSsl(e.target.checked)} />
          Use SSL/TLS
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Cluster'}
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

export default ClusterForm;
