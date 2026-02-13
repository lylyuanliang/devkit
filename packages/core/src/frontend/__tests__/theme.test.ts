import { themeRegistry, LIGHT_THEME, DARK_THEME, applyTheme } from '../styles/themes';

describe('Theme System', () => {
  describe('Theme Registry', () => {
    it('should have light and dark themes registered', () => {
      const themes = themeRegistry.list();
      expect(themes.length).toBeGreaterThanOrEqual(2);

      const lightTheme = themeRegistry.get('light');
      const darkTheme = themeRegistry.get('dark');

      expect(lightTheme).toBeDefined();
      expect(darkTheme).toBeDefined();
    });

    it('should return correct theme by id', () => {
      const lightTheme = themeRegistry.get('light');
      expect(lightTheme?.id).toBe('light');
      expect(lightTheme?.name).toBe('Light');

      const darkTheme = themeRegistry.get('dark');
      expect(darkTheme?.id).toBe('dark');
      expect(darkTheme?.name).toBe('Dark');
    });

    it('should return all theme ids', () => {
      const ids = themeRegistry.getIds();
      expect(ids).toContain('light');
      expect(ids).toContain('dark');
    });

    it('should support registering new themes', () => {
      const customTheme = {
        id: 'custom-test',
        name: 'Custom Test',
        colors: {
          bgPrimary: '#ff0000',
          bgSecondary: '#ff1111',
          bgTertiary: '#ff2222',
          textPrimary: '#000000',
          textSecondary: '#111111',
          textTertiary: '#222222',
          borderPrimary: '#333333',
          borderSecondary: '#444444',
          accentPrimary: '#0066cc',
          accentSecondary: '#0052a3',
          accentHover: '#0052a3',
          sidebarBg: '#f5f5f5',
          sidebarBorder: '#e0e0e0',
          tabBg: '#fafafa',
          tabActiveBorder: '#0066cc',
          buttonHoverBg: '#f0f0f0',
        },
      };

      themeRegistry.register(customTheme);
      const retrieved = themeRegistry.get('custom-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Custom Test');
    });
  });

  describe('Theme Colors', () => {
    it('should have all required color properties in light theme', () => {
      const colors = LIGHT_THEME.colors;
      expect(colors.bgPrimary).toBeDefined();
      expect(colors.textPrimary).toBeDefined();
      expect(colors.borderPrimary).toBeDefined();
      expect(colors.accentPrimary).toBeDefined();
      expect(colors.sidebarBg).toBeDefined();
      expect(colors.tabBg).toBeDefined();
    });

    it('should have all required color properties in dark theme', () => {
      const colors = DARK_THEME.colors;
      expect(colors.bgPrimary).toBeDefined();
      expect(colors.textPrimary).toBeDefined();
      expect(colors.borderPrimary).toBeDefined();
      expect(colors.accentPrimary).toBeDefined();
      expect(colors.sidebarBg).toBeDefined();
      expect(colors.tabBg).toBeDefined();
    });

    it('should have different colors between light and dark themes', () => {
      expect(LIGHT_THEME.colors.bgPrimary).not.toBe(DARK_THEME.colors.bgPrimary);
      expect(LIGHT_THEME.colors.textPrimary).not.toBe(DARK_THEME.colors.textPrimary);
    });
  });

  describe('Apply Theme', () => {
    beforeEach(() => {
      // Setup DOM
      document.documentElement.style.cssText = '';
      document.documentElement.removeAttribute('data-theme');
    });

    it('should apply theme CSS variables to root element', () => {
      applyTheme(LIGHT_THEME);

      const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
      expect(bgPrimary.trim()).toBe(LIGHT_THEME.colors.bgPrimary);
    });

    it('should set data-theme attribute', () => {
      applyTheme(DARK_THEME);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update all color variables', () => {
      applyTheme(LIGHT_THEME);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--bg-primary')).toBe(LIGHT_THEME.colors.bgPrimary);
      expect(root.style.getPropertyValue('--text-primary')).toBe(LIGHT_THEME.colors.textPrimary);
      expect(root.style.getPropertyValue('--accent-primary')).toBe(LIGHT_THEME.colors.accentPrimary);
    });
  });
});
