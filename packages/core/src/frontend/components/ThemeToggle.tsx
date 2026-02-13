import React from 'react';
import { useAppStore } from '../store';
import { useAvailableThemes } from '../hooks/useTheme';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const currentTheme = useAppStore((state) => state.currentTheme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const availableThemes = useAvailableThemes();

  const handleToggle = () => {
    toggleTheme();
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      default:
        return '🎨';
    }
  };

  const getNextThemeName = () => {
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    return availableThemes[nextIndex];
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${getNextThemeName()} theme`}
      title={`Current: ${currentTheme} | Click to switch to ${getNextThemeName()}`}
    >
      {getThemeIcon(currentTheme)}
    </button>
  );
};
