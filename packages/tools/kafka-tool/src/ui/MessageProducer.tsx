import React from 'react';
import { KafkaTool } from '../index';

interface MessageProducerProps {
  kafkaTool?: KafkaTool;
  onError?: (error: string) => void;
}

const MessageProducer: React.FC<MessageProducerProps> = () => {
  return (
    <div className="message-producer">
      <h3>Produce Messages</h3>
      <p>Message producer coming soon...</p>
    </div>
  );
};

export default MessageProducer;
