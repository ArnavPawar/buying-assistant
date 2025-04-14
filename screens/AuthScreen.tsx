import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme, IconButton, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';


WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function AuthScreen({ navigation }: Props) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const theme = useTheme();

  const toggleMode = () => setIsLogin(prev => !prev);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ User logged in:', session.user);
        navigation.replace('Home');
      } else {
        console.log('❌ No active session:', error?.message);
      }
    };

    checkSession();
  }, []);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) throw error;
      }
      navigation.replace('Home');
    } catch (err: any) {
      console.error('❌ Auth error:', err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const redirectUri = AuthSession.makeRedirectUri();
    const provider = 'google';
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: { access_type: 'offline', prompt: 'consent' }, // optional
        },
      });

    if (error) {
      console.error('❌ Google auth error:', error.message);
    } else {
      WebBrowser.openBrowserAsync(data.url);
    }
    console.log('✅ OAuth login initiated, redirecting...');
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        {isLogin ? 'Log In' : 'Create Account'}
      </Text>

      {!isLogin && (
        <>
          <TextInput label="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} mode="outlined" />
          <TextInput label="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} mode="outlined" />
        </>
      )}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <Button mode="contained" onPress={handleAuth} style={styles.loginButton}>
        {isLogin ? 'Log In' : 'Sign Up'}
      </Button>

      {isLogin && (
        <TouchableOpacity onPress={() => supabase.auth.resetPasswordForEmail(email)}>
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={toggleMode}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold', textDecorationLine: 'underline' }}>
            {isLogin ? 'Create one' : 'Log in'}
          </Text>
        </Text>
      </TouchableOpacity>

      <Divider style={{ marginVertical: 16 }} />
      <Text style={{ textAlign: 'center', color: '#999', marginBottom: 12 }}>Or continue with</Text>

      <View style={styles.socialBubbleContainer}>
        <IconButton icon="google" containerColor="#DB4437" iconColor="white" onPress={handleGoogleLogin} />
        {Platform.OS === 'ios' && (
          <IconButton icon="apple" containerColor="#000" iconColor="white" onPress={() => {}} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 10,
  },
  forgotPassword: {
    color: '#1e90ff',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  socialBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
});