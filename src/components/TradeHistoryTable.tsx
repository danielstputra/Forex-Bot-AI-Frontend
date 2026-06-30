'use client';

import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Clock, Search, Lock, Grid3X3 } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { formatToLocalTime, getLocalTimezoneName } from '../utils/timezone';
import EnterprisePivotGrid from './EnterprisePivotGrid';
import * as XLSX from 'xlsx';

export default function TradeHistoryTable() {
  const { activeTrades, tradeHistory, user, setUpgradeOpen } = useBotStore();
  const t = useI18nStore((state) => state.t);
  
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'pivot'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab switching paywall check
  const handleTabChange = (tab: 'active' | 'history' | 'pivot') => {
    if (tab === 'pivot' && user?.tier !== 'ENTERPRISE') {
      setUpgradeOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Combine or filter data based on active tab
  const currentData = activeTab === 'active' ? activeTrades : tradeHistory;
  
  const filteredData = currentData.filter(trade => 
    trade.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format values
  const formatVal = (val?: number, isJpy = false) => {
    if (val === undefined) return '-';
    return isJpy ? val.toFixed(2) : val.toFixed(4);
  };

  const formatProfit = (val?: number) => {
    if (val === undefined) return '-';
    const sign = val > 0 ? '+' : '';
    return `${sign}$${val.toFixed(2)}`;
  };

  // Export to Excel using SheetJS with custom template based on user tier
  const handleExport = () => {
    if (user?.tier === 'FREE') {
      setUpgradeOpen(true);
      return;
    }

    if (tradeHistory.length === 0) return;

    let workbook = XLSX.utils.book_new();

    if (user?.tier === 'ENTERPRISE') {
      // Institutional-Grade Export
      const totalProfit = tradeHistory.reduce((sum, t) => sum + (t.profit || 0), 0);
      const winRate = ((tradeHistory.filter(t => (t.profit || 0) > 0).length / tradeHistory.length) * 100).toFixed(1) + '%';
      const totalVolume = tradeHistory.reduce((sum, t) => sum + t.lotSize, 0).toFixed(2) + ' Lot';

      // Assemble the custom template sheet
      const institutionalData = [
        [`${useBotStore.getState().appConfig?.appName?.toUpperCase() || 'FOREX BOT AI'} - INSTITUTIONAL PERFORMANCE REPORT`],
        [],
        ['ACCOUNT INFORMATION', '', '', 'REPORT METADATA'],
        ['Account Holder:', user.email, '', 'Generated At:', new Date().toLocaleString()],
        ['Subscription Tier:', user.tier, '', 'Timezone:', getLocalTimezoneName()],
        [],
        ['PERFORMANCE SUMMARY'],
        ['Total Trades', 'Total Volume', 'Net Profit / Loss', 'Win Rate'],
        [tradeHistory.length, totalVolume, `$${totalProfit.toFixed(2)}`, winRate],
        [],
        ['DETAILED TRANSACTION LOGS'],
        ['Trade ID', 'Timestamp (Local)', 'Currency Pair', 'Type', 'Lot Size', 'Entry Price', 'Exit Price', 'Profit/Loss ($)', 'Status']
      ];

      // Add actual trade logs
      tradeHistory.forEach(t => {
        institutionalData.push([
          t.id,
          new Date(t.timestamp).toLocaleString(),
          t.pair,
          t.type,
          t.lotSize,
          t.entryPrice,
          t.exitPrice || 0,
          t.profit || 0,
          t.status
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(institutionalData);
      
      // Auto-fit columns (rough estimate)
      const max_val = institutionalData.reduce((w, r) => Math.max(w, r.length), 0);
      worksheet['!cols'] = Array(max_val).fill({ wch: 18 });

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Institutional Report');
    } else {
      // Standard Export for Premium Tier
      const exportData = tradeHistory.map(t => ({
        'ID Transaksi': t.id,
        'Pasangan Mata Uang': t.pair,
        'Tipe': t.type,
        'Ukuran Lot': t.lotSize,
        'Harga Masuk': t.entryPrice,
        'Harga Keluar': t.exitPrice || 0,
        'Profit / Loss ($)': t.profit || 0,
        'Status': t.status,
        'Waktu Masuk': new Date(t.timestamp).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trade History');
    }

    XLSX.writeFile(workbook, `Forex_Bot_AI_Performance_${user?.tier}_${Date.now()}.xlsx`);
  };

  const tzName = getLocalTimezoneName();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl h-full">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-850 self-start">
          <button
            onClick={() => handleTabChange('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTab === 'active'
                ? 'bg-slate-850 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('table.active')} ({activeTrades.length})
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-slate-850 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('table.history')} ({tradeHistory.length})
          </button>
          <button
            onClick={() => handleTabChange('pivot')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'pivot'
                ? 'bg-slate-850 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
            {t('table.pivot')}
            {user?.tier !== 'ENTERPRISE' && <Lock className="w-3 h-3 text-slate-550" />}
          </button>
        </div>

        {/* Search & Export */}
        {activeTab !== 'pivot' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('table.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 w-48 font-mono"
              />
            </div>

            {activeTab === 'history' && (
              <button
                onClick={handleExport}
                disabled={tradeHistory.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs rounded-xl font-semibold transition-all duration-300 active:scale-95 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {t('table.export')}
                {user?.tier === 'FREE' && <Lock className="w-3.5 h-3.5 text-slate-550" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conditional rendering for Pivot Grid */}
      {activeTab === 'pivot' ? (
        <EnterprisePivotGrid />
      ) : (
        /* Table Data Container */
        <div className="flex-1 overflow-x-auto min-h-[260px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-[11px] font-mono text-slate-550 uppercase tracking-wider">
                <th className="py-3 px-4 font-normal">{t('table.id')}</th>
                <th className="py-3 px-4 font-normal">{t('table.time')} ({tzName})</th>
                <th className="py-3 px-4 font-normal">{t('table.pair')}</th>
                <th className="py-3 px-4 font-normal">{t('table.type')}</th>
                <th className="py-3 px-4 font-normal">{t('table.lot')}</th>
                <th className="py-3 px-4 font-normal">{t('table.entry')}</th>
                <th className="py-3 px-4 font-normal">{t('table.exit')}</th>
                <th className="py-3 px-4 font-normal text-right">{t('table.profit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/40 text-xs font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                    {t('table.empty')}
                  </td>
                </tr>
              ) : (
                filteredData.map((trade) => {
                  const isJpy = trade.pair.includes('JPY');
                  const isProfit = (trade.profit || 0) > 0;
                  
                  return (
                    <tr key={trade.id} className="hover:bg-slate-950/20 transition-colors duration-200">
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{trade.id}</td>
                      <td className="py-3.5 px-4 text-slate-550">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          {formatToLocalTime(trade.timestamp)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-bold">{trade.pair}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          trade.type === 'BUY' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-rose-950/60 text-rose-400 border border-rose-900/30'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{trade.lotSize}</td>
                      <td className="py-3.5 px-4 text-slate-400">{formatVal(trade.entryPrice, isJpy)}</td>
                      <td className="py-3.5 px-4 text-slate-400">{formatVal(trade.exitPrice, isJpy)}</td>
                      <td className={`py-3.5 px-4 text-right font-bold ${
                        trade.status === 'OPEN' ? 'text-cyan-400 italic' :
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {trade.status === 'OPEN' ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                            {t('table.floating')}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {formatProfit(trade.profit)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
