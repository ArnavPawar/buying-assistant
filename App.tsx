import React, { useState } from 'react';
import { View, TextInput, Button, ScrollView, Text } from 'react-native';
import { parseUserQuery } from './utils/gptParser';
import { fetchAmazonProducts } from './utils/amazonAPI';

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
          <View key={idx} style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.price}</Text>
            <Text>⭐ {item.rating}</Text>
            <Text>{item.link}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
