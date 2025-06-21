'use client';

import { useState, useEffect } from 'react';
import { connectWallet, disconnectWallet, getWalletBalance, formatXLM, WalletInfo, loadDemoBalance, isFreighterInstalled } from '../utils/stellar';

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
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [freighterInstalled, setFreighterInstalled] = useState(true);

  useEffect(() => {
    const checkInstallation = async () => {
      const installed = await isFreighterInstalled();
      setFreighterInstalled(installed);
    };
    checkInstallation();
  }, []);

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

  const handleLoadDemoBalance = async () => {
    setLoadingDemo(true);
    setError(null);
    try {
      const demoBalance = '10000';
      localStorage.setItem('demoBalance', demoBalance);

      const demoWalletInfo: WalletInfo = {
        publicKey: 'G-DEMO-ACCOUNT-FOR-TESTING-PURPOSES',
        isConnected: true,
        balance: demoBalance,
      };
      onWalletConnected(demoWalletInfo);
    } catch (error: any) {
      setError(error.message || 'Failed to load demo balance.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleInstallFreighter = () => {
    window.open('https://www.freighter.app/', '_blank');
  };

  const demoButton = (
    <button
      onClick={handleLoadDemoBalance}
      className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300 ease-in-out shadow-md flex items-center justify-center mt-4"
      disabled={loadingDemo}
    >
      {loadingDemo ? (
        "Loading..."
      ) : (
        "Load 10,000 XLM Demo"
      )}
    </button>
  );

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
              "Disconnect"
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
        
        {demoButton}
      </div>
    );
  }

  if (!freighterInstalled) {
    return (
      <div className="glass p-6 border border-yellow-500/30 rounded-lg text-center">
        <div className="flex items-center gap-3 mb-3 justify-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full pulse"></div>
            <h3 className="text-xl font-semibold text-yellow-400">Freighter Wallet Required</h3>
        </div>
        <p className="text-gray-300 text-sm mb-6">
          To connect your wallet and make donations, you need the Freighter browser extension.
        </p>
        <button
          onClick={handleInstallFreighter}
          className="btn-primary px-6 py-3 text-sm font-medium glow"
        >
          Install Freighter Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-6 border border-blue-500/30 rounded-lg">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full pulse"></div>
          <h3 className="text-xl font-semibold text-blue-400">Stellar Wallet Connection</h3>
        </div>
        <p className="text-gray-300 text-sm">
          Connect your Freighter wallet to make secure blockchain donations
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleConnect}
          disabled={loading}
          className="flex-1 btn-primary px-6 py-3 text-sm font-medium glow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Connecting...</span>
            </>
          ) : (
            "Connect Wallet"
          )}
        </button>
        <button
          onClick={handleInstallFreighter}
          className="flex-1 glass px-6 py-3 text-sm font-medium border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Get Freighter
        </button>
      </div>
      
      <div className="mt-4">
        {demoButton}
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