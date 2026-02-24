import React, { useState, useEffect } from 'react';
import { KafkaTool } from '../index';
import { KafkaClusterConfig } from '../types';

interface ClusterSelectorProps {
  kafkaTool?: KafkaTool;
}

const ClusterSelector: React.FC<ClusterSelectorProps> = ({ kafkaTool }) => {
  const [clusters, setClusters] = useState<KafkaClusterConfig[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (kafkaTool) {
      setClusters(kafkaTool.getClusters());
    }
  }, [kafkaTool]);

  return (
    <div className="cluster-selector">
      <h3>Kafka Clusters</h3>
      {clusters.length === 0 ? (
        <p>No clusters configured</p>
      ) : (
        <div className="cluster-list">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="cluster-item">
              <h4>{cluster.name}</h4>
              <p>{cluster.brokers.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Cluster'}
      </button>
      {showForm && <div className="cluster-form">Cluster form coming soon...</div>}
    </div>
  );
};

export default ClusterSelector;
