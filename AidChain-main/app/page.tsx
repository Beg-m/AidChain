'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { create, get } from "@github/webauthn-json";
import WalletConnection from "./components/WalletConnection";
import CreateWalletButton from "./components/CreateWalletButton";
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
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${20 + Math.random() * 10}s`,
    }));
    setParticles(newParticles);
  }, []);

  // Load donation statistics on mount and populate demo data
  useEffect(() => {
    populateDemoData(); // Populate demo data if empty
    if (walletInfo?.publicKey) {
      updateDonationStats(walletInfo.publicKey);
    }
  }, [walletInfo]);

  const updateDonationStats = async (publicKey: string) => {
    try {
      const donations = await getDonationHistory(publicKey);
      setDonationCount(donations.length);
      const total = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      setTotalDonations(total.toString());
    } catch (e) {
      setDonationCount(0);
      setTotalDonations('0');
    }
  };

  // Demo Passkey login (without real backend, just WebAuthn API call)
  async function handlePasskeyLogin() {
    setLoading(true);
    setError(null);
    try {
      const credentialId = localStorage.getItem("passkeyCredentialId");
      if (!credentialId) {
        throw new Error("No passkey registered. Please register first.");
      }

      // In a real app, challenge would be from the server
      const auth = await get({
        publicKey: {
          challenge: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))),
          timeout: 60000,
          allowCredentials: [{
            id: credentialId,
            type: "public-key",
          }],
          userVerification: "preferred",
        },
      });

      // In a real app, you'd send `auth` to your server for verification.
      setIsAuthenticated(true);
      setShowLoginModal(false);
    } catch (e: any) {
      console.error(e);
      setError(`Login failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Demo Passkey registration (without real backend, just WebAuthn API call)
  async function handlePasskeyRegister() {
    setLoading(true);
    setError(null);
    try {
      // In a real app, challenge and user info would come from the server
      const cred = await create({
        publicKey: {
          challenge: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))),
          rp: { name: "AidChain" },
          user: {
            id: "user-id-from-server", // This should be a unique user ID
            name: "demo@aidchain.com",
            displayName: "Demo User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
        },
      });

      // For this demo, we store the new credential ID in localStorage.
      // In a real app, you'd send `cred` to your server for verification and storage.
      localStorage.setItem("passkeyCredentialId", cred.id);

      setError("Registration successful! You can now login.");
    } catch (e: any) {
      console.error(e);
      setError(`Registration failed: ${e.message}`);
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
    if (walletInfo?.publicKey) {
      updateDonationStats(walletInfo.publicKey);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="particles">
        {particles.map((style, i) => (
          <div
            key={i}
            className="particle"
            style={style}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen items-center justify-center p-6">
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-cyan-400 to-purple-600 p-3 rounded-full">
              <Image 
                src="/favicon.ico" 
                alt="AidChain Logo" 
                width={80} 
                height={80}
                className="rounded-full"
              />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 gradient-text">
            AidChain
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            Revolutionizing humanitarian aid through blockchain transparency. 
            Every donation is tracked, every impact is verified, every life matters.
          </p>
          
          <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
              <span>Live Blockchain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full pulse"></div>
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full pulse"></div>
              <span>100% Transparent</span>
            </div>
          </div>
        </header>

        {/* Main Actions */}
        <main className="flex flex-col items-center gap-8 w-full max-w-4xl">
          {!isAuthenticated ? (
            <div className="glass-card p-8 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold mb-6 gradient-text">
                Join the Revolution
              </h2>
              <button
                className="btn-primary w-full text-lg py-4 glow"
                onClick={() => setShowLoginModal(true)}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="spinner"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <span>🔐 Login with Passkey</span>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Wallet Connection */}
              <div className="glass-card p-6 w-full">
                <WalletConnection
                  onWalletConnected={handleWalletConnected}
                  onWalletDisconnected={handleWalletDisconnected}
                  walletInfo={walletInfo}
                />
              </div>

              {/* Statistics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="glass-card p-6 text-center card-hover">
                  <div className="text-4xl font-bold gradient-text mb-2">{donationCount}</div>
                  <div className="text-gray-400 text-sm">Total Donations</div>
                  <div className="mt-2 text-xs text-gray-500">Tracked on Blockchain</div>
                </div>
                
                <div className="glass-card p-6 text-center card-hover">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {formatXLM(totalDonations)}
                  </div>
                  <div className="text-gray-400 text-sm">Total XLM</div>
                  <div className="mt-2 text-xs text-gray-500">Crypto Donations</div>
                </div>
                
                <div className="glass-card p-6 text-center card-hover">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    {walletInfo?.isConnected ? '✓' : '○'}
                  </div>
                  <div className="text-gray-400 text-sm">Wallet Status</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {walletInfo?.isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <button
                  className="flex-1 btn-primary text-lg py-4 glow disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowCreateAidModal(true)}
                  disabled={!walletInfo?.isConnected}
                >
                  {walletInfo?.isConnected ? (
                    <span>💝 Create Donation</span>
                  ) : (
                    <span>🔗 Connect Wallet First</span>
                  )}
                </button>
                
                <button
                  className="flex-1 glass px-6 py-4 text-lg font-semibold border border-white/20 hover:border-white/40 transition-all duration-300 card-hover"
                  onClick={() => setShowDonationHistoryModal(true)}
                >
                  📊 Donation History
                </button>
              </div>

              <button
                className="glass px-6 py-3 text-gray-300 hover:text-white transition-colors duration-300"
                onClick={() => {
                  setIsAuthenticated(false);
                  setWalletInfo(null);
                }}
              >
                🚪 Logout
              </button>
            </>
          )}

          {/* Features Section */}
          <div className="glass-card p-8 w-full mt-12">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">
              Why Choose AidChain?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">Blockchain Transparency</h3>
                <p className="text-gray-400 text-sm">
                  Every donation is permanently recorded on the Stellar blockchain, ensuring complete transparency and traceability.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-3 text-purple-400">Instant Verification</h3>
                <p className="text-gray-400 text-sm">
                  Real-time verification of donations with instant confirmation and detailed transaction history.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-3 text-green-400">Global Impact</h3>
                <p className="text-gray-400 text-sm">
                  Support disaster relief efforts worldwide with secure, borderless cryptocurrency donations.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Secure Authentication</h3>
                <p className="text-gray-400 text-sm">
                  Advanced passkey authentication ensures your donations are secure and your identity is protected.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-400">Impact Analytics</h3>
                <p className="text-gray-400 text-sm">
                  Track your donation impact with detailed analytics and real-time reporting on relief efforts.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-3 text-pink-400">Low Fees</h3>
                <p className="text-gray-400 text-sm">
                  Stellar's low transaction fees ensure more of your donation goes directly to those in need.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with ❤️ for humanitarian aid transparency</p>
          <p className="mt-2">Powered by Stellar Blockchain Technology</p>
        </footer>
      </div>

      {/* Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 gradient-text text-center">
              Welcome to AidChain
            </h2>
            
            <div className="space-y-4">
              <button
                className="w-full btn-primary py-3"
                onClick={handlePasskeyLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : '🔐 Login with Passkey'}
              </button>
              
              <button
                className="w-full glass py-3 border border-white/20 hover:border-white/40 transition-colors"
                onClick={handlePasskeyRegister}
                disabled={loading}
              >
                {loading ? 'Registering...' : '📝 Register New Passkey'}
              </button>
              
              <button
                className="w-full text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setShowLoginModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <DonationForm
        isOpen={showCreateAidModal}
        onClose={() => setShowCreateAidModal(false)}
        walletInfo={walletInfo}
        onDonationSuccess={handleDonationSuccess}
      />

      <DonationHistory
        isOpen={showDonationHistoryModal}
        onClose={() => setShowDonationHistoryModal(false)}
        walletInfo={walletInfo}
      />
    </div>
  );
}
