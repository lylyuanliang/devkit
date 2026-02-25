import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ConsumerGroupDetails, PartitionOffset } from '../../types/consumer-groups';

interface ConsumerGroupDetailsPageProps {
  clusterId: string;
  groupId: string;
  onBack: () => void;
  onResetClick: () => void;
  onDeleteClick: () => void;
}

export const ConsumerGroupDetailsPage: React.FC<ConsumerGroupDetailsPageProps> = ({
  clusterId,
  groupId,
  onBack,
  onResetClick,
  onDeleteClick,
}) => {
  const [details, setDetails] = useState<ConsumerGroupDetails | null>(null);
  const [lag, setLag] = useState<PartitionOffset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailsData, lagData] = await Promise.all([
        apiClient.getConsumerGroupDetails(clusterId, groupId),
        apiClient.getConsumerGroupLag(clusterId, groupId),
      ]);
      setDetails(detailsData);
      setLag(lagData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [clusterId, groupId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!details) return <div className="p-6">No data</div>;

  const highLagThreshold = 1000;

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-blue-500 hover:underline">
        ← Back to Groups
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{groupId}</h1>
        <div className="flex gap-2">
          <button
            onClick={onResetClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Offsets
          </button>
          <button
            onClick={onDeleteClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-3">Group Information</h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">State:</span> {details.state}</div>
            <div><span className="font-medium">Protocol:</span> {details.protocol_type}</div>
            <div><span className="font-medium">Members:</span> {details.members.length}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-3">Topics</h2>
          <div className="text-sm">
            {details.topics.length > 0 ? (
              <ul className="list-disc list-inside">
                {details.topics.map(topic => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">No topics</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Member ID</th>
                <th className="px-4 py-2 text-left">Client ID</th>
                <th className="px-4 py-2 text-left">Host</th>
              </tr>
            </thead>
            <tbody>
              {details.members.map((member) => (
                <tr key={member.member_id} className="border-b">
                  <td className="px-4 py-2">{member.member_id}</td>
                  <td className="px-4 py-2">{member.client_id}</td>
                  <td className="px-4 py-2">{member.host}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Partition Offsets</h2>
          <button
            onClick={loadDetails}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Topic</th>
                <th className="px-4 py-2 text-left">Partition</th>
                <th className="px-4 py-2 text-left">Current Offset</th>
                <th className="px-4 py-2 text-left">Log End Offset</th>
                <th className="px-4 py-2 text-left">Lag</th>
              </tr>
            </thead>
            <tbody>
              {lag.map((offset) => (
                <tr key={`${offset.topic}-${offset.partition}`} className="border-b">
                  <td className="px-4 py-2">{offset.topic}</td>
                  <td className="px-4 py-2">{offset.partition}</td>
                  <td className="px-4 py-2">{offset.current_offset}</td>
                  <td className="px-4 py-2">{offset.log_end_offset}</td>
                  <td className={`px-4 py-2 ${
                    offset.lag > highLagThreshold ? 'bg-red-100 text-red-800' : ''
                  }`}>
                    {offset.lag}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
