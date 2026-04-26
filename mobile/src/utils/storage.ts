import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
