'use client';

import { useState, useEffect } from 'react';
import { connectWallet, disconnectWallet, getWalletBalance, formatXLM, WalletInfo } from '../utils/stellar';
import * as StellarSdk from '@stellar/stellar-sdk';

interface WalletConnectionProps {
  onWalletConnected: (walletInfo: WalletInfo) => void;
  onWalletDisconnected: () => void;
  walletInfo: WalletInfo | null;
}

export default function WalletConnection({ 
  onWalletConnected, 
  onWalletDisconnected, 
  walletInfo 
}: WalletConnectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  // Update balance periodically when wallet is connected
  useEffect(() => {
    if (walletInfo?.isConnected && walletInfo?.publicKey) {
      updateBalance(walletInfo.publicKey);
      const interval = setInterval(() => updateBalance(walletInfo.publicKey), 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [walletInfo?.isConnected, walletInfo?.publicKey]);

  const updateBalance = async (publicKey: string) => {
    try {
      const newBalance = await getWalletBalance(publicKey);
      setBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const newWalletInfo = await connectWallet();
      const initialBalance = await getWalletBalance(newWalletInfo.publicKey);
      
      const fullWalletInfo = { ...newWalletInfo, balance: initialBalance };

      onWalletConnected(fullWalletInfo);
      setBalance(initialBalance);
    } catch (error: any) {
      setError(error.message || 'Wallet connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectWallet();
      onWalletDisconnected();
      setBalance('0');
    } catch (error: any) {
      setError(error.message || 'Error disconnecting wallet.');
    } finally {
      setLoading(false);
    }
  };

  if (walletInfo?.isConnected) {
    return (
      <div className="glass p-6 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full pulse"></div>
              <h3 className="text-xl font-semibold text-green-400">Wallet Connected</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Address:</span>
                <span className="text-gray-300 text-sm font-mono">
                  {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Balance:</span>
                <span className="text-green-400 text-lg font-bold">
                  {formatXLM(walletInfo.balance)} XLM
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="glass px-6 py-3 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="spinner"></div>
                <span>Disconnecting...</span>
              </div>
            ) : (
              <span>🔌 Disconnect</span>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full pulse"></div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="glass p-6 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full pulse"></div>
              <h3 className="text-xl font-semibold text-blue-400">Stellar Wallet Connection</h3>
            </div>
            
            <p className="text-gray-300 text-sm">
              Connect your Freighter wallet to make secure blockchain donations
            </p>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-primary px-6 py-3 text-sm font-medium glow disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="spinner"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <span>🔗 Connect Wallet</span>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full pulse"></div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass p-6 border border-blue-500/30 rounded-lg mt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full pulse"></div>
              <h3 className="text-xl font-semibold text-blue-400">Create a Secure Wallet</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              We recommend using the official Freighter wallet for the best security. Click the button to go to the Freighter website and create your wallet.
            </p>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block px-6 py-3 text-sm font-medium glow"
            >
              Go to Freighter
            </a>
          </div>
        </div>
      </div>
    </>
  );
} 