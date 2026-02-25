import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { PartitionOffset } from '../../types/consumer-groups';

interface ResetOffsetsDialogProps {
  clusterId: string;
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetOffsetsDialog: React.FC<ResetOffsetsDialogProps> = ({
  clusterId,
  groupId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [strategy, setStrategy] = useState<'beginning' | 'end' | 'timestamp'>('beginning');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PartitionOffset[] | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const request = {
        group_id: groupId,
        strategy,
        timestamp: strategy === 'timestamp' ? new Date(timestamp).getTime() : undefined,
      };
      const resetResult = await apiClient.resetConsumerGroupOffsets(clusterId, request);
      setResult(resetResult);
      setConfirmed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset offsets');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirmed(true);
    await handleReset();
  };

  const handleClose = () => {
    setStrategy('beginning');
    setTimestamp('');
    setError(null);
    setResult(null);
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Reset Consumer Group Offsets</h2>

        {!result ? (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Reset Strategy</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="beginning"
                    checked={strategy === 'beginning'}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="mr-2"
                  />
                  Reset to Beginning
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="end"
                    checked={strategy === 'end'}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="mr-2"
                  />
                  Reset to End
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="timestamp"
                    checked={strategy === 'timestamp'}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="mr-2"
                  />
                  Reset to Timestamp
                </label>
              </div>
            </div>

            {strategy === 'timestamp' && (
              <div className="mb-4">
                <label className="block font-semibold mb-2">Timestamp</label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (strategy === 'timestamp' && !timestamp)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Offsets'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              Offsets reset successfully!
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">New Offsets</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Topic</th>
                      <th className="px-2 py-1 text-left">Partition</th>
                      <th className="px-2 py-1 text-left">New Offset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((offset) => (
                      <tr key={`${offset.topic}-${offset.partition}`} className="border-b">
                        <td className="px-2 py-1">{offset.topic}</td>
                        <td className="px-2 py-1">{offset.partition}</td>
                        <td className="px-2 py-1">{offset.current_offset}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  handleClose();
                  onSuccess();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
