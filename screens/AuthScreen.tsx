// 📁 screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function AuthScreen({ onAuthComplete }: { onAuthComplete: () => void }) {
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleMode = () => setIsLogin(prev => !prev);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 24 }}>
        {isLogin ? 'Log In' : 'Sign Up'}
      </Text>

      {!isLogin && (
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={{ marginBottom: 12 }}
        />
      )}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        mode="outlined"
        autoCapitalize="none"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={{ marginBottom: 16 }}
      />

      <Button mode="contained" onPress={onAuthComplete} style={{ marginBottom: 16 }}>
        {isLogin ? 'Log In' : 'Create Account'}
      </Button>

      <Text style={{ textAlign: 'center', marginBottom: 12 }}>or</Text>

      <Button mode="outlined" icon="google" onPress={() => {}} style={{ marginBottom: 8 }}>
        Connect with Google
      </Button>
      <Button mode="outlined" icon="facebook" onPress={() => {}} style={{ marginBottom: 24 }}>
        Connect with Facebook
      </Button>

      <TouchableOpacity onPress={toggleMode}>
        <Text style={{ textAlign: 'center', color: theme.colors.primary }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
