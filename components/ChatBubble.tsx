import React from 'react';
import { View, Text, Linking, Image, TouchableWithoutFeedback } from 'react-native';
import { Card, useTheme, Button } from 'react-native-paper';
import { ChatMessage } from '../utils/supabaseChats';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const lines = message.text.split('\n');
  const theme = useTheme();
  const userColor = (theme.colors as any)['userBubble'];
  const textColor = (theme.colors as any)['text'];

  if (message.sender === 'user') {
    return (
      <Card
        style={{
          alignSelf: 'flex-end',
          backgroundColor: userColor,
          marginVertical: 4,
          padding: 10,
          borderRadius: 10,
          maxWidth: '85%',
        }}
      >
        <Card.Content>
          {lines.map((line, i) => (
            <Text key={i} style={{ color: textColor, fontSize: 15, marginBottom: 4 }}>
              {line}
            </Text>
          ))}
        </Card.Content>
      </Card>
    );
  }

  // Bot message
  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <View
        pointerEvents="auto"
        style={{
          marginVertical: 8,
          paddingHorizontal: 10,
          width: '100%',
        }}
      >
        {lines.map((line, i) => {
          const isLink = line.startsWith('http');
          const isImage = line.match(/\.(jpg|jpeg|png|webp)$/i);

          if (isImage) {
            return (
              <Image
                key={i}
                source={{ uri: line }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  marginVertical: 6,
                }}
                resizeMode="cover"
              />
            );
          } else if (isLink) {
            return (
              <Button
                key={i}
                mode="contained"
                icon="cart"
                onPress={() => Linking.openURL(line)}
                style={{ marginVertical: 6, alignSelf: 'flex-start' }}
                labelStyle={{ color: '#fff' }}
              >
                Buy Now
              </Button>
            );
          } else {
            return (
              <Text
                key={i}
                style={{
                  color: textColor,
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                {line}
              </Text>
            );
          }
        })}
      </View>
    </TouchableWithoutFeedback>
  );
}