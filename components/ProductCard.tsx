import React from 'react';
import { View, Text, Button, Linking } from 'react-native';
import { Product } from '../screens/ChatScreen';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <View
      style={{
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{product.title}</Text>
      <Text style={{ marginBottom: 4 }}>{product.price}</Text>
      <Text style={{ marginBottom: 8 }}>{product.rating}</Text>
      <Button title="Buy Now" onPress={() => Linking.openURL(product.link)} />
    </View>
  );
}
