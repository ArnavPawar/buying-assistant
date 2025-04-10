import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, ScrollView, Text, Linking, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { parseUserQuery } from './utils/gptParser';
import { fetchAmazonProducts } from './utils/amazonAPI';
import { searchEbayProducts } from './utils/ebayAPI';
import { saveChat, ChatMessage, loadRecentChats, deleteChatById } from './utils/supabaseChats';
import { Buffer } from 'buffer';
import { Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform} from 'react-native';


global.Buffer = Buffer;

type Chat = {
  id: string;
  name: string;
  messages: ChatMessage[];
};

type Product = {
  title: string;
  price: string;
  rating: string;
  link: string;
};

type ChatEntry = {
  id: number;
  name: string;
  messages: ChatMessage[];
};

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [platform, setPlatform] = useState<'amazon' | 'ebay'>('ebay');
  const [chatMessage, setChatMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      const loaded = await loadRecentChats();
      setChats(loaded);
    })();
  }, []);

  const handleRefresh = () => {
    console.log("🔁 Refreshing app state...");
    setQuery('');
    setResults([]);
    setError(false);
    setLoading(false);
    setChatMessage('');
    setSelectedChatId(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    const parsedId = Number(chatId);
    if (isNaN(parsedId)) {
      Alert.alert("Invalid chat ID");
      return;
    }
  
    await deleteChatById(String(parsedId));
    const updated = await loadRecentChats();
    setChats(updated);
  
    if (selectedChatId === chatId) {
      handleRefresh();
    }
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
      const updated = await loadRecentChats();
      setChats(updated);

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
        products = await searchEbayProducts(productTitles);
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 0, paddingTop: 0 }}>
      <Picker
        selectedValue={selectedChatId ?? 'none'}
        onValueChange={(value: string) => {
          const selected = chats.find(chat => chat.id.toString() === value);
          if (selected) {
            setQuery(selected.messages.find(m => m.sender === 'user')?.text || '');
            setChatMessage(selected.messages.find(m => m.sender === 'bot')?.text || '');
            setSelectedChatId(value);
          }
        }}
      >
        <Picker.Item label="➕ New Chat" value="none" />
        {chats.map(chat => (
          <Picker.Item key={chat.id} label={chat.name} value={chat.id.toString()} />
        ))}
      </Picker>

      {selectedChatId && selectedChatId !== 'none' && (
          <Button
            title="❌ Delete Chat"
            color="red"
            onPress={() => handleDeleteChat(selectedChatId)}
          />
        )}

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
        <Button title="Amazon" color={platform === "amazon" ? "#007aff" : "#ccc"} onPress={() => setPlatform("amazon")} />
        <Button title="🔄 Refresh" color="#007aff" onPress={handleRefresh} />
        <Button title="eBay" color={platform === "ebay" ? "#007aff" : "#ccc"} onPress={() => setPlatform("ebay")} />
      </View>

      <Button title="Search" onPress={handleSearch} />

      <ScrollView style={{ marginTop: 20 }}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>⏳ Loading...</Text>
        ) : error ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#888', marginBottom: 10 }}>😕 Couldn't find any products.</Text>
            <Button title="Try Again" onPress={handleSearch} />
          </View>
        ) : results.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>Start by searching above ⬆️</Text>
        ) : (
          <>
            {chatMessage !== '' && (
              <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#f1f1f1', borderRadius: 8 }}>
                <Text style={{ fontStyle: 'italic', color: '#333' }}>🧠 {chatMessage}</Text>
              </View>
            )}
            {results.map((item, idx) => (
              <View
                key={idx}
                style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{item.title}</Text>
                <Text style={{ marginBottom: 4 }}>{item.price}</Text>
                <Text style={{ marginBottom: 8 }}>{item.rating}</Text>
                <View style={{ alignSelf: 'flex-start' }}>
                  <Button title="Buy Now" onPress={() => Linking.openURL(item.link)} />
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
  );
}
