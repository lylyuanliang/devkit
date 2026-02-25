import React, { useState, useEffect } from 'react';
import { KafkaAPI } from '../service/kafka-api';

interface ConsumerGroupsViewProps {
  clusterId: string;
  styles?: any;
}

export const ConsumerGroupsView: React.FC<ConsumerGroupsViewProps> = ({ clusterId }) => {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConsumerGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await KafkaAPI.listConsumerGroups(clusterId);
      setGroups(groupList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consumer groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumerGroups();
  }, [clusterId]);

  const filteredGroups = groups.filter(g =>
    g.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search consumer groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={loadConsumerGroups}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          title="Refresh consumer groups list"
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {filteredGroups.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                  Consumer Group ID
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          {loading ? 'Loading...' : 'No consumer groups found'}
        </div>
      )}
    </div>
  );
};
