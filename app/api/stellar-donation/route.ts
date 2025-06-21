import { NextRequest, NextResponse } from 'next/server';
import StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const STELLAR_NETWORK = 'Test SDF Network ; September 2015';
const server = new StellarSdk.Server(HORIZON_URL);

export async function POST(req: NextRequest) {
  try {
    const { xdr } = await req.json();
    if (!xdr) {
      return NextResponse.json({ error: 'Missing XDR' }, { status: 400 });
    }

    // Parse transaction
    const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, STELLAR_NETWORK);

    // Submit transaction
    const result = await server.submitTransaction(tx);
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
} 