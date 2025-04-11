// 📁 theme.ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007aff',
    secondary: '#03dac6',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
  },
};