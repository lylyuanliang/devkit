import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KafkaToolComponent from '../KafkaToolComponent';

describe('KafkaToolComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ==================== Component Rendering Tests ====================
  describe('Component Rendering', () => {
    it('should render the Kafka Client component', () => {
      render(<KafkaToolComponent />);

      expect(screen.getByText(/Kafka Client/i)).toBeInTheDocument();
    });

    it('should show "未连接" when no cluster is connected', () => {
      render(<KafkaToolComponent />);

      expect(screen.getByText(/未连接/i)).toBeInTheDocument();
    });

    it('should render navigation sidebar', () => {
      render(<KafkaToolComponent />);

      expect(screen.getByText(/集群管理/i)).toBeInTheDocument();
      expect(screen.getByText(/Topics/i)).toBeInTheDocument();
      expect(screen.getByText(/生产消息/i)).toBeInTheDocument();
    });
  });

  // ==================== Cluster Management Tests ====================
  describe('Cluster Management', () => {
    it('should add a new cluster', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const nameInput = screen.getByPlaceholderText(/集群名称/i);
      const brokerInput = screen.getByPlaceholderText(/Broker 地址/i);
      const addButton = screen.getByText(/添加集群/i);

      await user.type(nameInput, 'Test Cluster');
      await user.type(brokerInput, 'localhost:9092');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Cluster')).toBeInTheDocument();
      });
    });

    it('should not allow adding cluster without name', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const addButton = screen.getByText(/添加集群/i);

      // Button should be disabled
      expect(addButton).toBeDisabled();
    });
  });

  // ==================== Producer Tests ====================
  describe('Message Producer', () => {
    it('should show producer message form when "生产消息" is selected', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      expect(screen.getByText(/选择 Topic/i)).toBeInTheDocument();
      expect(screen.getByText(/消息格式/i)).toBeInTheDocument();
    });

    it('should require topic before sending message', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      // Navigate to producer
      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      // Find and check send button is disabled
      const sendButton = screen.getByText(/发送消息/i);
      expect(sendButton).toBeDisabled();
    });

    it('should validate JSON format when selected', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      // Select JSON format
      const jsonButton = screen.getByText(/JSON/i);
      await user.click(jsonButton);

      // Type invalid JSON
      const textarea = screen.getByPlaceholderText(/输入有效的 JSON/i);
      await user.type(textarea, 'invalid json');

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/JSON 格式错误/i)).toBeInTheDocument();
      });
    });

    it('should accept valid JSON', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      // Select JSON format
      const jsonButton = screen.getByText(/JSON/i);
      await user.click(jsonButton);

      // Type valid JSON
      const textarea = screen.getByPlaceholderText(/输入有效的 JSON/i);
      await user.type(textarea, '{"test": "data"}');

      // Error should not appear
      await waitFor(() => {
        expect(screen.queryByText(/JSON 格式错误/i)).not.toBeInTheDocument();
      });
    });

    it('should toggle advanced options', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      // Find and click advanced options
      const advancedButton = screen.getByText(/高级选项/i);
      await user.click(advancedButton);

      // Advanced fields should be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/消息 key/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/分区号/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== Consumer Tests ====================
  describe('Message Consumer', () => {
    it('should navigate to Topics view', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const topicsButton = screen.getByText(/Topics/i);
      await user.click(topicsButton);

      expect(screen.getByText(/请先在"集群管理"中连接一个集群/i)).toBeInTheDocument();
    });

    it('should show empty message when no cluster connected', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const topicsButton = screen.getByText(/Topics/i);
      await user.click(topicsButton);

      expect(screen.getByText(/请先在"集群管理"中连接一个集群/i)).toBeInTheDocument();
    });
  });

  // ==================== Theme Tests ====================
  describe('Theme Support', () => {
    it('should respond to theme changes', () => {
      render(<KafkaToolComponent />);

      // Set dark theme
      localStorage.setItem('devkit-theme', 'dark');

      // Dispatch theme change event
      window.dispatchEvent(new Event('devkit-theme-changed'));

      // Component should update (no errors)
      expect(screen.getByText(/Kafka Client/i)).toBeInTheDocument();
    });
  });

  // ==================== Format Switching Tests ====================
  describe('Format Switching', () => {
    it('should switch between JSON and plain text', async () => {
      const user = userEvent.setup();
      render(<KafkaToolComponent />);

      const produceButton = screen.getByText(/生产消息/i);
      await user.click(produceButton);

      // Start with plain text (default)
      expect(screen.getByPlaceholderText(/输入消息内容/i)).toBeInTheDocument();

      // Switch to JSON
      const jsonButton = screen.getByText('JSON');
      await user.click(jsonButton);

      // Placeholder should change
      expect(screen.getByPlaceholderText(/输入有效的 JSON/i)).toBeInTheDocument();

      // Switch back to plain text
      const textButton = screen.getByText(/纯文本/i);
      await user.click(textButton);

      expect(screen.getByPlaceholderText(/输入消息内容/i)).toBeInTheDocument();
    });
  });
});
