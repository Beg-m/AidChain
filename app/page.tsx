'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { create } from "@github/webauthn-json";
import WalletConnection from "./components/WalletConnection";
import DonationForm from "./components/DonationForm";
import DonationHistory from "./components/DonationHistory";
import { WalletInfo, getDonationHistory, formatXLM } from "./utils/stellar";
import { populateDemoData } from "./utils/demoData";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateAidModal, setShowCreateAidModal] = useState(false);
  const [showDonationHistoryModal, setShowDonationHistoryModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [donationCount, setDonationCount] = useState(0);
  const [totalDonations, setTotalDonations] = useState('0');

  // Load donation statistics on mount and populate demo data
  useEffect(() => {
    populateDemoData(); // Populate demo data if empty
    updateDonationStats();
  }, []);

  const updateDonationStats = () => {
    const donations = getDonationHistory();
    setDonationCount(donations.length);
    const total = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    setTotalDonations(total.toString());
  };

  // Demo Passkey login (without real backend, just WebAuthn API call)
  async function handlePasskeyLogin() {
    setLoading(true);
    setError(null);
    try {
      // Demo registration and authentication flow
      // In real app, challenge would be received from server and verified
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
      setError("Login failed or was cancelled.");
    } finally {
      setLoading(false);
    }
  }

  const handleWalletConnected = (info: WalletInfo) => {
    setWalletInfo(info);
  };

  const handleWalletDisconnected = () => {
    setWalletInfo(null);
  };

  const handleDonationSuccess = () => {
    updateDonationStats();
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
      <header className="mb-8 flex flex-col items-center">
        <Image src="/favicon.ico" alt="AidChain Logo" width={64} height={64} />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-blue-700">AidChain</h1>
        <p className="text-lg text-gray-700 max-w-xl text-center">
          A social impact donation tracking system built on Stellar blockchain for transparency and trust in disaster relief.
        </p>
      </header>

      <main className="flex flex-col items-center gap-6 w-full max-w-2xl">
        {!isAuthenticated ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full"
            onClick={() => setShowLoginModal(true)}
          >
            Login with Passkey
          </button>
        ) : (
          <>
            {/* Wallet Connection Component */}
            <WalletConnection
              onWalletConnected={handleWalletConnected}
              onWalletDisconnected={handleWalletDisconnected}
              walletInfo={walletInfo}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{donationCount}</div>
                <div className="text-sm text-gray-600">Total Donations</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatXLM(totalDonations)}</div>
                <div className="text-sm text-gray-600">Total XLM</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 w-full">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowCreateAidModal(true)}
                disabled={!walletInfo?.isConnected}
              >
                {walletInfo?.isConnected ? 'Create Donation' : 'Connect Wallet'}
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors w-full"
                onClick={() => setShowDonationHistoryModal(true)}
              >
                Donation History
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow w-full mt-2"
                onClick={() => {
                  setIsAuthenticated(false);
                  setWalletInfo(null);
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Why AidChain?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Transparent donation tracking on blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">NFT-based delivery confirmation</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Secure and modern login: Passkey</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Stellar blockchain integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-blue-50 rounded-lg p-6 w-full">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">How it Works?</h3>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Connect your Freighter wallet</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Select donation amount and category</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Confirm transaction on Stellar blockchain</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <span>Track your donation transparently</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        {isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-lg">ℹ️</span>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Demo Mode</h4>
                <p className="text-yellow-700 text-sm">
                  This application uses Stellar testnet. For real donations, you need test XLM in your Freighter wallet. 
                  You can get test XLM from <a href="https://laboratory.stellar.org/#account-creator?network=testnet" target="_blank" rel="noopener noreferrer" className="underline">Stellar Laboratory</a>.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Login with Passkey</h2>
            <p className="text-gray-700 mb-6 text-center">Use Passkey for secure login.</p>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow w-full mb-2 disabled:opacity-60"
              onClick={handlePasskeyLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login with Passkey"}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow w-full"
              onClick={() => setShowLoginModal(false)}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Donation Form Modal */}
      <DonationForm
        isOpen={showCreateAidModal}
        onClose={() => setShowCreateAidModal(false)}
        walletInfo={walletInfo}
        onDonationSuccess={handleDonationSuccess}
      />

      {/* Donation History Modal */}
      <DonationHistory
        isOpen={showDonationHistoryModal}
        onClose={() => setShowDonationHistoryModal(false)}
      />
    </div>
  );
}
