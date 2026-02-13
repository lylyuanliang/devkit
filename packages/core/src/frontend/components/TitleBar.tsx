import React, { useEffect, useState } from 'react';
import { getCurrentWindow, type WebviewWindow } from '@tauri-apps/api/window';
import './TitleBar.css';

export const TitleBar: React.FC = () => {
  const [appWindow, setAppWindow] = useState<WebviewWindow | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const initWindow = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const window = getCurrentWindow();
        console.log('Window initialized:', window);
        setAppWindow(window);
        setIsReady(true);

        // Check initial maximized state
        const maximized = await window.isMaximized();
        console.log('Initial maximized state:', maximized);
        setIsMaximized(maximized);

        // Listen for resize events to update maximized state
        const unlistenResized = await window.onResized(async () => {
          const maximized = await window.isMaximized();
          console.log('Window resized, maximized:', maximized);
          setIsMaximized(maximized);
        });

        return () => {
          unlistenResized();
        };
      } catch (error) {
        console.error('Failed to get window:', error);
        setIsReady(true);
      }
    };

    initWindow();
  }, []);

  const handleMinimize = async () => {
    console.log('Minimize clicked, appWindow:', appWindow);
    if (appWindow) {
      try {
        await appWindow.minimize();
        console.log('Minimized');
      } catch (error) {
        console.error('Failed to minimize:', error);
      }
    }
  };

  const handleMaximize = async () => {
    console.log('Maximize clicked, appWindow:', appWindow, 'isMaximized:', isMaximized);
    if (appWindow) {
      try {
        await appWindow.toggleMaximize();
        // Update state immediately after toggle
        const maximized = await appWindow.isMaximized();
        console.log('After toggle, maximized:', maximized);
        setIsMaximized(maximized);
      } catch (error) {
        console.error('Failed to maximize:', error);
      }
    }
  };

  const handleClose = async () => {
    console.log('Close clicked, appWindow:', appWindow);
    if (appWindow) {
      try {
        await appWindow.close();
        console.log('Closed');
      } catch (error) {
        console.error('Failed to close:', error);
      }
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <span className="title-bar-title">DevKit</span>
        <div className="title-bar-drag-region" data-tauri-drag-region />
        <div className="title-bar-controls">
          <button
            className="title-bar-btn minimize-btn"
            onClick={handleMinimize}
            aria-label="Minimize"
            title="Minimize"
            disabled={!isReady || !appWindow}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect y="4" width="10" height="2" />
            </svg>
          </button>
          <button
            className="title-bar-btn maximize-btn"
            onClick={handleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            title={isMaximized ? 'Restore' : 'Maximize'}
            disabled={!isReady || !appWindow}
          >
            {isMaximized ? (
              // Restore icon - two overlapping squares (Windows style)
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="1" y="3" width="5" height="5" />
                <rect x="4" y="1" width="5" height="5" />
              </svg>
            ) : (
              // Maximize icon - single square
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="1" y="1" width="8" height="8" />
              </svg>
            )}
          </button>
          <button
            className="title-bar-btn close-btn"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
            disabled={!isReady || !appWindow}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
