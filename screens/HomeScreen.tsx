import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Share,
  TouchableOpacity,
  Text as RNText,
  findNodeHandle,
  UIManager,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  useTheme,
  Modal,
  Portal,
  IconButton,
  Menu
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadRecentChats } from '../utils/supabaseChats';
import type { RootStackParamList } from '../App';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

type Chat = {
  id: string;
  name: string;
  messages: any[];
};

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const buttonRef = useRef<View>(null);
  const [anchorCoords, setAnchorCoords] = useState<{ x: number; y: number } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (menuVisible && buttonRef.current) {
      setTimeout(() => {
        const handle = findNodeHandle(buttonRef.current);
        if (handle) {
          UIManager.measure(handle, (_x, _y, _w, h, px, py) => {
            setAnchorCoords({ x: px, y: py + h });
          });
        }
      }, 10);
    }
  }, [menuVisible]);

  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-10);
    }
  }, [menuVisible]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchChats = async () => {
        const loaded = await loadRecentChats();
        setChats(loaded);
      };
      fetchChats();
    }, [])
  );

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: '🛍️ Check out ShopGPT – your AI shopping assistant! https://yourapp.com',
      });
      if (result.action === Share.sharedAction && result.activityType) {
        console.log('Shared with activity type:', result.activityType);
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Welcome to ShopGPT 🛍️</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.subtitle}>What would you like to do?</Text>

            <Button
              mode="contained"
              icon="magnify"
              style={styles.button}
              onPress={() => navigation.navigate('Chat', { chatId: null })}
            >
              Start a New Search
            </Button>

            <View ref={buttonRef}>
              <Button
                mode="outlined"
                icon="chat"
                style={styles.button}
                onPress={() => setMenuVisible(true)}
              >
                View My Chats
              </Button>
            </View>

            {anchorCoords && menuVisible && (
        <View
          style={[
            styles.triangle,
            {
              position: 'absolute',
              left: anchorCoords.x + 70, // adjust to center under button
              top: anchorCoords.y - 8,   // place just above the menu
              zIndex: 1000,
            },
          ]}
        />
      )}

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={anchorCoords || { x: 0, y: 0 }}
          contentStyle={styles.menuContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {chats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                {index !== 0 && <View style={styles.menuSeparator} />}
                <Menu.Item
                  title={chat.name}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('Chat', { chatId: chat.id.toString() });                  }}
                  titleStyle={styles.menuItem}
                />
              </React.Fragment>
            ))}
          </Animated.View>
        </Menu>

            <Button
              mode="outlined"
              icon="cog"
              style={styles.button}
              onPress={() => navigation.navigate('Settings')}
            >
              Settings
            </Button>

            <Button
              mode="text"
              icon="share-variant"
              style={[styles.button, { marginTop: 16 }]}
              onPress={handleShare}
            >
              Share the App
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.infoRow}>
          <Card style={styles.infoBox} onPress={() => setVisible(true)}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text style={styles.infoTitle}>How ShopGPT Works❓</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.infoBox, { justifyContent: 'center' }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text style={[styles.infoTitle, { marginBottom: 4 }]}>Rating of 4.8/5 🌟s</Text>
              <Text style={{ fontSize: 15, color: '#666', textAlign: 'center' }}>
                A simple shopping tool. Please Rate!
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
          <ScrollView style={{ maxHeight: 300 }}>
            <Text style={styles.modalTitle}>🧠 How ShopGPT Works</Text>
            <Text style={styles.modalText}>
              ShopGPT uses GPT to understand your product needs, then finds top listings from Amazon and eBay based on price, quality, and reviews.
              Soon, this section will include visuals and demos!
            </Text>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const boxWidth = screenWidth / 2 - 28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    marginTop: '25%',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    paddingVertical: 8,
  },
  button: {
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  infoBox: {
    width: boxWidth,
    height: boxWidth,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 24,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#333',
  },
  menuContent: {
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 200,
  },
  menuHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#888',
    paddingVertical: 4,
  },
  menuItem: {
    fontSize: 15,
    paddingVertical: 6,
  },
  triangle: {
    width: 10,
    height: 10,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    alignSelf: 'center',
    marginBottom: 8,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
    marginHorizontal: 8,
  },
});
