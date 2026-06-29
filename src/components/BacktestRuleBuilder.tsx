'use client';

import React from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { Play, RotateCcw, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

export default function BacktestRuleBuilder() {
  const { strategyParams, updateStrategyParams, runBacktest, resetBacktest, backtestStatus } = useBotStore();
  const t = useI18nStore((state) => state.t);

  const handleSliderChange = (field: 'riskRewardRatio' | 'riskPercentage', value: number) => {
    updateStrategyParams({ [field]: value });
  };

  const handleToggleChange = (field: 'newsFilter' | 'maCrossover' | 'rsiFilter' | 'volatilityStop') => {
    updateStrategyParams({ [field]: !strategyParams[field] });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Rule-Builder Strategi
          </h3>
          <p className="text-[11px] text-slate-400">
            Kustomisasi logika filter & manajemen risiko AI.
          </p>
        </div>
      </div>

      {/* Sliders Section */}
      <div className="space-y-5">
        {/* Risk-to-Reward Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-450">{t('backtest.riskReward')}</span>
            <span className="text-cyan-400 font-bold">1 : {strategyParams.riskRewardRatio.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={strategyParams.riskRewardRatio}
            disabled={backtestStatus === 'RUNNING'}
            onChange={(e) => handleSliderChange('riskRewardRatio', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-45 disabled:cursor-not-allowed"
          />
        </div>

        {/* Risk Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-450">{t('backtest.riskPct')}</span>
            <span className="text-cyan-400 font-bold">{strategyParams.riskPercentage.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={strategyParams.riskPercentage}
            disabled={backtestStatus === 'RUNNING'}
            onChange={(e) => handleSliderChange('riskPercentage', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-45 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Toggle Switches */}
      <div className="space-y-4 pt-2 border-t border-slate-850/80">
        {/* News Filter */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{t('backtest.newsFilter')}</span>
            <span className="text-[10px] text-slate-500 font-mono">Skip trading during high impact news</span>
          </div>
          <button
            type="button"
            disabled={backtestStatus === 'RUNNING'}
            onClick={() => handleToggleChange('newsFilter')}
            className={`transition-colors duration-300 ${backtestStatus === 'RUNNING' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {strategyParams.newsFilter ? (
              <ToggleRight className="w-10 h-10 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-650" />
            )}
          </button>
        </div>

        {/* MA Crossover */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{t('backtest.maCrossover')}</span>
            <span className="text-[10px] text-slate-500 font-mono">Trend confirmation using EMA 20/50</span>
          </div>
          <button
            type="button"
            disabled={backtestStatus === 'RUNNING'}
            onClick={() => handleToggleChange('maCrossover')}
            className={`transition-colors duration-300 ${backtestStatus === 'RUNNING' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {strategyParams.maCrossover ? (
              <ToggleRight className="w-10 h-10 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-650" />
            )}
          </button>
        </div>

        {/* RSI Filter */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{t('backtest.rsiFilter')}</span>
            <span className="text-[10px] text-slate-500 font-mono">Avoid entry on overbought/oversold</span>
          </div>
          <button
            type="button"
            disabled={backtestStatus === 'RUNNING'}
            onClick={() => handleToggleChange('rsiFilter')}
            className={`transition-colors duration-300 ${backtestStatus === 'RUNNING' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {strategyParams.rsiFilter ? (
              <ToggleRight className="w-10 h-10 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-650" />
            )}
          </button>
        </div>

        {/* Volatility Stop */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{t('backtest.volatilityStop')}</span>
            <span className="text-[10px] text-slate-500 font-mono">Dynamic stops based on ATR volatility</span>
          </div>
          <button
            type="button"
            disabled={backtestStatus === 'RUNNING'}
            onClick={() => handleToggleChange('volatilityStop')}
            className={`transition-colors duration-300 ${backtestStatus === 'RUNNING' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {strategyParams.volatilityStop ? (
              <ToggleRight className="w-10 h-10 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-650" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-850/80">
        {backtestStatus === 'COMPLETED' ? (
          <button
            onClick={resetBacktest}
            className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            {t('backtest.reset')}
          </button>
        ) : (
          <button
            onClick={runBacktest}
            disabled={backtestStatus === 'RUNNING'}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-55 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-cyan-950/20"
          >
            <Play className="w-4 h-4 fill-white" />
            {t('backtest.run')}
          </button>
        )}
      </div>
    </div>
  );
}
