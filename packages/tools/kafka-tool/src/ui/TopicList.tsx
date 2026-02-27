import React, { useEffect } from 'react';
import { KafkaTool } from '../kafka-tool';
import { TopicInfo } from '../types';
import { useTopicStore } from './topic-store';
import TopicForm from './TopicForm';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface TopicListProps {
  kafkaTool?: KafkaTool;
}

const TopicList: React.FC<TopicListProps> = ({ kafkaTool }) => {
  const {
    topics,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    setTopics,
    setLoading,
    setError,
    openCreateForm,
    showCreateForm,
    showDeleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectedTopicForDelete,
    notification,
    showNotification,
    clearNotification,
  } = useTopicStore();

  // Load topics on mount
  useEffect(() => {
    refreshTopics();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification.type) {
      const timeout = setTimeout(
        () => clearNotification(),
        notification.type === 'success' ? 2000 : 5000
      );
      return () => clearTimeout(timeout);
    }
  }, [notification, clearNotification]);

  const refreshTopics = async () => {
    if (!kafkaTool?.getKafkaService().isConnected()) {
      setError('Not connected to Kafka cluster');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const adminService = kafkaTool.getKafkaService().getAdminService();
      const data = await adminService.listTopics();
      setTopics(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load topics';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = async () => {
    showNotification('success', 'Topic created successfully');
    await refreshTopics();
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopicForDelete || !kafkaTool?.getKafkaService().isConnected()) {
      return;
    }

    setLoading(true);
    try {
      const adminService = kafkaTool.getKafkaService().getAdminService();
      await adminService.deleteTopic(selectedTopicForDelete);
      showNotification('success', `Topic "${selectedTopicForDelete}" deleted successfully`);
      closeDeleteConfirm();
      await refreshTopics();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete topic';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="topic-list-container">
      {/* Notification */}
      {notification.type && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="topic-list-header">
        <h2>Topics</h2>
        <button
          className="btn btn-primary"
          onClick={openCreateForm}
          disabled={loading}
        >
          Create Topic
        </button>
      </div>

      {/* Search Bar */}
      <div className="topic-list-search">
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button
          className="btn btn-secondary"
          onClick={refreshTopics}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="btn btn-secondary" onClick={refreshTopics}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading topics...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTopics.length === 0 && (
        <div className="empty-state">
          <p>
            {searchQuery
              ? 'No topics match your search'
              : 'No topics found in this cluster'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={openCreateForm}>
              Create First Topic
            </button>
          )}
        </div>
      )}

      {/* Topic Table */}
      {!loading && !error && filteredTopics.length > 0 && (
        <div className="topic-table-wrapper">
          <table className="topic-table">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Partitions</th>
                <th>Replication Factor</th>
                <th>Leader</th>
                <th>ISR</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic) => (
                <tr key={topic.name}>
                  <td className="topic-name">{topic.name}</td>
                  <td>{topic.partitions}</td>
                  <td>{topic.replicationFactor}</td>
                  <td>{topic.leader ?? '-'}</td>
                  <td>{topic.isr?.join(', ') ?? '-'}</td>
                  <td className="actions">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteConfirm(topic.name)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Topic</h3>
              <button
                className="modal-close"
                onClick={() => {
                  // Close form
                }}
              >
                ×
              </button>
            </div>
            <TopicForm
              kafkaTool={kafkaTool}
              onSave={handleCreateSuccess}
              onCancel={() => {
                // Close form
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedTopicForDelete && (
        <DeleteConfirmationDialog
          topicName={selectedTopicForDelete}
          onConfirm={handleDeleteTopic}
          onCancel={closeDeleteConfirm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TopicList;
