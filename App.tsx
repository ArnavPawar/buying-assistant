import React, { useState } from 'react';
import { View, TextInput, Button, ScrollView, Text } from 'react-native';
import { parseUserQuery } from './utils/gptParser';
import { fetchAmazonProducts } from './utils/amazonAPI';
import { Linking } from 'react-native';

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      console.log("🔍 Search started...");
      console.log("📨 User query:", query);
  
      const parsed = await parseUserQuery(query);
      console.log("🧠 GPT Parsed Response:", parsed);
  
      console.log("📦 Fetching products from Amazon...");
      const products = await fetchAmazonProducts(parsed);
  
      console.log("✅ Products fetched:", products.length, "items");
      setResults(products);
    } catch (error) {
      console.error("❌ Error during search:", error);
    }
  };
  

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 }}>
      <TextInput
        placeholder="Ask for a product..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          backgroundColor: '#fff',
          color: '#000',
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          fontSize: 16,
        }}
      />
      <Button title="Search" onPress={handleSearch} />
      <ScrollView style={{ marginTop: 20 }}>
      {results.map((item, idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: 12,
            padding: 15,
            marginBottom: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
            {item.title}
          </Text>
          <Text style={{ marginBottom: 4 }}>{item.price}</Text>
          <Text style={{ marginBottom: 8 }}>⭐ {item.rating}</Text>

          <View style={{ alignSelf: 'flex-start' }}>
          <Button
              title="Buy Now"
              onPress={() => {
                console.log("Opening link:", item.link);
                Linking.openURL(item.link);
              }}
          />
          </View>
        </View>
      ))}
      </ScrollView>
    </View>
  );
}
