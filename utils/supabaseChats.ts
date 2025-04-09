import { supabase } from '../lib/supabase';

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
};

export const saveChat = async (name: string, messages: ChatMessage[]) => {
    console.log("🧪 Saving chat with name:", name);
    console.log("🧪 Messages:", messages);
  
    const { error } = await supabase.from("Chats").insert([
      { name, messages }
    ]);
  
    if (error) {
      console.error("❌ Supabase insert error:", error.message);
    } else {
      console.log("✅ Chat saved successfully");
    }
  };
  
  
  

export const loadRecentChats = async () => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Load failed:', error);
    return [];
  }

  return data;
};
