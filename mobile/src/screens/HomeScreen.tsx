import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { getToken, removeToken } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
        (async () => {
          try {
            const token = await getToken();
            if (!token) return setLoading(false);
            const res = await fetch(`${API_BASE}/api/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return setLoading(false);
            const data = await res.json();
            setUser(data.user || null);
          } catch (e) {
            console.warn('Profile fetch error', e);
          } finally {
            setLoading(false);
          }
        })();
  }, []);

      async function handleLogout() {
        await removeToken();
        // reset navigation to Login so user can't go back to protected screens
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.title}>Ana Panel</Text>
          {user ? (
            <Text style={styles.subtitle}>Hoşgeldin, {user.name} ({user.email})</Text>
          ) : (
            <Text style={styles.subtitle}>Giriş yapılmadı.</Text>
          )}
          <View style={{ marginTop: 20 }}>
            <Button title="Çıkış Yap" onPress={handleLogout} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});
