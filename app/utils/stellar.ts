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
    const { address: publicKey } = await freighterApi.getAddress();
    // Account info and sequence number should be fetched via API in production
    // For demo, we cannot build a real transaction without account info
    // Instead, you should POST to an API route that builds and submits the transaction
    throw new Error('Transaction building must be done on the server/API route for security and compatibility.');
  } catch (error) {
    console.error('Donation creation error:', error);
    throw error;
  }
};

// Get donation history
export const getDonationHistory = (): DonationData[] => {
  try {
    const donations = localStorage.getItem('donations');
    return donations ? JSON.parse(donations) : [];
  } catch (error) {
    console.error('Error loading donation history:', error);
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