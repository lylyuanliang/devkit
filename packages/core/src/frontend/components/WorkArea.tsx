import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import './WorkArea.css';

export const WorkArea: React.FC = () => {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const [toolComponent, setToolComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (!activeTab) {
      setToolComponent(null);
      return;
    }

    // Dynamically load tool component based on toolId
    const loadTool = async () => {
      setLoading(true);
      try {
        if (activeTab.toolId === 'kafka-tool') {
          // Import Kafka Tool component
          const KafkaToolComponent = (await import('@devkit/kafka-tool')).default;
          setToolComponent(() => KafkaToolComponent);
        }
      } catch (error) {
        console.error('Failed to load tool:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTool();
  }, [activeTab]);

  if (!activeTab) {
    return (
      <div className="work-area empty">
        <div className="empty-state">
          <h2>Welcome to DevKit</h2>
          <p>Select a tool from the menu to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-area">
      <div className="tool-container">
        {loading ? (
          <p>Loading {activeTab.toolName}...</p>
        ) : toolComponent ? (
          React.createElement(toolComponent)
        ) : (
          <p>Failed to load {activeTab.toolName}</p>
        )}
      </div>
    </div>
  );
};
