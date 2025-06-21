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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Create Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">Donation Successful!</h3>
            <p className="text-gray-600">
              Your donation of {formatXLM(donationAmount)} XLM has been sent successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!walletInfo?.isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Please connect your Stellar wallet to make a donation.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Wallet connected: {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Balance: {formatXLM(walletInfo.balance)} XLM
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Donation Amount (XLM)
              </label>
              <input
                type="number"
                step="0.0000001"
                min="0.0000001"
                max={walletInfo?.balance || undefined}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="e.g., 10.5"
                disabled={loading || !walletInfo?.isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 0.0000001 XLM
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationCategory}
                onChange={(e) => setDonationCategory(e.target.value)}
                disabled={loading}
              >
                <option value="money">Money</option>
                <option value="blanket">Blanket</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="medicine">Medicine</option>
                <option value="cleaning">Cleaning Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Region
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationRegion}
                onChange={(e) => setDonationRegion(e.target.value)}
                disabled={loading}
              >
                <option value="istanbul">Istanbul</option>
                <option value="ankara">Ankara</option>
                <option value="izmir">Izmir</option>
                <option value="antalya">Antalya</option>
                <option value="bursa">Bursa</option>
                <option value="adana">Adana</option>
                <option value="gaziantep">Gaziantep</option>
                <option value="konya">Konya</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !walletInfo?.isConnected}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Make Donation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow transition-colors disabled:opacity-50"
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