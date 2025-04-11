import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ goToChat }: { goToChat: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor: '#fff'}}>
      <Text>🏠 Home Screen</Text>
      <Button title="Go to Chat" onPress={goToChat} />
    </View>
  );
}
