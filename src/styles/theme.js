// src/styles/theme.js
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#9C27B0',
    accent: '#FFC107',
    background: '#0A0F2B',
    surface: '#1A1F3B',
    text: '#FFFFFF',
    placeholder: '#BBBBBB',
    error: '#FF5252',
    cosmic: {
      deepPurple: '#3B196A',
      cosmicBlue: '#0A0F2B',
      stardustGold: '#FFD700',
      celestialPink: '#FF69B4',
      etherealTeal: '#00CED1',
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};