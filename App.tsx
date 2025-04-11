// 📁 App.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import ChatScreen from './screens/ChatScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // toggle to false to test login screen
  const [onHome, setOnHome] = useState(true);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  if (onHome) return <HomeScreen goToChat={() => setOnHome(false)} />;

  return <ChatScreen goHome={() => setOnHome(true)} />;
}