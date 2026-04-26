import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [debugResp, setDebugResp] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
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
          {/* Debug info */}
          <Text style={{ marginTop: 12, color: '#9ca3af', fontSize: 12 }}>Debug token: {debugToken ?? 'null'}</Text>
          <Text style={{ marginTop: 6, color: '#9ca3af', fontSize: 12 }}>GET /api/me response: {debugResp ?? 'none'}</Text>
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
