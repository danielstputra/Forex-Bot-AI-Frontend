'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { ShieldCheck, Cpu, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

export default function FintechHub() {
  const {
    wallets,
    vpsInstance,
    fetchWallets,
    fetchVps,
    requestDeposit,
    requestWithdrawal,
    deployVps
  } = useBotStore();

  const [activeTab, setActiveTab] = useState<'wallet' | 'vps'>('wallet');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [vpsPlan, setVpsPlan] = useState('VPS Basic');
  const [vpsRegion, setVpsRegion] = useState('Singapore');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWallets();
    fetchVps();
  }, [fetchWallets, fetchVps]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await requestDeposit(currency, parseFloat(amount), paymentMethod, proofFile);
      setMsg({ type: 'success', text: 'Deposit submitted successfully! Awaiting admin approval.' });
      setAmount('');
      setProofFile(null);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit deposit.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await requestWithdrawal(currency, parseFloat(amount), paymentMethod, payoutDetails);
      setMsg({ type: 'success', text: 'Withdrawal submitted successfully! Awaiting admin approval.' });
      setAmount('');
      setPayoutDetails('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit withdrawal.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeployVps = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await deployVps(vpsPlan, vpsRegion);
      setMsg({ type: 'success', text: 'VPS provisioned successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to deploy VPS.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => { setActiveTab('wallet'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'wallet'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet className="h-4 w-4" />
          Multi-Currency Wallet
        </button>
        <button
          onClick={() => { setActiveTab('vps'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'vps'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Dedicated VPS Hosting
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-lg border ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {activeTab === 'wallet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balances */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white">Wallet Balances</h3>
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">{w.currency} Wallet</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {w.currency === 'USD' ? '$' : ''}
                      {w.balance.toLocaleString(undefined, { minimumFractionDigits: w.currency === 'BTC' ? 6 : 2 })}
                      {w.currency !== 'USD' ? ` ${w.currency}` : ''}
                    </h4>
                    {w.address && (
                      <span className="text-[10px] text-gray-500 font-mono block mt-1 truncate max-w-[200px]">
                        Address: {w.address}
                      </span>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${w.currency === 'USD' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => fetchWallets()}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Balances
            </button>
          </div>

          {/* Deposit & Withdraw Forms */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Form */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowDownRight className="text-cyan-400" />
                  Deposit Funds
                </h3>
              </div>
              <form onSubmit={handleDeposit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Select Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="USD">USD (Bank Transfer / QRIS)</option>
                    <option value="USDT">USDT (TRC20 Crypto)</option>
                    <option value="BTC">BTC (Bitcoin Network)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {currency === 'USD' ? (
                      <>
                        <option value="BANK_TRANSFER">Bank Transfer (BCA/Mandiri)</option>
                        <option value="QRIS">QRIS Instant Payment</option>
                      </>
                    ) : (
                      <option value="CRYPTO">Crypto Wallet Transfer</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Upload Payment Proof (JPG, PNG, PDF)</label>
                  <input
                    type="file"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-500/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/15"
                >
                  {loading ? 'Processing...' : 'Submit Deposit'}
                </button>
              </form>
            </div>

            {/* Withdrawal Form */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowUpRight className="text-purple-400" />
                  Withdraw Funds
                </h3>
              </div>
              <form onSubmit={handleWithdrawal} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Select Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="USD">USD (Bank Transfer)</option>
                    <option value="USDT">USDT (TRC20 Crypto)</option>
                    <option value="BTC">BTC (Bitcoin Network)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    {currency === 'USD' ? (
                      <option value="BANK_TRANSFER">Local Bank Transfer</option>
                    ) : (
                      <option value="CRYPTO">Crypto Address</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payout Destination Details</label>
                  <textarea
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={currency === 'USD' ? "BCA - 80213082 - A/N Budi Setiawan" : "Enter your TRC20/BTC wallet address"}
                    className="w-full h-[76px] bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-purple-500/15"
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* VPS Hosting Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VPS Info Card */}
          <div className="lg:col-span-1 p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  VPS Server Status
                </span>
                <Cpu className="h-6 w-6 text-purple-400" />
              </div>

              {vpsInstance ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white">{vpsInstance.planName}</h4>
                    <span className="text-xs text-gray-400 font-mono">Location: {vpsInstance.region}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono block">IP ADDRESS</span>
                    <span className="text-sm font-bold text-white font-mono">{vpsInstance.ipAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVE RUNNING (24/7 VPS ONLINE)
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">No VPS Deployed</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bot Anda saat ini berjalan pada sesi browser lokal. Jalankan bot 24/7 di server cloud VPS khusus agar trading tetap berjalan meskipun perangkat Anda mati.
                  </p>
                </div>
              )}
            </div>

            {vpsInstance && (
              <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-500 font-mono">
                Expires: {new Date(vpsInstance.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Deploy VPS Form */}
          <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Cpu className="text-purple-400" />
              Deploy New Dedicated VPS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Server Plan</label>
                <select
                  value={vpsPlan}
                  onChange={(e) => setVpsPlan(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="VPS Basic">VPS Basic (1 Core CPU, 2GB RAM) - FREE</option>
                  <option value="VPS Advanced">VPS Pro (2 Core CPU, 4GB RAM) - $15/mo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Server Region</label>
                <select
                  value={vpsRegion}
                  onChange={(e) => setVpsRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="Singapore">Singapore (Best for SE Asia)</option>
                  <option value="Tokyo">Tokyo, Japan (Low Latency)</option>
                  <option value="New York">New York, US (Near WallStreet Servers)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              * VPS Basic gratis untuk seluruh pelanggan paket **PRO** dan **ENTERPRISE**. Saldo dompet Anda akan dikurangi secara otomatis jika Anda memilih paket VPS Pro berbayar.
            </p>
            <button
              onClick={handleDeployVps}
              disabled={loading || !!vpsInstance}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Deploying Virtual Server...' : (vpsInstance ? 'VPS Already Active' : 'Deploy Virtual Dedicated VPS')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
