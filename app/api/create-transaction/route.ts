import { NextRequest, NextResponse } from 'next/server';
import StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const STELLAR_NETWORK = 'Test SDF Network ; September 2015';
const server = new StellarSdk.Server(HORIZON_URL);
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';

export async function POST(req: NextRequest) {
  try {
    const { donorAddress, amount, category, region } = await req.json();

    if (!donorAddress || !amount || !category || !region) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!CONTRACT_ID) {
        throw new Error('Smart contract not deployed');
    }

    const account = await server.loadAccount(donorAddress);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_NETWORK,
    })
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          function: StellarSdk.HostFunction.invokeContract({
            contractId: CONTRACT_ID,
            functionName: 'create_donation',
            args: [
              StellarSdk.nativeToScVal(donorAddress, { type: 'address' }),
              StellarSdk.nativeToScVal(parseFloat(amount) * 10000000, { type: 'i128' }),
              StellarSdk.nativeToScVal(category, { type: 'string' }),
              StellarSdk.nativeToScVal(region, { type: 'string' }),
            ]
          }),
        })
      )
      .setTimeout(30)
      .build();
    
    const transactionXDR = transaction.toXDR();
    return NextResponse.json({ xdr: transactionXDR });

  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 });
  }
} 