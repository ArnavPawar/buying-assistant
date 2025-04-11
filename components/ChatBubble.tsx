import React from 'react';
import { View, Text, Linking, Button, Image } from 'react-native';
import { ChatMessage } from '../utils/supabaseChats';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const lines = message.text.split('\n');
  

  return (
    <View
      style={{
        alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: message.sender === 'user' ? '#dcf8c6' : '#f1f0f0',
        marginVertical: 4,
        padding: 10,
        borderRadius: 10,
        maxWidth: '85%',
      }}
    >
      {lines.map((line, i) => {
        const isLink = line.startsWith('http');
        const isImage = line.match(/\.(jpg|jpeg|png|webp)$/i);
        console.log("📦 Chat line:", line);

        if (isImage) {
            return (
                <Image
                key={i}
                source={{ uri: line }}
                style={{ width: 150, height: 150, borderRadius: 8, marginVertical: 5 }}
                resizeMode="cover"
                />
            );
        }
        else if (isLink) {
          return (
            <Button
              key={i}
              title="Buy Now"
              color="#007aff"
              onPress={() => Linking.openURL(line)}
            />
          );
        } else {
          return (
            <Text key={i} style={{ color: '#000', marginBottom: 4 }}>
              {line}
            </Text>
          );
        }
      })}
    </View>
  );
}
