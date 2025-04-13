// 📁 theme.ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  roundness: 1,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000000',
    secondary: '#ec33cf',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    userBubble: '#5fc9f8',
    botBubble: '#f5f5f5',
  },
};
