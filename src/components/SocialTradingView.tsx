'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { Award, Users, Copy, Check, TrendingUp, Sparkles, Filter, ShieldCheck } from 'lucide-react';

interface LeaderboardTrader {
  rank: number;
  username: string;
  winRate: number;
  roi30d: number;
  copiers: number;
  profit: number;
  pair: string;
  userId: string;
}

export default function SocialTradingView() {
  const { 
    user, 
    updateConfig, 
    addLog, 
    addNotification, 
    addAuditLog,
    leaders,
    copyConnections,
    fetchLeaders,
    fetchCopyConnections,
    startCopying,
    stopCopying
  } = useBotStore();
  const t = useI18nStore((state) => state.t);
  
  const [selectedTrader, setSelectedTrader] = useState<LeaderboardTrader | null>(null);
  const [lotMultiplier, setLotMultiplier] = useState(1.0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLeaders();
    fetchCopyConnections();
  }, [fetchLeaders, fetchCopyConnections]);

  // Find active copy connection
  const activeConnection = copyConnections.find(c => c.status === 'ACTIVE');
  const copiedLeader = activeConnection ? leaders.find(l => l.userId === activeConnection.leaderId) : null;
  const isCopying = copiedLeader ? copiedLeader.username : null;

  const topTraders: LeaderboardTrader[] = leaders.length > 0 ? leaders : [
    { rank: 1, username: 'FX_Sniper_99', winRate: 84.5, roi30d: 42.8, copiers: 1280, profit: 14250, pair: 'EUR/USD', userId: 'leader-1' },
    { rank: 2, username: 'GoldenScalper', winRate: 79.2, roi30d: 35.4, copiers: 840, profit: 9800, pair: 'USD/JPY', userId: 'leader-2' },
    { rank: 3, username: 'SwingKing', winRate: 74.8, roi30d: 28.1, copiers: 512, profit: 6200, pair: 'GBP/USD', userId: 'leader-3' },
    { rank: 4, username: 'AlphaForexAI', winRate: 72.1, roi30d: 22.5, copiers: 320, profit: 4150, pair: 'AUD/USD', userId: 'leader-4' },
  ];

  const presets = [
    {
      name: 'Safe EUR/USD Swing',
      creator: 'SwingKing',
      pair: 'EUR/USD',
      risk: 'CONSERVATIVE',
      winRate: '74.8%',
      price: 'Free',
      desc: 'Strategi swing trading dengan penempatan Stop Loss ketat dan profit konsisten.'
    },
    {
      name: 'Gold Scalper Extreme',
      creator: 'FX_Sniper_99',
      pair: 'USD/JPY',
      risk: 'AGGRESSIVE',
      winRate: '84.5%',
      price: '$19.00',
      desc: 'Peluang lot tinggi pada volatilitas jangka pendek. Membutuhkan lisensi Enterprise.'
    }
  ];

  const handleOpenCopyModal = (trader: LeaderboardTrader) => {
    setSelectedTrader(trader);
    setShowModal(true);
  };

  const handleConfirmCopy = async () => {
    if (!selectedTrader) return;

    try {
      await startCopying(selectedTrader.userId, lotMultiplier);
      setShowModal(false);
      
      // Update bot configuration to match trader's pair & set lot size based on multiplier
      updateConfig({
        tradeSize: parseFloat((0.1 * lotMultiplier).toFixed(2)) || 0.01,
        riskLevel: selectedTrader.roi30d > 30 ? 'AGGRESSIVE' : 'MODERATE'
      });

      addLog(`[Copy Trading] Mulai menyalin posisi ${selectedTrader.username} (Multiplier: ${lotMultiplier}x)`, 'SUCCESS');
      addAuditLog(`Copy Bot: Started copying ${selectedTrader.username} (Multiplier: ${lotMultiplier}x)`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopCopy = async () => {
    if (!activeConnection) return;

    try {
      await stopCopying(activeConnection.id);
      addLog(`[Copy Trading] Berhenti menyalin posisi ${isCopying}`, 'WARNING');
      addAuditLog(`Copy Bot: Stopped copying ${isCopying}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPreset = (name: string, risk: string, pair: string, price: string) => {
    if (price !== 'Free' && user?.tier !== 'ENTERPRISE') {
      addLog(`[Paywall] Gagal menerapkan preset '${name}': Membutuhkan lisensi ENTERPRISE.`, 'ERROR');
      addNotification(`Preset ${name} memerlukan lisensi Enterprise!`);
      addAuditLog(`Apply Preset Failed: ${name} (Paywall)`, 'FAILED');
      return;
    }

    updateConfig({
      tradeSize: 0.1,
      riskLevel: risk as any
    });

    addLog(`[AI Engine] Preset '${name}' berhasil diterapkan untuk pasangan ${pair}.`, 'SUCCESS');
    addNotification(`Preset ${name} berhasil diterapkan!`);
    addAuditLog(`Applied Strategy Preset: ${name}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <Users className="w-6 h-6 text-cyan-400" />
          Social Trading & Copy-Bot Hub
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Salin konfigurasi trading otomatis milik trader sukses atau terapkan preset strategi terverifikasi secara instan.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 - Leaderboard */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Traders Klasemen Teratas (30d)</h3>
              {isCopying && activeConnection && (
                <button
                  onClick={handleStopCopy}
                  className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-600/30 rounded-xl text-[10px] font-mono font-bold transition-all duration-300 active:scale-95"
                >
                  Stop Copying ({isCopying})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center font-normal">Rank</th>
                    <th className="py-3 px-4 font-normal">Trader</th>
                    <th className="py-3 px-4 font-normal text-right">Win Rate</th>
                    <th className="py-3 px-4 font-normal text-right">ROI (30d)</th>
                    <th className="py-3 px-4 font-normal text-right">Copiers</th>
                    <th className="py-3 px-4 font-normal text-right">Profit</th>
                    <th className="py-3 px-4 text-right font-normal">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                  {topTraders.map((trader) => (
                    <tr key={trader.username} className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3.5 px-4 text-center font-bold">
                        {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : trader.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-100 font-bold block">{trader.username}</span>
                        <span className="text-[10px] text-slate-500">{trader.pair} Focus</span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{trader.winRate}%</td>
                      <td className="py-3.5 px-4 text-right text-cyan-400 font-bold">+{trader.roi30d}%</td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{trader.copiers}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">${trader.profit.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isCopying === trader.username ? (
                          <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold rounded-xl font-mono flex items-center justify-center gap-1 w-24 ml-auto">
                            <Check className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenCopyModal(trader)}
                            disabled={isCopying !== null}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-955 text-[10px] font-black uppercase rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 w-24 ml-auto"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Bot
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1/3 - Marketplace Presets */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Config Marketplace
            </h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Terapkan preset konfigurasi bot AI yang siap pakai untuk menghemat waktu analisis.
            </p>

            <div className="space-y-4 pt-2">
              {presets.map((preset) => (
                <div key={preset.name} className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-205">{preset.name}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Oleh: {preset.creator} | {preset.pair}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 font-bold font-mono rounded-md ${
                      preset.price === 'Free' ? 'bg-emerald-950 text-emerald-400' : 'bg-purple-950 text-purple-400'
                    }`}>
                      {preset.price}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed">{preset.desc}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-850/60 font-mono text-[9px] text-slate-500">
                    <div>
                      Win Rate: <span className="text-emerald-400 font-bold">{preset.winRate}</span>
                    </div>
                    <div>
                      Risiko: <span className="text-cyan-400 font-bold">{preset.risk}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyPreset(preset.name, preset.risk, preset.pair, preset.price)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 border border-slate-850"
                  >
                    Terapkan Preset
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy Settings Modal */}
      {showModal && selectedTrader && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Salin Konfigurasi Bot
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda akan menyalin pengaturan trading dari <span className="text-cyan-400 font-bold font-mono">{selectedTrader.username}</span>. Silakan tentukan lot multiplier risiko Anda.
            </p>

            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Lot Multiplier</span>
                <span className="text-cyan-400 font-bold">{lotMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={lotMultiplier}
                onChange={(e) => setLotMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Konservatif (0.5x)</span>
                <span>Agresif (3.0x)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition-all duration-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCopy}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md"
              >
                Mulai Salin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
