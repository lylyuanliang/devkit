import React, { useState, useEffect } from 'react';
import { KafkaAPI } from '../service/kafka-api';
import { ConsumerGroupsView } from './ConsumerGroupsView';
import { cn } from './tailwindClasses';

interface Cluster {
  id: string;
  name: string;
  brokers: string[];
  connected?: boolean;
  topics?: string[];
  error?: string;
  lastConnectionAttempt?: number;
  authType?: 'none' | 'sasl-plain' | 'sasl-scram' | 'ssl';
  username?: string;
  password?: string;
  sslEnabled?: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
  sslCaPath?: string;
  description?: string;
  tags?: string[];
  connectionTimeout?: number;
  requestTimeout?: number;
}

interface KafkaEnvironmentConfig {
  name: string;
  host: string;
  brokers: string[];
  description?: string;
  tags?: string[];
}

const validateJSON = (content: string): { valid: boolean; error?: string } => {
  return {
    valid: KafkaAPI.isValidJSON(content),
    error: KafkaAPI.isValidJSON(content) ? undefined : 'Invalid JSON',
  };
};

export const KafkaToolComponent: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [connectedCluster, setConnectedCluster] = useState<Cluster | null>(null);
  const [activeView, setActiveView] = useState<'clusters' | 'topics' | 'consumer-groups' | 'produce'>('clusters');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load clusters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kafka-clusters');
    if (saved) {
      try {
        setClusters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load clusters:', e);
      }
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleConnectCluster = async (cluster: Cluster) => {
    setLoading(true);
    setError(null);
    try {
      await KafkaAPI.connectCluster(cluster.id, cluster.brokers.join(','));
      setConnectedCluster(cluster);
      setActiveView('topics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedCluster(null);
    setActiveView('clusters');
  };

  return (
    <div className={cn(
      'w-full h-full flex flex-col transition-colors',
      isDarkMode ? 'dark bg-slate-950' : 'bg-gray-50'
    )}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kafka Tool</h1>
          {connectedCluster && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connected to: <span className="font-semibold">{connectedCluster.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="w-full md:w-48 bg-gray-100 dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-2">
            {connectedCluster ? (
              <>
                <button
                  onClick={() => setActiveView('topics')}
                  className={cn(
                    'block w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-left',
                    activeView === 'topics'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  📚 Topics
                </button>
                <button
                  onClick={() => setActiveView('consumer-groups')}
                  className={cn(
                    'block w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-left',
                    activeView === 'consumer-groups'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  👥 Consumer Groups
                </button>
                <button
                  onClick={() => setActiveView('produce')}
                  className={cn(
                    'block w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-left',
                    activeView === 'produce'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  ✉️ Produce
                </button>
                <button
                  onClick={handleDisconnect}
                  className="block w-full px-4 py-3 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left mt-4"
                >
                  🔌 Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveView('clusters')}
                className={cn(
                  'block w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-left',
                  activeView === 'clusters'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                📦 Clusters
              </button>
            )}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-slate-950">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Clusters View */}
          {activeView === 'clusters' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Clusters</h2>
              {clusters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {cluster.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {cluster.brokers.join(', ')}
                      </p>
                      <button
                        onClick={() => handleConnectCluster(cluster)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  No clusters configured
                </div>
              )}
            </div>
          )}

          {/* Topics View */}
          {activeView === 'topics' && connectedCluster && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Topics</h2>
              <p className="text-gray-600 dark:text-gray-400">Topics view coming soon...</p>
            </div>
          )}

          {/* Consumer Groups View */}
          {activeView === 'consumer-groups' && connectedCluster && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Consumer Groups</h2>
              <ConsumerGroupsView clusterId={connectedCluster.id} styles={{}} />
            </div>
          )}

          {/* Produce View */}
          {activeView === 'produce' && connectedCluster && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Produce Message</h2>
              <p className="text-gray-600 dark:text-gray-400">Produce view coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default KafkaToolComponent;
