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
  const [donationCategory, setDonationCategory] = useState('para');
  const [donationRegion, setDonationRegion] = useState('istanbul');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletInfo?.isConnected) {
      setError('Bağış yapmak için cüzdan bağlantısı gereklidir.');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Geçerli bir bağış miktarı giriniz.');
      return;
    }

    if (parseFloat(donationAmount) > parseFloat(walletInfo.balance)) {
      setError('Cüzdanınızda yeterli bakiye bulunmuyor.');
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
      setError(error.message || 'Bağış işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Yardım Oluştur</h2>
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
            <h3 className="text-xl font-semibold text-green-700 mb-2">Bağış Başarılı!</h3>
            <p className="text-gray-600">
              {formatXLM(donationAmount)} XLM bağışınız başarıyla gönderildi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!walletInfo?.isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Bağış yapmak için önce Stellar cüzdanınızı bağlayın.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Cüzdan bağlı: {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Bakiye: {formatXLM(walletInfo.balance)} XLM
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bağış Miktarı (XLM)
              </label>
              <input
                type="number"
                step="0.0000001"
                min="0.0000001"
                max={walletInfo?.balance || undefined}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Örn: 10.5"
                disabled={loading || !walletInfo?.isConnected}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 0.0000001 XLM
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kategori
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationCategory}
                onChange={(e) => setDonationCategory(e.target.value)}
                disabled={loading}
              >
                <option value="para">Para</option>
                <option value="battaniye">Battaniye</option>
                <option value="gida">Gıda</option>
                <option value="giysi">Giysi</option>
                <option value="ilac">İlaç</option>
                <option value="temizlik">Temizlik Malzemesi</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bölge
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={donationRegion}
                onChange={(e) => setDonationRegion(e.target.value)}
                disabled={loading}
              >
                <option value="istanbul">İstanbul</option>
                <option value="ankara">Ankara</option>
                <option value="izmir">İzmir</option>
                <option value="antalya">Antalya</option>
                <option value="bursa">Bursa</option>
                <option value="adana">Adana</option>
                <option value="gaziantep">Gaziantep</option>
                <option value="konya">Konya</option>
                <option value="diger">Diğer</option>
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
                {loading ? 'İşlem Yapılıyor...' : 'Bağış Yap'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 