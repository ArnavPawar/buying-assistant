import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { Chat } from '../screens/ChatScreen';

type ChatPickerProps = {
  chats: Chat[];
  selectedChatId: string | null;
  onSelect: (value: string) => void;
};

export default function ChatPicker({ chats, selectedChatId, onSelect }: ChatPickerProps) {
  return (
    <Picker selectedValue={selectedChatId ?? 'none'} onValueChange={onSelect}>
      <Picker.Item label="➕ New Chat" value="none" />
      {chats.map(chat => (
        <Picker.Item key={chat.id} label={chat.name} value={chat.id.toString()} />
      ))}
    </Picker>
  );
}
