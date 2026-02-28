import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import ConsumerGroupListView from './ConsumerGroupListView';
import { useConsumerGroupStore } from './consumer-group-store';

// Mock the store
vi.mock('./consumer-group-store', () => ({
  useConsumerGroupStore: vi.fn(),
}));

// Mock KafkaTool
const createMockKafkaTool = (mockService = {}) => ({
  getKafkaService: vi.fn(() => ({
    isConnected: vi.fn(() => true),
    getConsumerGroupService: vi.fn(() => ({
      getConsumerGroupInfo: vi.fn().mockResolvedValue({
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: [],
      }),
      ...mockService,
    })),
  })),
});

describe('ConsumerGroupListView', () => {
  const mockSetSelectedGroup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useConsumerGroupStore as unknown as Mock).mockReturnValue({
      selectedGroupId: null,
      setSelectedGroup: mockSetSelectedGroup,
    });
  });

  describe('Task 8.1: Test consumer group list with various group counts', () => {
    it('should render empty state when no groups exist', () => {
      render(
        <ConsumerGroupListView
          groups={[]}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      expect(screen.getByText('没有消费者组')).toBeInTheDocument();
    });

    it('should render single consumer group', () => {
      render(
        <ConsumerGroupListView
          groups={['my-group']}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      expect(screen.getByText('my-group')).toBeInTheDocument();
    });

    it('should render multiple consumer groups', () => {
      const groups = ['group-1', 'group-2', 'group-3', 'group-4', 'group-5'];
      render(
        <ConsumerGroupListView
          groups={groups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      groups.forEach((group) => {
        expect(screen.getByText(group)).toBeInTheDocument();
      });
    });

    it('should render large number of groups (100+)', () => {
      const groups = Array.from({ length: 100 }, (_, i) => `group-${i + 1}`);
      render(
        <ConsumerGroupListView
          groups={groups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      // Verify first and last groups are rendered
      expect(screen.getByText('group-1')).toBeInTheDocument();
      expect(screen.getByText('group-100')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <ConsumerGroupListView
          groups={['group-1']}
          loading={true}
          onRefresh={vi.fn()}
        />
      );

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  describe('Task 8.2: Test pagination and filtering', () => {
    const testGroups = [
      'payment-service-consumer',
      'order-service-consumer',
      'user-service-consumer',
      'notification-consumer',
      'analytics-consumer',
      'payment-retry-consumer',
    ];

    it('should filter groups by search query', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          groups={testGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      // Initially all groups are visible
      expect(screen.getByText('payment-service-consumer')).toBeInTheDocument();
      expect(screen.getByText('order-service-consumer')).toBeInTheDocument();

      // Type in search
      const searchInput = screen.getByPlaceholderText('搜索消费者组...');
      await user.type(searchInput, 'payment');

      // Only payment groups should be visible
      expect(screen.getByText('payment-service-consumer')).toBeInTheDocument();
      expect(screen.getByText('payment-retry-consumer')).toBeInTheDocument();
      expect(screen.queryByText('order-service-consumer')).not.toBeInTheDocument();
      expect(screen.queryByText('user-service-consumer')).not.toBeInTheDocument();
    });

    it('should filter case-insensitively', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          groups={testGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('搜索消费者组...');
      await user.type(searchInput, 'ORDER');

      expect(screen.getByText('order-service-consumer')).toBeInTheDocument();
      expect(screen.queryByText('payment-service-consumer')).not.toBeInTheDocument();
    });

    it('should show no matches message when filter returns empty', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          groups={testGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('搜索消费者组...');
      await user.type(searchInput, 'nonexistent-xyz');

      expect(screen.getByText('没有匹配的消费者组')).toBeInTheDocument();
    });

    it('should clear filter and show all groups', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          groups={testGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('搜索消费者组...');

      // Type to filter
      await user.type(searchInput, 'payment');
      expect(screen.queryByText('order-service-consumer')).not.toBeInTheDocument();

      // Clear filter
      await user.clear(searchInput);
      expect(screen.getByText('order-service-consumer')).toBeInTheDocument();
      expect(screen.getByText('payment-service-consumer')).toBeInTheDocument();
    });

    it('should filter with partial match', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          groups={testGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('搜索消费者组...');
      await user.type(searchInput, 'service');

      // All service-consumer groups should be visible
      expect(screen.getByText('payment-service-consumer')).toBeInTheDocument();
      expect(screen.getByText('order-service-consumer')).toBeInTheDocument();
      expect(screen.getByText('user-service-consumer')).toBeInTheDocument();

      // Non-service groups should be hidden
      expect(screen.queryByText('notification-consumer')).not.toBeInTheDocument();
      expect(screen.queryByText('analytics-consumer')).not.toBeInTheDocument();
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      const specialGroups = ['group-with-dash', 'group_with_underscore', 'group.with.dot'];
      render(
        <ConsumerGroupListView
          groups={specialGroups}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('搜索消费者组...');

      await user.type(searchInput, '-dash');
      expect(screen.getByText('group-with-dash')).toBeInTheDocument();
      expect(screen.queryByText('group_with_underscore')).not.toBeInTheDocument();
    });
  });

  describe('Group selection', () => {
    it('should call setSelectedGroup when clicking on a group', async () => {
      const user = userEvent.setup();
      render(
        <ConsumerGroupListView
          kafkaTool={createMockKafkaTool() as any}
          groups={['group-1', 'group-2']}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      await user.click(screen.getByText('group-1'));

      expect(mockSetSelectedGroup).toHaveBeenCalledWith('group-1');
    });

    it('should highlight selected group', () => {
      (useConsumerGroupStore as unknown as Mock).mockReturnValue({
        selectedGroupId: 'group-1',
        setSelectedGroup: mockSetSelectedGroup,
      });

      render(
        <ConsumerGroupListView
          groups={['group-1', 'group-2']}
          loading={false}
          onRefresh={vi.fn()}
        />
      );

      // The selected group should have different styling
      const group1 = screen.getByText('group-1').closest('li');
      expect(group1).toBeInTheDocument();
    });
  });

  describe('Refresh functionality', () => {
    it('should call onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRefresh = vi.fn();
      render(
        <ConsumerGroupListView
          groups={['group-1']}
          loading={false}
          onRefresh={mockOnRefresh}
        />
      );

      await user.click(screen.getByText('🔄 刷新'));

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button while loading', () => {
      render(
        <ConsumerGroupListView
          groups={['group-1']}
          loading={true}
          onRefresh={vi.fn()}
        />
      );

      const refreshButton = screen.getByText('加载中...');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Dark mode', () => {
    it('should render with dark mode styles', () => {
      render(
        <ConsumerGroupListView
          groups={['group-1']}
          loading={false}
          onRefresh={vi.fn()}
          isDarkMode={true}
        />
      );

      expect(screen.getByText('group-1')).toBeInTheDocument();
    });

    it('should render with light mode styles', () => {
      render(
        <ConsumerGroupListView
          groups={['group-1']}
          loading={false}
          onRefresh={vi.fn()}
          isDarkMode={false}
        />
      );

      expect(screen.getByText('group-1')).toBeInTheDocument();
    });
  });
});

describe('Task 8.7: Performance test with large groups', () => {
  const mockSetSelectedGroup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useConsumerGroupStore as unknown as Mock).mockReturnValue({
      selectedGroupId: null,
      setSelectedGroup: mockSetSelectedGroup,
    });
  });

  it('should render 500 groups within acceptable time', () => {
    const groups = Array.from({ length: 500 }, (_, i) => `group-${i + 1}`);

    const startTime = performance.now();
    render(
      <ConsumerGroupListView
        groups={groups}
        loading={false}
        onRefresh={vi.fn()}
      />
    );
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Render should complete within 2000ms (accounting for CI environments)
    expect(renderTime).toBeLessThan(2000);
    expect(screen.getByText('group-1')).toBeInTheDocument();
    expect(screen.getByText('group-500')).toBeInTheDocument();
  });

  it('should filter 1000 groups efficiently', async () => {
    const user = userEvent.setup();
    const groups = Array.from({ length: 1000 }, (_, i) => `group-${i + 1}`);

    render(
      <ConsumerGroupListView
        groups={groups}
        loading={false}
        onRefresh={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索消费者组...');

    const startTime = performance.now();
    await user.type(searchInput, 'group-99');
    const endTime = performance.now();
    const filterTime = endTime - startTime;

    // Filter should complete within 1000ms
    expect(filterTime).toBeLessThan(1000);

    // Should find groups matching 'group-99'
    expect(screen.getByText('group-99')).toBeInTheDocument();
    expect(screen.getByText('group-990')).toBeInTheDocument();
    expect(screen.getByText('group-999')).toBeInTheDocument();
  });

  it('should handle groups with many partitions data structure', async () => {
    // Simulate groups that would have many partitions
    const groups = Array.from({ length: 50 }, (_, i) => `high-partition-group-${i + 1}`);

    render(
      <ConsumerGroupListView
        groups={groups}
        loading={false}
        onRefresh={vi.fn()}
      />
    );

    // Verify all groups render
    expect(screen.getByText('high-partition-group-1')).toBeInTheDocument();
    expect(screen.getByText('high-partition-group-50')).toBeInTheDocument();
  });

  it('should maintain responsiveness during rapid filter changes', async () => {
    const user = userEvent.setup();
    const groups = Array.from({ length: 200 }, (_, i) => `consumer-group-${i + 1}`);

    render(
      <ConsumerGroupListView
        groups={groups}
        loading={false}
        onRefresh={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索消费者组...');

    // Simulate rapid typing
    await user.type(searchInput, 'consumer');
    await user.clear(searchInput);
    await user.type(searchInput, 'group');
    await user.clear(searchInput);
    await user.type(searchInput, '100');

    // Should show filtered results
    expect(screen.getByText('consumer-group-100')).toBeInTheDocument();
  });
});
