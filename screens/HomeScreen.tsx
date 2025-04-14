import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, Modal, Portal } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

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
              onPress={() => navigation.navigate('Chat')}
            >
              Start a New Search
            </Button>

            <Button
              mode="outlined"
              icon="chat"
              style={styles.button}
              onPress={() => navigation.navigate('Chat')}
            >
              View My Chats
            </Button>

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
              onPress={() => console.log('Share coming soon')}
            >
              Share the App
            </Button>
          </Card.Content>
        </Card>

        {/* Two Info Boxes Below */}
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
  infoText: {
    fontSize: 14,
    color: '#555',
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
});