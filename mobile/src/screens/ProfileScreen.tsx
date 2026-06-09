import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getLocalProfile, setLocalProfile } from '../utils/storage';
import InlineMessage from '../components/InlineMessage';
import {
  calculateCalorieRecommendation,
  type ActivityLevel,
  type CalorieResult,
  type Gender,
  type Goal,
} from '../utils/calorie';

const ACTIVITY_OPTIONS: Array<{ label: string; value: ActivityLevel }> = [
  { label: 'Sedanter / hareketsiz', value: 'sedentary' },
  { label: 'Hafif aktif', value: 'light' },
  { label: 'Orta aktif', value: 'moderate' },
  { label: 'Çok aktif', value: 'very' },
  { label: 'Ekstra aktif', value: 'extra' },
];

const GOAL_OPTIONS: Array<{ label: string; value: Goal; hint: string }> = [
  { label: 'Kilo vermek', value: 'lose', hint: 'TDEE - 500 kcal' },
  { label: 'Kiloyu korumak', value: 'maintain', hint: 'TDEE' },
  { label: 'Kilo almak', value: 'gain', hint: 'TDEE + 300 kcal' },
];

function formatKcal(n: number) {
  return `${Math.round(n)} kcal`;
}

export default function ProfileScreen() {
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getLocalProfile();
      if (p?.heightCm) setHeightCm(String(p.heightCm));
      if (p?.weightKg) setWeightKg(String(p.weightKg));
  if (p?.ageYears) setAgeYears(String(p.ageYears));
  if (p?.gender) setGender(p.gender);
  if (p?.activityLevel) setActivityLevel(p.activityLevel);
  if (p?.goal) setGoal(p.goal);
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
    const a = Number(ageYears);
    if (!Number.isFinite(h) || h < 100 || h > 250) {
      setMessage({ type: 'error', text: 'Boy 100–250 cm aralığında olmalı (örn. 175).' });
      return;
    }
    if (!Number.isFinite(w) || w < 20 || w > 300) {
      setMessage({ type: 'error', text: 'Kilo değerini kg cinsinden gir (örn. 72).' });
      return;
    }
    if (!Number.isFinite(a) || a < 10 || a > 100) {
      setMessage({ type: 'error', text: 'Yaş 10–100 aralığında olmalı.' });
      return;
    }
    if (!gender) {
      setMessage({ type: 'error', text: 'Lütfen cinsiyet seç.' });
      return;
    }
    if (!activityLevel) {
      setMessage({ type: 'error', text: 'Lütfen aktivite seviyesini seç.' });
      return;
    }
    if (!goal) {
      setMessage({ type: 'error', text: 'Lütfen hedefini seç.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      await setLocalProfile({ heightCm: h, weightKg: w, ageYears: a, gender, activityLevel, goal });
      const r = calculateCalorieRecommendation({
        heightCm: h,
        weightKg: w,
        ageYears: a,
        gender,
        activityLevel,
        goal,
      });
      setResult(r);
      setMessage({ type: 'success', text: 'Profil kaydedildi, kalori önerin aşağıda.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Kaydedilemedi. Lütfen tekrar dene.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Bilgilerini gir, günlük kalori önerini hesaplayalım.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bilgiler</Text>

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

          <Text style={[styles.label, { marginTop: 12 }]}>Yaş</Text>
          <TextInput
            value={ageYears}
            onChangeText={setAgeYears}
            placeholder="28"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.muted}>BMI</Text>
            <Text style={styles.bmi}>{bmi ?? '-'}</Text>
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Cinsiyet</Text>
          <View style={styles.choiceRow}>
            <Pressable
              onPress={() => setGender('male')}
              style={[styles.choiceBtn, gender === 'male' && styles.choiceBtnActive]}
            >
              <Text style={[styles.choiceText, gender === 'male' && styles.choiceTextActive]}>Erkek</Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('female')}
              style={[styles.choiceBtn, gender === 'female' && styles.choiceBtnActive]}
            >
              <Text style={[styles.choiceText, gender === 'female' && styles.choiceTextActive]}>Kadın</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Aktivite seviyesi</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {ACTIVITY_OPTIONS.map((opt) => {
              const active = activityLevel === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setActivityLevel(opt.value)}
                  style={[styles.listChoice, active && styles.listChoiceActive]}
                >
                  <Text style={[styles.listChoiceText, active && styles.listChoiceTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Hedef</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {GOAL_OPTIONS.map((opt) => {
              const active = goal === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setGoal(opt.value)}
                  style={[styles.listChoice, active && styles.listChoiceActive]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.listChoiceText, active && styles.listChoiceTextActive]}>{opt.label}</Text>
                    <Text style={[styles.hintText, active && styles.hintTextActive]}>{opt.hint}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {message && <InlineMessage type={message.type} text={message.text} />}

          <Pressable onPress={handleSave} style={[styles.primaryBtn, saving && { opacity: 0.7 }]} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? 'Hesaplanıyor…' : 'Hesapla ve Kaydet'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalori Önerisi</Text>
          {!result ? (
            <Text style={styles.emptyText}>Henüz hesaplanmadı. Bilgilerini girip “Hesapla ve Kaydet”e bas.</Text>
          ) : (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>BMR</Text>
                <Text style={styles.resultValue}>{formatKcal(result.bmr)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>TDEE</Text>
                <Text style={styles.resultValue}>{formatKcal(result.tdee)}</Text>
              </View>
              <View style={[styles.resultRow, { marginTop: 6 }]}>
                <Text style={styles.resultLabel}>Önerilen günlük kalori</Text>
                <Text style={styles.recoValue}>{formatKcal(result.recommendedCalories)}</Text>
              </View>
              <Text style={styles.noteText}>
                Bu değer Mifflin–St Jeor formülü ile hesaplanan BMR, aktivite katsayısı ve hedef ayarlaması
                kullanılarak oluşturuldu.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
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
  cardTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
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
  choiceRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  choiceBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  choiceText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  choiceTextActive: {
    color: '#166534',
  },
  listChoice: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  listChoiceActive: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  listChoiceText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  listChoiceTextActive: {
    color: '#166534',
  },
  hintText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
  },
  hintTextActive: {
    color: '#166534',
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
  emptyText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resultLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
  },
  resultValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  recoValue: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '900',
  },
  noteText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
