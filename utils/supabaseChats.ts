import { supabase } from '../lib/supabase';

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
};

export const saveChat = async (name: string, messages: ChatMessage[]) => {
  const { data: existingChats, error: fetchError } = await supabase
    .from('Chats')
    .select('id')
    .order('created_at', { ascending: true }); // oldest first

  if (fetchError) {
    console.error("❌ Error fetching chats:", fetchError);
    return;
  }

  if (existingChats && existingChats.length >= 5) {
    const oldestChatId = existingChats[0].id;
    await supabase.from('Chats').delete().eq('id', oldestChatId);
    console.log("🗑️ Oldest chat deleted to make room");
  }

  const { error } = await supabase.from('Chats').insert({
    name,
    messages,
  });

  if (error) {
    console.error("❌ Save failed:", error);
  } else {
    console.log("✅ Chat saved successfully");
  }
};
  

export const loadRecentChats = async () => {
  const { data, error } = await supabase
    .from('Chats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Load failed:', error);
    return [];
  }

  return data.map(chat => ({
    ...chat,
    messages: typeof chat.messages === 'string' ? JSON.parse(chat.messages) : chat.messages
  }));
};


export const deleteChatById = async (id: string) => {
  const { error } = await supabase.from('Chats').delete().eq('id', id);
  if (error) {
    console.error('❌ Delete failed:', error);
  } else {
    console.log('🗑️ Chat deleted');
  }
};

