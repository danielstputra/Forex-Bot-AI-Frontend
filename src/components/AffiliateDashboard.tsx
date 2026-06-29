'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, DollarSign, Award, ArrowUpRight, Percent, RefreshCw } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';

export default function AffiliateDashboard() {
  const { affiliateStats, fetchAffiliateStats, requestAffiliatePayout } = useBotStore();
  const [copied, setCopied] = useState(false);

  // Payout Form States
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAffiliateStats();
  }, [fetchAffiliateStats]);

  const referralCode = affiliateStats?.referralCode || 'FXBOT';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join?ref=${referralCode}`
    : `https://forexbot.ai/join?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await requestAffiliatePayout(parseFloat(payoutAmount), paymentMethod, payoutDetails);
      setMsg({ type: 'success', text: 'Payout request submitted successfully!' });
      setPayoutAmount('');
      setPayoutDetails('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit payout request.' });
    } finally {
      setLoading(false);
    }
  };

  const totalReferrals = affiliateStats?.totalReferrals || 0;
  const totalCommission = affiliateStats?.totalCommission || 0;
  const pendingPayout = affiliateStats?.pendingPayout || 0;
  const referralsList = affiliateStats?.referrals || [];
  const payoutsList = affiliateStats?.payouts || [];

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
            <Award className="w-6 h-6 text-cyan-400" />
            Dashboard Afiliasi & Kemitraan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Undang rekan trader Anda dan dapatkan komisi bagi hasil sebesar 20% untuk setiap langganan aktif.
          </p>
        </div>
        <button
          onClick={() => fetchAffiliateStats()}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="h-4 w-4" />
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

      {/* Referral Link Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Tautan Referral Anda</h3>
          <p className="text-[11px] text-slate-455 leading-relaxed max-w-md">
            Bagikan tautan ini ke media sosial atau komunitas trading Anda. Komisi akan otomatis masuk setelah pendaftaran sukses.
          </p>
          <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1 justify-between items-center max-w-sm sm:max-w-md w-full">
            <span className="text-[11px] text-slate-300 font-mono pl-3 truncate max-w-[220px] sm:max-w-[300px]">{referralLink}</span>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-bold font-mono transition-all duration-300 flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center min-w-[150px] shrink-0">
          <Percent className="w-8 h-8 text-cyan-400 mb-1" />
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Komisi Anda</span>
          <span className="text-xl font-black text-slate-100 font-mono">20% Tier-1</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Referral Terdaftar</span>
            <span className="text-lg font-black font-mono text-slate-100">{totalReferrals}</span>
          </div>
        </div>

        {/* Total Commission */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Total Komisi</span>
            <span className="text-lg font-black font-mono text-emerald-400">${totalCommission.toFixed(2)}</span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Dalam Proses</span>
            <span className="text-lg font-black font-mono text-cyan-400">${pendingPayout.toFixed(2)}</span>
          </div>
        </div>

        {/* Available to Withdraw */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-slate-950 text-slate-400 rounded-2xl">
            <DollarSign className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Siap Ditarik</span>
            <span className="text-lg font-black font-mono text-cyan-400">
              ${(totalCommission - pendingPayout - payoutsList.filter((p: any) => p.status === 'PAID').reduce((acc: number, p: any) => acc + p.amount, 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Form */}
        <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Tarik Komisi Afiliasi</h3>
          <form onSubmit={handlePayoutSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Jumlah Penarikan ($)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="Minimal $50"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer (IDR)</option>
                <option value="PAYPAL">PayPal (USD)</option>
                <option value="USDT">USDT (TRC20 Crypto)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Detail Tujuan Rekening / Wallet</label>
              <textarea
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder="BCA - 80213082 - A/N Budi Setiawan atau Alamat Wallet USDT"
                className="w-full h-[76px] bg-slate-950 border border-slate-855 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              {loading ? 'Processing...' : 'Ajukan Penarikan'}
            </button>
          </form>
        </div>

        {/* Payout History Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Riwayat Pencairan Komisi</h3>
          {payoutsList.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500 font-mono">
              Belum ada riwayat penarikan komisi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                    <th className="py-3 px-4 font-normal">ID Payout</th>
                    <th className="py-3 px-4 font-normal">Tanggal</th>
                    <th className="py-3 px-4 font-normal">Metode</th>
                    <th className="py-3 px-4 font-normal text-right">Jumlah ($)</th>
                    <th className="py-3 px-4 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-355">
                  {payoutsList.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3.5 px-4 text-slate-200 font-semibold truncate max-w-[100px]">{pay.id}</td>
                      <td className="py-3.5 px-4 text-slate-550">{new Date(pay.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-slate-400">{pay.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">${pay.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                            : (pay.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-900/30' : 'bg-cyan-950 text-cyan-400 border border-cyan-900/30')
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
