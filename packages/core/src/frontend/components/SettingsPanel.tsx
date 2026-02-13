import React, { useState } from 'react';
import './SettingsPanel.css';

export interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'tools'>('general');

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3>Application Settings</h3>
            <label>
              <input type="checkbox" defaultChecked /> Start minimized
            </label>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="settings-section">
            <h3>Tool Configuration</h3>
            <p>Configure individual tools here</p>
          </div>
        )}
      </div>
    </div>
  );
};
