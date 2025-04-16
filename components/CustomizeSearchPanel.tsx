import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card, Divider, Switch, TextInput } from 'react-native-paper';
import Slider from '@react-native-community/slider';

export default function CustomizeSearchPanel({ onApply }: { onApply?: () => void }) {
  const [priceRange, setPriceRange] = useState(50);
  const [includeFreeShipping, setIncludeFreeShipping] = useState(false);
  const [category, setCategory] = useState('');

  return (
    <View style={styles.container}>
      <Card style={styles.panel}>
        <Card.Content>
          <Text style={styles.label}>Max Price: ${priceRange}</Text>
          <Slider
            minimumValue={0}
            maximumValue={500}
            step={5}
            value={priceRange}
            onValueChange={setPriceRange}
            style={{ marginBottom: 16 }}
          />

          <Divider style={{ marginVertical: 10 }} />

          <View style={styles.row}>
            <Text style={styles.label}>Free Shipping</Text>
            <Switch
              value={includeFreeShipping}
              onValueChange={setIncludeFreeShipping}
            />
          </View>

          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={{ marginTop: 16 }}
          />

          <Button mode="contained" onPress={onApply} style={{ marginTop: 20 }}>
            Apply
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  panel: {
    marginTop: 12,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});