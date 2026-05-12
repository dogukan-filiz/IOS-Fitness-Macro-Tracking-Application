import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type LocalProfile = {
  heightCm?: number;
  weightKg?: number;
  updatedAt?: string;
};

const PROFILE_KEY = 'local_profile_v1';

export async function setToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token === null) {
      localStorage.removeItem('token');
    } else {
      localStorage.setItem('token', token);
    }
  } else {
    if (token === null) {
      await SecureStore.deleteItemAsync('token');
    } else {
      await SecureStore.setItemAsync('token', token);
    }
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  return await SecureStore.getItemAsync('token');
}

export async function removeToken() {
  return setToken(null);
}

async function setItem(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
}

export async function setLocalProfile(profile: LocalProfile) {
  const payload: LocalProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await setItem(PROFILE_KEY, JSON.stringify(payload));
}

export async function getLocalProfile(): Promise<LocalProfile | null> {
  const raw = await getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearLocalProfile() {
  await setItem(PROFILE_KEY, null);
}
