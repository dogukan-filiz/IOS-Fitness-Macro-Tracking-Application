import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config/api';
import { getToken } from '../utils/storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DailyEntry = {
  id: number;
  date: string;
  grams: number;
  food: { id: number; name: string };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fromIsoDate(iso: string) {
  // Always interpret as local midnight.
  return new Date(`${iso}T00:00:00`);
}

function formatDateTr(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function fmtKcal(n: number) {
  return `${Math.round(n)} kcal`;
}

function fmtG(n: number) {
  return `${round1(n)} g`;
}

export default function FoodListScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  const iso = useMemo(() => toIsoDate(selectedDate), [selectedDate]);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc.calories += e.calories;
        acc.protein += e.protein;
        acc.carbs += e.carbs;
        acc.fat += e.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  async function fetchDaily() {
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const url = new URL(`${API_BASE}/api/food-entries/daily`);
      url.searchParams.set('date', iso);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Günlük besinler alınamadı.');
        setEntries([]);
        return;
      }

      setEntries(data?.entries || []);
    } catch (e) {
      console.warn('daily entries fetch error', e);
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      setEntries([]);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDaily();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, isFocused]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchDaily();
    setRefreshing(false);
  }

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

    // iOS: show inline/spinner picker
    setShowPicker(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Besin Listesi</Text>
      <Text style={styles.subtitle}>Seçtiğin tarihte eklenen besinleri görüntüle</Text>
      <Pressable style={styles.dateBtn} onPress={openDatePicker}>
        <Ionicons name="calendar" size={18} color="#111827" />
        <Text style={styles.dateBtnText}>{formatDateTr(iso)}</Text>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </Pressable>

      {Platform.OS === 'web' ? (
        // Web: RN DateTimePicker is flaky; use the native browser date input.
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 18 }} />
      ) : (
        <FlatList
          style={{ alignSelf: 'stretch', marginTop: 14 }}
          data={entries}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Günlük Toplam</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kalori</Text>
                <Text style={styles.summaryValue}>{fmtKcal(totals.calories)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Protein</Text>
                <Text style={styles.summaryValue}>{fmtG(totals.protein)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Karbonhidrat</Text>
                <Text style={styles.summaryValue}>{fmtG(totals.carbs)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Yağ</Text>
                <Text style={styles.summaryValue}>{fmtG(totals.fat)}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            error ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateTitle}>Bir sorun oluştu</Text>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={fetchDaily}>
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.stateBox}>
                <Text style={styles.stateTitle}>Kayıt yok</Text>
                <Text style={styles.stateText}>Bu tarihte eklenmiş bir besin bulunmuyor.</Text>
                <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('FoodAdd')}>
                  <Ionicons name="add" size={18} color="#ffffff" />
                  <Text style={styles.primaryBtnText}>Besin Ekle</Text>
                </Pressable>
              </View>
            )
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryName}>{item.food.name}</Text>
                  <Text style={styles.entryGrams}>{Math.round(item.grams)} g</Text>
                </View>

                <View style={styles.macroRow}>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>Kalori</Text>
                    <Text style={styles.macroPillValue}>{fmtKcal(item.calories)}</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>P</Text>
                    <Text style={styles.macroPillValue}>{fmtG(item.protein)}</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>K</Text>
                    <Text style={styles.macroPillValue}>{fmtG(item.carbs)}</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>Y</Text>
                    <Text style={styles.macroPillValue}>{fmtG(item.fat)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
  dateBtn: {
    marginTop: 14,
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
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '800',
  },
  summaryValue: {
    color: '#ffffff',
    fontWeight: '900',
  },
  entryCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryName: {
    flex: 1,
    color: '#111827',
    fontWeight: '900',
    fontSize: 15,
    marginRight: 10,
  },
  entryGrams: {
    color: '#6b7280',
    fontWeight: '800',
  },
  macroRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  macroPill: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  macroPillLabel: {
    color: '#6b7280',
    fontWeight: '900',
    fontSize: 12,
  },
  macroPillValue: {
    color: '#111827',
    fontWeight: '900',
  },
  stateBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  stateTitle: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 16,
  },
  stateText: {
    marginTop: 6,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '900',
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
  },
  primaryBtnText: {
    color: '#ffffff',
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
  },
  iosPickerWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
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
});
