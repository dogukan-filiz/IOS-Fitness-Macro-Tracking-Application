import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config/api';
import { getToken } from '../utils/storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import InlineMessage from '../components/InlineMessage';

type WeightEntry = {
  id: number;
  weight: number;
  date: string; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
};

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fromIsoDate(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function formatDateTr(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function parseWeight(input: string) {
  const normalized = input.replace(',', '.').trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export default function WeightScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  const iso = useMemo(() => toIsoDate(selectedDate), [selectedDate]);

  function openDatePicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        is24Hour: true,
        onChange: (_event: DateTimePickerEvent, date?: Date) => {
          if (date) setSelectedDate(date);
        },
      });
      return;
    }
    setShowPicker(true);
  }

  async function fetchWeights() {
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const res = await fetch(`${API_BASE}/api/weights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Kilo kayıtları alınamadı.');
        setEntries([]);
        return;
      }
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
    } catch (e) {
      console.warn('weights fetch error', e);
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      setEntries([]);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchWeights();
    setRefreshing(false);
  }

  async function saveWeight() {
    const w = parseWeight(weightInput);
    setNotice(null);
    setError(null);
    if (!weightInput.trim()) {
      setError('Lütfen kilo değerini gir.');
      return;
    }
    if (!Number.isFinite(w)) {
      setError('Kilo sayısal olmalı (örn. 78.5).');
      return;
    }
    if (w < 20 || w > 300) {
      setError('Kilo 20–300 kg aralığında olmalı.');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const res = await fetch(`${API_BASE}/api/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: w, date: iso }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Kilo kaydı eklenemedi.');
        return;
      }

      setWeightInput('');
      setNotice(`${formatDateTr(iso)} için kilo kaydı güncellendi.`);
      await fetchWeights();
    } catch (e) {
      console.warn('weights save error', e);
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchWeights();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const entriesDesc = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  }, [entries]);

  const chartData = useMemo(() => {
    // chart-kit needs arrays; keep at most last 30 points to avoid label clutter
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
    const sliced = sorted.slice(Math.max(0, sorted.length - 30));
    return {
      points: sliced,
      labels: sliced.map((e) => e.date.slice(5)), // MM-DD
      values: sliced.map((e) => round1(e.weight)),
    };
  }, [entries]);

  const chartWidth = Math.min(width - 48, 420);

  return (
    <View style={styles.container}>
      <FlatList
        data={entriesDesc}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Kilo Takibi</Text>
            <Text style={styles.subtitle}>Günlük kilonu kaydet, geçmişini gör ve grafikten takip et.</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Yeni Kayıt</Text>

              <Text style={styles.label}>Tarih</Text>
              <Pressable style={styles.dateBtn} onPress={openDatePicker}>
                <Ionicons name="calendar" size={18} color="#111827" />
                <Text style={styles.dateBtnText}>{formatDateTr(iso)}</Text>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </Pressable>

              {Platform.OS === 'web' ? (
                <input
                  style={styles.webDateInput as any}
                  type="date"
                  value={iso}
                  onChange={(e: any) => setSelectedDate(fromIsoDate(e.target.value))}
                />
              ) : null}

              {Platform.OS === 'ios' && showPicker ? (
                <View style={styles.iosPickerWrap}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(_event: DateTimePickerEvent, date?: Date) => {
                      if (date) setSelectedDate(date);
                    }}
                  />
                  <Pressable style={styles.iosDoneButton} onPress={() => setShowPicker(false)}>
                    <Text style={styles.iosDoneText}>Tamam</Text>
                  </Pressable>
                </View>
              ) : null}

              <Text style={[styles.label, { marginTop: 12 }]}>Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="örn. 78.5"
                placeholderTextColor="#6b7280"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                value={weightInput}
                onChangeText={setWeightInput}
              />

              <Pressable style={[styles.primaryBtn, saving ? styles.primaryBtnDisabled : null]} onPress={saveWeight} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="save" size={18} color="#ffffff" />
                    <Text style={styles.primaryBtnText}>Kaydet</Text>
                  </>
                )}
              </Pressable>

              {error ? <InlineMessage type="error" text={error} /> : null}
              {notice ? <InlineMessage type="success" text={notice} /> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Kilo Grafiği</Text>
              {loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color="#16a34a" />
                </View>
              ) : chartData.points.length === 0 ? (
                <View style={styles.centerBox}>
                  <Text style={styles.emptyText}>Henüz kayıt yok. Grafiği görmek için kilo ekle.</Text>
                </View>
              ) : chartData.points.length === 1 ? (
                <View style={styles.centerBox}>
                  <Text style={styles.emptyText}>Grafik için en az 2 kayıt gerekli.</Text>
                </View>
              ) : (
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.values }],
                  }}
                  width={chartWidth}
                  height={220}
                  yAxisSuffix="kg"
                  withDots
                  withInnerLines={false}
                  bezier
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    propsForDots: { r: '4', strokeWidth: '2', stroke: '#16a34a' },
                  }}
                  style={styles.chart}
                />
              )}
            </View>

            <Text style={styles.sectionTitle}>Geçmiş Kayıtlar</Text>

            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator color="#16a34a" />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>Kayıt bulunamadı.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <View>
              <Text style={styles.entryDate}>{formatDateTr(item.date)}</Text>
              <Text style={styles.entrySub}>{item.date}</Text>
            </View>
            <Text style={styles.entryWeight}>{round1(item.weight)} kg</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  sectionTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '800',
    marginBottom: 6,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBtnText: {
    flex: 1,
    color: '#111827',
    fontWeight: '900',
  },
  webDateInput: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 16,
    marginTop: 10,
  },
  iosPickerWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  iosDoneButton: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  iosDoneText: {
    color: '#065f46',
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  centerBox: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '700',
  },
  chart: {
    borderRadius: 14,
    marginTop: 4,
  },
  entryRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryDate: {
    fontWeight: '900',
    color: '#111827',
  },
  entrySub: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  entryWeight: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
});
