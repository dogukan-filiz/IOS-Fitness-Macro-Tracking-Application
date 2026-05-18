import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { setToken } from '../utils/storage';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { API_BASE } from '../config/api';

async function fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 12000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogin, setDebugLogin] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Macro Tracker</Text>
        <Text style={styles.subtitle}>Hoş geldiniz, devam etmek için giriş yapın.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="ornek@mail.com"
          placeholderTextColor="#6b7280"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#6b7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            setError(null);
            setLoading(true);
            try {
              const res = await fetchWithTimeout(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                timeoutMs: 12000,
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error || 'Giriş başarısız');
              } else {
                // show debug info about token
                setDebugLogin(JSON.stringify(data));
                // token sakla using SecureStore
                try {
                  await setToken(data.token);
                  const read = await (await import('../utils/storage')).getToken();
                  console.log('Stored token read back:', read);
                  setDebugLogin(prev => (prev ? prev + '\nStored:' + read : 'Stored:' + read));
                } catch (e) {
                  console.warn('Token kaydedilemedi', e);
                  setDebugLogin(prev => (prev ? prev + '\nSaveError' : 'SaveError'));
                }
                navigation.replace('Root');
              }
            } catch (e) {
              if ((e as any)?.name === 'AbortError') {
                setError('İstek zaman aşımına uğradı. Telefon ve bilgisayar aynı Wi‑Fi’da mı? API adresi doğru mu?');
              } else {
                setError('Sunucu ile bağlantı kurulamadı. Telefon ve bilgisayar aynı ağda olmalı.');
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <ActivityIndicator color="#022c22" /> : <Text style={styles.primaryButtonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    color: '#f9fafb',
    backgroundColor: '#020617',
    marginBottom: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#38bdf8',
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: '#f87171',
    textAlign: 'center',
  },
});
