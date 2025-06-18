'use client';

import { useState, useEffect } from 'react';
import { connectWallet, disconnectWallet, getWalletBalance, formatXLM, WalletInfo } from '../utils/stellar';

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
    if (walletInfo?.isConnected) {
      updateBalance();
      const interval = setInterval(updateBalance, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [walletInfo?.isConnected]);

  const updateBalance = async () => {
    try {
      const newBalance = await getWalletBalance();
      setBalance(newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const walletInfo = await connectWallet();
      onWalletConnected(walletInfo);
      setBalance(walletInfo.balance);
    } catch (error: any) {
      setError(error.message || 'Cüzdan bağlantısı başarısız oldu.');
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
      setError(error.message || 'Cüzdan bağlantısı kesilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (walletInfo?.isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800">Cüzdan Bağlı</h3>
            <p className="text-sm text-green-600">
              Adres: {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
            </p>
            <p className="text-sm text-green-600">
              Bakiye: {formatXLM(balance)} XLM
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Bağlantı Kesiliyor...' : 'Bağlantıyı Kes'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">Stellar Cüzdan Bağlantısı</h3>
          <p className="text-sm text-blue-600">
            Bağış yapmak için Freighter cüzdanınızı bağlayın
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
} 