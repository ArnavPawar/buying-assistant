import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Switch, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<{ email: string; name?: string; id: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        const { id, email, user_metadata } = user;
        setProfile({
          id,
          email: email ?? '',
          name: `${user_metadata?.first_name ?? ''} ${user_metadata?.last_name ?? ''}`.trim(),
        });

        // Load dark mode from Profiles table
        const { data: profileData } = await supabase
          .from('Profiles')
          .select('dark_mode')
          .eq('id', id)
          .single();

        if (profileData) {
          setDarkMode(profileData.dark_mode);
        }
      }
    };

    loadSettings();
  }, []);

  const toggleDarkMode = async () => {
    if (!profile) return;
    const newValue = !darkMode;
    setDarkMode(newValue);

    await supabase
      .from('Profiles')
      .update({ dark_mode: newValue })
      .eq('id', profile.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <Button mode="outlined" onPress={handleLogout} style={{ marginTop: 40 }}>
          Log Out
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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