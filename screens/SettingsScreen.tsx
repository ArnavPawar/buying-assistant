import React, { useEffect, useState } from 'react';
import { View, StyleSheet,Dimensions } from 'react-native';
import { Text, Button, Switch, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<{ email: string; name?: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const screenHeight = Dimensions.get('window').height

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { email, user_metadata } = session.user;
        setProfile({
            email: email ?? '',
            name: `${user_metadata?.first_name ?? ''} ${user_metadata?.last_name ?? ''}`.trim(),
        });
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { marginTop: screenHeight * 0.15 }]}>
      <Text style={styles.header}>⚙️ Settings</Text>

      {profile && (
        <View style={styles.profileBox}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
          {profile.name && (
            <>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{profile.name}</Text>
            </>
          )}
        </View>
      )}

      <Divider style={{ marginVertical: 20 }} />

      <View style={styles.toggleRow}>
        <Text>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 40 }}>
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileBox: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});