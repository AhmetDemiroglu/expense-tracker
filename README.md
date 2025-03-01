# Bütçe360° - Kredi Kartı Dönem Takip Uygulaması

**Bütçe360°**, kredi kartı dönem takibi yapmanızı sağlayan ve harcamalarınızı yönetmenize yardımcı olan modern bir web uygulamasıdır. Harcamalarınızı organize edin, bütçenizi kontrol altında tutun ve finansal hedeflerinize ulaşın.

---

## Özellikler

- **Kredi Kartı Dönem Takibi**
  Hesap kesim tarihlerini ve dönem başlangıçlarını kolayca ayarlayın. Aktif dönem içindeki harcamalarınızı takip edin.

- **Günlük Harcama Kaydı**
  Günlük harcamalarınızı kaydedin ve kategorilere ayırarak detaylı bir şekilde görüntüleyin.

- **Dinamik Günlük Limit Hesaplama**
  Geçmiş harcamalarınıza göre günlük limitiniz otomatik olarak güncellenir. Böylece bütçenizi daha etkili bir şekilde yönetebilirsiniz.

- **Borç Takibi**
  Kredi kartı borçlarınızı ve diğer ödemelerinizi kolayca yönetin.

- **Fatura Yönetimi**
  Fatura ödemelerinizi takip edin ve düzenli olarak kaydedin.

- **Birikim Planlaması**
  Finansal hedeflerinize ulaşmak için birikimlerinizi planlayın.

- **Gelir Takibi**
  Aylık gelirlerinizi kaydedin ve bütçenizi buna göre planlayın.

- **Mobil Uyumlu Tasarım**
  Tüm cihazlarda (mobil, tablet, masaüstü) sorunsuz çalışan responsive bir tasarım.

---

## Teknolojiler

- **Vue.js 3** (Composition API ile)
- **Vuex** (State Management)
- **Firebase Realtime Database**
- **Firebase Authentication**
- **Firebase Hosting**

---

## Kurulum

### Bağımlılıkları yükleyin

```bash
npm install
```

### Geliştirme sunucusunu başlatın

```bash
npm run dev
```

### Projeyi derleyin

```bash
npm run build
```

---

## Ortam Değişkenleri

Projenin çalışması için bir `.env` dosyası oluşturun ve Firebase yapılandırma bilgilerinizi ekleyin:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Örnek bir `.env.example` dosyası projenin kök dizininde bulunmaktadır. Bu dosyayı `.env` olarak kopyalayıp kendi Firebase yapılandırma bilgilerinizle doldurabilirsiniz.

---

## Proje Yapısı

```plaintext
expense-tracker/
├── src/
│   ├── assets/         # Statik dosyalar
│   ├── components/     # Vue bileşenleri
│   │   ├── bills/      # Fatura yönetimi bileşenleri
│   │   ├── calendar/   # Takvim ve günlük görünüm bileşenleri
│   │   ├── debts/      # Borç takibi bileşenleri
│   │   ├── expenses/   # Harcama yönetimi bileşenleri
│   │   ├── income/     # Gelir yönetimi bileşenleri
│   │   ├── savings/    # Birikim yönetimi bileşenleri
│   │   └── shared/     # Paylaşılan bileşenler
│   ├── router/         # Vue Router yapılandırması
│   ├── services/       # API servisleri ve Firebase bağlantıları
│   ├── store/          # Vuex store modülleri
│   ├── views/          # Sayfa bileşenleri
│   ├── App.vue         # Ana uygulama bileşeni
│   └── main.js         # Uygulama giriş noktası
├── public/             # Genel dosyalar
└── index.html          # Ana HTML dosyası
```

---

## Özellikler Detayı

### Kredi Kartı Dönem Takibi

- Hesap kesim tarihi belirleme
- Dönem başlangıç tarihi ayarlama
- Aktif dönem içi harcama takibi
- Dönem bazlı raporlama

### Harcama Yönetimi

- Günlük harcama kaydı
- Harcama kategorileri
- Harcama detayları görüntüleme
- Harcama istatistikleri

### Dinamik Bütçe Planlama

- Aylık gelir takibi
- Sabit gider yönetimi
- Dinamik günlük harcama limiti hesaplama
  - Geçmiş harcamalara göre otomatik limit ayarlama
  - Limit değişim göstergesi
  - Kalan günler için bütçe optimizasyonu

### Borç ve Fatura Takibi

- Kredi kartı borçları
- Fatura ödemeleri
- Birikim hedefleri
- Ödeme hatırlatıcıları

### Veri Görselleştirme

- Takvim görünümü
- Günlük, haftalık ve aylık raporlar
- Harcama dağılım grafikleri
- PDF ve yazdırma desteği

---

## Lisans

Bu proje özel kullanım için geliştirilmiştir ve tüm hakları saklıdır.
Son güncelleme: 1 Mart 2025
