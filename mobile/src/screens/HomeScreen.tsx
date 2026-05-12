import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { getLocalProfile, getToken, removeToken } from '../utils/storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type DailySummary = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  total_grams: number;
  items: number;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [dailyTarget, setDailyTarget] = useState<number>(2500);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  function calcDailyTarget(weightKg?: number, heightCm?: number) {
    // Lightweight heuristic (not full BMR/TDEE yet):
    //  - base target ~ goal maintenance-ish using weight
    //  - clamp to reasonable bounds
    // If info missing, fall back to 2500.
    if (!weightKg || !Number.isFinite(weightKg)) return 2500;
    let target = Math.round(weightKg * 33);
    if (heightCm && Number.isFinite(heightCm)) {
      // small adjustment: taller users usually need a bit more
      // (kept intentionally small so it doesn't swing wildly)
      target += Math.round((heightCm - 170) * 5);
    }
    if (!Number.isFinite(target)) return 2500;
    return Math.max(1400, Math.min(3500, target));
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

  // Personalized daily target from locally saved measurements
  const local = await getLocalProfile();
  setDailyTarget(calcDailyTarget(local?.weightKg, local?.heightCm));

        const token = await getToken();
        if (!token) return;

        const meRes = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user || null);
        }

        const sumRes = await fetch(`${API_BASE}/api/daily-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.summary || null);
        }
      } catch (e) {
        console.warn('Home fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isFocused]);

      async function handleLogout() {
        await removeToken();
        // reset navigation to Login so user can't go back to protected screens
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }

      const todayLabel = new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      });

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                Merhaba{user?.name ? `, ${user.name}` : ''}!
              </Text>
              <Text style={styles.date}>{todayLabel}</Text>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Çıkış</Text>
            </Pressable>
          </View>

          <View style={styles.bigCard}>
            <Text style={styles.bigCardLabel}>Günlük Kalori</Text>
            <Text style={styles.bigCardValue}>{summary ? Math.round(summary.calories) : 0}</Text>
            <Text style={styles.bigCardSub}>kcal</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(((summary?.calories || 0) / dailyTarget) * 100, 100)}%` },
                ]}
              />
            </View>

            <View style={styles.bigCardFooter}>
              <Text style={styles.bigCardMuted}>Kalan</Text>
              <Text style={styles.bigCardMuted}>
                {Math.max(dailyTarget - Math.round(summary?.calories || 0), 0)} kcal
              </Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Protein</Text>
              <Text style={styles.smallCardValue}>{summary ? summary.protein.toFixed(1) : '0.0'}g</Text>
            </View>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Karbonhidrat</Text>
              <Text style={styles.smallCardValue}>{summary ? summary.carbs.toFixed(1) : '0.0'}g</Text>
            </View>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Yağ</Text>
              <Text style={styles.smallCardValue}>{summary ? summary.fat.toFixed(1) : '0.0'}g</Text>
            </View>
          </View>

          <Pressable style={styles.primaryCta} onPress={() => navigation.navigate('FoodAdd')}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.primaryCtaText}>Besin Ekle</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  date: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  logoutText: {
    color: '#111827',
    fontWeight: '700',
  },
  bigCard: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  bigCardLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginBottom: 6,
  },
  bigCardValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  bigCardSub: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  bigCardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bigCardMuted: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '700',
  },
  macroRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  smallCardTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  smallCardValue: {
    marginTop: 8,
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  primaryCta: {
    marginTop: 16,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
  },
  primaryCtaText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
