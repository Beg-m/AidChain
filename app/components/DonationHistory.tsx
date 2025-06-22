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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
      console.log('Loaded donation history:', history); // Debug log
      setDonations(history);
    } catch (err: any) {
      console.error('Error loading donation history:', err);
      setError('Failed to load donation history. Showing demo data instead.');
      // Fallback to demo data
      setDonations(demoDonations);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (donationId: string) => {
    // This functionality is currently placeholder and will be fully implemented later.
    alert(`Confirmation for donation ${donationId} is a feature in development.`);
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
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'delivered':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅ Completed';
      case 'pending':
        return '⏳ Pending';
      case 'failed':
        return '❌ Failed';
      case 'delivered':
        return '📦 Delivered';
      default:
        return '❓ Unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blanket':
        return '🛏️';
      case 'food':
        return '🍽️';
      case 'clothing':
        return '👕';
      case 'money':
        return '💰';
      case 'medicine':
        return '💊';
      case 'cleaning':
        return '🧹';
      default:
        return '📦';
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
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getRegionText = (region: string) => {
    switch (region) {
      case 'istanbul':
        return '🏛️ Istanbul';
      case 'ankara':
        return '🏛️ Ankara';
      case 'izmir':
        return '🌊 Izmir';
      case 'antalya':
        return '🏖️ Antalya';
      case 'bursa':
        return '🌳 Bursa';
      case 'adana':
        return '🌾 Adana';
      case 'gaziantep':
        return '🏺 Gaziantep';
      case 'konya':
        return '🕌 Konya';
      case 'other':
        return '🌐 Other';
      default:
        return region.charAt(0).toUpperCase() + region.slice(1);
    }
  };

  const getOrganizationText = (organization: string) => {
    switch (organization) {
      case 'afad': return 'AFAD';
      case 'kizilay': return 'Kızılay';
      case 'akut': return 'AKUT';
      case 'ahbap': return 'Ahbap Derneği';
      case 'ihh': return 'İHH';
      case 'deniz-feneri': return 'Deniz Feneri Derneği';
      case 'hayata-destek': return 'Hayata Destek Derneği';
      case 'mazlumder': return 'Mazlumder';
      case 'and': return 'AND';
      case 'tider': return 'TİDER';
      case 'sadakatasi': return 'Sadakataşı Derneği';
      case 'besir': return 'Beşir Derneği';
      case 'corbada-tuzun-olsun': return 'Çorbada Tuzun Olsun Derneği';
      case 'acdc': return 'ACDC';
      case 'ilk-umut': return 'İlk Umut Derneği';
      default: return organization;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Donation History</h2>
            <p className="text-gray-400 text-sm">
              Track all your humanitarian contributions on the blockchain
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`glass px-4 py-2 rounded-lg text-sm font-medium ${
              walletInfo?.publicKey ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'
            } border`}>
              {walletInfo?.publicKey ? 
                (walletInfo.publicKey.startsWith('G-DEMO') ? '🎭 Demo Data' : '🔗 Wallet Data') 
                : '🎭 Demo Data'
              }
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-300"
            >
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="spinner"></div>
              <span className="text-gray-300 text-lg">Loading donation history...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-400 to-pink-500 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load History</h3>
            <p className="text-gray-400 text-center">{error}</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">No Donations Yet</h3>
            <p className="text-gray-400 text-center mb-4">Your donation history will appear here</p>
            <p className="text-gray-500 text-sm text-center">Make your first donation to see it tracked on the blockchain</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="glass p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">
                          {getCategoryIcon(donation.category)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {formatXLM(donation.amount)} XLM
                          </h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="mr-4">{getRegionText(donation.region)}</span>
                            <span>{getCategoryText(donation.category)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <span className="mr-4">🏢 {getOrganizationText(donation.organization)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>🕒 {formatDate(donation.timestamp)}</span>
                        <span>🆔 {donation.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                        {getStatusText(donation.status)}
                      </span>
                      
                      <button
                        onClick={() => handleConfirm(donation.id)}
                        disabled={donation.status === 'delivered'}
                        className="text-xs font-semibold rounded-full px-3 py-1 transition-all duration-300
                          bg-green-500/20 text-green-300 hover:bg-green-500/40 disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {donation.status === 'delivered' ? '✓ Delivered' : 'Confirm Delivery'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Transaction details can be added here if needed */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 