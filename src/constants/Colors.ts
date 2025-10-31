export const Colors = {
  // Paleta principal
  background: '#F5F4F1',
  white: '#FFFFFF',
  accent: '#FFD97D',
  border: '#C5C4C3',
  textPrimary: '#2C2C2C',
  textSecondary: '#6F6F6F',
  dark: '#111111',
  coral: '#FF6257',
  
  // Colores adicionales para compatibilidad
  primary: '#111111', // Mapeado a dark
  secondary: '#FFD97D', // Mapeado a accent
  backgroundAlt: '#F5F4F1', // Mapeado a background
  textLight: '#6F6F6F', // Mapeado a textSecondary
  card: '#FFFFFF', // Mapeado a white
  cardBorder: '#C5C4C3', // Mapeado a border
  
  // Colores adicionales para estados
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Sombras
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
  
  // Gradientes
  gradient: {
    primary: ['#FFD97D', '#FFB74D'],
    secondary: ['#F5F4F1', '#E8E6E3'],
    blue: ['#4A90E2', '#1E3A8A'], // Gradiente azul como el logo
    blueLight: ['#87CEEB', '#4A90E2'], // Versión más clara del azul
  }
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;