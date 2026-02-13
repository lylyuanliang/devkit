import React from 'react';
import { useAppStore } from '../store';
import { useThemePersistence } from '../hooks/useTheme';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { WorkArea } from './WorkArea';
import './App.css';

export const App: React.FC = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);

  // Initialize theme persistence
  useThemePersistence();

  return (
    <div className="app-wrapper">
      <TitleBar />
      <div className="app-container">
        <div className={`sidebar-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <Sidebar />
        </div>
        <div className="main-content">
          <TabBar />
          <WorkArea />
        </div>
      </div>
    </div>
  );
};
