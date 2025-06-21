# AidChain - Stellar Blockchain-Based Donation Tracking System

AidChain is a social impact donation tracking system built on Stellar blockchain for transparency and trust in disaster relief.

## 🚀 Features

### 🔐 Secure Login
- **Passkey Support**: Modern and secure biometric login
- **WebAuthn API**: Browser-based authentication

### 💰 Stellar Blockchain Integration
- **Freighter Wallet Support**: Stellar wallet integration
- **Real-time Transactions**: Instant donation transactions on blockchain
- **Transparent Tracking**: All donations visible on blockchain
- **Testnet Support**: Stellar testnet usage for development

### 📊 Donation Management
- **Multiple Categories**: Money, blankets, food, clothing, medicine, cleaning supplies
- **Regional Distribution**: Donations to different regions of Turkey
- **Donation History**: Detailed transaction history and statistics
- **Real-time Balance**: Wallet balance tracking

### 🎨 User Experience
- **Modern UI/UX**: Responsive design with Tailwind CSS
- **English Interface**: Full English language support
- **Mobile Compatible**: Perfect experience on all devices

## 🛠️ Installation

### Requirements
- Node.js 18+ 
- npm or yarn
- Freighter Wallet (browser extension)

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd AidChain-main
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Install Freighter Wallet
1. Download wallet from [Freighter.app](https://www.freighter.app/)
2. Install in your browser
3. Create testnet account or import existing account

## 🔧 Usage

### 1. Login
- Click "Login with Passkey" button
- Use your browser's biometric login system

### 2. Connect Wallet
- Click "Connect Wallet" button
- Connect your Freighter wallet
- View your wallet balance

### 3. Make Donation
- Click "Create Donation" button
- Enter donation amount (in XLM)
- Select category and region
- Confirm transaction

### 4. View Donation History
- Click "Donation History" button
- View all your donations and transaction details
- Click blockchain explorer links to verify transactions

## 🏗️ Technical Details

### Stellar Integration
```typescript
// Wallet connection
const walletInfo = await connectWallet();

// Donation transaction
const donation = await createDonation(amount, category, region);

// Balance query
const balance = await getWalletBalance();
```

### Technologies Used
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Blockchain**: Stellar SDK, Freighter API
- **Authentication**: WebAuthn API
- **State Management**: React Hooks

### File Structure
```
app/
├── components/
│   ├── WalletConnection.tsx    # Wallet connection component
│   ├── DonationForm.tsx        # Donation form
│   └── DonationHistory.tsx     # Donation history
├── utils/
│   └── stellar.ts             # Stellar blockchain operations
├── page.tsx                   # Main page
└── layout.tsx                 # Application layout
```

## 🔗 Stellar Testnet

This application uses Stellar testnet. To get test XLM:

1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=testnet)
2. Create test account
3. Import to your Freighter wallet

## 📱 Supported Features

### Donation Categories
- 💰 Money (XLM)
- 🧸 Blanket
- 🍎 Food
- 👕 Clothing
- 💊 Medicine
- 🧽 Cleaning Supplies

### Supported Regions
- Istanbul
- Ankara
- Izmir
- Antalya
- Bursa
- Adana
- Gaziantep
- Konya
- Other

## 🔒 Security

- All transactions are transparently executed on Stellar blockchain
- Wallet keys are never stored in the application
- Secure authentication with Passkey
- Secure communication over HTTPS

## 🚀 Future Features

- [ ] NFT-based donation confirmation
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Automatic balance updates
- [ ] Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- Project Link: https://github.com/Beg-m/AidChain
- Issues: https://github.com/Beg-m/AidChain/issues

---

**Note**: This application is in development and uses Stellar testnet. Mainnet integration is required for real donations.
