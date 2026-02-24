import React from 'react';
import { KafkaTool } from '../index';

interface TopicListProps {
  kafkaTool?: KafkaTool;
  onError?: (error: string) => void;
}

const TopicList: React.FC<TopicListProps> = () => {
  return (
    <div className="topic-list">
      <h3>Topics</h3>
      <p>Topic management coming soon...</p>
    </div>
  );
};

export default TopicList;
