import React from 'react';
import { useAppStore } from '../store';
import './TabBar.css';

export const TabBar: React.FC = () => {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const removeTab = useAppStore((state) => state.removeTab);

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.toolName}</span>
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeTab(tab.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
