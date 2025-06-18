import Image from "next/image";
import { useState } from "react";
import { create } from "@github/webauthn-json";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateAidModal, setShowCreateAidModal] = useState(false);
  const [showDonationHistoryModal, setShowDonationHistoryModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationCategory, setDonationCategory] = useState("battaniye");
  const [donationRegion, setDonationRegion] = useState("istanbul");

  // Demo Passkey login (gerçek backend olmadan, sadece WebAuthn API çağrısı)
  async function handlePasskeyLogin() {
    setLoading(true);
    setError(null);
    try {
      // Demo amaçlı registration ve authentication akışı
      // Gerçek uygulamada sunucu ile challenge alınır ve doğrulama yapılır
      const challenge = btoa(String.fromCharCode(...new Uint8Array(32)));
      await create({
        publicKey: {
          challenge,
          rp: { name: "AidChain" },
          user: {
            id: btoa(String.fromCharCode(...new Uint8Array(16))),
            name: "demo@aidchain.com",
            displayName: "Demo User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
        },
      });
      setIsAuthenticated(true);
      setShowLoginModal(false);
    } catch (e: any) {
      setError("Giriş başarısız veya iptal edildi.");
    } finally {
      setLoading(false);
    }
  }

  // Demo Stellar cüzdan bağlantısı ve bağış işlemi
  function handleCreateAid() {
    // Gerçek uygulamada Stellar cüzdan bağlantısı ve bağış işlemi yapılacak
    alert(`Bağış oluşturuldu: ${donationAmount} ${donationCategory} - ${donationRegion}`);
    setShowCreateAidModal(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
      <header className="mb-8 flex flex-col items-center">
        <Image src="/favicon.ico" alt="AidChain Logo" width={64} height={64} />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-blue-700">AidChain</h1>
        <p className="text-lg text-gray-700 max-w-xl text-center">
          Afet yardımlarında şeffaflık ve güven için Stellar blockchain üzerinde çalışan toplumsal fayda odaklı bağış takip sistemi.
        </p>
      </header>
      <main className="flex flex-col items-center gap-6 w-full max-w-md">
        {!isAuthenticated ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full"
            onClick={() => setShowLoginModal(true)}
          >
            Passkey ile Giriş
          </button>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full"
              onClick={() => setShowCreateAidModal(true)}
            >
              Yardım Oluştur
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full"
              onClick={() => setShowDonationHistoryModal(true)}
            >
              Bağış Geçmişi
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow w-full mt-2"
              onClick={() => setIsAuthenticated(false)}
            >
              Çıkış Yap
            </button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-4 mt-4 w-full">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Neden AidChain?</h2>
          <ul className="list-disc pl-5 text-gray-700 text-base space-y-1">
            <li>Bağışların zincir üstünde şeffaf takibi</li>
            <li>Yardım ulaştı NFT onayı</li>
            <li>Güvenli ve modern giriş: Passkey</li>
            <li>Kullanıcı dostu arayüz</li>
          </ul>
        </div>
      </main>
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Passkey ile Giriş</h2>
            <p className="text-gray-700 mb-6 text-center">Güvenli giriş için Passkey kullanın.</p>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow w-full mb-2 disabled:opacity-60"
              onClick={handlePasskeyLogin}
              disabled={loading}
            >
              {loading ? "Giriş Yapılıyor..." : "Passkey ile Giriş Yap"}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow w-full"
              onClick={() => setShowLoginModal(false)}
              disabled={loading}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      {showCreateAidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Yardım Oluştur</h2>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2">Bağış Miktarı</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Örn: 100"
              />
            </div>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2">Kategori</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={donationCategory}
                onChange={(e) => setDonationCategory(e.target.value)}
              >
                <option value="battaniye">Battaniye</option>
                <option value="gida">Gıda</option>
                <option value="giysi">Giysi</option>
              </select>
            </div>
            <div className="w-full mb-4">
              <label className="block text-gray-700 mb-2">Bölge</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={donationRegion}
                onChange={(e) => setDonationRegion(e.target.value)}
              >
                <option value="istanbul">İstanbul</option>
                <option value="ankara">Ankara</option>
                <option value="izmir">İzmir</option>
              </select>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow w-full mb-2"
              onClick={handleCreateAid}
            >
              Bağış Yap
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow w-full"
              onClick={() => setShowCreateAidModal(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      {showDonationHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Bağış Geçmişi</h2>
            <p className="text-gray-700 mb-6 text-center">Henüz bağış geçmişi bulunmuyor.</p>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow w-full"
              onClick={() => setShowDonationHistoryModal(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
