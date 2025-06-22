import FreighterApi from '@stellar/freighter-api';
import StellarSdk from '@stellar/stellar-sdk';
// NOTE: StellarSdk is now only used on the server-side in API routes.

// Stellar network configuration
const STELLAR_NETWORK = "Test SDF Network ; September 2015";
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
// const server = new StellarSdk.Server(HORIZON_URL); // REMOVED: Only use on server/API

// Smart Contract Configuration
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

// Initialize Freighter API
const freighterApi = FreighterApi;

export interface DonationData {
  id: string;
  amount: string;
  category: string;
  region: string;
  organization: string;
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

export interface SmartContractDonation {
  donor: string;
  amount: string;
  category: string;
  region: string;
  timestamp: number;
  status: string;
  deliveryNftId?: string;
}

export interface SmartContractStats {
  totalDonations: number;
  totalAmount: string;
  categoryStats: Record<string, number>;
  regionStats: Record<string, number>;
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

// Smart Contract Functions
export const createSmartContractDonation = async (
  amount: string,
  category: string,
  region: string
): Promise<SmartContractDonation> => {
  try {
    const { address: donorAddress } = await freighterApi.getAddress();
    
    // 1. Create the transaction on the server
    const createResponse = await fetch('/api/create-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donorAddress, amount, category, region }),
    });
    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error || 'Failed to create transaction');
    }
    const { xdr } = await createResponse.json();

    // 2. Sign the transaction on the client
    const signedTx = await freighterApi.signTransaction(xdr, { networkPassphrase: STELLAR_NETWORK });

    // 3. Submit the signed transaction on the server
    const submitResponse = await fetch('/api/stellar-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xdr: signedTx }),
    });

    if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new Error(error.error || 'Failed to submit transaction');
    }

    const { result } = await submitResponse.json();

    if (result.successful) {
      const donation: SmartContractDonation = {
        donor: donorAddress,
        amount,
        category,
        region,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'completed',
      };
      
      // Also save to localStorage for donation history
      const donationData: DonationData = {
        id: `smart-${Date.now()}`,
        amount,
        category,
        region,
        organization: 'Smart Contract',
        timestamp: new Date().toISOString(),
        transactionHash: result.hash || `smart_tx_${Date.now()}`,
        status: 'completed',
        donorAddress,
      };
      
      const existingDonations = await getDonationHistory();
      localStorage.setItem('donations', JSON.stringify([donationData, ...existingDonations]));
      
      return donation;
    } else {
      throw new Error('Smart contract transaction failed');
    }
  } catch (error: any) {
    console.error('Smart contract donation error:', error);
    throw new Error(error?.message || 'Smart contract donation failed.');
  }
};

// Get smart contract donations
export const getSmartContractDonations = async (): Promise<SmartContractDonation[]> => {
  try {
    if (!CONTRACT_ID) {
      return [];
    }
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(CONTRACT_ID);
    
    // This is a simplified approach - in a real implementation, you'd need to parse contract events
    // For now, we'll return an empty array and implement this properly when contract is deployed
    return [];
  } catch (error) {
    console.error('Error getting smart contract donations:', error);
    return [];
  }
};

// Get smart contract statistics
export const getSmartContractStats = async (): Promise<SmartContractStats> => {
  try {
    if (!CONTRACT_ID) {
      return {
        totalDonations: 0,
        totalAmount: '0',
        categoryStats: {},
        regionStats: {},
      };
    }

    // This would call the smart contract's get_stats function
    // For now, return default stats
    return {
      totalDonations: 0,
      totalAmount: '0',
      categoryStats: {},
      regionStats: {},
    };
  } catch (error) {
    console.error('Error getting smart contract stats:', error);
    return {
      totalDonations: 0,
      totalAmount: '0',
      categoryStats: {},
      regionStats: {},
    };
  }
};

// DUMMY: Create donation transaction for demo purposes
export const createDonation = async (
  amount: string,
  category: string,
  region: string,
  organization: string
): Promise<DonationData> => {
  try {
    const { address: publicKey } = await freighterApi.getAddress();
    
    // Update demo balance if it exists
    const currentDemoBalance = getDemoBalance();
    if (currentDemoBalance !== '0') {
      const newBalance = parseFloat(currentDemoBalance) - parseFloat(amount);
      if (newBalance >= 0) {
        localStorage.setItem('demoBalance', newBalance.toString());
      } else {
        throw new Error('Insufficient demo balance');
      }
    }
    
    const newDonation: DonationData = {
      id: `demo-${Date.now()}`,
      amount,
      category,
      region,
      organization,
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
    // If publicKey is provided and it's a real wallet (not demo), filter donations by wallet
    if (publicKey && !publicKey.startsWith('G-DEMO')) {
      // Get local donations and filter by the connected wallet
      const localData = localStorage.getItem('donations');
      const allLocalDonations: DonationData[] = localData ? JSON.parse(localData) : [];
      
      // Filter donations that belong to this specific wallet
      const walletDonations = allLocalDonations.filter(donation => 
        donation.donorAddress === publicKey
      );
      
      // Try to get on-chain data via our API route
      try {
        const response = await fetch(`/api/getWalletData?publicKey=${publicKey}`);
        if (response.ok) {
          const { history } = await response.json();
          // Combine wallet-specific local donations with on-chain data
          const combinedDonations = [...walletDonations, ...history];
          // Sort by timestamp (newest first)
          return combinedDonations.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      } catch (error) {
        console.error('Error fetching on-chain data:', error);
        // Fall back to wallet-specific local data only
      }
      
      // Return only wallet-specific donations
      return walletDonations.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    
    // For demo mode or no wallet connected, return all local donations
    const localData = localStorage.getItem('donations');
    const localDonations: DonationData[] = localData ? JSON.parse(localData) : [];
    return localDonations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting donation history:', error);
    return []; // Return empty array on error
  }
};

// Get wallet balance from our API route
export const getWalletBalance = async (): Promise<string> => {
  try {
    const { address: publicKey } = await freighterApi.getAddress();
    if (publicKey.startsWith('G-DEMO')) {
      return getDemoBalance();
    }
    
    const response = await fetch(`/api/getWalletData?publicKey=${publicKey}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch balance');
    }
    const { balance } = await response.json();
    return balance;

  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return '0'; // Return '0' on error
  }
};

// Format XLM string for display
export const formatXLM = (amount: string): string => {
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
};

// Get transaction status (should be via API route)
export const getTransactionStatus = async (transactionHash: string): Promise<'pending' | 'completed' | 'failed'> => {
  // TODO: Implement via API route
  return 'pending';
};

// Check if smart contract is configured
export const isSmartContractAvailable = (): boolean => {
  return !!CONTRACT_ID;
};

// Load demo balance
export const loadDemoBalance = async (amount: string = '10000'): Promise<string> => {
  localStorage.setItem('demoBalance', amount);
  // This is a mock implementation. A real one might need to update wallet state.
  return amount;
};

// Get demo balance
export const getDemoBalance = (): string => {
  return localStorage.getItem('demoBalance') || '0';
}; 