import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsumerGroupDetails from './ConsumerGroupDetails';
import { KafkaTool } from '../index';

// Mock KafkaTool
const mockKafkaTool = {
  getKafkaService: jest.fn(() => ({
    isConnected: jest.fn(() => true),
    getConsumerGroupService: jest.fn(() => ({
      getConsumerGroupInfo: jest.fn(),
      getConsumerGroupOffsets: jest.fn(),
    })),
  })),
};

describe('ConsumerGroupDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Partition Assignment Display', () => {
    it('should render partition assignments table when data is available', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [
          {
            memberId: 'member-1',
            clientId: 'client-1',
            host: 'localhost',
            topicPartitions: [
              { topic: 'topic-1', partition: 0 },
              { topic: 'topic-1', partition: 1 },
            ],
          },
        ],
        topics: ['topic-1'],
      };

      const mockOffsets = [
        { topic: 'topic-1', partition: 0, offset: '100', lag: '50' },
        { topic: 'topic-1', partition: 1, offset: '200', lag: '25' },
      ];

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn().mockResolvedValue(mockOffsets),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Member Partition Assignments')).toBeInTheDocument();
      });

      expect(screen.getByText('member-1')).toBeInTheDocument();
      expect(screen.getByText('client-1')).toBeInTheDocument();
      expect(screen.getByText('topic-1')).toBeInTheDocument();
    });

    it('should display loading state for partition assignments', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: [],
      };

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
        ),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Loading partition assignments...')).toBeInTheDocument();
      });
    });

    it('should handle empty partition assignments', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [
          {
            memberId: 'member-1',
            clientId: 'client-1',
            host: 'localhost',
            topicPartitions: [],
          },
        ],
        topics: [],
      };

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn().mockResolvedValue([]),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No partition assignments available')).toBeInTheDocument();
      });
    });

    it('should display partition offset table with lag information', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: ['topic-1'],
      };

      const mockOffsets = [
        { topic: 'topic-1', partition: 0, offset: '100', lag: '50' },
        { topic: 'topic-1', partition: 1, offset: '200', lag: '25' },
      ];

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn().mockResolvedValue(mockOffsets),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Partition Offsets')).toBeInTheDocument();
      });

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should handle empty partition offsets', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: [],
      };

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn().mockResolvedValue([]),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No partition offsets')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when not connected', async () => {
      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => false),
        getConsumerGroupService: jest.fn(),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Not connected to Kafka cluster')).toBeInTheDocument();
      });
    });

    it('should display error message on service failure', async () => {
      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest
          .fn()
          .mockRejectedValue(new Error('Service error')),
        getConsumerGroupOffsets: jest.fn(),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Service error')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: [],
      };

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn().mockResolvedValue(mockGroupInfo),
        getConsumerGroupOffsets: jest.fn().mockResolvedValue([]),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Consumer Group: test-group')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      expect(mockConsumerGroupService.getConsumerGroupInfo).toHaveBeenCalledTimes(2);
    });

    it('should disable refresh button while loading', async () => {
      const mockGroupInfo = {
        groupId: 'test-group',
        state: 'stable',
        members: [],
        topics: [],
      };

      const mockConsumerGroupService = {
        getConsumerGroupInfo: jest.fn(
          () => new Promise((resolve) => setTimeout(() => resolve(mockGroupInfo), 100))
        ),
        getConsumerGroupOffsets: jest.fn(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
        ),
      };

      (mockKafkaTool.getKafkaService as jest.Mock).mockReturnValue({
        isConnected: jest.fn(() => true),
        getConsumerGroupService: jest.fn(() => mockConsumerGroupService),
      });

      render(
        <ConsumerGroupDetails
          kafkaTool={mockKafkaTool as any}
          groupId="test-group"
        />
      );

      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeDisabled();
    });
  });
});
