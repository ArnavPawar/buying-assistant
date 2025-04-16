import React from 'react';
import { View, Text, Linking, Image, TouchableOpacity } from 'react-native';
import { Card, useTheme, Button } from 'react-native-paper';
import { ChatMessage } from '../utils/supabaseChats';
import type { Product } from '../screens/ChatScreen';

type Props = {
  message: ChatMessage;
  onProductPress?: (product: Product) => void;
};

export default function ChatBubble({ message, onProductPress }: Props) {
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

  // Bot message — attempt to parse products
  const products: Product[] = [];
  for (let i = 0; i < lines.length; i += 4) {
    const title = lines[i]?.replace(/^\d+\.\s*/, '') || '';
    const price = lines[i + 1] || '';
    const link = lines[i + 2] || '';
    const image = lines[i + 3] || '';
    if (title && price && link && image) {
      products.push({ title, price, rating: '', link, image });
    }
  }

  if (products.length > 0) {
    return (
      <View style={{ marginVertical: 8 }}>
        {products.map((product, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {  console.log('Tapped product:', product);

              onProductPress?.(product)}}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#f1f1f1',
              borderRadius: 10,
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: product.image }}
              style={{
                width: '100%',
                height: 180,
              }}
              resizeMode="cover"
            />
            <View style={{ padding: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{product.title}</Text>
              <Text style={{ color: '#555', marginBottom: 6 }}>{product.price}</Text>
              <Button
                icon="cart"
                mode="contained"
                onPress={() => Linking.openURL(product.link)}
              >
                Buy Now
              </Button>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Fallback — just show lines
  return (
    <View style={{ marginVertical: 8, paddingHorizontal: 10 }}>
      {lines.map((line, i) => (
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
      ))}
    </View>
  );
}