# AidChain Smart Contract

Bu klasör, AidChain projesi için Stellar/Soroban smart contract'ını içerir.

## 📋 Özellikler

### 🎯 Ana Fonksiyonlar
- **create_donation**: Yeni bağış oluşturma
- **get_donations**: Tüm bağışları listeleme
- **get_donations_by_donor**: Belirli bir bağışçının bağışlarını getirme
- **confirm_delivery**: Bağış teslimatını onaylama
- **get_stats**: Bağış istatistiklerini getirme

### 📊 Veri Yapıları
- **Donation**: Bağış bilgilerini içeren struct
- **DonationStats**: İstatistik bilgilerini içeren struct

## 🛠️ Kurulum

### Gereksinimler
- Rust 1.70+
- Soroban CLI
- Stellar testnet hesabı

### 1. Rust Kurulumu
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. Soroban CLI Kurulumu
```bash
curl -sSf https://soroban.stellar.org/install.sh | sh
```

### 3. WebAssembly Target Kurulumu
```bash
rustup target add wasm32-unknown-unknown
```

## 🚀 Deployment

### Otomatik Deployment
```bash
chmod +x ../scripts/deploy-contract.sh
../scripts/deploy-contract.sh
```

### Manuel Deployment
```bash
# Build contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/aidchain_contract.wasm \
    --source testnet \
    --network testnet
```

## 📝 Smart Contract Fonksiyonları

### create_donation
Yeni bir bağış oluşturur.

**Parametreler:**
- `donor`: Bağışçı adresi (Address)
- `amount`: Bağış miktarı (i128 - stroops cinsinden)
- `category`: Bağış kategorisi (String)
- `region`: Bağış bölgesi (String)

**Dönüş:**
- `Donation`: Oluşturulan bağış bilgileri

### get_donations
Tüm bağışları getirir.

**Dönüş:**
- `Vec<Donation>`: Tüm bağışların listesi

### get_donations_by_donor
Belirli bir bağışçının bağışlarını getirir.

**Parametreler:**
- `donor`: Bağışçı adresi (Address)

**Dönüş:**
- `Vec<Donation>`: Bağışçının bağışları

### confirm_delivery
Bağış teslimatını onaylar ve NFT ID'si ekler.

**Parametreler:**
- `donation_index`: Bağış indeksi (u32)
- `nft_id`: NFT ID'si (String)

**Dönüş:**
- `Donation`: Güncellenmiş bağış bilgileri

### get_stats
Bağış istatistiklerini getirir.

**Dönüş:**
- `DonationStats`: İstatistik bilgileri

## 🧪 Test

```bash
cargo test
```

## 📊 Veri Yapıları

### Donation Struct
```rust
pub struct Donation {
    pub donor: Address,           // Bağışçı adresi
    pub amount: i128,             // Bağış miktarı (stroops)
    pub category: Symbol,         // Kategori
    pub region: Symbol,           // Bölge
    pub timestamp: u64,           // Zaman damgası
    pub status: Symbol,           // Durum (pending/completed/delivered)
    pub delivery_nft_id: Option<Symbol>, // Teslimat NFT ID'si
}
```

### DonationStats Struct
```rust
pub struct DonationStats {
    pub total_donations: i128,           // Toplam bağış sayısı
    pub total_amount: i128,              // Toplam bağış miktarı
    pub category_stats: Map<Symbol, i128>, // Kategori bazında istatistikler
    pub region_stats: Map<Symbol, i128>,   // Bölge bazında istatistikler
}
```

## 🔗 Frontend Entegrasyonu

Smart contract frontend'de şu şekilde kullanılır:

```typescript
import { createSmartContractDonation, getSmartContractDonations } from '../utils/stellar';

// Bağış oluştur
const donation = await createSmartContractDonation('10', 'money', 'istanbul');

// Bağışları getir
const donations = await getSmartContractDonations();
```

## 🌐 Ağ Konfigürasyonu

- **Testnet**: `https://soroban-testnet.stellar.org`
- **Mainnet**: `https://soroban-mainnet.stellar.org`

## 🔒 Güvenlik

- Tüm işlemler Stellar blockchain'de şeffaf olarak kaydedilir
- Smart contract immutable'dır (değiştirilemez)
- Tüm bağışlar doğrulanabilir
- NFT tabanlı teslimat onayı

## 📈 Performans

- Gas optimizasyonu yapılmış
- Minimal storage kullanımı
- Hızlı işlem süreleri
- Ölçeklenebilir yapı

## 🐛 Hata Ayıklama

### Yaygın Hatalar

1. **Contract not deployed**
   - Çözüm: Contract'ı deploy edin

2. **Insufficient balance**
   - Çözüm: Testnet XLM alın

3. **Invalid parameters**
   - Çözüm: Parametreleri kontrol edin

### Log Kontrolü
```bash
soroban contract logs --id <CONTRACT_ID>
```

## 📞 Destek

Sorun yaşarsanız:
1. Soroban dokümantasyonunu kontrol edin
2. GitHub issues'da arama yapın
3. Stellar Discord'da sorun

## 📄 Lisans

MIT License 