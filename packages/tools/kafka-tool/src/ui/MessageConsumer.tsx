import React from 'react';
import { KafkaTool } from '../index';

interface MessageConsumerProps {
  kafkaTool?: KafkaTool;
  onError?: (error: string) => void;
}

const MessageConsumer: React.FC<MessageConsumerProps> = () => {
  return (
    <div className="message-consumer">
      <h3>Consume Messages</h3>
      <p>Message consumer coming soon...</p>
    </div>
  );
};

export default MessageConsumer;
