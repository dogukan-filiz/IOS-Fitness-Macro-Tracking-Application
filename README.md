# Fitness Macro Tracking Application

**BLM4538 - IOS İle Mobil Uygulama Geliştirme II**  
**Öğrenci:** Doğukan Filiz - 22290746  
**Dönem:** Bahar 2026

---

## Proje Hakkında

Kullanıcıların günlük beslenme alışkanlıklarını takip edebilecekleri ve tüketilen besinlerin kalori ile makro değerlerini analiz edebilecekleri kapsamlı bir mobil uygulama.

### Temel Özellikler

- Günlük kalori takibi
- Makro besin analizi (Protein, Karbonhidrat, Yağ)
- Kilo değişim takibi
- Kişiselleştirilmiş kalori önerileri
- Grafiksel ilerleme raporları
- Kapsamlı besin veritabanı

---

## Teknoloji Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Navigation

### Backend
- Node.js
- Express.js
- PostgreSQL

### Araçlar
- Git & GitHub
- Figma (UI/UX)
- VS Code

---

## Proje Gelişim Takvimi

| Hafta | Konu | Durum | Video |
|-------|------|-------|-------|
| 1 | Proje planlama ve dokümantasyon | Tamamlandı | [YouTube](https://www.youtube.com/watch?v=CYnLUYTB3yo&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=2&t=3s) |
| 2 | React Native kurulumu ve proje yapısı | Tamamlandı | [YouTube](https://www.youtube.com/watch?v=8SuirBNspEc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=1) |
| 3 | Login/Register ekranları | Tamamlandı | [YouTube](https://www.youtube.com/watch?v=Lz-Z5SqH-Cc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=3&t=59s) |
| 4 | Backend API geliştirme | Beklemede | - |
| 5 | Besin ekleme sistemi | Beklemede | - |
| 6 | Makro hesaplama sistemi | Beklemede | - |
| 7 | Kilo takip ve grafikler | Beklemede | - |
| 8 | Kalori öneri sistemi | Beklemede | - |
| 9 | UI iyileştirmeleri | Beklemede | - |
| 10 | Final ve sunum | Beklemede | - |

---

## Haftalık Videolar

YouTube Playlist: [Buradan](https://www.youtube.com/playlist?list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H)

### Hafta 1 - Proje Tanıtımı
- Proje fikri ve hedefler
- Teknoloji seçimleri
- Geliştirme planı

**Video:** [https://www.youtube.com/watch?v=CYnLUYTB3yo&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=2&t=3s](https://www.youtube.com/watch?v=CYnLUYTB3yo&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=2&t=3s)

### Hafta 2 - Expo Kurulumu ve Proje Başlangıcı
- React Native/Expo ortamının kurulumu
- TypeScript şablonu ile mobil projenin oluşturulması
- Web üzerinde çalışan basit başlangıç ekranının gösterimi

**Video:** [https://www.youtube.com/watch?v=8SuirBNspEc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=1](https://www.youtube.com/watch?v=8SuirBNspEc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=1)

### Hafta 3 - Login ve Register Ekranları
- React Navigation ile navigation yapısının kurulması
- Login ve Register ekran tasarımlarının oluşturulması
- Ekranlar arası geçiş akışının gösterimi

**Video:** [https://www.youtube.com/watch?v=Lz-Z5SqH-Cc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=3&t=59s](https://www.youtube.com/watch?v=Lz-Z5SqH-Cc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=3&t=59s)

---

## Proje Yapısı

```
fitness-app/
├── docs/              # Dokümantasyon dosyaları
├── mobile/            # React Native mobil uygulama
│   ├── src/
│   │   ├── components/    # UI komponentleri
│   │   ├── screens/       # Uygulama ekranları
│   │   ├── navigation/    # Navigasyon yapısı
│   │   ├── services/      # API servisleri
│   │   ├── utils/         # Yardımcı fonksiyonlar
│   │   └── types/         # TypeScript tipleri
│   └── assets/            # Resimler, fontlar
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── controllers/   # API controller'ları
│   │   ├── models/        # Veritabanı modelleri
│   │   ├── routes/        # API route'ları
│   │   └── middleware/    # Middleware'ler
│   └── config/            # Konfigürasyon
└── database/          # Veritabanı şemaları
```

---

## Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI
- PostgreSQL

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/dogukan-filiz/IOS-Fitness-Macro-Tracking-Application.git
cd IOS-Fitness-Macro-Tracking-Application
```

2. **Mobil uygulama için (ilerleyen haftalarda)**
```bash
cd mobile
npm install
npx expo start
```

3. **Backend için (ilerleyen haftalarda)**
```bash
cd backend
npm install
npm run dev
```

---

## Dokümantasyon

- [Proje Dokümanı](./PROJE_DOKUMANI.md) - Detaylı proje planı ve özellikler

---

## Haftalık Hedefler

### Hafta 1 (Tamamlandı)
- [x] Proje fikri belirlendi
- [x] Teknoloji stack araştırması yapıldı
- [x] GitHub repository oluşturuldu
- [x] Proje dokümantasyonu hazırlandı
- [x] README.md oluşturuldu

### Hafta 2 (Tamamlandı)
- [x] React Native ortamı kuruldu
- [x] Expo TypeScript projesi oluşturuldu
- [x] Temel klasör ve bağımlılıklar hazırlandı
- [x] Web üzerinde çalışan başlangıç ekranı gösterildi

### Hafta 3 (Tamamlandı)
- [x] React Navigation kuruldu
- [x] Login ekranı oluşturuldu
- [x] Register ekranı oluşturuldu
- [x] Login/Register navigation akışı çalışır hale getirildi

---

## Lisans

MIT License - Detaylar için [LICENSE](./LICENSE) dosyasına bakınız.

---

## İletişim

**Doğukan Filiz**  
Öğrenci No: 22290746  
BLM4538 - IOS İle Mobil Uygulama Geliştirme II

**GitHub:** [@dogukan-filiz](https://github.com/dogukan-filiz)  
**Repository:** [IOS-Fitness-Macro-Tracking-Application](https://github.com/dogukan-filiz/IOS-Fitness-Macro-Tracking-Application)

---

**Son Güncelleme:** 16 Mart 2026
