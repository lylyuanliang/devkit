import React from 'react';
import { useAppStore } from '../store';
import { ThemeToggle } from './ThemeToggle';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const availableTools = useAppStore((state) => state.availableTools);
  const recentTools = useAppStore((state) => state.recentTools);
  const addTab = useAppStore((state) => state.addTab);

  const handleToolClick = (toolId: string, toolName: string) => {
    const tabId = `${toolId}-${Date.now()}`;
    addTab({ id: tabId, toolId, toolName });
  };

  const categories = Array.from(
    new Map(availableTools.map((tool) => [tool.category, tool])).keys()
  );

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
        {!sidebarCollapsed && <h2>Tools</h2>}
        <ThemeToggle />
      </div>

      {!sidebarCollapsed && (
        <>
          <div className="search-box">
            <input type="text" placeholder="Search tools..." />
          </div>

          {recentTools.length > 0 && (
            <div className="tool-section">
              <h3>⭐ Recent</h3>
              <ul>
                {recentTools.map((toolId) => {
                  const tool = availableTools.find((t) => t.id === toolId);
                  return tool ? (
                    <li key={toolId} onClick={() => handleToolClick(toolId, tool.name)}>
                      {tool.icon} {tool.name}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          {categories.map((category) => (
            <div key={category} className="tool-section">
              <h3>{category}</h3>
              <ul>
                {availableTools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <li key={tool.id} onClick={() => handleToolClick(tool.id, tool.name)}>
                      {tool.icon} {tool.name}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
