import FreighterApi from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

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
  status: 'pending' | 'completed' | 'failed' | 'delivered';
  donorAddress: string;
  deliveryNftId?: string; // Optional field for the NFT ID
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

// DUMMY: Create donation transaction for demo purposes
export const createDonation = async (
  amount: string,
  category: string,
  region: string
): Promise<DonationData> => {
  try {
    const { address: publicKey } = await freighterApi.getAddress();
    
    const newDonation: DonationData = {
      id: `demo-${Date.now()}`,
      amount,
      category,
      region,
      timestamp: new Date().toISOString(),
      transactionHash: `dummy_tx_${Date.now()}` + Math.random().toString(36).substring(2, 15),
      status: 'completed', // For demo, assume it's completed instantly
      donorAddress: publicKey,
    };

    const existingDonations = await getDonationHistory();
    localStorage.setItem('donations', JSON.stringify([newDonation, ...existingDonations]));

    return newDonation;
  } catch (error: any) {
    console.error('Donation creation error:', error);
    throw new Error(error?.message || 'Donation transaction failed.');
  }
};

// Get donation history (supports both demo and on-chain data)
export const getDonationHistory = async (publicKey?: string): Promise<DonationData[]> => {
  try {
    // If publicKey is provided, try to get on-chain data
    if (publicKey) {
      const server = new StellarSdk.Server(HORIZON_URL);
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
    } else {
      // Fallback to demo data from localStorage
      const donations = localStorage.getItem('donations');
      return donations ? JSON.parse(donations) : [];
    }
  } catch (error) {
    console.error('Error loading donation history:', error);
    // Fallback to demo data if on-chain fails
    const donations = localStorage.getItem('donations');
    return donations ? JSON.parse(donations) : [];
  }
};

// DUMMY: Confirm delivery and create a fake NFT ID
export const confirmDelivery = async (donationId: string): Promise<DonationData> => {
  try {
    const donations = await getDonationHistory();
    const donationIndex = donations.findIndex((d: DonationData) => d.id === donationId);

    if (donationIndex === -1) {
      throw new Error('Donation not found');
    }

    const updatedDonation = {
      ...donations[donationIndex],
      status: 'delivered' as const,
      deliveryNftId: `nft-aid-${Date.now()}`
    };

    donations[donationIndex] = updatedDonation;
    localStorage.setItem('donations', JSON.stringify(donations));

    return updatedDonation;
  } catch (error) {
    console.error('Error confirming delivery:', error);
    throw error;
  }
};

// Get wallet balance
export const getWalletBalance = async (publicKey: string): Promise<string> => {
  try {
    const response = await fetch('/api/getWalletBalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey }),
    });
    const data = await response.json();
    return data.balance || '0.00';
  } catch (error) {
    console.error('Balance fetch error:', error);
    return '0.00';
  }
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