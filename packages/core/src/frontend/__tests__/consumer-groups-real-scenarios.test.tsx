import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsumerGroupsContainer } from '../components/ConsumerGroupsContainer';
import { apiClient } from '../api/client';
import { ConsumerGroup, ConsumerGroupDetails, PartitionOffset } from '../../types/consumer-groups';

vi.mock('../api/client');

const mockApiClient = apiClient as any;

describe('Consumer Groups - Real Scenario Integration Tests', () => {
  const clusterId = 'production-cluster';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Scenario 1: Monitor high lag consumer group', async () => {
    const groups: ConsumerGroup[] = [
      {
        group_id: 'payment-processor',
        state: 'Stable',
        protocol_type: 'consumer',
        members_count: 3,
        total_lag: 50000,
      },
    ];

    const details: ConsumerGroupDetails = {
      group_id: 'payment-processor',
      state: 'Stable',
      protocol_type: 'consumer',
      members: [{ member_id: 'member-1', client_id: 'payment-1', host: '10.0.1.10' }],
      topics: ['payment-events'],
    };

    const lagData: PartitionOffset[] = [
      { topic: 'payment-events', partition: 0, current_offset: 1000, log_end_offset: 26000, lag: 25000 },
    ];

    mockApiClient.listConsumerGroups.mockResolvedValue(groups);
    mockApiClient.getConsumerGroupDetails.mockResolvedValue(details);
    mockApiClient.getConsumerGroupLag.mockResolvedValue(lagData);

    render(<ConsumerGroupsContainer clusterId={clusterId} />);

    await waitFor(() => {
      expect(screen.getByText('payment-processor')).toBeInTheDocument();
    });

    expect(mockApiClient.listConsumerGroups).toHaveBeenCalledWith(clusterId);
  });

  it('Scenario 2: Recover dead consumer group', async () => {
    const groups: ConsumerGroup[] = [
      { group_id: 'email-service', state: 'Dead', protocol_type: 'consumer', members_count: 0, total_lag: 0 },
    ];

    const details: ConsumerGroupDetails = {
      group_id: 'email-service',
      state: 'Dead',
      protocol_type: 'consumer',
      members: [],
      topics: ['email-events'],
    };

    const resetResult: PartitionOffset[] = [
      { topic: 'email-events', partition: 0, current_offset: 10000, log_end_offset: 10000, lag: 0 },
    ];

    mockApiClient.listConsumerGroups.mockResolvedValue(groups);
    mockApiClient.getConsumerGroupDetails.mockResolvedValue(details);
    mockApiClient.getConsumerGroupLag.mockResolvedValue([]);
    mockApiClient.resetConsumerGroupOffsets.mockResolvedValue(resetResult);

    render(<ConsumerGroupsContainer clusterId={clusterId} />);

    await waitFor(() => {
      expect(screen.getByText('email-service')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Reset Offsets')).toBeInTheDocument();
    }, { timeout: 5000 });

    const resetButtons = screen.getAllByRole('button', { name: /reset offsets/i });
    fireEvent.click(resetButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Reset to End')).toBeInTheDocument();
    }, { timeout: 5000 });

    const endRadio = screen.getByLabelText('Reset to End');
    fireEvent.click(endRadio);

    const confirmResetButtons = screen.getAllByRole('button', { name: /reset offsets/i });
    fireEvent.click(confirmResetButtons[1]);

    await waitFor(() => {
      expect(mockApiClient.resetConsumerGroupOffsets).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('Scenario 3: Delete inactive consumer group', async () => {
    const groups: ConsumerGroup[] = [
      { group_id: 'old-batch-job', state: 'Dead', protocol_type: 'consumer', members_count: 0, total_lag: 0 },
    ];

    const details: ConsumerGroupDetails = {
      group_id: 'old-batch-job',
      state: 'Dead',
      protocol_type: 'consumer',
      members: [],
      topics: [],
    };

    mockApiClient.listConsumerGroups.mockResolvedValue(groups);
    mockApiClient.getConsumerGroupDetails.mockResolvedValue(details);
    mockApiClient.getConsumerGroupLag.mockResolvedValue([]);
    mockApiClient.deleteConsumerGroup.mockResolvedValue(undefined);

    render(<ConsumerGroupsContainer clusterId={clusterId} />);

    await waitFor(() => {
      expect(screen.getByText('old-batch-job')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Delete Group')).toBeInTheDocument();
    }, { timeout: 5000 });

    const deleteButtons = screen.getAllByRole('button', { name: /delete group/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/permanently remove/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const confirmDeleteButtons = screen.getAllByRole('button', { name: /delete group/i });
    fireEvent.click(confirmDeleteButtons[1]);

    await waitFor(() => {
      expect(mockApiClient.deleteConsumerGroup).toHaveBeenCalledWith(clusterId, 'old-batch-job');
    }, { timeout: 5000 });
  });

  it('Scenario 4: Large scale pagination and search', async () => {
    const largeList = Array.from({ length: 25 }, (_, i) => ({
      group_id: `service-${String(i).padStart(3, '0')}`,
      state: i % 2 === 0 ? 'Stable' : 'Dead',
      protocol_type: 'consumer',
      members_count: i % 3,
      total_lag: i * 100,
    }));

    mockApiClient.listConsumerGroups.mockResolvedValue(largeList);

    render(<ConsumerGroupsContainer clusterId={clusterId} />);

    await waitFor(() => {
      expect(screen.getByText('service-000')).toBeInTheDocument();
    });

    expect(screen.getByText('service-009')).toBeInTheDocument();
    expect(screen.queryByText('service-010')).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('service-010')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'service-015');

    await waitFor(() => {
      expect(screen.getByText('service-015')).toBeInTheDocument();
    });
  });
});
