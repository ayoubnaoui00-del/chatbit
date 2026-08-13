import { Platform } from 'react-native';

// API and Socket URLs
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

export const SOCKET_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

// Storage Keys
export const TOKEN_STORAGE_KEY = 'chatbit_jwt_token';
export const USER_STORAGE_KEY = 'chatbit_user_data';

// Stitch ChatBit Design System Colors & Theme Tokens
export const COLORS = {
  // Brand & Primary
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#eeefff',
  primaryFixed: '#dbe1ff',

  // Secondary & Online Indicator (Emerald)
  secondary: '#006c49',
  secondaryContainer: '#6cf8bb',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00714d',

  // Tertiary
  tertiary: '#943700',
  tertiaryContainer: '#bc4800',

  // Neutral & Surfaces
  background: '#f8f9fb',
  surface: '#f8f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f6',
  surfaceContainer: '#edeef0',
  surfaceContainerHigh: '#e7e8ea',
  surfaceContainerHighest: '#e1e2e4',
  surfaceVariant: '#e1e2e4',
  
  // Text Colors
  onSurface: '#191c1e',
  onSurfaceVariant: '#434655',
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f3',
  
  // Outline & Borders
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  border: '#e5e7eb',

  // Error & Danger
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Status indicators
  online: '#006c49',
  offline: '#737686',
  pending: '#eab308', // Amber for en_attente
  active: '#2563eb',  // Blue for en_cours
  closed: '#6b7280',  // Gray for fermee
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  gutter: 16,
  marginStandard: 16,
  paddingBubbleVertical: 12,
  paddingBubbleHorizontal: 16,
};

export const RADIUS = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
