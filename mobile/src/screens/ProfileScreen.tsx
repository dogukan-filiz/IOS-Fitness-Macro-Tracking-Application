import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getLocalProfile, setLocalProfile } from '../utils/storage';

export default function ProfileScreen() {
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getLocalProfile();
      if (p?.heightCm) setHeightCm(String(p.heightCm));
      if (p?.weightKg) setWeightKg(String(p.weightKg));
    })();
  }, []);

  const bmi = useMemo(() => {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!Number.isFinite(h) || !Number.isFinite(w)) return null;
    if (h <= 0 || w <= 0) return null;
    const m = h / 100;
    const v = w / (m * m);
    return Math.round(v * 10) / 10;
  }, [heightCm, weightKg]);

  async function handleSave() {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!Number.isFinite(h) || h < 80 || h > 250) {
      Alert.alert('Geçersiz boy', 'Boy değerini cm cinsinden gir (örn. 175).');
      return;
    }
    if (!Number.isFinite(w) || w < 20 || w > 300) {
      Alert.alert('Geçersiz kilo', 'Kilo değerini kg cinsinden gir (örn. 72).');
      return;
    }

    try {
      setSaving(true);
      await setLocalProfile({ heightCm: h, weightKg: w });
      Alert.alert('Kaydedildi', 'Boy ve kilo bilgilerin kaydedildi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Boy ve kilo bilgilerini buradan kaydedebilirsin.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Boy (cm)</Text>
        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="175"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Kilo (kg)</Text>
        <TextInput
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="72"
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.row}>
          <Text style={styles.muted}>BMI</Text>
          <Text style={styles.bmi}>{bmi ?? '-'}</Text>
        </View>

        <Pressable onPress={handleSave} style={[styles.primaryBtn, saving && { opacity: 0.7 }]} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muted: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  bmi: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
});
