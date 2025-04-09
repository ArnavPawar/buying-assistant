import React, { useState } from 'react';
import { View, TextInput, Button, ScrollView, Text, Linking } from 'react-native';
import { parseUserQuery } from './utils/gptParser';
import { fetchAmazonProducts } from './utils/amazonAPI';
import { searchEbayProducts } from './utils/ebayAPI';
import { saveChat, ChatMessage } from './utils/supabaseChats';
import { runDebugInsert } from './utils/debugInsert';


type Product = {
  title: string;
  price: string;
  rating: string;
  link: string;
};

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [platform, setPlatform] = useState<'amazon' | 'ebay'>('ebay');
  const [chatMessage, setChatMessage] = useState('');

  const handleRefresh = () => {
    console.log("🔁 Refreshing app state...");
    setQuery('');
    setResults([]);
    setError(false);
    setLoading(false);
    setChatMessage('');
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(false);
    setResults([]);
    setChatMessage('');

    try {
      console.log("🔍 Search started...");
      console.log("📨 User query:", query);

      const parsed = await parseUserQuery(query);
      console.log("🧠 GPT Parsed Response:", parsed);

      const message = parsed.message || '';
      const productTitles = parsed.products || parsed;

      setChatMessage(message);

      const chatHistory: ChatMessage[] = [
        { sender: 'user', text: query },
        { sender: 'bot', text: message },
      ];
      await saveChat(`Search: ${query}`, chatHistory);

      let products: Product[] = [];

      if (platform === 'amazon') {
        console.log("📦 Fetching products from Amazon...");
        products = await fetchAmazonProducts({
          keywords: productTitles.join(", "),
          priceMax: 999,
          category: ''
        });
      } else if (platform === 'ebay') {
        console.log("📦 Fetching products from eBay...");
        const queryString = Array.isArray(productTitles) ? productTitles.join(" ") : query;
        products = await searchEbayProducts(queryString);
      }

      if (!products || products.length === 0) throw new Error("No products found");

      console.log("✅ Products fetched:", products.length, "items");
      setResults(products);
    } catch (err) {
      console.error("❌ Error during search:", err);
      setError(true);
    }

    setLoading(false);
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
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Button
          title="Amazon"
          color={platform === "amazon" ? "#007aff" : "#ccc"}
          onPress={() => setPlatform("amazon")}
        />
        <Button
          title="🔄 Refresh"
          color="#007aff"
          onPress={handleRefresh}
        />
        <Button
          title="eBay"
          color={platform === "ebay" ? "#007aff" : "#ccc"}
          onPress={() => setPlatform("ebay")}
        />
        <Button
          title="🧪 Test DB Insert"
          color="#34c759"
          onPress={() => {
            console.log("🧪 Running debug insert...");
            runDebugInsert();
          }}
        />

      </View>

      <Button title="Search" onPress={handleSearch} />

      <ScrollView style={{ marginTop: 20 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>⏳ Loading...</Text>
        ) : error ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#888', marginBottom: 10 }}>
              😕 Couldn't find any products.
            </Text>
            <Button title="Try Again" onPress={handleSearch} />
          </View>
        ) : results.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            Start by searching above ⬆️
          </Text>
        ) : (
          <>
            {chatMessage !== '' && (
              <View style={{
                marginBottom: 20,
                padding: 10,
                backgroundColor: '#f1f1f1',
                borderRadius: 8
              }}>
                <Text style={{ fontStyle: 'italic', color: '#333' }}>
                  🧠 {chatMessage}
                </Text>
              </View>
            )}

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
                <Text style={{ marginBottom: 8 }}>{item.rating}</Text>

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
          </>
        )}
      </ScrollView>
    </View>
  );
}
