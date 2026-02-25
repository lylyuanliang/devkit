import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface DeleteGroupDialogProps {
  clusterId: string;
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  clusterId,
  groupId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteConsumerGroup(clusterId, groupId);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete consumer group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Delete Consumer Group</h2>

        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
          <p className="font-semibold mb-2">⚠️ Warning</p>
          <p className="text-sm">
            Deleting this consumer group will permanently remove all offset information.
            This action cannot be undone.
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">Group ID:</span> {groupId}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">I understand this action is permanent</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !confirmed}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Group'}
          </button>
        </div>
      </div>
    </div>
  );
};
