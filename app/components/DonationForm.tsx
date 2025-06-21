'use client';

import { useState } from 'react';
import { createDonation, formatXLM, WalletInfo } from '../utils/stellar';

interface DonationFormProps {
  isOpen: boolean;
  onClose: () => void;
  walletInfo: WalletInfo | null;
  onDonationSuccess: () => void;
}

export default function DonationForm({ 
  isOpen, 
  onClose, 
  walletInfo, 
  onDonationSuccess 
}: DonationFormProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCategory, setDonationCategory] = useState('money');
  const [donationRegion, setDonationRegion] = useState('istanbul');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletInfo?.isConnected) {
      setError('Wallet connection required to make donation.');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    if (parseFloat(donationAmount) > parseFloat(walletInfo.balance)) {
      setError('Insufficient balance in your wallet.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createDonation(donationAmount, donationCategory, donationRegion);
      setSuccess(true);
      setDonationAmount('');
      onDonationSuccess();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Donation transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold gradient-text">Create Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-300"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-green-400 mb-4">Donation Successful!</h3>
            <p className="text-gray-300 text-lg mb-2">
              Your donation of <span className="text-green-400 font-semibold">{formatXLM(donationAmount)} XLM</span> has been sent successfully.
            </p>
            <p className="text-gray-400 text-sm">
              Transaction recorded on Stellar blockchain for transparency.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Status */}
            {!walletInfo?.isConnected ? (
              <div className="glass p-4 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full pulse"></div>
                  <p className="text-yellow-300 text-sm">
                    Please connect your Stellar wallet to make a donation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass p-4 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full pulse"></div>
                  <p className="text-green-300 text-sm font-medium">
                    Wallet Connected
                  </p>
                </div>
                <p className="text-gray-300 text-xs">
                  {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
                </p>
                <p className="text-green-400 text-sm mt-1 font-semibold">
                  Balance: {formatXLM(walletInfo.balance)} XLM
                </p>
              </div>
            )}

            {/* Donation Amount */}
            <div>
              <label className="block text-gray-300 font-semibold mb-3 text-lg">
                💰 Donation Amount (XLM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0000001"
                  min="0.0000001"
                  max={walletInfo?.balance || undefined}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="e.g., 10.5"
                  disabled={loading || !walletInfo?.isConnected}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  XLM
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Minimum: 0.0000001 XLM • Maximum: {walletInfo?.balance ? formatXLM(walletInfo.balance) : '∞'} XLM
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-gray-300 font-semibold mb-3 text-lg">
                📦 Category
              </label>
              <select
                className="w-full p-4 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white transition-all duration-300"
                value={donationCategory}
                onChange={(e) => setDonationCategory(e.target.value)}
                disabled={loading}
              >
                <option value="money" className="bg-gray-800">💰 Money</option>
                <option value="blanket" className="bg-gray-800">🛏️ Blanket</option>
                <option value="food" className="bg-gray-800">🍽️ Food</option>
                <option value="clothing" className="bg-gray-800">👕 Clothing</option>
                <option value="medicine" className="bg-gray-800">💊 Medicine</option>
                <option value="cleaning" className="bg-gray-800">🧹 Cleaning Supplies</option>
              </select>
            </div>

            {/* Region Selection */}
            <div>
              <label className="block text-gray-300 font-semibold mb-3 text-lg">
                🌍 Region
              </label>
              <select
                className="w-full p-4 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-white transition-all duration-300"
                value={donationRegion}
                onChange={(e) => setDonationRegion(e.target.value)}
                disabled={loading}
              >
                <option value="istanbul" className="bg-gray-800">🏛️ Istanbul</option>
                <option value="ankara" className="bg-gray-800">🏛️ Ankara</option>
                <option value="izmir" className="bg-gray-800">🌊 Izmir</option>
                <option value="antalya" className="bg-gray-800">🏖️ Antalya</option>
                <option value="bursa" className="bg-gray-800">🌳 Bursa</option>
                <option value="adana" className="bg-gray-800">🌾 Adana</option>
                <option value="gaziantep" className="bg-gray-800">🏺 Gaziantep</option>
                <option value="konya" className="bg-gray-800">🕌 Konya</option>
                <option value="other" className="bg-gray-800">🌐 Other</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="glass p-4 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full pulse"></div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !walletInfo?.isConnected}
                className="flex-1 btn-primary py-4 text-lg glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>💝 Make Donation</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 glass py-4 text-lg font-semibold border border-white/20 hover:border-white/40 transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 