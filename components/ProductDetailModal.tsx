import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';
import { fetchAmazonProducts } from '../utils/amazonAPI';
import { searchEbayProducts } from '../utils/ebayAPI';
import type { Product } from '../screens/ChatScreen';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  product: Product | null;
  platform: 'amazon' | 'ebay';
};

export default function ProductDetailModal({ visible, onDismiss, product, platform }: Props) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!product || !visible) return;

    const fetchDetails = async () => {
      if (cacheRef.current.has(product.title)) {
        setDetails(cacheRef.current.get(product.title));
        return;
      }

      setLoading(true);
      try {
        const results =
          platform === 'amazon'
            ? await fetchAmazonProducts({ keywords: product.title, priceMax: 999, category: '' })
            : await searchEbayProducts([product.title]);

        const fullData = results[0]; // Assuming 1st result matches
        setDetails(fullData);
        cacheRef.current.set(product.title, fullData);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [product, visible]);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        {loading || !details ? (
          <ActivityIndicator />
        ) : (
          <ScrollView>
            <Image source={{ uri: details.image }} style={styles.image} />
            <Text style={styles.title}>{details.title}</Text>
            <Text>{details.price}</Text>
            <Text>{details.rating}</Text>
            <Text style={styles.link}>{details.link}</Text>
            <Button onPress={() => onDismiss()}>Close</Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  link: {
    color: 'blue',
    marginVertical: 10,
  },
});