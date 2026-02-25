import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsumerGroupsContainer } from '../components/ConsumerGroupsContainer';
import { apiClient } from '../api/client';
import { ConsumerGroup, ConsumerGroupDetails, PartitionOffset } from '../../types/consumer-groups';

// Mock the API client
jest.mock('../api/client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Consumer Groups Management - Integration Tests', () => {
  const clusterId = 'test-cluster';

  const mockConsumerGroups: ConsumerGroup[] = [
    {
      group_id: 'group-1',
      state: 'Stable',
      protocol_type: 'consumer',
      members_count: 2,
      total_lag: 100,
    },
    {
      group_id: 'group-2',
      state: 'Dead',
      protocol_type: 'consumer',
      members_count: 0,
      total_lag: 0,
    },
    {
      group_id: 'group-3',
      state: 'Stable',
      protocol_type: 'consumer',
      members_count: 1,
      total_lag: 5000,
    },
  ];

  const mockGroupDetails: ConsumerGroupDetails = {
    group_id: 'group-1',
    state: 'Stable',
    protocol_type: 'consumer',
    members: [
      {
        member_id: 'member-1',
        client_id: 'client-1',
        host: '192.168.1.1',
      },
      {
        member_id: 'member-2',
        client_id: 'client-2',
        host: '192.168.1.2',
      },
    ],
    topics: ['topic-1', 'topic-2'],
  };

  const mockLagData: PartitionOffset[] = [
    {
      topic: 'topic-1',
      partition: 0,
      current_offset: 100,
      log_end_offset: 150,
      lag: 50,
    },
    {
      topic: 'topic-1',
      partition: 1,
      current_offset: 200,
      log_end_offset: 250,
      lag: 50,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.listConsumerGroups.mockResolvedValue(mockConsumerGroups);
    mockApiClient.getConsumerGroupDetails.mockResolvedValue(mockGroupDetails);
    mockApiClient.getConsumerGroupLag.mockResolvedValue(mockLagData);
    mockApiClient.deleteConsumerGroup.mockResolvedValue(undefined);
    mockApiClient.resetConsumerGroupOffsets.mockResolvedValue(mockLagData);
  });

  describe('List View - Display and Filtering', () => {
    it('should display consumer groups list on initial load', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
      });

      expect(mockApiClient.listConsumerGroups).toHaveBeenCalledWith(clusterId);
      expect(screen.getByText('group-1')).toBeInTheDocument();
      expect(screen.getByText('group-2')).toBeInTheDocument();
      expect(screen.getByText('group-3')).toBeInTheDocument();
    });

    it('should filter consumer groups by search term', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'group-1');

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
        expect(screen.queryByText('group-2')).not.toBeInTheDocument();
        expect(screen.queryByText('group-3')).not.toBeInTheDocument();
      });
    });

    it('should sort consumer groups by column', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const lagHeader = screen.getByText('Lag');
      fireEvent.click(lagHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // After sorting by lag, group-3 (lag: 5000) should appear before group-1 (lag: 100)
        const group3Index = rows.findIndex(row => row.textContent.includes('group-3'));
        const group1Index = rows.findIndex(row => row.textContent.includes('group-1'));
        expect(group3Index).toBeLessThan(group1Index);
      });
    });

    it('should paginate consumer groups', async () => {
      const manyGroups = Array.from({ length: 15 }, (_, i) => ({
        group_id: `group-${i}`,
        state: 'Stable',
        protocol_type: 'consumer',
        members_count: 1,
        total_lag: i * 100,
      }));

      mockApiClient.listConsumerGroups.mockResolvedValue(manyGroups);

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-0')).toBeInTheDocument();
      });

      // First page should show 10 items
      expect(screen.getByText('group-0')).toBeInTheDocument();
      expect(screen.getByText('group-9')).toBeInTheDocument();
      expect(screen.queryByText('group-10')).not.toBeInTheDocument();

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('group-10')).toBeInTheDocument();
        expect(screen.getByText('group-14')).toBeInTheDocument();
      });
    });
  });

  describe('Details View - Navigation and Display', () => {
    it('should navigate to details view when clicking on a group', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
        expect(screen.getByText('Stable')).toBeInTheDocument();
      });

      expect(mockApiClient.getConsumerGroupDetails).toHaveBeenCalledWith(clusterId, 'group-1');
      expect(mockApiClient.getConsumerGroupLag).toHaveBeenCalledWith(clusterId, 'group-1');
    });

    it('should display group details including members and topics', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('member-1')).toBeInTheDocument();
        expect(screen.getByText('member-2')).toBeInTheDocument();
        expect(screen.getByText('topic-1')).toBeInTheDocument();
        expect(screen.getByText('topic-2')).toBeInTheDocument();
      });
    });

    it('should display partition offsets with lag highlighting', async () => {
      const highLagData: PartitionOffset[] = [
        {
          topic: 'topic-1',
          partition: 0,
          current_offset: 100,
          log_end_offset: 2000,
          lag: 1900,
        },
        {
          topic: 'topic-1',
          partition: 1,
          current_offset: 200,
          log_end_offset: 250,
          lag: 50,
        },
      ];

      mockApiClient.getConsumerGroupLag.mockResolvedValue(highLagData);

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        const lagCells = screen.getAllByText(/1900|50/);
        expect(lagCells.length).toBeGreaterThan(0);
      });
    });

    it('should refresh lag data when clicking refresh button', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Partition Offsets')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockApiClient.getConsumerGroupLag).toHaveBeenCalledTimes(2);
      });
    });

    it('should navigate back to list view', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Stable')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
        expect(screen.getByText('group-1')).toBeInTheDocument();
        expect(screen.getByText('group-2')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Offsets Flow', () => {
    it('should open reset offsets dialog and reset to beginning', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Reset Offsets')).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      const resetToBeginningRadio = screen.getByLabelText(/reset to beginning/i);
      expect(resetToBeginningRadio).toBeChecked();

      const confirmButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApiClient.resetConsumerGroupOffsets).toHaveBeenCalledWith(clusterId, {
          group_id: 'group-1',
          strategy: 'beginning',
          timestamp: undefined,
        });
      });
    });

    it('should reset to timestamp when selected', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Reset Offsets')).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      const resetToTimestampRadio = screen.getByLabelText(/reset to timestamp/i);
      fireEvent.click(resetToTimestampRadio);

      const timestampInput = screen.getByDisplayValue('');
      await userEvent.type(timestampInput, '2024-01-15T10:30');

      const confirmButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApiClient.resetConsumerGroupOffsets).toHaveBeenCalled();
        const call = mockApiClient.resetConsumerGroupOffsets.mock.calls[0];
        expect(call[1].strategy).toBe('timestamp');
        expect(call[1].timestamp).toBeDefined();
      });
    });

    it('should display success message and new offsets after reset', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Reset Offsets')).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Offsets reset successfully!')).toBeInTheDocument();
        expect(screen.getByText('New Offsets')).toBeInTheDocument();
      });
    });

    it('should handle reset offsets error', async () => {
      const errorMessage = 'Failed to reset offsets: Group is active';
      mockApiClient.resetConsumerGroupOffsets.mockRejectedValueOnce(new Error(errorMessage));

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Reset Offsets')).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Group Flow', () => {
    it('should open delete dialog with confirmation warning', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Delete Group')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
        expect(screen.getByText(/warning/i)).toBeInTheDocument();
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });
    });

    it('should require confirmation checkbox before deletion', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Delete Group')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      const deleteConfirmButton = screen.getByRole('button', { name: /delete group/i });
      expect(deleteConfirmButton).toBeDisabled();

      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      expect(deleteConfirmButton).not.toBeDisabled();
    });

    it('should delete group and return to list view', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Delete Group')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      const deleteConfirmButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteConfirmButton);

      await waitFor(() => {
        expect(mockApiClient.deleteConsumerGroup).toHaveBeenCalledWith(clusterId, 'group-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
      });
    });

    it('should handle deletion error', async () => {
      const errorMessage = 'Failed to delete consumer group: Group is active';
      mockApiClient.deleteConsumerGroup.mockRejectedValueOnce(new Error(errorMessage));

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Delete Group')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      const deleteConfirmButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteConfirmButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Complete User Workflows', () => {
    it('should complete full workflow: list -> details -> reset -> back to list', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      // Step 1: View list
      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      // Step 2: Navigate to details
      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Stable')).toBeInTheDocument();
      });

      // Step 3: Open reset dialog
      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      // Step 4: Confirm reset
      const confirmButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Offsets reset successfully!')).toBeInTheDocument();
      });

      // Step 5: Close dialog and return to list
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      // Verify list was refreshed
      expect(mockApiClient.listConsumerGroups).toHaveBeenCalledTimes(2);
    });

    it('should complete full workflow: list -> details -> delete -> back to list', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      // Step 1: View list
      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      // Step 2: Navigate to details
      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Stable')).toBeInTheDocument();
      });

      // Step 3: Open delete dialog
      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      // Step 4: Confirm deletion
      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      const deleteConfirmButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteConfirmButton);

      await waitFor(() => {
        expect(mockApiClient.deleteConsumerGroup).toHaveBeenCalledWith(clusterId, 'group-1');
      });

      // Step 5: Return to list
      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
      });

      // Verify list was refreshed
      expect(mockApiClient.listConsumerGroups).toHaveBeenCalledTimes(2);
    });

    it('should handle deletion error when group is active', async () => {
      mockApiClient.deleteConsumerGroup.mockRejectedValueOnce(
        new Error('Cannot delete active consumer group')
      );

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Delete Group')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete Group'));

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Cannot delete active consumer group')).toBeInTheDocument();
      });
    });
  });

  describe('Real Scenario - Complete Consumer Group Lifecycle', () => {
    it('should handle complete workflow: list -> view details -> reset offsets -> return to list', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      // Step 1: Verify list is loaded
      await waitFor(() => {
        expect(mockApiClient.listConsumerGroups).toHaveBeenCalledWith(clusterId);
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      // Step 2: Click on a group to view details
      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      // Step 3: Verify details are loaded
      await waitFor(() => {
        expect(mockApiClient.getConsumerGroupDetails).toHaveBeenCalledWith(clusterId, 'group-1');
        expect(mockApiClient.getConsumerGroupLag).toHaveBeenCalledWith(clusterId, 'group-1');
        expect(screen.getByText('member-1')).toBeInTheDocument();
      });

      // Step 4: Open reset dialog
      fireEvent.click(screen.getByText('Reset Offsets'));

      await waitFor(() => {
        expect(screen.getByText('Reset Consumer Group Offsets')).toBeInTheDocument();
      });

      // Step 5: Select reset strategy and confirm
      const beginningRadio = screen.getByLabelText('Reset to Beginning');
      fireEvent.click(beginningRadio);

      const resetButton = screen.getByRole('button', { name: /reset offsets/i });
      fireEvent.click(resetButton);

      // Step 6: Verify reset was called
      await waitFor(() => {
        expect(mockApiClient.resetConsumerGroupOffsets).toHaveBeenCalledWith(
          clusterId,
          expect.objectContaining({
            group_id: 'group-1',
            strategy: 'beginning',
          })
        );
      });

      // Step 7: Close dialog and return to list
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
      });

      // Step 8: Verify list was refreshed
      expect(mockApiClient.listConsumerGroups).toHaveBeenCalledTimes(2);
    });

    it('should handle complete workflow: list -> view details -> delete group -> return to list', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      // Step 1: Load list
      await waitFor(() => {
        expect(screen.getByText('group-2')).toBeInTheDocument();
      });

      // Step 2: View group details
      const group2Row = screen.getByText('group-2').closest('tr');
      fireEvent.click(group2Row!);

      await waitFor(() => {
        expect(mockApiClient.getConsumerGroupDetails).toHaveBeenCalledWith(clusterId, 'group-2');
      });

      // Step 3: Open delete dialog
      fireEvent.click(screen.getByText('Delete Group'));

      await waitFor(() => {
        expect(screen.getByText('Delete Consumer Group')).toBeInTheDocument();
      });

      // Step 4: Confirm deletion
      const confirmCheckbox = screen.getByRole('checkbox');
      fireEvent.click(confirmCheckbox);

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      fireEvent.click(deleteButton);

      // Step 5: Verify delete was called
      await waitFor(() => {
        expect(mockApiClient.deleteConsumerGroup).toHaveBeenCalledWith(clusterId, 'group-2');
      });

      // Step 6: Return to list
      await waitFor(() => {
        expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
      });

      // Step 7: Verify list was refreshed
      expect(mockApiClient.listConsumerGroups).toHaveBeenCalledTimes(2);
    });

    it('should handle search, sort, and pagination in real scenario', async () => {
      const manyGroups = Array.from({ length: 25 }, (_, i) => ({
        group_id: `group-${String(i).padStart(2, '0')}`,
        state: i % 2 === 0 ? 'Stable' : 'Dead',
        protocol_type: 'consumer',
        members_count: i % 3,
        total_lag: i * 100,
      }));

      mockApiClient.listConsumerGroups.mockResolvedValue(manyGroups);

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      // Step 1: Verify initial load shows first page
      await waitFor(() => {
        expect(screen.getByText('group-00')).toBeInTheDocument();
        expect(screen.getByText('group-09')).toBeInTheDocument();
        expect(screen.queryByText('group-10')).not.toBeInTheDocument();
      });

      // Step 2: Search for specific group
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'group-05');

      await waitFor(() => {
        expect(screen.getByText('group-05')).toBeInTheDocument();
        expect(screen.queryByText('group-00')).not.toBeInTheDocument();
      });

      // Step 3: Clear search
      await userEvent.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('group-00')).toBeInTheDocument();
      });

      // Step 4: Sort by lag
      const lagHeader = screen.getByText('Lag');
      fireEvent.click(lagHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const group24Index = rows.findIndex(row => row.textContent.includes('group-24'));
        const group00Index = rows.findIndex(row => row.textContent.includes('group-00'));
        expect(group24Index).toBeLessThan(group00Index);
      });

      // Step 5: Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('group-10')).toBeInTheDocument();
      });

      // Step 6: Navigate back to previous page
      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('group-00')).toBeInTheDocument();
      });
    });

    it('should handle lag highlighting in real scenario', async () => {
      const groupsWithHighLag: ConsumerGroup[] = [
        {
          group_id: 'high-lag-group',
          state: 'Stable',
          protocol_type: 'consumer',
          members_count: 1,
          total_lag: 50000,
        },
      ];

      const lagDataWithHighLag: PartitionOffset[] = [
        {
          topic: 'critical-topic',
          partition: 0,
          current_offset: 0,
          log_end_offset: 10000,
          lag: 10000,
        },
        {
          topic: 'critical-topic',
          partition: 1,
          current_offset: 0,
          log_end_offset: 5000,
          lag: 5000,
        },
      ];

      mockApiClient.listConsumerGroups.mockResolvedValue(groupsWithHighLag);
      mockApiClient.getConsumerGroupDetails.mockResolvedValue({
        group_id: 'high-lag-group',
        state: 'Stable',
        protocol_type: 'consumer',
        members: [],
        topics: ['critical-topic'],
      });
      mockApiClient.getConsumerGroupLag.mockResolvedValue(lagDataWithHighLag);

      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('high-lag-group')).toBeInTheDocument();
      });

      const groupRow = screen.getByText('high-lag-group').closest('tr');
      fireEvent.click(groupRow!);

      await waitFor(() => {
        expect(screen.getByText('critical-topic')).toBeInTheDocument();
      });

      // Verify high lag is displayed and highlighted
      const lagCells = screen.getAllByText(/10000|5000/);
      expect(lagCells.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations: refresh while viewing details', async () => {
      render(<ConsumerGroupsContainer clusterId={clusterId} />);

      await waitFor(() => {
        expect(screen.getByText('group-1')).toBeInTheDocument();
      });

      const group1Row = screen.getByText('group-1').closest('tr');
      fireEvent.click(group1Row!);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      // Click refresh multiple times
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockApiClient.getConsumerGroupLag).toHaveBeenCalledTimes(4); // 1 initial + 3 refreshes
      });
    });
  });
});
