import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { IconButton, TextInput as PaperInput } from 'react-native-paper';
import { Chat } from '../screens/ChatScreen';

export default function ChatMenuDropdown({
  chats,
  editingChatId,
  editingChatName,
  inputRef,
  onEditNameChange,
  onEditNameSave,
  onEditNameStart,
  onDeleteChat,
  onSelectChat,
}: {
  chats: Chat[];
  editingChatId: string | null;
  editingChatName: string;
  inputRef: React.RefObject<any>;
  onEditNameChange: (name: string) => void;
  onEditNameSave: (chatId: string) => void;
  onEditNameStart: (chatId: string, name: string) => void;
  onDeleteChat: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
}) {
  return (
    <View style={styles.dropdown}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {chats.filter(chat => chat.name).map(chat => (
          <View key={chat.id} style={styles.chatRow}>
            {editingChatId === chat.id.toString() ? (
              <PaperInput
                ref={inputRef}
                value={editingChatName}
                onChangeText={onEditNameChange}
                style={styles.input}
                dense
                returnKeyType="done"
              />
            ) : (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => onSelectChat(chat.id.toString())}
              >
                <Text style={styles.chatName}>{chat.name}</Text>
              </TouchableOpacity>
            )}

            {editingChatId === chat.id.toString() ? (
              <IconButton icon="check" onPress={() => onEditNameSave(chat.id.toString())} />
            ) : (
              <IconButton
                icon="pencil"
                onPress={() => onEditNameStart(chat.id.toString(), chat.name)}
              />
            )}

            <IconButton icon="delete" iconColor="red" onPress={() => onDeleteChat(chat.id)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#fefefe',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  chatName: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
});
