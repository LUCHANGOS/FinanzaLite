export const Colors = {
  // Colores principales basados en el logo
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Colores secundarios
  secondary: '#2196F3',
  secondaryDark: '#1976D2',
  secondaryLight: '#64B5F6',
  
  // Colores de estado
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Gradientes
  gradients: {
    primary: ['#4CAF50', '#81C784'],
    secondary: ['#2196F3', '#64B5F6'],
    success: ['#4CAF50', '#66BB6A'],
    warning: ['#FF9800', '#FFB74D'],
    error: ['#F44336', '#EF5350'],
    income: ['#4CAF50', '#8BC34A'],
    expense: ['#F44336', '#FF5722'],
    neutral: ['#9E9E9E', '#BDBDBD'],
  },
  
  // Modo claro
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    border: '#E0E0E0',
    shadow: '#000000',
    card: '#FFFFFF',
    divider: '#E0E0E0',
  },
  
  // Modo oscuro
  dark: {
    background: '#0D1117',
    surface: '#161B22',
    surfaceVariant: '#21262D',
    text: '#F0F6FC',
    textSecondary: '#8B949E',
    textTertiary: '#6E7681',
    border: '#30363D',
    shadow: '#000000',
    card: '#161B22',
    divider: '#21262D',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const getTheme = (isDark) => ({
  colors: isDark ? Colors.dark : Colors.light,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  isDark,
});
