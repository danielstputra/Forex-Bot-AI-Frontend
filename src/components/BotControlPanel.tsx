'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { RiskLevel } from '../types';

export default function BotControlPanel() {
  const { 
    status, 
    config, 
    selectedPair, 
    setStatus, 
    updateConfig, 
    setSelectedPair,
    user,
    setUpgradeOpen,
    priceAlerts,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert
  } = useBotStore();
  
  const { lang, t } = useI18nStore();

  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  useEffect(() => {
    fetchPriceAlerts();
  }, [fetchPriceAlerts]);

  const isPairLocked = (pair: string) => {
    if (!user) return true;
    if (user.tier === 'FREE' && pair !== 'EUR/USD') return true;
    return false;
  };

  const isRiskLocked = (level: RiskLevel) => {
    if (!user) return true;
    if (user.tier !== 'ENTERPRISE' && level === 'AGGRESSIVE') return true;
    return false;
  };

  const handlePairClick = (pair: string) => {
    if (isPairLocked(pair)) {
      setUpgradeOpen(true);
      return;
    }
    setSelectedPair(pair);
  };

  const handleRiskClick = (level: RiskLevel) => {
    if (isRiskLocked(level)) {
      setUpgradeOpen(true);
      return;
    }
    updateConfig({ riskLevel: level });
  };

  const handleStatusToggle = (newStatus: 'RUNNING' | 'PAUSED' | 'IDLE') => {
    setStatus(newStatus);
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertPrice.trim() || isNaN(parseFloat(alertPrice))) return;

    try {
      await createPriceAlert(selectedPair, parseFloat(alertPrice), alertCondition);
      setAlertPrice('');
    } catch (err) {
      console.error(err);
    }
  };

  // State lokal untuk menghindari spam updateConfig ke API setiap keystroke
  const [localTradeSize, setLocalTradeSize] = useState(config.tradeSize.toString());
  const [localMaxDrawdown, setLocalMaxDrawdown] = useState(config.maxDrawdown.toString());

  // Sinkronisasi state lokal saat config dari store berubah (hanya jika elemen tidak sedang fokus)
  useEffect(() => {
    if (document.activeElement !== document.getElementById('input-trade-size')) {
      setLocalTradeSize(config.tradeSize.toString());
    }
  }, [config.tradeSize]);

  useEffect(() => {
    if (document.activeElement !== document.getElementById('input-max-drawdown')) {
      setLocalMaxDrawdown(config.maxDrawdown.toString());
    }
  }, [config.maxDrawdown]);

  // Efek debounce untuk Trade Size (tunda updateConfig 600ms sejak keystroke terakhir)
  useEffect(() => {
    const value = parseFloat(localTradeSize);
    if (!isNaN(value) && value >= 0.01 && value <= 10.0 && value !== config.tradeSize) {
      const handler = setTimeout(() => {
        updateConfig({ tradeSize: value });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [localTradeSize, config.tradeSize, updateConfig]);

  // Efek debounce untuk Max Drawdown (tunda updateConfig 600ms sejak keystroke terakhir)
  useEffect(() => {
    const value = parseFloat(localMaxDrawdown);
    if (!isNaN(value) && value >= 1.0 && value <= 50.0 && value !== config.maxDrawdown) {
      const handler = setTimeout(() => {
        updateConfig({ maxDrawdown: value });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [localMaxDrawdown, config.maxDrawdown, updateConfig]);

  const handleTradeSizeBlur = () => {
    const value = parseFloat(localTradeSize);
    if (!isNaN(value) && value >= 0.01 && value <= 10.0) {
      if (value !== config.tradeSize) {
        updateConfig({ tradeSize: value });
      }
    } else {
      // Rollback jika input tidak valid
      setLocalTradeSize(config.tradeSize.toString());
    }
  };

  const handleMaxDrawdownBlur = () => {
    const value = parseFloat(localMaxDrawdown);
    if (!isNaN(value) && value >= 1.0 && value <= 50.0) {
      if (value !== config.maxDrawdown) {
        updateConfig({ maxDrawdown: value });
      }
    } else {
      // Rollback jika input tidak valid
      setLocalMaxDrawdown(config.maxDrawdown.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'size' | 'drawdown') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'size') {
        handleTradeSizeBlur();
      } else {
        handleMaxDrawdownBlur();
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div id="tour-control" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
      <div>
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-1 font-mono">
          {t('control.title')}
        </h3>
        <p className="text-xs text-slate-400">
          {t('control.desc')}
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* START */}
        <button
          onClick={() => handleStatusToggle('RUNNING')}
          disabled={status === 'RUNNING'}
          className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all duration-300 font-semibold text-xs uppercase ${
            status === 'RUNNING'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-inner'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 active:scale-95'
          }`}
        >
          <Play className={`w-5 h-5 ${status === 'RUNNING' ? 'fill-emerald-500 text-emerald-400' : ''}`} />
          {t('control.start')}
        </button>

        {/* PAUSE */}
        <button
          onClick={() => handleStatusToggle('PAUSED')}
          disabled={status === 'PAUSED' || status === 'IDLE' || status === 'PANIC'}
          className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all duration-300 font-semibold text-xs uppercase ${
            status === 'PAUSED'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 shadow-inner'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <Pause className={`w-5 h-5 ${status === 'PAUSED' ? 'fill-amber-500 text-amber-400' : ''}`} />
          {t('control.pause')}
        </button>

        {/* STOP */}
        <button
          onClick={() => handleStatusToggle('IDLE')}
          disabled={status === 'IDLE'}
          className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all duration-300 font-semibold text-xs uppercase ${
            status === 'IDLE'
              ? 'bg-slate-800 border-slate-700 text-slate-200 shadow-inner'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 active:scale-95'
          }`}
        >
          <Square className="w-5 h-5" />
          {t('control.stop')}
        </button>
      </div>

      {/* Currency Pair Selector */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-mono">{t('control.pairLabel')}</label>
        <div className="grid grid-cols-2 gap-2">
          {config.targetPairs.map((pair) => {
            const locked = isPairLocked(pair);
            return (
              <button
                key={pair}
                onClick={() => handlePairClick(pair)}
                className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition-all duration-355 flex items-center justify-center gap-1.5 ${
                  selectedPair === pair
                    ? 'bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-750 hover:text-slate-300'
                }`}
              >
                {pair}
                {locked && <Lock className="w-3 h-3 text-slate-550" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk Level Selector */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-400 font-mono">{t('control.riskLabel')}</label>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
            config.riskLevel === 'CONSERVATIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' :
            config.riskLevel === 'MODERATE' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/30' :
            'bg-rose-950 text-rose-400 border border-rose-800/30'
          }`}>
            {config.riskLevel}
          </span>
        </div>
        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-850">
          {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as RiskLevel[]).map((level) => {
            const locked = isRiskLocked(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleRiskClick(level)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 ${
                  config.riskLevel === level
                    ? 'bg-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {level.substring(0, 4)}
                {locked && <Lock className="w-2.5 h-2.5 text-slate-555" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Parameters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trade Size */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-mono">{t('control.tradeSize')}</label>
          <input
            id="input-trade-size"
            type="number"
            step="0.01"
            min="0.01"
            max="10.0"
            value={localTradeSize}
            onChange={(e) => setLocalTradeSize(e.target.value)}
            onBlur={handleTradeSizeBlur}
            onKeyDown={(e) => handleKeyDown(e, 'size')}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Max Drawdown */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-mono">{t('control.maxDrawdown')}</label>
          <input
            id="input-max-drawdown"
            type="number"
            step="0.5"
            min="1.0"
            max="50.0"
            value={localMaxDrawdown}
            onChange={(e) => setLocalMaxDrawdown(e.target.value)}
            onBlur={handleMaxDrawdownBlur}
            onKeyDown={(e) => handleKeyDown(e, 'drawdown')}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>


      {/* Warning Alert if Status is Panic */}
      {status === 'PANIC' && (
        <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4 flex gap-3 text-rose-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{t('control.panicActive')}</span>
          </div>
        </div>
      )}

      {/* Status Verification */}
      <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4 space-y-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-cyan-400/80 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">{t('control.securityActive')}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('control.hmac')}:</span>
          <span className="text-emerald-400">SHA-256</span>
        </div>
        <div className="flex justify-between">
          <span>{t('control.e2ee')}:</span>
          <span className="text-emerald-400">AES-256-GCM</span>
        </div>
        <div className="flex justify-between">
          <span>{t('control.replay')}:</span>
          <span className="text-slate-300">30 {lang === 'ID' ? 'Detik' : lang === 'JA' ? '秒' : 'Seconds'}</span>
        </div>
      </div>

      {/* Price Alerts Widget */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs text-slate-200 font-mono font-bold uppercase tracking-wider">Price Alerts</label>
        </div>

        <form onSubmit={handleCreateAlert} className="flex gap-2">
          <select
            value={alertCondition}
            onChange={(e) => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
            className="bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ABOVE">&gt;</option>
            <option value="BELOW">&lt;</option>
          </select>
          <input
            type="number"
            step="0.0001"
            placeholder="Target Price"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-955 text-xs font-black uppercase rounded-xl transition-all duration-300"
          >
            Set
          </button>
        </form>

        {/* Alerts List */}
        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
          {priceAlerts.filter(a => a.symbol === selectedPair).map((alert) => (
            <div key={alert.id} className="flex justify-between items-center bg-slate-955/40 border border-slate-850/60 px-3 py-1.5 rounded-xl font-mono text-[10px]">
              <span className="text-slate-300">
                {alert.symbol} {alert.condition === 'ABOVE' ? '>' : '<'} {alert.targetPrice}
              </span>
              <button
                onClick={() => deletePriceAlert(alert.id)}
                className="text-rose-400 hover:text-rose-500 font-bold"
              >
                Hapus
              </button>
            </div>
          ))}
          {priceAlerts.filter(a => a.symbol === selectedPair).length === 0 && (
            <div className="text-[10px] text-slate-550 text-center py-1 italic">
              Tidak ada alert aktif untuk {selectedPair}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
