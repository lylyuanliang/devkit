import React, { useState } from 'react';
import { ConsumerGroupsPage } from './ConsumerGroupsPage';
import { ConsumerGroupDetailsPage } from './ConsumerGroupDetailsPage';
import { ResetOffsetsDialog } from './ResetOffsetsDialog';
import { DeleteGroupDialog } from './DeleteGroupDialog';

interface ConsumerGroupsContainerProps {
  clusterId: string;
}

type ViewType = 'list' | 'details';

export const ConsumerGroupsContainer: React.FC<ConsumerGroupsContainerProps> = ({ clusterId }) => {
  const [view, setView] = useState<ViewType>('list');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewDetails = (groupId: string) => {
    setSelectedGroupId(groupId);
    setView('details');
  };

  const handleBack = () => {
    setView('list');
    setSelectedGroupId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleResetSuccess = () => {
    setShowResetDialog(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    handleBack();
  };

  return (
    <div>
      {view === 'list' ? (
        <ConsumerGroupsPage
          clusterId={clusterId}
          onViewDetails={handleViewDetails}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <ConsumerGroupDetailsPage
          clusterId={clusterId}
          groupId={selectedGroupId!}
          onBack={handleBack}
          onResetClick={() => setShowResetDialog(true)}
          onDeleteClick={() => setShowDeleteDialog(true)}
        />
      )}

      {selectedGroupId && (
        <>
          <ResetOffsetsDialog
            clusterId={clusterId}
            groupId={selectedGroupId}
            isOpen={showResetDialog}
            onClose={() => setShowResetDialog(false)}
            onSuccess={handleResetSuccess}
          />
          <DeleteGroupDialog
            clusterId={clusterId}
            groupId={selectedGroupId}
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
};
