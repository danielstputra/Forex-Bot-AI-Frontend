'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BotControlPanel from '@/components/BotControlPanel';
import TradingViewChart from '@/components/TradingViewChart';
import AiConsole from '@/components/AiConsole';
import TradeHistoryTable from '@/components/TradeHistoryTable';
import AuthModal from '@/components/AuthModal';
import UpgradeModal from '@/components/UpgradeModal';
import BacktestingView from '@/components/BacktestingView';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import KycPortal from '@/components/KycPortal';
import AffiliateDashboard from '@/components/AffiliateDashboard';
import OfflineFallback from '@/components/OfflineFallback';
import ProductTour from '@/components/ProductTour';
import SocialTradingView from '@/components/SocialTradingView';
import BackofficeView from '@/components/BackofficeView';
import HelpCenterView from '@/components/HelpCenterView';
import AuditTrailView from '@/components/AuditTrailView';
import LiveChatWidget from '@/components/LiveChatWidget';
import FintechHub from '@/components/FintechHub';
import BrokerConnector from '@/components/BrokerConnector';
import EconomicCalendar from '@/components/EconomicCalendar';
import PammDashboard from '@/components/PammDashboard';
import DeveloperPortal from '@/components/DeveloperPortal';
import InboxView from '@/components/InboxView';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { mockSocketService } from '@/services/mockSocket';
import { useBotStore } from '@/store/useBotStore';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, isUpgradeOpen, setUpgradeOpen, initSession, initTenant, appConfig, theme, setTheme } = useBotStore();

  // Sync theme store state with HTML class on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark && theme !== 'dark') {
      useBotStore.setState({ theme: 'dark' });
    } else if (!isDark && theme !== 'light') {
      useBotStore.setState({ theme: 'light' });
    }
  }, [theme]);

  // Update Browser Title based on dynamic config
  useEffect(() => {
    if (appConfig?.appName) {
      document.title = `${appConfig.appName} - Premium Enterprise Trading Terminal`;
    }
  }, [appConfig?.appName]);

  // Restore session from backend on mount
  useEffect(() => {
    initTenant();
    initSession();
  }, [initSession, initTenant]);

  // Manage WebSocket connection based on user login state
  useEffect(() => {
    if (user) {
      mockSocketService.connect();
    } else {
      mockSocketService.disconnect();
    }
    return () => {
      mockSocketService.disconnect();
    };
  }, [user]);

  // Session Timeout Hook (30s inactivity timeout + 15s warning countdown)
  const { showWarning, countdown, resetTimeout } = useSessionTimeout(30000, 15);

  // If user is not authenticated, show the login screen
  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans selection:bg-cyan-500/30">
      
      {/* PWA & Network Monitor Fallback */}
      <OfflineFallback />

      {/* Onboarding Product Tour */}
      <ProductTour />

      {/* Sidebar - Navigation */}
      <div id="tour-sidebar">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Header - Account & Quick Controls */}
        <div id="tour-header">
          <Header />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Left 2/3 - Chart & Positions */}
              <div className="xl:col-span-2 space-y-6">
                {/* Real-time Candlestick Chart */}
                <TradingViewChart />
                
                {/* Active Trades Data Grid */}
                <TradeHistoryTable />

                {/* Broker MT4/MT5 Connection */}
                <BrokerConnector />

                {/* Economic Calendar */}
                <EconomicCalendar />
              </div>

              {/* Right 1/3 - Control Panel & AI Thoughts */}
              <div className="space-y-6">
                {/* Bot Settings & Risk Control */}
                <div id="tour-control">
                  <BotControlPanel />
                </div>

                {/* AI Console Feed */}
                <div id="tour-console">
                  <AiConsole />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-[calc(100vh-140px)]">
              <TradeHistoryTable />
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="min-h-[calc(100vh-140px)]">
              <InboxView />
            </div>
          )}

          {activeTab === 'fintech' && (
            <div className="min-h-[calc(100vh-140px)]">
              <FintechHub />
            </div>
          )}


          {activeTab === 'backtest' && (
            <div className="min-h-[calc(100vh-140px)]">
              <BacktestingView />
            </div>
          )}

          {activeTab === 'social' && (
            <div className="min-h-[calc(100vh-140px)]">
              <SocialTradingView />
            </div>
          )}

          {activeTab === 'pamm' && (
            <div className="min-h-[calc(100vh-140px)]">
              <PammDashboard />
            </div>
          )}

          {activeTab === 'security_kyc' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl">
              <TwoFactorSetup />
              <KycPortal />
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="min-h-[calc(100vh-140px)]">
              <AffiliateDashboard />
            </div>
          )}

          {activeTab === 'help' && (
            <div className="min-h-[calc(100vh-140px)]">
              <HelpCenterView />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="min-h-[calc(100vh-140px)]">
              <AuditTrailView />
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="min-h-[calc(100vh-140px)]">
              <DeveloperPortal />
            </div>
          )}

          {activeTab === 'backoffice' && (
            <div className="min-h-[calc(100vh-140px)]">
              <BackofficeView />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-[calc(100vh-140px)]">
              <AiConsole />
            </div>
          )}
        </main>
      </div>

      {/* Floating Live Chat Widget */}
      <LiveChatWidget />

      {/* Subscription Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Auto Logout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className="p-3.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">Sesi Anda Akan Berakhir</h3>
              <p className="text-[11px] text-slate-455 leading-relaxed">
                Anda tidak aktif selama beberapa saat. Anda akan otomatis keluar dalam:
              </p>
              <div className="text-xl font-black text-rose-500 font-mono animate-pulse">
                {countdown} detik
              </div>
            </div>
            <button
              onClick={resetTimeout}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 shadow"
            >
              <RefreshCw className="w-4 h-4" />
              Lanjutkan Sesi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
