'use client';

import React from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { Cpu, Loader2 } from 'lucide-react';

export default function BacktestProgress() {
  const { backtestProgress, logs } = useBotStore();
  const t = useI18nStore((state) => state.t);

  // Get only the SignalR Backtest logs to stream in this view
  const backtestLogs = logs
    .filter(log => log.message.includes('[SignalR'))
    .slice(0, 4);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] gap-8 shadow-xl relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Loading Icon */}
      <div className="relative flex items-center justify-center">
        <div className="p-5 bg-cyan-500/10 rounded-full text-cyan-400 border border-cyan-500/20 animate-pulse">
          <Cpu className="w-10 h-10" />
        </div>
        <Loader2 className="w-24 h-24 text-cyan-400 absolute animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* Progress Text */}
      <div className="text-center space-y-2">
        <h4 className="text-lg font-bold text-slate-100 font-mono tracking-wider">{t('backtest.progress')}</h4>
        <p className="text-sm font-black text-cyan-400 font-mono">{backtestProgress}%</p>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full max-w-md bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850/60 p-0.5">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-300 relative"
          style={{ width: `${backtestProgress}%` }}
        >
          {/* Glowing tip */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Streaming SignalR Logs */}
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-850/50 rounded-2xl p-4 font-mono text-[10px] text-cyan-500/80 space-y-2 h-28 overflow-y-auto">
        {backtestLogs.length === 0 ? (
          <div className="text-slate-600 italic text-center py-6">
            Menghubungkan ke broker stream...
          </div>
        ) : (
          backtestLogs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start animate-fade-in">
              <span className="text-slate-600 font-bold shrink-0">&gt;</span>
              <span className="leading-normal">{log.message.replace('[SignalR Backtest] ', '')}</span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
