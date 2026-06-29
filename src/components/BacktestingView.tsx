'use client';

import React, { useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import BacktestRuleBuilder from './BacktestRuleBuilder';
import BacktestProgress from './BacktestProgress';
import BacktestResultView from './BacktestResultView';
import { AreaChart, HelpCircle, Clock, Trash2 } from 'lucide-react';

export default function BacktestingView() {
  const { backtestStatus, backtestHistoryList, fetchBacktestHistory, deleteBacktestHistory } = useBotStore();
  const t = useI18nStore((state) => state.t);

  useEffect(() => {
    fetchBacktestHistory();
  }, [fetchBacktestHistory]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <AreaChart className="w-6 h-6 text-cyan-400" />
          {t('backtest.title')}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t('backtest.desc')}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column - Rule Builder (1/3) */}
        <div>
          <BacktestRuleBuilder />
        </div>

        {/* Right Column - Status/Progress/Result (2/3) */}
        <div className="xl:col-span-2">
          {backtestStatus === 'IDLE' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] gap-4 text-center shadow-xl">
              <div className="p-4 bg-slate-950 rounded-full text-slate-600 border border-slate-850/60">
                <HelpCircle className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-255 uppercase tracking-wider font-mono">
                  Siap Memulai Simulasi
                </h3>
                <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
                  Tentukan parameter rasio risiko, stop loss, dan filter indikator teknikal di panel sebelah kiri, lalu tekan <strong>&quot;Jalankan Simulasi&quot;</strong>.
                </p>
              </div>
            </div>
          )}

          {backtestStatus === 'RUNNING' && (
            <BacktestProgress />
          )}

          {backtestStatus === 'COMPLETED' && (
            <BacktestResultView />
          )}
        </div>

      </div>

      {/* Riwayat Backtest - dari Database */}
      {backtestHistoryList.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-purple-400" />
            Riwayat Backtest Tersimpan
            <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full ml-1">{backtestHistoryList.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {backtestHistoryList.map((h: any) => (
              <div key={h.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-100 font-mono leading-tight">{h.strategyName}</p>
                  <button
                    onClick={() => deleteBacktestHistory(h.id)}
                    className="shrink-0 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  {new Date(h.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="bg-slate-900 rounded-lg p-1.5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Net Profit</p>
                    <p className={`text-[11px] font-black font-mono ${h.result?.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${h.result?.netProfit?.toFixed(0) ?? 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-1.5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Win Rate</p>
                    <p className="text-[11px] font-black font-mono text-cyan-400">
                      {h.result?.winRate?.toFixed(1) ?? 'N/A'}%
                    </p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-1.5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Max DD</p>
                    <p className="text-[11px] font-black font-mono text-amber-400">
                      {h.result?.maxDrawdown?.toFixed(1) ?? 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
