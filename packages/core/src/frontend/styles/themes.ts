export type ThemeName = string;

export interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  borderPrimary: string;
  borderSecondary: string;

  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  accentHover: string;

  // Component specific
  sidebarBg: string;
  sidebarBorder: string;
  tabBg: string;
  tabActiveBorder: string;
  buttonHoverBg: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

// Built-in themes
export const LIGHT_THEME: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#eeeeee',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    borderPrimary: '#e0e0e0',
    borderSecondary: '#d0d0d0',
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

export const DARK_THEME: Theme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    bgPrimary: '#1e1e1e',
    bgSecondary: '#2d2d2d',
    bgTertiary: '#3a3a3a',
    textPrimary: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    borderPrimary: '#404040',
    borderSecondary: '#505050',
    accentPrimary: '#4d94ff',
    accentSecondary: '#3d7acc',
    accentHover: '#3d7acc',
    sidebarBg: '#2d2d2d',
    sidebarBorder: '#404040',
    tabBg: '#252525',
    tabActiveBorder: '#4d94ff',
    buttonHoverBg: '#3a3a3a',
  },
};

// Theme registry
class ThemeRegistry {
  private themes: Map<string, Theme> = new Map();

  constructor() {
    this.register(LIGHT_THEME);
    this.register(DARK_THEME);
  }

  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  get(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  list(): Theme[] {
    return Array.from(this.themes.values());
  }

  getIds(): string[] {
    return Array.from(this.themes.keys());
  }
}

export const themeRegistry = new ThemeRegistry();

// Apply theme to DOM
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  const colors = theme.colors;

  // Set CSS variables
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-secondary', colors.bgSecondary);
  root.style.setProperty('--bg-tertiary', colors.bgTertiary);
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-tertiary', colors.textTertiary);
  root.style.setProperty('--border-primary', colors.borderPrimary);
  root.style.setProperty('--border-secondary', colors.borderSecondary);
  root.style.setProperty('--accent-primary', colors.accentPrimary);
  root.style.setProperty('--accent-secondary', colors.accentSecondary);
  root.style.setProperty('--accent-hover', colors.accentHover);
  root.style.setProperty('--sidebar-bg', colors.sidebarBg);
  root.style.setProperty('--sidebar-border', colors.sidebarBorder);
  root.style.setProperty('--tab-bg', colors.tabBg);
  root.style.setProperty('--tab-active-border', colors.tabActiveBorder);
  root.style.setProperty('--button-hover-bg', colors.buttonHoverBg);

  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', theme.id);
};
