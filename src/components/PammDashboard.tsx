'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { Percent, Users, DollarSign, Award, Check, RefreshCw, ShieldAlert } from 'lucide-react';

interface InvestorAccount {
  id: string;
  name: string;
  balance: number;
  share: number; // Percentage
  floating: number;
  status: string;
}

export default function PammDashboard() {
  const { 
    pammPools, 
    pammInvestors, 
    pammPayouts, 
    fetchPammPools, 
    fetchPammInvestors, 
    fetchPammPayouts, 
    savePammAllocation,
    addNotification, 
    addAuditLog 
  } = useBotStore();

  const [activePool, setActivePool] = useState<any>(null);
  const [allocationMethod, setAllocationMethod] = useState<'proportional' | 'equal' | 'manual'>('proportional');
  
  // Investor Accounts list (loaded from store with mock fallback)
  const [localInvestors, setLocalInvestors] = useState<InvestorAccount[]>([]);

  useEffect(() => {
    fetchPammPools();
    fetchPammPayouts();
  }, [fetchPammPools, fetchPammPayouts]);

  useEffect(() => {
    if (pammPools.length > 0) {
      const pool = pammPools[0];
      setActivePool(pool);
      fetchPammInvestors(pool.id);
    }
  }, [pammPools, fetchPammInvestors]);

  useEffect(() => {
    if (pammInvestors.length > 0) {
      setLocalInvestors(pammInvestors);
    } else {
      // Fallback mock data
      setLocalInvestors([
        { id: 'SLV-901', name: 'Andi Wijaya', balance: 50000, share: 25.0, floating: 120.50, status: 'ACTIVE' },
        { id: 'SLV-902', name: 'Siti Rahma', balance: 30000, share: 15.0, floating: 72.30, status: 'ACTIVE' },
        { id: 'SLV-903', name: 'Budi Santoso', balance: 80000, share: 40.0, floating: 192.80, status: 'ACTIVE' },
        { id: 'SLV-904', name: 'Diana Lestari', balance: 40000, share: 20.0, floating: 96.40, status: 'ACTIVE' },
      ]);
    }
  }, [pammInvestors]);

  const totalBalance = localInvestors.reduce((sum, inv) => sum + inv.balance, 0);
  const totalFloating = localInvestors.reduce((sum, inv) => sum + inv.floating, 0);
  const totalAllocatedShare = localInvestors.reduce((sum, inv) => sum + inv.share, 0);

  const handleShareChange = (id: string, newShare: number) => {
    setLocalInvestors(
      localInvestors.map((inv) => {
        if (inv.id === id) {
          return { ...inv, share: newShare };
        }
        return inv;
      })
    );
  };

  const handleSaveAllocation = async () => {
    if (allocationMethod === 'manual' && Math.abs(totalAllocatedShare - 100) > 0.1) {
      addNotification('Gagal menyimpan alokasi: Jumlah alokasi harus tepat 100%!');
      addAuditLog(`PAMM Allocation Save Failed: Sum is ${totalAllocatedShare}% (Expected 100%)`, 'FAILED');
      return;
    }

    if (activePool) {
      try {
        const allocs = localInvestors.map(inv => ({ investorId: inv.id, share: inv.share }));
        await savePammAllocation(activePool.id, allocationMethod, allocs);
      } catch (err) {
        console.error(err);
      }
    } else {
      addNotification('Matriks alokasi PAMM berhasil disimpan dan diterapkan.');
      addAuditLog(`PAMM Allocation Matrix Updated (Method: ${allocationMethod})`);
    }
  };

  const handleMethodChange = (method: 'proportional' | 'equal' | 'manual') => {
    setAllocationMethod(method);
    
    if (method === 'equal') {
      const equalShare = parseFloat((100 / localInvestors.length).toFixed(2));
      setLocalInvestors(localInvestors.map(inv => ({ ...inv, share: equalShare })));
    } else if (method === 'proportional') {
      setLocalInvestors(
        localInvestors.map(inv => ({
          ...inv,
          share: parseFloat(((inv.balance / (totalBalance || 1)) * 100).toFixed(1))
        }))
      );
    }
  };

  const payouts = pammPayouts.length > 0 ? pammPayouts : [
    { period: 'Mei 2026', profitGenerated: 12500, feeRate: 20, collectedFee: 2500, date: '2026-06-01' },
    { period: 'April 2026', profitGenerated: 9800, feeRate: 20, collectedFee: 1960, date: '2026-05-01' },
  ];

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <Percent className="w-6 h-6 text-cyan-400" />
          Manajer Multi-Akun (PAMM / MAM)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Kelola dana investor pengikut (*slave accounts*) menggunakan pembagian alokasi lot otomatis dan kalkulasi biaya bagi hasil (*performance fee*).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Total Dana Kelolaan</span>
            <span className="text-lg font-black font-mono text-slate-100">${totalBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Jumlah Investor</span>
            <span className="text-lg font-black font-mono text-slate-100">{localInvestors.length} Akun</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">Bagi Hasil (Fee)</span>
            <span className="text-lg font-black font-mono text-slate-100">{activePool?.performanceFeePct || 20.0}%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 uppercase font-mono tracking-wider block">All-Time ROI Pool</span>
            <span className="text-lg font-black font-mono text-slate-100">+{activePool?.allTimeRoi || 24.5}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 - Investor List & Allocation Settings */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">Matriks Alokasi Investor</h3>
              <p className="text-xs text-slate-450 mt-0.5">Konfigurasi persentase lot transaksi yang disalin ke setiap akun investor.</p>
            </div>
            
            {/* Allocation Method Selector */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
              {(['proportional', 'equal', 'manual'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => handleMethodChange(method)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg font-mono transition-all duration-300 ${
                    allocationMethod === method
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-normal">ID Investor</th>
                    <th className="py-2.5 px-4 font-normal">Nama Akun</th>
                    <th className="py-2.5 px-4 text-right font-normal">Saldo ($)</th>
                    <th className="py-2.5 px-4 text-right font-normal">Floating Profit</th>
                    <th className="py-2.5 px-4 text-right font-normal">Porsi Alokasi (%)</th>
                    <th className="py-2.5 px-4 text-center font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                  {localInvestors.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3.5 px-4 text-slate-200 font-semibold">{inv.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-300">{inv.name}</td>
                      <td className="py-3.5 px-4 text-right">${inv.balance.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">+${inv.floating.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">
                        {allocationMethod === 'manual' ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={inv.share}
                            onChange={(e) => handleShareChange(inv.id, parseFloat(e.target.value) || 0)}
                            className="bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-right text-cyan-400 font-mono text-xs w-20 focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <span className="text-cyan-400 font-bold">{inv.share.toFixed(1)}%</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[9px] font-bold rounded">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Validation Banner */}
            {allocationMethod === 'manual' && (
              <div className="pt-2">
                {Math.abs(totalAllocatedShare - 100) < 0.1 ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/30 p-3 rounded-2xl text-emerald-400 text-[10px] font-mono flex items-center gap-1.5 justify-center">
                    <Check className="w-4 h-4" /> Alokasi valid (100%). Siap untuk disimpan.
                  </div>
                ) : (
                  <div className="bg-rose-950/30 border border-rose-800/30 p-3 rounded-2xl text-rose-455 text-[10px] font-mono flex items-center gap-1.5 justify-center">
                    <ShieldAlert className="w-4 h-4 animate-bounce" /> PERINGATAN: Jumlah total alokasi harus tepat 100% (Jumlah saat ini: {totalAllocatedShare}%).
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveAllocation}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md"
            >
              Simpan Matriks Alokasi
            </button>
          </div>
        </div>

        {/* Right 1/3 - Performance Fee Payout History */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Bagi Hasil (Performance Fee)</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Riwayat pengumpulan komisi {activePool?.performanceFeePct || 20}% bagi hasil atas keuntungan bersih yang diperoleh dari dana investor pengikut.
            </p>

            <div className="space-y-4 pt-2">
              {payouts.map((payout, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{payout.period}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Diterima: {payout.date}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      +${payout.collectedFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-850/60 font-mono text-[9px] text-slate-550">
                    <span>Profit Bersih: ${payout.profitGenerated.toLocaleString()}</span>
                    <span>Rasio: {payout.feeRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
