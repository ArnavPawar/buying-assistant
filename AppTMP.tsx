
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, ScrollView, Text, Linking, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { parseUserQuery } from './utils/gptParser';
import { fetchAmazonProducts } from './utils/amazonAPI';
import { searchEbayProducts } from './utils/ebayAPI';
import { saveChat, ChatMessage, loadRecentChats, deleteChatById } from './utils/supabaseChats';
import { Buffer } from 'buffer';
import { supabase } from './lib/supabase';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';


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
    setQuery('');
    setResults([]);
    setError(false);
    setLoading(false);
    setChatMessage('');
    setSelectedChatId(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChatById(chatId);
    const updated = await loadRecentChats();
    setChats(updated);
    if (selectedChatId === chatId) handleRefresh();
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(false);
    setResults([]);
    setChatMessage('');
  
    try {
      const parsed = await parseUserQuery(query);
      const message = parsed.message || '';
      const productTitles = parsed.products || parsed;
  
      const products = platform === 'amazon'
        ? await fetchAmazonProducts({ keywords: productTitles.join(", "), priceMax: 999, category: '' })
        : await searchEbayProducts(productTitles);
  
      if (!products || products.length === 0) throw new Error("No products found");
  
      const productList = products.map((p, idx) =>
        `${idx + 1}. ${p.title} - ${p.price}\n${p.link}`
      ).join('\n\n');
  
      const newMessages: ChatMessage[] = [
        { sender: 'user', text: query },
        { sender: 'bot', text: message },
        { sender: 'bot', text: productList }
      ];
  
      let updatedMessages = newMessages;
  
      if (selectedChatId && selectedChatId !== 'none') {
        const currentChat = chats.find(chat => chat.id.toString() === selectedChatId);
        if (currentChat) {
          updatedMessages = [...currentChat.messages, ...newMessages];
          await supabase
            .from('Chats')
            .update({ messages: updatedMessages })
            .eq('id', selectedChatId);
        }
      } else {
        await saveChat(`Search: ${query}`, newMessages);
      }
  
      const refreshed = await loadRecentChats();
      setChats(refreshed);
  
      if (selectedChatId) {
        const refreshedChat = refreshed.find(c => c.id.toString() === selectedChatId);
        if (refreshedChat) {
          setSelectedChatId(refreshedChat.id.toString());
        }
      }
  
      if (!selectedChatId || selectedChatId === 'none') {
        const lastChat = refreshed[0];
        if (lastChat) {
          setSelectedChatId(lastChat.id.toString());
        }
      }
  
      setChatMessage(message);
      setResults(products);
  
    } catch (err) {
      console.error("❌ Error during search:", err);
      setError(true);
    }
  
    setLoading(false);
  };
  
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
          <Picker
            selectedValue={selectedChatId ?? 'none'}
            onValueChange={(value: string) => {
              const selected = chats.find(chat => chat.id.toString() === value);
              if (selected) {
                setQuery('');
                setChatMessage('');
                setSelectedChatId(value);
              }
            }}>
            <Picker.Item label="➕ New Chat" value="none" />
            {chats.map(chat => (
              <Picker.Item key={chat.id} label={chat.name} value={chat.id.toString()} />
            ))}
          </Picker>

          {selectedChatId && selectedChatId !== 'none' && (
            <Button title="❌ Delete Chat" color="red" onPress={() => handleDeleteChat(selectedChatId)} />
          )}

          <TextInput
            placeholder="Ask for a product..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            style={{ borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', color: '#000', padding: 10, marginBottom: 10, borderRadius: 8, fontSize: 16 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Button title="Amazon" color={platform === 'amazon' ? '#007aff' : '#ccc'} onPress={() => setPlatform('amazon')} />
            <Button title="🔄 Refresh" color="#007aff" onPress={handleRefresh} />
            <Button title="eBay" color={platform === 'ebay' ? '#007aff' : '#ccc'} onPress={() => setPlatform('ebay')} />
          </View>

          <Button title="Search" onPress={handleSearch} />

          <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {selectedChatId !== 'none' && selectedChatId && chats.find(c => c.id.toString() === selectedChatId)?.messages.map((msg, index) => (
              <View
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#f1f0f0',
                  marginVertical: 4,
                  padding: 10,
                  borderRadius: 10,
                  maxWidth: '85%',
                }}
              >
                {/* Handle link display inside bot messages */}
                {msg.text.split('\n').map((line, i) => (
                  <Text
                    key={i}
                    style={{ color: line.startsWith('http') ? 'blue' : '#000' }}
                    onPress={() => {
                      if (line.startsWith('http')) Linking.openURL(line);
                    }}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>


        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
