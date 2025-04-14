// 📁 App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './theme';
import AuthScreen from './screens/AuthScreen';
// import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';


import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Chat: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            animation: 'slide_from_right', // default
            headerShown: false,
        }}
        >
          <Stack.Screen name="Login" component={AuthScreen} />
          {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
