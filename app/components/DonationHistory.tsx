'use client';

import { useState, useEffect } from 'react';
import { getDonationHistory, DonationData, formatXLM, WalletInfo } from '../utils/stellar';
import { demoDonations } from '../utils/demoData';

interface DonationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  walletInfo: WalletInfo | null;
}

export default function DonationHistory({ isOpen, onClose, walletInfo }: DonationHistoryProps) {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (walletInfo?.publicKey) {
        loadDonationHistory(walletInfo.publicKey);
      } else {
        // Demo modunda örnek verileri göster
        setDonations(demoDonations);
        setError(null);
        setLoading(false);
      }
    }
  }, [isOpen, walletInfo]);

  const loadDonationHistory = async (publicKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const history = await getDonationHistory(publicKey);
      setDonations(history);
    } catch (err: any) {
      setError('Failed to load donation history.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'blanket':
        return 'Blanket';
      case 'food':
        return 'Food';
      case 'clothing':
        return 'Clothing';
      case 'money':
        return 'Money';
      case 'medicine':
        return 'Medicine';
      case 'cleaning':
        return 'Cleaning Supplies';
      default:
        return category;
    }
  };

  const getRegionText = (region: string) => {
    switch (region) {
      case 'istanbul':
        return 'Istanbul';
      case 'ankara':
        return 'Ankara';
      case 'izmir':
        return 'Izmir';
      case 'antalya':
        return 'Antalya';
      case 'bursa':
        return 'Bursa';
      case 'adana':
        return 'Adana';
      case 'gaziantep':
        return 'Gaziantep';
      case 'konya':
        return 'Konya';
      case 'other':
        return 'Other';
      default:
        return region;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Donation History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
          <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${walletInfo?.publicKey ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{walletInfo?.publicKey ? 'On-Chain Data' : 'Demo Data'}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-600">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-lg mb-2">{error}</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-lg mb-2">No donation history yet</p>
            <p className="text-sm">Your donations will appear here after your first donation</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {formatXLM(donation.amount)} XLM
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusText(donation.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Category:</span> {getCategoryText(donation.category)}
                        </div>
                        <div>
                          <span className="font-medium">Region:</span> {getRegionText(donation.region)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(donation.timestamp)}
                        </div>
                        <div>
                          <span className="font-medium">From:</span> {donation.donorAddress.slice(0, 8)}...{donation.donorAddress.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Transaction Hash:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${donation.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {donation.transactionHash.slice(0, 16)}...{donation.transactionHash.slice(-16)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Donations: {donations.length}</span>
            <span>
              Total Amount: {formatXLM(donations.reduce((sum, d) => sum + parseFloat(d.amount), 0).toString())} XLM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 