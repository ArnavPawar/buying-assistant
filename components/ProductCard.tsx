import React from 'react';
import { View, Linking, Image } from 'react-native';
import { Product } from '../screens/ChatScreen';
import { Card, Text, Button, useTheme } from 'react-native-paper';

export default function ProductCard({ product }: { product: Product }) {
  const theme = useTheme();

  return (
    <Card style={{ marginVertical: 10, borderRadius: 12, elevation: 3 }}>
      <Card.Cover source={{ uri: product.image }} style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <Card.Content style={{ paddingBottom: 0 }}>
        <Text variant="titleMedium" style={{ marginTop: 8, fontWeight: 'bold' }}>{product.title}</Text>
        <Text variant="bodyMedium" style={{ marginTop: 4 }}>{product.price}</Text>
        <Text variant="bodySmall" style={{ marginBottom: 8 }}>{product.rating}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => Linking.openURL(product.link)}>
          Buy Now
        </Button>
      </Card.Actions>
    </Card>
  );
}
