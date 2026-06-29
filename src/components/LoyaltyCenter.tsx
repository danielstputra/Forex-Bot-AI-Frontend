'use client';

import React, { useEffect, useState } from 'react';
import { Award, Sparkles, Flame, Percent, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';

export default function LoyaltyCenter() {
  const { loyaltyStatus, fetchLoyaltyStatus, claimLoyaltyReward } = useBotStore();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLoyaltyStatus();
  }, [fetchLoyaltyStatus]);

  const handleClaim = async (rewardName: string, pointsSpent: number) => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await claimLoyaltyReward(rewardName, pointsSpent);
      setMsg({ type: 'success', text: `Hadiah "${rewardName}" berhasil diklaim!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal mengklaim hadiah.' });
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = loyaltyStatus?.totalPoints || 0;
  const volumeTraded = loyaltyStatus?.activeVolumePoint?.volumeTraded || 0.0;
  const targetVolume = 50.0;
  const progressPercent = Math.min((volumeTraded / targetVolume) * 100, 100);

  const allBadges = loyaltyStatus?.allBadges || [];
  const earnedBadges = loyaltyStatus?.earnedBadges || [];
  const rewardClaimsList = loyaltyStatus?.rewardClaims || [];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-cyan-455" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-455" />;
      case 'Flame': return <Flame className="w-8 h-8 text-rose-455" />;
      default: return <Award className="w-8 h-8 text-emerald-455" />;
    }
  };

  const rewards = [
    { name: 'Diskon 50% Langganan', points: 500, desc: 'Klaim kupon potongan harga langganan bulanan.' },
    { name: 'Akses Preset Premium Gratis', points: 1000, desc: 'Akses gratis strategi AI berkinerja tinggi selama 1 bulan.' }
  ];

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
            <Award className="w-6 h-6 text-cyan-400" />
            Pusat Loyalitas & Gamifikasi (Rewards)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Klaim lencana pencapaian (*trading achievements*) dan kumpulkan poin volume transaksi untuk mendapatkan potongan biaya langganan bulanan.
          </p>
        </div>
        <button
          onClick={() => fetchLoyaltyStatus()}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 - Badges & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Trading Badges & Achievements</h3>
            
            {allBadges.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500 font-mono">
                Belum ada lencana terdaftar di database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allBadges.map((badge: any) => {
                  const isUnlocked = earnedBadges.some((eb: any) => eb.id === badge.id);
                  return (
                    <div 
                      key={badge.id} 
                      className={`border rounded-2xl p-4.5 flex gap-4 items-start relative overflow-hidden transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-slate-955/40 border-slate-800 hover:border-cyan-500/20'
                          : 'bg-slate-955/10 border-slate-900 opacity-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isUnlocked ? 'bg-slate-900' : 'bg-slate-950'
                      }`}>
                        {getBadgeIcon(badge.iconName)}
                      </div>
                      
                      <div className="space-y-1 text-left flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">{badge.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 font-mono font-bold rounded ${
                            isUnlocked ? 'bg-emerald-950 text-emerald-455 border border-emerald-900/30' : 'bg-slate-950 text-slate-500'
                          }`}>
                            {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-455 leading-relaxed">{badge.description}</p>
                        {badge.requiredVol > 0 && !isUnlocked && (
                          <span className="text-[8px] text-slate-500 font-mono block pt-1">
                            Target: {badge.requiredVol} Lot
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 - Volume Point System & Claims */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4.5 h-4.5 text-cyan-400" /> Volume Point System
              </h3>
              <span className="flex items-center gap-1 text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-cyan-400" />
                {totalPoints} Points
              </span>
            </div>
            
            <p className="text-[11px] text-slate-455 leading-relaxed font-mono">
              Kumpulkan poin dengan menjalankan bot (100 Poin per 1.0 Lot). Poin Anda dapat ditukarkan secara instan di bawah ini.
            </p>

            {/* Volume Progress Bar */}
            <div className="space-y-2 bg-slate-955 p-4.5 rounded-2xl border border-slate-850">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-450">Volume Bulan Ini</span>
                <span className="text-cyan-405 font-bold">{volumeTraded} / {targetVolume} Lots</span>
              </div>
              
              <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <p className="text-[9px] text-slate-500 font-mono text-center pt-1">
                {volumeTraded < targetVolume
                  ? `Butuh ${(targetVolume - volumeTraded).toFixed(2)} Lot lagi untuk mengaktifkan diskon.`
                  : 'Target volume bulanan tercapai!'}
              </p>
            </div>

            {/* Rewards Exchange */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Tukar Hadiah Poin</span>
              {rewards.map((r) => (
                <div key={r.name} className="bg-slate-955 border border-slate-855 p-3.5 rounded-xl flex justify-between items-center gap-3">
                  <div className="text-left flex-1">
                    <span className="text-xs font-bold text-slate-300 block">{r.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono leading-normal block">{r.desc}</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold block mt-1">{r.points} Poin</span>
                  </div>
                  <button
                    onClick={() => handleClaim(r.name, r.points)}
                    disabled={loading || totalPoints < r.points}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all shrink-0"
                  >
                    Claim
                  </button>
                </div>
              ))}
            </div>

            {/* Claims History */}
            {rewardClaimsList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Klaim Terkini</span>
                <div className="space-y-1.5">
                  {rewardClaimsList.map((claim: any) => (
                    <div key={claim.id} className="flex justify-between items-center text-[10px] font-mono p-2 bg-slate-955 rounded-lg border border-slate-855/50">
                      <span className="text-slate-300 truncate max-w-[150px]">{claim.rewardName}</span>
                      <span className="text-emerald-400 font-bold">{claim.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
