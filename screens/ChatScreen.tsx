import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
  Text,
  TouchableOpacity
} from 'react-native';
import { fetchAmazonProducts } from '../utils/amazonAPI';
import { searchEbayProducts } from '../utils/ebayAPI';
import { parseUserQuery } from '../utils/gptParser';
import { supabase } from '../lib/supabase';
import { saveChat, loadRecentChats, deleteChatById, ChatMessage } from '../utils/supabaseChats';
import ChatBubble from '../components/ChatBubble';
import { IconButton, Button, TextInput as PaperInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useRoute } from '@react-navigation/native';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

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

export default function ChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute(); // access route params
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<'amazon' | 'ebay'>('ebay');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  useEffect(() => {
    (async () => {
      const loaded = await loadRecentChats();
      setChats(loaded);
  
      // If the Home screen passed in a chatId
      const chatIdFromRoute = (route.params as any)?.chatId;

      if (chatIdFromRoute === null) {
        handleNewChat(); // 👈 this will trigger the new chat
      } else if (chatIdFromRoute) {
        setSelectedChatId(chatIdFromRoute);
      } else if (loaded.length > 0) {
        setSelectedChatId(loaded[0].id.toString());
      }
    })();
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', scrollToEnd);
    return () => showSubscription.remove();
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 99999, animated: true });
    }, 10);
  };

  const handleRefresh = () => {
    setQuery('');
    setLoading(false);
    setSelectedChatId(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChatById(chatId);
    const updated = await loadRecentChats();
    setChats(updated);
  
    if (selectedChatId === chatId) {
      if (updated.length > 0) {
        setSelectedChatId(updated[0].id.toString());
      } else {
        handleNewChat(); // only if no chats left
      }
    }
  };

  const handleNewChat = async () => {
    const newMessages: ChatMessage[] = [];
    await saveChat('', newMessages); // No name initially
    const refreshed = await loadRecentChats();
    setChats(refreshed);
    const latest = refreshed[0];
    if (latest) setSelectedChatId(latest.id.toString());
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
  
    const userMsg: ChatMessage = { sender: 'user', text: query };
    const loadingMsg: ChatMessage = { sender: 'bot', text: '⏳ Loading suggestions...' };
  
    let currentId = selectedChatId;
    let currentMessages: ChatMessage[] = [];
  
    if (!currentId) {
      const initialMessages = [userMsg, loadingMsg];
      const { data, error } = await saveChat('', initialMessages); // no name initially
      if (data && data.length > 0) {
        currentId = data[0].id.toString();
        setSelectedChatId(currentId);
        currentMessages = initialMessages;
      }
    } else {
      const currentChat = chats.find(chat => chat.id.toString() === currentId);
      currentMessages = currentChat?.messages || [];
      const updatedMessages = [...currentMessages, userMsg, loadingMsg];
  
      await supabase.from('Chats').update({
        messages: updatedMessages,
        name: currentChat?.name || query.slice(0, 25),
      }).eq('id', currentId);
      currentMessages = updatedMessages; // carry forward for final update
    }
  
    const refreshedBefore = await loadRecentChats();
    setChats(refreshedBefore);
    scrollToEnd();
    setLoading(true);
  
    try {
      const parsed = await parseUserQuery(query);
      const message = parsed.message || '';
      const productTitles = parsed.products || parsed;
  
      const products = platform === 'amazon'
        ? await fetchAmazonProducts({ keywords: productTitles.join(", "), priceMax: 999, category: '' })
        : await searchEbayProducts(productTitles);
  
      if (!products || products.length === 0) throw new Error("No products found");
  
      const productList = products.map((p, idx) =>
        `${idx + 1}. ${p.title}\n${p.price}\n${p.link}\n${p.image}`
      ).join('\n\n');
  
      const botMessages: ChatMessage[] = [
        { sender: 'bot', text: message },
        { sender: 'bot', text: productList }
      ];
  
      const finalMessages = currentMessages.slice(0, -1).concat(botMessages); // replace loading with output
  
      if (currentId) {
        await supabase.from('Chats').update({ messages: finalMessages }).eq('id', currentId);
      }
  
      const refreshed = await loadRecentChats();
      setChats(refreshed);
      scrollToEnd();
    } catch (err) {
      console.error("❌ Error during search:", err);
    }
  
    setLoading(false);
    setQuery('');
  };

  const messages = selectedChatId && chats.find(c => c.id.toString() === selectedChatId)?.messages || [];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 40, paddingBottom: 10 }}>
            <IconButton icon="menu" onPress={() => setShowChatMenu(prev => !prev)} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.primary }}>
                ShopGPT
              </Text>
            </TouchableOpacity>
            <IconButton icon="plus" onPress={handleNewChat} />
          </View>

          {/* Chat menu */}
          {showChatMenu && (
            <View style={{ position: 'absolute', top: 80, left: 10, right: 10, backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 5, zIndex: 10 }}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {chats.filter(chat => chat.name).map(chat => (
                  <View key={chat.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                      setSelectedChatId(chat.id.toString());
                      setShowChatMenu(false);
                      setTimeout(scrollToEnd, 200);
                    }}>
                      <Text>{chat.name}</Text>
                    </TouchableOpacity>
                    <IconButton icon="pencil" onPress={() => {}} />
                    <IconButton icon="delete" iconColor="red" onPress={() => handleDeleteChat(chat.id)} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat content scrollable */}
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => <ChatBubble message={item} />}
              contentContainerStyle={{ padding: 10, paddingBottom: 110 }}
              keyboardShouldPersistTaps="handled"
            />
          </View>

          {/* Input and controls */}
          <View style={{ backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderColor: '#ccc' }}>
            <PaperInput
              placeholder="Ask for a product..."
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              mode="outlined"
              style={{ marginBottom: 8 }}
              right={<PaperInput.Icon icon="send" onPress={handleSearch} />}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12 }}>
              <Button mode={platform === 'amazon' ? 'contained' : 'outlined'} onPress={() => setPlatform('amazon')}>Amazon</Button>
              <Button mode={platform === 'ebay' ? 'contained' : 'outlined'} onPress={() => setPlatform('ebay')}>eBay</Button>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
