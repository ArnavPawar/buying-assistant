import React from 'react';
import { View, Text, Button } from 'react-native';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor: '#fff'}}>
      <Text>🔐 Login Screen (mocked)</Text>
      <Button title="Log In" onPress={onLogin} />
    </View>
  );
}
