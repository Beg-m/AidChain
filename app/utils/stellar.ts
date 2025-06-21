import FreighterApi from '@stellar/freighter-api';
import StellarSdk from '@stellar/stellar-sdk';

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
    if (!CONTRACT_ID) {
      throw new Error('Smart contract not deployed');
    }

    const { address: donorAddress } = await freighterApi.getAddress();
    
    // Create transaction for smart contract call
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(donorAddress);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK,
    })
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          hostFunction: StellarSdk.HostFunction.invokeContract({
            contractId: CONTRACT_ID,
            functionName: 'create_donation',
            args: [
              StellarSdk.nativeToScVal(donorAddress, 'address'),
              StellarSdk.nativeToScVal(parseFloat(amount) * 10000000, 'i128'), // Convert to stroops
              StellarSdk.nativeToScVal(category, 'string'),
              StellarSdk.nativeToScVal(region, 'string'),
            ],
          }),
        })
      )
      .setTimeout(30)
      .build();

    // Sign and submit transaction
    const signedTx = await freighterApi.signTransaction(transaction.toXDR(), STELLAR_NETWORK);
    const result = await server.submitTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTx, STELLAR_NETWORK));

    if (result.successful) {
      // Create donation object from transaction result
      const donation: SmartContractDonation = {
        donor: donorAddress,
        amount,
        category,
        region,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'completed',
      };

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

// Check if smart contract is available
export const isSmartContractAvailable = (): boolean => {
  return !!CONTRACT_ID;
};

// Helper function to convert XLM to stroops
export const xlmToStroops = (xlm: string): string => {
  const amount = parseFloat(xlm) * 10000000;
  return amount.toString();
};

// Helper function to convert stroops to XLM
export const stroopsToXlm = (stroops: string): string => {
  const amount = BigInt(stroops);
  return (Number(amount) / 10000000).toString();
}; 