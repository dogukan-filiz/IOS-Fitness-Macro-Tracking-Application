# Fitness Macro Tracking Application - Proje Dokümanı

**Öğrenci:** Doğukan Filiz  
**Öğrenci No:** 22290746  
**Ders:** BLM4538 - IOS İle Mobil Uygulama Geliştirme II  
**Tarih:** Mart 2026

---

## 1. Projenin Amacı

Bu projenin amacı, kullanıcıların günlük beslenme alışkanlıklarını takip edebilecekleri ve tüketilen besinlerin kalori ile makro değerlerini analiz edebilecekleri bir mobil uygulama geliştirmektir.

### Uygulama Özellikleri

Uygulama sayesinde kullanıcılar:
- **Günlük kalori tüketimini takip edebilecek**
- **Protein, karbonhidrat ve yağ miktarlarını görebilecek**
- **Kilo değişimlerini kayıt altına alabilecek**
- **Hedeflerine uygun kalori önerileri alabilecek**

Bu proje **React Native** kullanılarak mobil platformlar için geliştirilecektir.

---

## 2. Kullanılacak Teknolojiler

### Mobil Uygulama
- **React Native** - Cross-platform mobil uygulama framework'ü
- **Expo** - React Native geliştirme ve test platformu
- **TypeScript** - Tip güvenliği ve kod kalitesi

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework

### Veritabanı
- **PostgreSQL** - İlişkisel veritabanı yönetim sistemi

### Versiyon Kontrol
- **Git** - Versiyon kontrol sistemi
- **GitHub** - Kod paylaşım ve işbirliği platformu

### Tasarım
- **Figma** - UI/UX tasarım aracı

---

## 3. Uygulamanın Temel Özellikleri

### Kullanıcı Sistemi
- Kullanıcı kayıt olma
- Kullanıcı giriş yapma
- Profil yönetimi

### Besin Takibi
- Günlük besin ekleme
- Besin gramı girme
- Otomatik kalori hesaplama
- Besin veritabanı

### Makro Analizi
- **Protein** hesaplama ve takibi
- **Karbonhidrat** hesaplama ve takibi
- **Yağ** hesaplama ve takibi
- Günlük makro dağılımı grafikleri

### Kilo Takibi
- Günlük kilo kaydı
- Grafiksel ilerleme görüntüleme
- Hedef kilo belirleme

### Kalori Öneri Sistemi

Kullanıcının şu bilgilerine göre kişiselleştirilmiş günlük kalori önerisi:
- **Boy**
- **Kilo**
- **Yaş**
- **Hedef** (kilo verme, alma veya koruma)
- **Aktivite seviyesi**

---

## 4. Uygulama Ekranları

Planlanan ekranlar:

1. **Splash Screen** - Açılış ekranı
2. **Giriş Ekranı** - Kullanıcı girişi
3. **Kayıt Ekranı** - Yeni kullanıcı kaydı
4. **Onboarding** - İlk kullanım bilgilendirme
5. **Ana Panel (Dashboard)** - Günlük özet görünüm
6. **Besin Ekleme Ekranı** - Yeni besin kaydı
7. **Besin Arama Ekranı** - Veritabanından besin arama
8. **Günlük Besin Listesi** - Tüketilen besinler
9. **Kilo Takip Ekranı** - Kilo grafikleri
10. **Profil Ekranı** - Kullanıcı bilgileri ve ayarlar
11. **İstatistikler Ekranı** - Haftalık/aylık raporlar

Bu ekranların taslak tasarımları **Figma** üzerinden hazırlanacaktır.

---

## 5. Proje Geliştirme Planı (Hafta Hafta)

### 1. Hafta
**Görevler:**
- Proje fikrinin belirlenmesi
- Gerekli teknolojilerin araştırılması
- GitHub repository oluşturulması
- Proje dokümanının hazırlanması

**Video İçeriği:**
Proje fikri ve planı anlatılacaktır.

---

### 2. Hafta
**Görevler:**
- React Native geliştirme ortamının kurulması
- Expo projesinin oluşturulması
- Proje klasör yapısının oluşturulması
- Temel bağımlılıkların yüklenmesi

**Video İçeriği:**
Kurulum süreci ve proje başlangıcı anlatılacaktır.

---

### 3. Hafta
**Görevler:**
- Navigation sisteminin kurulması (React Navigation)
- Login ekranının tasarlanması
- Register ekranının tasarlanması
- Basit kullanıcı arayüzü oluşturulması

**Video İçeriği:**
Login ve Register ekranlarının çalışması gösterilecektir.

---

### 4. Hafta
**Görevler:**
- Backend projesinin oluşturulması
- PostgreSQL veritabanı kurulumu
- Kullanıcı kayıt API'sinin yazılması
- Kullanıcı giriş API'sinin yazılması
- Mobil uygulama ile backend bağlantısı

**Video İçeriği:**
API bağlantısı ve kullanıcı işlemleri gösterilecektir.

---

### 5. Hafta
**Görevler:**
- Besin ekleme sistemi
- Besin veritabanı oluşturma
- Kalori hesaplama algoritması
- Makro hesaplama sistemi

**Video İçeriği:**
Besin ekleme işlemi anlatılacaktır.

---

### 6. Hafta
**Görevler:**
- Günlük besin listesi ekranı
- Makro değerlerin hesaplanması
- Günlük özet gösterimi
- Besin düzenleme/silme özellikleri

**Video İçeriği:**
Makro hesaplama sistemi anlatılacaktır.

---

### 7. Hafta
**Görevler:**
- Kilo takip sistemi
- Kilo kayıt ekranı
- Grafik kütüphanesi entegrasyonu
- İlerleme grafiklerinin oluşturulması

**Video İçeriği:**
Kilo değişimi grafiği gösterilecektir.

---

### 8. Hafta
**Görevler:**
- Kalori öneri sistemi geliştirilmesi
- BMR (Basal Metabolic Rate) hesaplama
- TDEE (Total Daily Energy Expenditure) hesaplama
- Kullanıcı hedeflerine göre kalori önerisi

**Video İçeriği:**
Kalori hesaplama sistemi anlatılacaktır.

---

### 9. Hafta
**Görevler:**
- Uygulama arayüzünün iyileştirilmesi
- Hata düzeltmeleri (Bug fixes)
- Performans optimizasyonları
- Kullanıcı deneyimi iyileştirmeleri

**Video İçeriği:**
Uygulamanın genel işleyişi gösterilecektir.

---

### 10. Hafta
**Görevler:**
- Final düzenlemeleri
- Uygulama testleri
- Dokümantasyon tamamlama
- Proje sunumuna hazırlık

**Video İçeriği:**
Uygulamanın tüm özellikleri anlatılacaktır.

---

## 6. GitHub Kullanımı

Proje süresince yapılan tüm çalışmalar GitHub üzerinden paylaşılacaktır.

### Her Hafta:
- Yapılan işlemler detaylı olarak yazılacaktır
- Kod değişiklikleri commit edilecektir
- Haftalık video linkleri README'de paylaşılacaktır
- Progress tracking için Issues kullanılacaktır

### Repository Yapısı:
```
main
├── docs/          # Dokümantasyon
├── mobile/        # React Native mobil uygulama
├── backend/       # Node.js/Express backend
└── database/      # Veritabanı şemaları
```

---

## 7. Video Paylaşımı

Her hafta yapılan gelişmeler **3-5 dakikalık** video ile anlatılacaktır.

### Video İçeriği:
- Haftalık hedefler
- Yapılan kodlamalar
- Tasarım değişiklikleri
- Karşılaşılan sorunlar ve çözümleri
- Tamamlanan özellikler

Videolar **YouTube** üzerinden bir oynatma listesinde paylaşılacaktır.

**YouTube Playlist:** [Playlist](https://www.youtube.com/playlist?list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H)

---

## 8. Proje Hedefleri ve Başarı Kriterleri

### Teknik Hedefler:
- Clean Code prensipleri
- TypeScript kullanımı
- Component-based architecture
- RESTful API tasarımı
- Responsive UI/UX
- Error handling
- Data validation

### Fonksiyonel Hedefler:
- Kullanıcı kimlik doğrulama
- Günlük besin takibi
- Makro hesaplama
- Kilo takibi
- Kalori önerisi
- Grafiksel raporlama

---

## 9. Kaynaklar

### Öğrenme Kaynakları:
- React Native Documentation
- Expo Documentation
- Node.js & Express.js Guides
- PostgreSQL Documentation
- TypeScript Handbook

### API'ler:
- Besin bilgileri için açık kaynak API'ler araştırılacaktır
- Gerekirse custom besin veritabanı oluşturulacaktır

---

## 10. İletişim

**Öğrenci:** Doğukan Filiz  
**Öğrenci No:** 22290746  
**GitHub:** [github.com/dogukan-filiz](https://github.com/dogukan-filiz)  
**Repository:** [IOS-Fitness-Macro-Tracking-Application](https://github.com/dogukan-filiz/IOS-Fitness-Macro-Tracking-Application)

---

**Son Güncelleme:** 16 Mart 2026
