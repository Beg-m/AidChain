import { SorobanRpc, Contract, Networks, Address, ScVal, scValToNative, nativeToScVal } from 'soroban-client';

// Soroban RPC configuration
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Contract configuration
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';

export interface SorobanDonation {
  donor: string;
  amount: string;
  category: string;
  region: string;
  timestamp: number;
  status: string;
  deliveryNftId?: string;
}

export interface SorobanStats {
  totalDonations: number;
  totalAmount: string;
  categoryStats: Record<string, number>;
  regionStats: Record<string, number>;
}

class SorobanClient {
  private rpc: SorobanRpc;
  private contract: Contract;

  constructor() {
    this.rpc = new SorobanRpc(SOROBAN_RPC_URL);
    this.contract = new Contract(CONTRACT_ID);
  }

  // Helper function to convert ScVal to native types
  private scValToNative<T>(scVal: ScVal): T {
    return scValToNative(scVal) as T;
  }

  // Helper function to convert native types to ScVal
  private nativeToScVal(value: any): ScVal {
    return nativeToScVal(value);
  }

  // Create a new donation on the smart contract
  async createDonation(
    donorAddress: string,
    amount: string,
    category: string,
    region: string,
    signAndSendTransaction: (transaction: any) => Promise<any>
  ): Promise<SorobanDonation> {
    try {
      const donor = new Address(donorAddress);
      const amountValue = BigInt(parseFloat(amount) * 10000000); // Convert to stroops (7 decimals)

      const transaction = await this.contract.call(
        'create_donation',
        this.nativeToScVal(donor),
        this.nativeToScVal(amountValue),
        this.nativeToScVal(category),
        this.nativeToScVal(region)
      );

      const result = await signAndSendTransaction(transaction);
      
      if (result.status === 'SUCCESS') {
        // Parse the result to get donation details
        const donationData = this.scValToNative<any>(result.result);
        return {
          donor: donationData.donor,
          amount: donationData.amount,
          category: donationData.category,
          region: donationData.region,
          timestamp: donationData.timestamp,
          status: donationData.status,
          deliveryNftId: donationData.delivery_nft_id
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  // Get all donations from the smart contract
  async getDonations(): Promise<SorobanDonation[]> {
    try {
      const result = await this.contract.call('get_donations');
      const donations = this.scValToNative<any[]>(result.result);
      
      return donations.map(donation => ({
        donor: donation.donor,
        amount: donation.amount,
        category: donation.category,
        region: donation.region,
        timestamp: donation.timestamp,
        status: donation.status,
        deliveryNftId: donation.delivery_nft_id
      }));
    } catch (error) {
      console.error('Error getting donations:', error);
      throw error;
    }
  }

  // Get donations by donor address
  async getDonationsByDonor(donorAddress: string): Promise<SorobanDonation[]> {
    try {
      const donor = new Address(donorAddress);
      const result = await this.contract.call('get_donations_by_donor', this.nativeToScVal(donor));
      const donations = this.scValToNative<any[]>(result.result);
      
      return donations.map(donation => ({
        donor: donation.donor,
        amount: donation.amount,
        category: donation.category,
        region: donation.region,
        timestamp: donation.timestamp,
        status: donation.status,
        deliveryNftId: donation.delivery_nft_id
      }));
    } catch (error) {
      console.error('Error getting donations by donor:', error);
      throw error;
    }
  }

  // Confirm delivery of a donation
  async confirmDelivery(
    donationIndex: number,
    nftId: string,
    signAndSendTransaction: (transaction: any) => Promise<any>
  ): Promise<SorobanDonation> {
    try {
      const transaction = await this.contract.call(
        'confirm_delivery',
        this.nativeToScVal(donationIndex),
        this.nativeToScVal(nftId)
      );

      const result = await signAndSendTransaction(transaction);
      
      if (result.status === 'SUCCESS') {
        const donationData = this.scValToNative<any>(result.result);
        return {
          donor: donationData.donor,
          amount: donationData.amount,
          category: donationData.category,
          region: donationData.region,
          timestamp: donationData.timestamp,
          status: donationData.status,
          deliveryNftId: donationData.delivery_nft_id
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  }

  // Get donation statistics
  async getStats(): Promise<SorobanStats> {
    try {
      const result = await this.contract.call('get_stats');
      const stats = this.scValToNative<any>(result.result);
      
      return {
        totalDonations: stats.total_donations,
        totalAmount: stats.total_amount,
        categoryStats: stats.category_stats,
        regionStats: stats.region_stats
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Get donations by category
  async getDonationsByCategory(category: string): Promise<SorobanDonation[]> {
    try {
      const result = await this.contract.call('get_donations_by_category', this.nativeToScVal(category));
      const donations = this.scValToNative<any[]>(result.result);
      
      return donations.map(donation => ({
        donor: donation.donor,
        amount: donation.amount,
        category: donation.category,
        region: donation.region,
        timestamp: donation.timestamp,
        status: donation.status,
        deliveryNftId: donation.delivery_nft_id
      }));
    } catch (error) {
      console.error('Error getting donations by category:', error);
      throw error;
    }
  }

  // Get donations by region
  async getDonationsByRegion(region: string): Promise<SorobanDonation[]> {
    try {
      const result = await this.contract.call('get_donations_by_region', this.nativeToScVal(region));
      const donations = this.scValToNative<any[]>(result.result);
      
      return donations.map(donation => ({
        donor: donation.donor,
        amount: donation.amount,
        category: donation.category,
        region: donation.region,
        timestamp: donation.timestamp,
        status: donation.status,
        deliveryNftId: donation.delivery_nft_id
      }));
    } catch (error) {
      console.error('Error getting donations by region:', error);
      throw error;
    }
  }

  // Get total amount donated
  async getTotalAmount(): Promise<string> {
    try {
      const result = await this.contract.call('get_total_amount');
      return this.scValToNative<string>(result.result);
    } catch (error) {
      console.error('Error getting total amount:', error);
      throw error;
    }
  }

  // Get donation count
  async getDonationCount(): Promise<number> {
    try {
      const result = await this.contract.call('get_donation_count');
      return this.scValToNative<number>(result.result);
    } catch (error) {
      console.error('Error getting donation count:', error);
      throw error;
    }
  }

  // Check if contract is deployed
  async isContractDeployed(): Promise<boolean> {
    try {
      if (!CONTRACT_ID) return false;
      
      const ledger = await this.rpc.getLatestLedger();
      return ledger.sequence > 0;
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sorobanClient = new SorobanClient();

// Helper functions for conversion
export const formatStroopsToXLM = (stroops: string): string => {
  const amount = BigInt(stroops);
  return (Number(amount) / 10000000).toString();
};

export const formatXLMToStroops = (xlm: string): string => {
  const amount = parseFloat(xlm) * 10000000;
  return amount.toString();
}; 