import React from 'react';
import { View, Text, Linking, Image, TouchableWithoutFeedback } from 'react-native';
import { Card, useTheme, Button } from 'react-native-paper';
import { ChatMessage } from '../utils/supabaseChats';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const lines = message.text.split('\n');
  const theme = useTheme();
  const userColor = (theme.colors as any)['userBubble'];
  const botColor = (theme.colors as any)['botBubble'];
  const textColor = (theme.colors as any)['text'];

  return (
    <TouchableWithoutFeedback>
      <Card
        style={{
          alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
          backgroundColor: message.sender === 'user' ? userColor : botColor,
          marginVertical: 4,
          padding: 10,
          borderRadius: 10,
          maxWidth: '85%',
        }}
      >
        <Card.Content>
          {lines.map((line, i) => {
            const isLink = line.startsWith('http');
            const isImage = line.match(/\.(jpg|jpeg|png|webp)$/i);

            if (isImage) {
              return (
                <Image
                  key={i}
                  source={{ uri: line }}
                  style={{
                    width: 160,
                    height: 160,
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
                  style={{ color: textColor, fontSize: 15, marginBottom: 4 }}
                >
                  {line}
                </Text>
              );
            }
          })}
        </Card.Content>
      </Card>
    </TouchableWithoutFeedback>
  );
}