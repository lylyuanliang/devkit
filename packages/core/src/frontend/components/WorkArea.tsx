import React from 'react';
import { useAppStore } from '../store';
import './WorkArea.css';

export const WorkArea: React.FC = () => {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId);

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
        <p>Tool: {activeTab.toolName}</p>
        {/* Tool component will be rendered here */}
      </div>
    </div>
  );
};
