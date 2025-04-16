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
  TouchableOpacity,
  Alert,
  StyleSheet
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
import { TextInput as RNTextInput } from 'react-native';
import ProductDetailModal from '../components/ProductDetailModal';
import CustomizeSearchPanel from '../components/CustomizeSearchPanel';
import ChatMenuDropdown from '../components/ChatMenuDropdown';

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

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatName, setEditingChatName] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [showCustomizePanel, setShowCustomizePanel] = useState(false);

  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    (async () => {
      const loaded = await loadRecentChats();
      setChats(loaded);
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

  const handleDeleteChat = async (chatId: string | number) => {
    await deleteChatById(chatId.toString());
    const updated = await loadRecentChats();
    setChats(updated);
    if (selectedChatId?.toString() === chatId.toString()) {
      await handleNewChat(); // now this will run correctly
    }
  };

  const handleRenameChat = async (chatId: string) => {
    Alert.prompt('Rename Chat', 'Enter new name for chat:', async (newName) => {
      if (!newName.trim()) return;
      await supabase.from('Chats').update({ name: newName.trim() }).eq('id', chatId);
      const refreshed = await loadRecentChats();
      setChats(refreshed);
    });
  };

  const handleNewChat = async () => {
    setSelectedChatId(null);  // Indicates a new, unsaved chat
    setQuery('');             // Clear input field
    setLoading(false);        // Reset loading spinner
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
  
    const userMsg: ChatMessage = { sender: 'user', text: query };
    const loadingMsg: ChatMessage = { sender: 'bot', text: '⏳ Loading suggestions...' };
  
    let currentId = selectedChatId;
    let currentMessages: ChatMessage[] = [];
  
    if (!currentId) {
      // Only create chat when user sends input
      const initialMessages = [userMsg, loadingMsg];
      const { data } = await saveChat(query.slice(0, 25), initialMessages); // set name here
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
        name: currentChat?.name?.trim() ? currentChat.name : query.slice(0, 25)
      }).eq('id', currentId);
  
      currentMessages = updatedMessages;
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
      ).join('\n');
  
      const botMessages: ChatMessage[] = [
        { sender: 'bot', text: message },
        { sender: 'bot', text: productList }
      ];
  
      const finalMessages = currentMessages.slice(0, -1).concat(botMessages); // replace loading with output
  
      if (currentId) {
        await supabase.from('Chats').update({
          messages: finalMessages
        }).eq('id', currentId);
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

          {showChatMenu && (
            <ChatMenuDropdown
              chats={chats}
              editingChatId={editingChatId}
              editingChatName={editingChatName}
              inputRef={inputRef}
              onEditNameChange={setEditingChatName}
              onEditNameSave={async (chatId) => {
                const trimmed = editingChatName.trim();
                if (trimmed) {
                  await supabase.from('Chats').update({ name: trimmed }).eq('id', chatId);
                  const refreshed = await loadRecentChats();
                  setChats(refreshed);
                }
                setEditingChatId(null);
                Keyboard.dismiss();
              }}
              onEditNameStart={(chatId, name) => {
                setEditingChatId(chatId);
                setEditingChatName(name);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              onDeleteChat={handleDeleteChat}
              onSelectChat={(chatId) => {
                setSelectedChatId(chatId);
                setShowChatMenu(false);
                setTimeout(scrollToEnd, 200);
              }}
            />
          )}

          {/* Chat content scrollable */}
          <View style={{ flex: 1 }}>
          <FlatList
              scrollEnabled={true}
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <ChatBubble
                  message={item}
                  onProductPress={(product) => {
                    setSelectedProduct(product);
                    setModalVisible(true);
                  }}
                />
              )}
              contentContainerStyle={{ padding: 10, paddingBottom: 110 }}
              keyboardShouldPersistTaps="handled"
            />
          </View>

          <ProductDetailModal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            product={selectedProduct}
            platform={platform}
          />
          {showCustomizePanel && (
              <CustomizeSearchPanel onApply={() => {
                console.log('Apply customization');
                setShowCustomizePanel(false); // optional: hide after apply
              }} />
            )}
          {/* Input and controls */}
    <View style={{
      backgroundColor: '#fff',
      padding: 10,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 8,
    }}>
    <PaperInput
      placeholder="Ask for a product..."
      placeholderTextColor="#888"
      value={query}
      onChangeText={setQuery}
      onSubmitEditing={handleSearch}
      mode="outlined"
      theme={{ roundness: 12 }}
      style={{ marginBottom: 8, backgroundColor: '#fff' }}
      right={<PaperInput.Icon icon="send" onPress={handleSearch} />}
    />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12 }}>
    <Button mode={platform === 'amazon' ? 'contained' : 'outlined'} onPress={() => setPlatform('amazon')}>Amazon</Button>
              <Button
                mode={showCustomizePanel ? 'contained' : 'outlined'}
                onPress={() => setShowCustomizePanel(prev => !prev)}
              >
                Customize
              </Button>
              <Button mode={platform === 'ebay' ? 'contained' : 'outlined'} onPress={() => setPlatform('ebay')}>eBay</Button>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({

  panel: {
    marginTop: 12,
    padding: 10,
    borderBottomLeftRadius: 20, // 👈 for visual flow
    borderBottomRightRadius: 20,
  }
});
