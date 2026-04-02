import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';

export default function App() {
  return <AuthNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // koyu lacivert arka plan
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 16,
  },
  courseCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38bdf8',
  },
  courseTitle: {
    fontSize: 16,
    color: '#e5e7eb',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  infoText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
