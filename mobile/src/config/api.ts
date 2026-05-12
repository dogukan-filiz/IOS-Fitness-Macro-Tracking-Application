import { Platform } from 'react-native';

// Prefer an explicit env var so phones can reach your dev machine.
// Example (LAN):   EXPO_PUBLIC_API_BASE="http://192.168.1.29:4000"
// Example (ngrok): EXPO_PUBLIC_API_BASE="https://xxxx.ngrok-free.app"
const fromEnv = process.env.EXPO_PUBLIC_API_BASE;

export const API_BASE =
  fromEnv ||
  (Platform.OS === 'web'
    ? 'http://localhost:4000'
    : // Physical devices can't reach your computer via "localhost".
      'http://192.168.1.29:4000');
