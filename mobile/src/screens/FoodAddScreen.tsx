import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE } from '../config/api';
import { getToken } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import InlineMessage from '../components/InlineMessage';

type Food = {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

type OffItem = {
  source: 'off';
  sourceId: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export default function FoodAddScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [apiItems, setApiItems] = useState<OffItem[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [selectedApi, setSelectedApi] = useState<OffItem | null>(null);
  const [grams, setGrams] = useState('100');
  const [meal, setMeal] = useState<'Kahvaltı' | 'Öğle' | 'Akşam' | 'Atıştırma'>('Kahvaltı');
  const [mode, setMode] = useState<'db' | 'api'>('db');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const gramsNum = useMemo(() => {
    const n = Number(grams);
    return Number.isFinite(n) ? n : NaN;
  }, [grams]);

  const estimate = useMemo(() => {
    const item = mode === 'api' ? selectedApi : selected;
    if (!item || !gramsNum || Number.isNaN(gramsNum) || gramsNum <= 0) return null;
    const factor = gramsNum / 100.0;
    return {
      calories: round1(item.calories_per_100g * factor),
      protein: round1(item.protein_per_100g * factor),
      carbs: round1(item.carbs_per_100g * factor),
      fat: round1(item.fat_per_100g * factor),
    };
  }, [mode, selected, selectedApi, gramsNum]);

  async function fetchFoods(search: string) {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' });
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const url = new URL(`${API_BASE}/api/foods`);
      if (search.trim()) url.searchParams.set('q', search.trim());
      url.searchParams.set('limit', '50');

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: data?.error || 'Besin listesi alınamadı.' });
        return;
      }
      setFoods(data.foods || []);
  setApiItems([]);
  setSelectedApi(null);
    } catch (e) {
      console.warn('foods fetch error', e);
      setMessage({ type: 'error', text: 'Besin listesi alınamadı.' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchFromApi(search: string) {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' });
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const url = new URL(`${API_BASE}/api/foods/search`);
      url.searchParams.set('q', search.trim());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: data?.error || 'API besin araması başarısız.' });
        return;
      }
      setApiItems(data.items || []);
      setFoods([]);
      setSelected(null);
    } catch (e) {
      console.warn('OFF search error', e);
      setMessage({ type: 'error', text: 'API besin araması başarısız.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFoods('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    setMessage(null);
    const item = mode === 'api' ? selectedApi : selected;
    if (!item) {
      setMessage({ type: 'error', text: 'Lütfen bir besin seçin.' });
      return;
    }
    if (!gramsNum || Number.isNaN(gramsNum) || gramsNum <= 0) {
      setMessage({ type: 'error', text: 'Gram değeri geçersiz.' });
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' });
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const res = await fetch(`${API_BASE}/api/food-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body:
          mode === 'api'
            ? JSON.stringify({ grams: gramsNum, offProduct: { ...item, sourceId: (item as OffItem).sourceId } })
            : JSON.stringify({ foodId: (item as Food).id, grams: gramsNum }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: data?.error || 'Besin eklenemedi.' });
        return;
      }

      setMessage({ type: 'success', text: 'Besin günlük listeye eklendi.' });
      navigation.goBack();
    } catch (e) {
      console.warn('food entry add error', e);
      setMessage({ type: 'error', text: 'Besin eklenemedi.' });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Besin Ekle</Text>
      <Text style={styles.subtitle}>Günlük beslenmenize yeni bir besin ekleyin</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öğün Seçin</Text>
        <View style={styles.segmentRow}>
          {(['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırma'] as const).map((m) => {
            const active = meal === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMeal(m)}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{m}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kaynak</Text>
        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => {
              setMode('db');
              setSelectedApi(null);
              fetchFoods(query);
            }}
            style={[styles.segmentBtn, mode === 'db' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, mode === 'db' && styles.segmentTextActive]}>Hazır Besinler</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode('api');
              setSelected(null);
              if (query.trim()) fetchFromApi(query);
            }}
            style={[styles.segmentBtn, mode === 'api' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, mode === 'api' && styles.segmentTextActive]}>API'den Ara</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Besin ara (örn: tavuk, pirinç)"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        autoCapitalize="none"
        onSubmitEditing={() => (mode === 'api' ? fetchFromApi(query) : fetchFoods(query))}
        returnKeyType="search"
      />

      <Pressable style={styles.searchBtn} onPress={() => (mode === 'api' ? fetchFromApi(query) : fetchFoods(query))}>
        <Text style={styles.searchBtnText}>Ara</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          style={{ alignSelf: 'stretch', marginTop: 12 }}
          data={mode === 'api' ? apiItems : foods}
          keyExtractor={(item: any) => String(mode === 'api' ? item.sourceId : item.id)}
          renderItem={({ item }) => {
            const isSelected = mode === 'api' ? selectedApi?.sourceId === item.sourceId : selected?.id === item.id;
            return (
              <Pressable
                onPress={() => {
                  if (mode === 'api') {
                    setSelectedApi(item as OffItem);
                  } else {
                    setSelected(item as Food);
                  }
                }}
                style={[styles.foodRow, isSelected && styles.foodRowSelected]}
              >
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMeta}>{item.calories_per_100g} kcal / 100g</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>Sonuç bulunamadı.</Text>}
        />
      )}

  <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
        <Text style={styles.label}>Gram</Text>
        <TextInput
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          placeholder="örn: 150"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        {estimate ? (
          <Text style={styles.estimate}>
            Tahmini: {estimate.calories} kcal • P {estimate.protein}g • K {estimate.carbs}g • Y {estimate.fat}g
          </Text>
        ) : (
          <Text style={styles.estimate}>Bir besin seçip gram gir.</Text>
        )}

        {message ? <InlineMessage type={message.type} text={message.text} /> : null}

        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Besini Ekle</Text>
        </Pressable>
      </View>
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
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 14,
  },
  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: '800',
    marginBottom: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#16a34a',
  },
  segmentText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  searchBtn: {
    marginTop: 10,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  foodRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  foodRowSelected: {
    borderColor: '#16a34a',
    backgroundColor: 'rgba(22,163,74,0.08)',
  },
  foodName: {
    color: '#111827',
    fontWeight: '700',
  },
  foodMeta: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 12,
  },
  empty: {
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    color: '#6b7280',
    marginBottom: 6,
  },
  estimate: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 12,
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
