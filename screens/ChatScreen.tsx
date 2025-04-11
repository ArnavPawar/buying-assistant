// ChatScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, ScrollView, Text, Linking, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { fetchAmazonProducts } from '../utils/amazonAPI';
import { searchEbayProducts } from '../utils/ebayAPI';
import { parseUserQuery } from '../utils/gptParser';
import { supabase } from '../lib/supabase';
import { saveChat, loadRecentChats, deleteChatById, ChatMessage } from '../utils/supabaseChats';
import ChatBubble from '../components/ChatBubble';
import ChatPicker from '../components/ChatPicker';

export type Chat = {
  id: string;
  name: string;
  messages: ChatMessage[];
};

export type Product = {
  title: string;
  price: string;
  rating: string;
  link: string;
  image: string;
};

type Props = {
    goHome: () => void;
  };

export default function ChatScreen({ goHome }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [platform, setPlatform] = useState<'amazon' | 'ebay'>('ebay');
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

    try {
      const parsed = await parseUserQuery(query);
      const message = parsed.message || '';
      const productTitles = parsed.products || parsed;

      const products = platform === 'amazon'
        ? await fetchAmazonProducts({ keywords: productTitles.join(", "), priceMax: 999, category: '' })
        : await searchEbayProducts(productTitles);

      if (!products || products.length === 0) throw new Error("No products found");

      const productList = products.map((p, idx) =>
        `${idx + 1}. ${p.title}\n${p.price}\n${p.link}\n${p.image}` // include the image URL
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
          await supabase.from('Chats').update({ messages: updatedMessages }).eq('id', selectedChatId);
        }
      } else {
        await saveChat(`Search: ${query}`, newMessages);
      }

      const refreshed = await loadRecentChats();
      setChats(refreshed);

      if (!selectedChatId || selectedChatId === 'none') {
        const lastChat = refreshed[0];
        if (lastChat) {
          setSelectedChatId(lastChat.id.toString());
        }
      }

      setResults(products);
      console.log("✅ Products received:", products);

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

          <ChatPicker
            chats={chats}
            selectedChatId={selectedChatId}
            onSelect={(value) => {
              const selected = chats.find(chat => chat.id.toString() === value);
              if (selected) {
                setQuery('');
                setSelectedChatId(value);
              }
            }}
          />

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
            <Button title="Home" onPress={goHome} />
            <Button title="eBay" color={platform === 'ebay' ? '#007aff' : '#ccc'} onPress={() => setPlatform('ebay')} />
          </View>

          <Button title="Search" onPress={handleSearch} />

          <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {selectedChatId !== 'none' && selectedChatId && chats.find(c => c.id.toString() === selectedChatId)?.messages.map((msg, index) => (
              <ChatBubble key={index} message={msg} />
            ))}
          </ScrollView>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
