import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Update path as needed

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Log In</Text>

      <Button
        icon="facebook"
        mode="contained"
        style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
        onPress={() => console.log('Facebook Login')}
      >
        Connect with Facebook
      </Button>

      <Button
        icon="google"
        mode="contained"
        style={[styles.socialButton, { backgroundColor: '#db4437' }]}
        onPress={() => console.log('Google Login')}
      >
        Connect with Google
      </Button>

      <Divider style={styles.divider} />
      <Text style={styles.orText}>or</Text>

      <TextInput
        label="Your email address"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Your password"
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        style={styles.loginButton}
        onPress={() => navigation.replace('Home')}
      >
        Log in
      </Button>

      <TouchableOpacity onPress={() => console.log('Forgot Password')}>
        <Text style={styles.forgotPassword}>I've forgotten my password!</Text>
      </TouchableOpacity>
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
  socialButton: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 16,
  },
  orText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#999',
  },
  input: {
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 16,
  },
  forgotPassword: {
    color: '#1e90ff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});