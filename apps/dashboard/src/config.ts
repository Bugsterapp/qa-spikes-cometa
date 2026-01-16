// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  MOBILE_HEIGHT: 64,
  MAIN_DESKTOP_HEIGHT: 88,
  DASHBOARD_DESKTOP_HEIGHT: 92,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 92 - 32,
} as const;

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
} as const;

export const ICON = {
  NAVBAR_ITEM: 22,
  NAVBAR_ITEM_HORIZONTAL: 20,
} as const;

// SETTINGS
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const cookiesExpires = 3;

export const cookiesKey = {
  themeMode: 'themeMode',
  themeLayout: 'themeLayout',
  themeStretch: 'themeStretch',
  themeContrast: 'themeContrast',
  themeDirection: 'themeDirection',
  themeColorPresets: 'themeColorPresets',
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeDirection = 'ltr' | 'rtl';
export type ThemeContrast = 'default' | 'bold';
export type ThemeLayout = 'horizontal' | 'vertical';
export type ThemeColorPresets = 'default' | 'purple' | 'cyan' | 'blue' | 'orange' | 'red';

export interface DefaultSettings {
  themeMode: ThemeMode;
  themeDirection: ThemeDirection;
  themeContrast: ThemeContrast;
  themeLayout: ThemeLayout;
  themeColorPresets: ThemeColorPresets;
  themeStretch: boolean;
}

export const defaultSettings: DefaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'horizontal',
  themeColorPresets: 'default',
  themeStretch: false,
};

// MULTI LANGUAGES
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------
