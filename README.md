# AidChain - Stellar Blockchain Tabanlı Bağış Takip Sistemi

AidChain, afet yardımlarında şeffaflık ve güven için Stellar blockchain üzerinde çalışan toplumsal fayda odaklı bağış takip sistemidir.

## 🚀 Özellikler

### 🔐 Güvenli Giriş
- **Passkey Desteği**: Modern ve güvenli biyometrik giriş
- **WebAuthn API**: Tarayıcı tabanlı kimlik doğrulama

### 💰 Stellar Blockchain Entegrasyonu
- **Freighter Cüzdan Desteği**: Stellar cüzdan entegrasyonu
- **Gerçek Zamanlı İşlemler**: Blockchain üzerinde anlık bağış işlemleri
- **Şeffaf Takip**: Tüm bağışların blockchain üzerinde görülebilir olması
- **Testnet Desteği**: Geliştirme için Stellar testnet kullanımı

### 📊 Bağış Yönetimi
- **Çoklu Kategori**: Para, battaniye, gıda, giysi, ilaç, temizlik malzemesi
- **Bölgesel Dağıtım**: Türkiye'nin farklı bölgelerine bağış
- **Bağış Geçmişi**: Detaylı işlem geçmişi ve istatistikler
- **Gerçek Zamanlı Bakiye**: Cüzdan bakiyesi takibi

### 🎨 Kullanıcı Deneyimi
- **Modern UI/UX**: Tailwind CSS ile responsive tasarım
- **Türkçe Arayüz**: Tam Türkçe dil desteği
- **Mobil Uyumlu**: Tüm cihazlarda mükemmel deneyim

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Freighter Cüzdan (tarayıcı eklentisi)

### Adım 1: Projeyi Klonlayın
```bash
git clone <repository-url>
cd AidChain-main
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

### Adım 4: Freighter Cüzdanını Kurun
1. [Freighter.app](https://www.freighter.app/) adresinden cüzdanı indirin
2. Tarayıcınıza yükleyin
3. Testnet hesabı oluşturun veya mevcut hesabınızı import edin

## 🔧 Kullanım

### 1. Giriş Yapın
- "Passkey ile Giriş" butonuna tıklayın
- Tarayıcınızın biyometrik giriş sistemini kullanın

### 2. Cüzdan Bağlayın
- "Cüzdan Bağla" butonuna tıklayın
- Freighter cüzdanınızı bağlayın
- Cüzdan bakiyenizi görün

### 3. Bağış Yapın
- "Yardım Oluştur" butonuna tıklayın
- Bağış miktarını girin (XLM cinsinden)
- Kategori ve bölge seçin
- İşlemi onaylayın

### 4. Bağış Geçmişini Görüntüleyin
- "Bağış Geçmişi" butonuna tıklayın
- Tüm bağışlarınızı ve işlem detaylarını görün
- Blockchain explorer linklerine tıklayarak işlemleri doğrulayın

## 🏗️ Teknik Detaylar

### Stellar Entegrasyonu
```typescript
// Cüzdan bağlantısı
const walletInfo = await connectWallet();

// Bağış işlemi
const donation = await createDonation(amount, category, region);

// Bakiye sorgulama
const balance = await getWalletBalance();
```

### Kullanılan Teknolojiler
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Blockchain**: Stellar SDK, Freighter API
- **Authentication**: WebAuthn API
- **State Management**: React Hooks

### Dosya Yapısı
```
app/
├── components/
│   ├── WalletConnection.tsx    # Cüzdan bağlantı bileşeni
│   ├── DonationForm.tsx        # Bağış formu
│   └── DonationHistory.tsx     # Bağış geçmişi
├── utils/
│   └── stellar.ts             # Stellar blockchain işlemleri
├── page.tsx                   # Ana sayfa
└── layout.tsx                 # Uygulama layout'u
```

## 🔗 Stellar Testnet

Bu uygulama Stellar testnet kullanmaktadır. Test XLM almak için:

1. [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=testnet) adresine gidin
2. Test hesabı oluşturun
3. Freighter cüzdanınıza import edin

## 📱 Desteklenen Özellikler

### Bağış Kategorileri
- 💰 Para (XLM)
- 🧸 Battaniye
- 🍎 Gıda
- 👕 Giysi
- 💊 İlaç
- 🧽 Temizlik Malzemesi

### Desteklenen Bölgeler
- İstanbul
- Ankara
- İzmir
- Antalya
- Bursa
- Adana
- Gaziantep
- Konya
- Diğer

## 🔒 Güvenlik

- Tüm işlemler Stellar blockchain üzerinde şeffaf olarak gerçekleşir
- Cüzdan anahtarları asla uygulamada saklanmaz
- Passkey ile güvenli kimlik doğrulama
- HTTPS üzerinden güvenli iletişim

## 🚀 Gelecek Özellikler

- [ ] NFT tabanlı yardım onayı
- [ ] Çoklu dil desteği
- [ ] Mobil uygulama
- [ ] Gelişmiş analitik dashboard
- [ ] Otomatik bakiye güncelleme
- [ ] Email bildirimleri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- Proje Linki: [GitHub Repository]
- Sorunlar: [GitHub Issues]

---

**Not**: Bu uygulama geliştirme aşamasındadır ve Stellar testnet kullanmaktadır. Gerçek bağışlar için mainnet entegrasyonu gereklidir.
