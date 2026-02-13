import { useEffect } from 'react';
import { useAppStore } from '../store';
import { themeRegistry, applyTheme } from '../styles/themes';

export const useThemePersistence = () => {
  const currentTheme = useAppStore((state) => state.currentTheme);
  const setTheme = useAppStore((state) => state.setTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('devkit-theme');
    if (savedTheme) {
      const theme = themeRegistry.get(savedTheme);
      if (theme) {
        setTheme(savedTheme);
        applyTheme(theme);
      } else {
        // Fallback to light theme if saved theme not found
        const lightTheme = themeRegistry.get('light');
        if (lightTheme) {
          setTheme('light');
          applyTheme(lightTheme);
        }
      }
    } else {
      // Default to light theme
      const lightTheme = themeRegistry.get('light');
      if (lightTheme) {
        setTheme('light');
        applyTheme(lightTheme);
      }
    }
  }, [setTheme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('devkit-theme', currentTheme);
    const theme = themeRegistry.get(currentTheme);
    if (theme) {
      applyTheme(theme);
    }
  }, [currentTheme]);
};

export const useTheme = () => {
  return useAppStore((state) => state.currentTheme);
};

export const useAvailableThemes = () => {
  return useAppStore((state) => state.availableThemes);
};
