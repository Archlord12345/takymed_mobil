export const Colors = {
  primary: '#006093', // From HSL 201 100% 29%
  primaryForeground: '#f8fafc',
  secondary: '#00A859', // From HSL 152 100% 33% (Takymed Green)
  secondaryForeground: '#f8fafc',
  background: '#f8fafc',
  foreground: '#020617',
  card: '#ffffff',
  cardForeground: '#020617',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  border: '#e2e8f0',
  input: '#e2e8f0',
  destructive: '#ef4444',
  destructiveForeground: '#f8fafc',
  success: '#10b981',
  warning: '#f59e0b',
  white: '#ffffff',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  pill: 100,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  xxl: 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};
