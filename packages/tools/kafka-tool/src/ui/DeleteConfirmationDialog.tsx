import React from 'react';

interface DeleteConfirmationDialogProps {
  topicName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  topicName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!topicName) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-small">
        <h3>Delete Topic</h3>
        <p>
          Are you sure you want to delete the topic <strong>{topicName}</strong>?
        </p>
        <p className="warning-text">This action cannot be undone.</p>

        <div className="modal-actions">
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
