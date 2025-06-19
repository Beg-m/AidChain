import FreighterApi from '@stellar/freighter-api';
import StellarSdk from '@stellar/stellar-sdk';

// Stellar network configuration
const STELLAR_NETWORK = "Test SDF Network ; September 2015";
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
// const server = new StellarSdk.Server(HORIZON_URL); // REMOVED: Only use on server/API

// Initialize Freighter API
const freighterApi = FreighterApi;

export interface DonationData {
  id: string;
  amount: string;
  category: string;
  region: string;
  timestamp: string;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  donorAddress: string;
}

export interface WalletInfo {
  publicKey: string;
  isConnected: boolean;
  balance: string;
}

// Check if Freighter is installed
export const isFreighterInstalled = async (): Promise<boolean> => {
  try {
    await freighterApi.isConnected();
    return true;
  } catch {
    return false;
  }
};

// Connect to Freighter wallet
export const connectWallet = async (): Promise<WalletInfo> => {
  try {
    if (!await isFreighterInstalled()) {
      throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
    }
    // Get public key (address)
    const { address: publicKey } = await freighterApi.getAddress();
    // TODO: Get balance via API route if needed
    return {
      publicKey,
      isConnected: true,
      balance: '0' // Balance fetch should be via API
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Disconnect wallet (no-op for new Freighter API)
export const disconnectWallet = async (): Promise<void> => {
  // No disconnect method in new Freighter API
};

// Create donation transaction (XDR creation and signing, submission via API)
export const createDonation = async (
  amount: string,
  category: string,
  region: string,
  recipientAddress: string = 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY' // Demo recipient
): Promise<DonationData> => {
  try {
    // 1. Kullanıcı adresini al
    const { address: publicKey } = await freighterApi.getAddress();

    // 2. Stellar sunucusuna bağlan
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    // 3. İşlem oluştur
    const fee = await server.fetchBaseFee();
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: recipientAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(30)
      .build();

    // 4. İşlemi XDR olarak serialize et
    const xdr = transaction.toXDR();

    // 5. Freighter ile imzala
    const signedXDR = await freighterApi.signTransaction(xdr, {
      network: 'TESTNET',
    });

    // 6. İşlemi gönder
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, StellarSdk.Networks.TESTNET);
    const result = await server.submitTransaction(tx);

    // 7. DonationData objesi oluştur
    const donation: DonationData = {
      id: result.hash,
      amount,
      category,
      region,
      timestamp: new Date().toISOString(),
      transactionHash: result.hash,
      status: 'completed',
      donorAddress: publicKey,
    };
    return donation;
  } catch (error: any) {
    console.error('Donation creation error:', error);
    throw new Error(error?.message || 'Donation transaction failed.');
  }
};

// Get donation history (on-chain)
export const getDonationHistory = async (publicKey: string): Promise<DonationData[]> => {
  try {
    const server = new StellarSdk.Server(HORIZON_URL);
    // Sadece gönderici olduğu işlemleri çek
    const payments = await server.payments().forAccount(publicKey).order('desc').limit(20).call();
    const donations: DonationData[] = payments.records
      .filter((op: any) => op.type === 'payment' && op.asset_type === 'native' && op.from === publicKey)
      .map((op: any) => ({
        id: op.id,
        amount: op.amount,
        category: 'money', // On-chain'den kategori bilgisi alınamaz, default 'money'
        region: 'unknown', // On-chain'den bölge bilgisi alınamaz, default 'unknown'
        timestamp: op.created_at,
        transactionHash: op.transaction_hash,
        status: 'completed',
        donorAddress: op.from,
      }));
    return donations;
  } catch (error) {
    console.error('Error loading on-chain donation history:', error);
    return [];
  }
};

// Get wallet balance (should be via API route)
export const getWalletBalance = async (): Promise<string> => {
  // TODO: Implement via API route
  return '0';
};

// Format XLM amount for display
export const formatXLM = (amount: string): string => {
  const num = parseFloat(amount);
  return num.toFixed(2);
};

// Get transaction status (should be via API route)
export const getTransactionStatus = async (transactionHash: string): Promise<'pending' | 'completed' | 'failed'> => {
  // TODO: Implement via API route
  return 'pending';
}; 