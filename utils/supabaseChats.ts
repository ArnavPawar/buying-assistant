import { supabase } from '../lib/supabase';

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
};

export const saveChat = async (name: string, messages: ChatMessage[]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return { data: null, error: new Error("No user found") };

  const { data: existingChats, error: fetchError } = await supabase
    .from('Chats')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error("❌ Error fetching chats:", fetchError);
    return { data: null, error: fetchError };
  }

  if (existingChats && existingChats.length >= 5) {
    const oldestChatId = existingChats[0].id;
    await supabase.from('Chats').delete().eq('id', oldestChatId);
    console.log("🗑️ Oldest chat deleted to make room");
  }

  const { data, error } = await supabase
    .from('Chats')
    .insert({ name, messages, user_id: user.id })
    .select(); // 🔥 make sure to select so data is returned

  if (error) {
    console.error("❌ Save failed:", error);
    return { data: null, error };
  } else {
    console.log("✅ Chat saved successfully");
    return { data, error: null }; // ✅ return inserted row
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
