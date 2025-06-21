import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function POST(req: NextRequest) {
  const { publicKey } = await req.json();
  try {
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    );
    return NextResponse.json({ balance: nativeBalance ? nativeBalance.balance : '0.00' });
  } catch (error: any) {
    return NextResponse.json({ balance: '0.00', error: error.message }, { status: 200 });
  }
} 