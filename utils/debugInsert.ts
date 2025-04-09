// utils/debugInsert.ts
import { supabase } from "../lib/supabase";

export const runDebugInsert = async () => {
  const dummyChat = {
    name: "Test Chat",
    messages: [
      { sender: "user", text: "Hello" },
      { sender: "bot", text: "Hi there! Welcome to the assistant." },
    ],
  };

  const { data, error, status } = await supabase
    .from("Chats")
    .insert([dummyChat])
    .select();

  if (error) {
    console.error("❌ Debug Insert Error:", error.message, status);
  } else {
    console.log("✅ Debug Insert Success:", data);
  }
};
