'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Flame, Wallet, ArrowUpRight, ArrowDownRight, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export default function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  const { stats, status, activeTrades, panicSell, user, logout, theme, setTheme } = useBotStore();
  const t = useI18nStore((state) => state.t);
  const [prevEquity, setPrevEquity] = useState(stats.equity);
  const [equityFlash, setEquityFlash] = useState<'up' | 'down' | null>(null);

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <header id="tour-header" className="w-full h-16 sm:h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 lg:px-8 flex items-center gap-2 sm:gap-4 z-20">

      {/* Hamburger – mobile only */}
      <button
        onClick={onMenuClick}
        className="p-2 sm:p-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 transition-all duration-300 lg:hidden shrink-0 cursor-pointer flex items-center justify-center"
        aria-label="Open Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Financial Overview – horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 overflow-x-auto no-scrollbar flex-1 min-w-0 py-1">

        {/* Balance */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-800/60 shrink-0">
          <div className="p-1 sm:p-1.5 bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-mono tracking-wider">{t('header.balance')}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-200 font-mono whitespace-nowrap">{formatCurrency(stats.balance)}</div>
          </div>
        </div>

        {/* Equity */}
        <div className={`flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-800/60 transition-colors duration-300 shrink-0 ${
          equityFlash === 'up' ? 'bg-emerald-950/40 border-emerald-500/40' :
          equityFlash === 'down' ? 'bg-rose-950/40 border-rose-500/40' : ''
        }`}>
          <div className={`p-1 sm:p-1.5 rounded-lg transition-colors duration-300 shrink-0 ${
            equityFlash === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
            equityFlash === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {equityFlash === 'up' ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> :
             equityFlash === 'down' ? <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> :
             <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </div>
          <div className="min-w-0">
            <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-mono tracking-wider">{t('header.equity')}</div>
            <div className={`text-[11px] sm:text-xs font-bold font-mono transition-colors duration-300 whitespace-nowrap ${
              equityFlash === 'up' ? 'text-emerald-400' :
              equityFlash === 'down' ? 'text-rose-400' : 'text-slate-100'
            }`}>{formatCurrency(stats.equity)}</div>
          </div>
        </div>

        {/* Margin – hidden on very small, visible sm+ */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/60 shrink-0">
          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">{t('header.margin')}</div>
            <div className="text-xs font-semibold text-slate-200 font-mono whitespace-nowrap">{formatCurrency(stats.margin)}</div>
          </div>
        </div>

        {/* Active Trades badge – md+ */}
        {activeTrades.length > 0 && (
          <div className="hidden md:flex px-3 py-1.5 bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 text-[10px] rounded-full font-mono items-center gap-1.5 animate-pulse shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {activeTrades.length} {t('header.activeTrades')}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

        {/* Panic Sell */}
        <button
          onClick={panicSell}
          disabled={status === 'PANIC'}
          className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-300 shadow-lg ${
            status === 'PANIC'
              ? 'bg-rose-950 border border-rose-800/30 text-rose-500 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
          }`}
        >
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">{t('header.panicSell')}</span>
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 sm:p-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800 hidden sm:block" />

        {/* User */}
        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div
              onClick={onProfileClick}
              className="text-right hidden md:block cursor-pointer hover:opacity-80 transition-opacity"
              title="Buka Profil Anda"
            >
              <div className="text-[11px] font-bold text-slate-300 max-w-[100px] truncate font-mono">
                {user.email.split('@')[0]}
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold font-mono tracking-wider ${
                user.tier === 'ENTERPRISE' ? 'bg-gradient-to-tr from-cyan-500/25 to-purple-500/25 border border-cyan-500/30 text-cyan-400' :
                user.tier === 'PREMIUM' ? 'bg-blue-950 border border-blue-800/35 text-blue-400' :
                'bg-slate-950 border border-slate-800 text-slate-500'
              }`}>
                {user.tier}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 sm:p-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-rose-400 rounded-xl text-slate-400 transition-all duration-300 active:scale-95"
              title={t('header.logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
