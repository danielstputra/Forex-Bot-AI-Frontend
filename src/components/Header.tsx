'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Flame, Wallet, ArrowUpRight, ArrowDownRight, LogOut } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { stats, status, activeTrades, panicSell, user, logout } = useBotStore();
  const t = useI18nStore((state) => state.t);
  const [prevEquity, setPrevEquity] = useState(stats.equity);
  const [equityFlash, setEquityFlash] = useState<'up' | 'down' | null>(null);

  // Trigger a flash effect when equity changes
  useEffect(() => {
    if (stats.equity > prevEquity) {
      setEquityFlash('up');
      const timer = setTimeout(() => setEquityFlash(null), 300);
      return () => clearTimeout(timer);
    } else if (stats.equity < prevEquity) {
      setEquityFlash('down');
      const timer = setTimeout(() => setEquityFlash(null), 300);
      return () => clearTimeout(timer);
    }
    setPrevEquity(stats.equity);
  }, [stats.equity, prevEquity]);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <header className="h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between z-20">
      {/* Financial Overview */}
      <div className="flex items-center gap-6">
        {/* Balance */}
        <div className="flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-800/60">
          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{t('header.balance')}</div>
            <div className="text-sm font-semibold text-slate-200 font-mono">
              {formatCurrency(stats.balance)}
            </div>
          </div>
        </div>

        {/* Equity */}
        <div className={`flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-800/60 transition-colors duration-300 ${
          equityFlash === 'up' ? 'bg-emerald-950/40 border-emerald-500/40' :
          equityFlash === 'down' ? 'bg-rose-950/40 border-rose-500/40' : ''
        }`}>
          <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
            equityFlash === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
            equityFlash === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {equityFlash === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
             equityFlash === 'down' ? <ArrowDownRight className="w-4 h-4" /> :
             <Wallet className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{t('header.equity')}</div>
            <div className={`text-sm font-bold font-mono transition-colors duration-300 ${
              equityFlash === 'up' ? 'text-emerald-400' :
              equityFlash === 'down' ? 'text-rose-400' : 'text-slate-100'
            }`}>
              {formatCurrency(stats.equity)}
            </div>
          </div>
        </div>

        {/* Margin */}
        <div className="flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-800/60">
          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{t('header.margin')}</div>
            <div className="text-sm font-semibold text-slate-200 font-mono">
              {formatCurrency(stats.margin)}
            </div>
          </div>
        </div>
      </div>

      {/* Control & Profile Area */}
      <div className="flex items-center gap-5">
        {/* Active Trades Badge */}
        {activeTrades.length > 0 && (
          <div className="px-3 py-1.5 bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 text-xs rounded-full font-mono flex items-center gap-1.5 animate-pulse animate-duration-1000">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            {activeTrades.length} {t('header.activeTrades')}
          </div>
        )}

        {/* Panic Sell Button */}
        <button
          onClick={panicSell}
          disabled={status === 'PANIC'}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg ${
            status === 'PANIC' 
              ? 'bg-rose-950 border border-rose-800/30 text-rose-500 cursor-not-allowed' 
              : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-rose-900/30 active:scale-95'
          }`}
        >
          <Flame className="w-4 h-4" />
          {t('header.panicSell')}
        </button>

        {/* Notification Bell Dropdown */}
        <NotificationBell />

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-slate-800" />

        {/* User Session Info */}
        {user && (
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-300 max-w-[120px] truncate font-mono">
                {user.email.split('@')[0]}
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold font-mono tracking-wider ${
                user.tier === 'ENTERPRISE' ? 'bg-gradient-to-tr from-cyan-500/25 to-purple-500/25 border border-cyan-500/30 text-cyan-400' :
                user.tier === 'PREMIUM' ? 'bg-blue-950 border border-blue-800/35 text-blue-400' :
                'bg-slate-950 border border-slate-800 text-slate-500'
              }`}>
                {user.tier}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-rose-400 rounded-xl text-slate-400 transition-all duration-300 active:scale-95"
              title={t('header.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
