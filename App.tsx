// 📁 App.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import ChatScreen from './screens/ChatScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import { theme } from './theme'; 
import { Provider as PaperProvider } from 'react-native-paper';

import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // toggle to false to test login screen
  const [onHome, setOnHome] = useState(true);

  return (
    <PaperProvider theme={theme}>
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : onHome ? (
        <HomeScreen goToChat={() => setOnHome(false)} />
      ) : (
        <ChatScreen goHome={() => setOnHome(true)} />
      )}
    </PaperProvider>
  );
}