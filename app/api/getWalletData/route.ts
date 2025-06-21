import { NextRequest, NextResponse } from 'next/server';
import StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new StellarSdk.Server(HORIZON_URL);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicKey = searchParams.get('publicKey');

  if (!publicKey) {
    return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
  }

  try {
    // Fetch account balance
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find(
      (b: any) => b.asset_type === 'native'
    )?.balance || '0';

    // Fetch payment history
    const payments = await server.payments().forAccount(publicKey).order('desc').limit(20).call();
    const history = payments.records
      .filter((op: any) => op.type === 'payment' && op.asset_type === 'native' && op.from === publicKey)
      .map((op: any) => ({
        id: op.id,
        amount: op.amount,
        organization: op.to, // Using 'to' as a stand-in for organization for now
        timestamp: op.created_at,
        transactionHash: op.transaction_hash,
        status: 'completed',
        donorAddress: op.from,
        category: 'On-Chain',
        region: 'Global',
      }));

    return NextResponse.json({ balance, history });

  } catch (error: any) {
    // Handle cases where the account doesn't exist on the network yet
    if (error.response && error.response.status === 404) {
      return NextResponse.json({ balance: '0', history: [] });
    }
    console.error('Stellar API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch wallet data' }, { status: 500 });
  }
} 