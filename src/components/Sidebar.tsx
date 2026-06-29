'use client';

import React from 'react';
import { 
  TrendingUp, 
  History, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Globe,
  LineChart,
  Award,
  Users,
  HelpCircle,
  Shield,
  Settings,
  Wallet,
  Percent,
  Code,
  Mail
} from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore, Language } from '../store/useI18nStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { status, user, setUpgradeOpen, customLogoUrl, inboxMessages } = useBotStore();
  const { lang, setLanguage, t } = useI18nStore();
  
  const menuItems = [
    { id: 'dashboard', name: t('sidebar.title'), icon: TrendingUp },
    { id: 'inbox', name: 'Kotak Masuk', icon: Mail },
    { id: 'history', name: t('sidebar.history'), icon: History },
    { id: 'fintech', name: 'Fintech Hub', icon: Wallet },
    { id: 'backtest', name: t('sidebar.backtest'), icon: LineChart },
    { id: 'social', name: 'Social Trading', icon: Users },
    { id: 'pamm', name: 'PAMM/MAM Manager', icon: Percent },
    { id: 'security_kyc', name: t('sidebar.securityKyc'), icon: ShieldCheck },
    { id: 'affiliate', name: t('sidebar.affiliate'), icon: Award },
    { id: 'help', name: 'Pusat Bantuan', icon: HelpCircle },
    { id: 'audit', name: 'Audit Trail', icon: Shield },
    { id: 'developer', name: 'Developer Portal', icon: Code },
    { id: 'backoffice', name: 'Backoffice (Admin)', icon: Settings },
    { id: 'logs', name: t('sidebar.logs'), icon: Terminal },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'backtest' && user?.tier === 'FREE') {
      setUpgradeOpen(true);
      return;
    }
    setActiveTab(id);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shrink-0">
      {/* Brand Section */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 h-20 shrink-0">
        {customLogoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={customLogoUrl} alt="Brand Logo" className="max-h-9 max-w-full object-contain" />
        ) : (
          <>
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg text-white animate-pulse">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-wider">FOREX-BOT <span className="text-cyan-400 font-black">AI</span></h1>
              <span className="text-[10px] text-slate-500 font-mono block">v3.0.0 Enterprise</span>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.id === 'backtest' && user?.tier === 'FREE';
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 text-xs font-medium ${
                isActive 
                  ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border-l-4 border-cyan-500 text-cyan-400 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-450'}`} />
                {item.name}
              </div>
              <div className="flex items-center gap-1">
                {item.id === 'inbox' && inboxMessages.filter(m => !m.isRead).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 text-[9px] font-black rounded-full">
                    {inboxMessages.filter(m => !m.isRead).length}
                  </span>
                )}
                {isLocked && (
                  <span className="text-[9px] px-1 py-0.5 bg-slate-950 text-slate-500 rounded border border-slate-850 font-mono font-bold">
                    PRO
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Summary */}
      <div className="px-4 py-4 m-4 bg-slate-955/60 border border-slate-800/80 rounded-2xl space-y-4 shrink-0">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-450">{t('sidebar.botStatus')}</span>
            <span className={`flex h-2 w-2 relative`}>
              {status === 'RUNNING' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                status === 'RUNNING' ? 'bg-emerald-500' :
                status === 'PAUSED' ? 'bg-amber-500' :
                status === 'PANIC' ? 'bg-rose-600' : 'bg-slate-500'
              }`}></span>
            </span>
          </div>
          
          <div className="space-y-1 text-[10px] font-mono text-slate-500">
            <div className="flex justify-between">
              <span>{t('sidebar.mode')}:</span>
              <span className={`font-bold ${
                status === 'RUNNING' ? 'text-emerald-400' :
                status === 'PAUSED' ? 'text-amber-400' :
                status === 'PANIC' ? 'text-rose-500' : 'text-slate-400'
              }`}>{status}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('sidebar.broker')}:</span>
              <span className="text-slate-355">IC Markets (Mock)</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="pt-3 border-t border-slate-850/85">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mb-2">
            <Globe className="w-3 h-3 text-slate-550" />
            <span>Language / 言語</span>
          </div>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-850/80">
            {(['ID', 'EN', 'JA'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`flex-1 py-1 text-[9px] font-black rounded-lg font-mono transition-all duration-350 ${
                  lang === l
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Security Indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[9px] text-cyan-500/80 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('sidebar.secured')}</span>
        </div>
      </div>
    </aside>
  );
}
