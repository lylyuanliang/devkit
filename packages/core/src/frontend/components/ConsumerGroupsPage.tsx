import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ConsumerGroup } from '../../types/consumer-groups';

interface ConsumerGroupsPageProps {
  clusterId: string;
  onViewDetails: (groupId: string) => void;
  refreshTrigger: number;
}

export const ConsumerGroupsPage: React.FC<ConsumerGroupsPageProps> = ({
  clusterId,
  onViewDetails,
  refreshTrigger,
}) => {
  const [groups, setGroups] = useState<ConsumerGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ConsumerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof ConsumerGroup>('group_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadConsumerGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listConsumerGroups(clusterId);
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consumer groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumerGroups();
  }, [clusterId, refreshTrigger]);

  useEffect(() => {
    let filtered = groups.filter(g =>
      g.group_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredGroups(filtered);
    setCurrentPage(1);
  }, [groups, searchTerm, sortBy, sortOrder]);

  const handleSort = (column: keyof ConsumerGroup) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredGroups.length / pageSize);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Consumer Groups</h1>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search consumer groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={loadConsumerGroups}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('group_id')}
              >
                Group ID {sortBy === 'group_id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('state')}
              >
                State {sortBy === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('members_count')}
              >
                Members {sortBy === 'members_count' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('total_lag')}
              >
                Total Lag {sortBy === 'total_lag' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.map((group) => (
              <tr key={group.group_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{group.group_id}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    group.state === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {group.state}
                  </span>
                </td>
                <td className="px-4 py-2">{group.members_count}</td>
                <td className="px-4 py-2">{group.total_lag}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onViewDetails(group.group_id)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredGroups.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No consumer groups found
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
