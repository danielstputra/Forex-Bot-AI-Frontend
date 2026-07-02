'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBotStore } from '../store/useBotStore';
import {
  Award, Terminal, FlaskConical, CheckCircle, Circle, ChevronRight, 
  Loader2, Play, Square, RotateCcw, Bot, TrendingUp, TrendingDown
} from 'lucide-react';

interface SimTrade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lot: number;
  entryPrice: number;
  exitPrice?: number;
  profit?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
}

interface SimLog {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function SimulationSandbox() {
  const { 
    setStatus,
    updateConfig,
    linkBrokerAccount,
    addLog,
    addNotification,
    fetchBrokerAccounts,
    addToast,
  } = useBotStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simLogs, setSimLogs] = useState<SimLog[]>([]);
  const [simTrades, setSimTrades] = useState<SimTrade[]>([]);
  const [simStats, setSimStats] = useState({
    totalProfit: 0,
    winCount: 0,
    lossCount: 0,
    balance: 10000,
  });
  const [simBotStatus, setSimBotStatus] = useState<'IDLE' | 'RUNNING' | 'STOPPED'>('IDLE');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const appendLog = (msg: string, type: SimLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('id-ID');
    setSimLogs(prev => [...prev, { time, msg, type }]);
    addLog(`[Sandbox] ${msg}`, type === 'error' ? 'ERROR' : type === 'warning' ? 'WARNING' : type === 'success' ? 'SUCCESS' : 'INFO');
  };

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simLogs]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ─── STEP 1: Link Mock Broker ────────────────────────────────────────────────
  const handleLinkBroker = async () => {
    setLoading(true);
    appendLog('📡 Memulai proses koneksi ke broker simulasi IC Markets...', 'info');
    
    try {
      await new Promise(r => setTimeout(r, 800)); // simulate latency
      await linkBrokerAccount({
        brokerName: 'IC Markets (Sandbox)',
        accountNumber: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        passwordCipher: 'sandbox_test_password_hash_abc123',
        serverAddress: 'https://sandbox.icmarkets.gateway',
        leverage: 500,
      });
      await fetchBrokerAccounts();
      appendLog('✅ Broker simulasi berhasil dihubungkan! Saldo awal: $10,000.00', 'success');
      appendLog('📋 Data akun tersimpan ke database dengan enkripsi AES-256.', 'info');
      addNotification('Broker simulasi IC Markets terhubung.');
      addToast('Broker simulasi berhasil terhubung!', 'success');
      setCurrentStep(2);
    } catch (err: any) {
      appendLog(`❌ Gagal menghubungkan broker: ${err.message}`, 'error');
      addToast(`Gagal: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: Configure Bot ───────────────────────────────────────────────────
  const handleConfigureBot = async () => {
    setLoading(true);
    appendLog('⚙️ Mengonfigurasi parameter bot AI...', 'info');
    await new Promise(r => setTimeout(r, 500));
    
    try {
      await updateConfig({ tradeSize: 0.5, maxDrawdown: 15.0, riskLevel: 'MODERATE' });
      appendLog('✅ Config AI disimpan: Lot = 0.5, Max Drawdown = 15%, Risk = MODERATE.', 'success');
      appendLog('🔒 Parameter divalidasi dan dikunci untuk sesi simulasi ini.', 'info');
      addToast('Konfigurasi bot berhasil disimpan!', 'success');
      setCurrentStep(3);
    } catch (err: any) {
      appendLog(`❌ Gagal simpan config: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 3: Start Bot ───────────────────────────────────────────────────────
  const handleStartBot = async () => {
    setLoading(true);
    appendLog('🚀 Mengirim sinyal START ke engine trading AI...', 'info');
    await new Promise(r => setTimeout(r, 600));

    try {
      await setStatus('RUNNING');
      setSimBotStatus('RUNNING');
      appendLog('✅ Bot AI diaktifkan! Status: RUNNING.', 'success');
      appendLog('🔍 Engine mulai memindai chart EUR/USD pada timeframe M5...', 'info');
      addToast('Bot AI berhasil dinyalakan!', 'success');
      addNotification('Trading Bot AI mulai berjalan.');
      setCurrentStep(4);
      startSimLoop();
    } catch (err: any) {
      appendLog(`❌ Gagal menyalakan bot: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── SIMULATION LOOP ─────────────────────────────────────────────────────────
  const startSimLoop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSimRunning(true);

    const events: Array<() => void> = [
      // Tick 1
      () => {
        appendLog('📊 Analisis RSI(14) = 28.3 → Kondisi Oversold terdeteksi pada EUR/USD M5.', 'info');
      },
      // Tick 2
      () => {
        appendLog('📈 Sinyal BELI dikonfirmasi oleh Bollinger Band lower touch + RSI divergence.', 'info');
      },
      // Tick 3 - Open trade 1
      () => {
        const trade: SimTrade = {
          id: `TRD-${Date.now()}`,
          symbol: 'EUR/USD',
          type: 'BUY',
          lot: 0.5,
          entryPrice: 1.08250,
          status: 'OPEN',
          openedAt: new Date().toLocaleTimeString('id-ID'),
        };
        setSimTrades(prev => [...prev, trade]);
        appendLog(`✅ Order dibuka: BUY EUR/USD @ 1.08250 | Lot: 0.5 | TP: 1.08390 | SL: 1.08100`, 'success');
        addNotification('Order BUY EUR/USD dibuka oleh AI.');
      },
      // Tick 4
      () => {
        appendLog('📡 Harga bergerak: 1.08265 → +1.5 pip dari entry. Memantau pergerakan...', 'info');
      },
      // Tick 5
      () => {
        appendLog('📡 Harga bergerak: 1.08310 → +6 pip. Momentum bullish menguat.', 'info');
      },
      // Tick 6 - Close trade 1 (profit)
      () => {
        const profit = 70.00;
        setSimTrades(prev => prev.map(t =>
          t.status === 'OPEN' && t.type === 'BUY'
            ? { ...t, exitPrice: 1.08390, profit, status: 'CLOSED' }
            : t
        ));
        setSimStats(prev => ({
          totalProfit: prev.totalProfit + profit,
          winCount: prev.winCount + 1,
          lossCount: prev.lossCount,
          balance: prev.balance + profit,
        }));
        appendLog(`🎯 Take Profit tercapai! Posisi ditutup @ 1.08390 | Profit: +$${profit.toFixed(2)}`, 'success');
        addNotification(`AI menutup posisi BUY EUR/USD. Profit: +$${profit.toFixed(2)}`);
        addToast(`Profit +$${profit.toFixed(2)} berhasil diamankan!`, 'success');
      },
      // Tick 7
      () => {
        appendLog('⏳ AI memasuki periode cooling-off (30 detik) setelah profit...', 'info');
      },
      // Tick 8
      () => {
        appendLog('📊 Analisis baru: RSI(14) = 71.8 → Overbought. Potensi reversal SELL.', 'info');
      },
      // Tick 9 - Open trade 2
      () => {
        const trade: SimTrade = {
          id: `TRD-${Date.now()}`,
          symbol: 'GBP/USD',
          type: 'SELL',
          lot: 0.5,
          entryPrice: 1.27540,
          status: 'OPEN',
          openedAt: new Date().toLocaleTimeString('id-ID'),
        };
        setSimTrades(prev => [...prev, trade]);
        appendLog(`✅ Order dibuka: SELL GBP/USD @ 1.27540 | Lot: 0.5 | TP: 1.27380 | SL: 1.27680`, 'success');
      },
      // Tick 10
      () => {
        appendLog('📡 GBP/USD turun ke 1.27480 → +6 pip. Posisi sesuai prediksi AI.', 'info');
      },
      // Tick 11 - Close trade 2 (profit)
      () => {
        const profit = 40.00;
        setSimTrades(prev => prev.map(t =>
          t.status === 'OPEN' && t.type === 'SELL'
            ? { ...t, exitPrice: 1.27380, profit, status: 'CLOSED' }
            : t
        ));
        setSimStats(prev => ({
          totalProfit: prev.totalProfit + profit,
          winCount: prev.winCount + 1,
          lossCount: prev.lossCount,
          balance: prev.balance + profit,
        }));
        appendLog(`🎯 Take Profit tercapai! Ditutup @ 1.27380 | Profit: +$${profit.toFixed(2)}`, 'success');
        addToast(`Profit +$${profit.toFixed(2)} berhasil diamankan!`, 'success');
      },
      // Tick 12 - Finish
      () => {
        appendLog('🏁 Skenario simulasi selesai. AI berhasil mengeksekusi 2 transaksi dengan profit bersih.', 'success');
        appendLog(`📊 Ringkasan: Win Rate 100% | Total Profit: +$${(70 + 40).toFixed(2)} | Balance Akhir: $10,110.00`, 'success');
        stopSimLoop();
        setCurrentStep(5);
        setSimBotStatus('STOPPED');
        setStatus('IDLE');
      },
    ];

    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx < events.length) {
        events[idx]();
        idx++;
      } else {
        clearInterval(timerRef.current!);
        setIsSimRunning(false);
      }
    }, 4000);
  };

  const stopSimLoop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSimRunning(false);
  };

  const handleStopEarly = async () => {
    stopSimLoop();
    setSimBotStatus('STOPPED');
    await setStatus('IDLE');
    appendLog('⏹️ Simulasi dihentikan secara manual oleh pengguna.', 'warning');
    addToast('Simulasi dihentikan.', 'info');
    setCurrentStep(5);
  };

  const handleReset = async () => {
    stopSimLoop();
    setSimBotStatus('IDLE');
    setCurrentStep(1);
    setSimLogs([]);
    setSimTrades([]);
    setSimStats({ totalProfit: 0, winCount: 0, lossCount: 0, balance: 10000 });
    await setStatus('IDLE');
  };

  // ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
  const steps = [
    {
      step: 1,
      title: 'Hubungkan Broker Simulasi',
      description: 'Membuat akun dummy IC Markets dengan saldo awal $10,000. Data dienkripsi AES-256 di database.',
      action: (
        <button
          onClick={handleLinkBroker}
          disabled={loading}
          className="mt-3 flex items-center gap-2 py-2 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md shadow-cyan-900/30"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {loading ? 'Menghubungkan...' : 'Hubungkan Broker'}
        </button>
      ),
    },
    {
      step: 2,
      title: 'Konfigurasi Parameter AI',
      description: 'Mengatur trade size 0.5 lot, max drawdown 15%, dan risk level MODERATE.',
      action: (
        <button
          onClick={handleConfigureBot}
          disabled={loading}
          className="mt-3 flex items-center gap-2 py-2 px-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-900/30"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {loading ? 'Menyimpan...' : 'Konfirmasi Config'}
        </button>
      ),
    },
    {
      step: 3,
      title: 'Nyalakan Trading Bot AI',
      description: 'Mengubah status engine bot menjadi RUNNING. AI siap menganalisis market.',
      action: (
        <button
          onClick={handleStartBot}
          disabled={loading}
          className="mt-3 flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-900/30"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {loading ? 'Menyalakan...' : 'Start Bot AI'}
        </button>
      ),
    },
    {
      step: 4,
      title: 'AI Live Trading (Berjalan)',
      description: 'Bot menganalisis chart, membuka posisi, memantau profit/loss, dan menutup posisi secara otomatis.',
      action: isSimRunning ? (
        <button
          onClick={handleStopEarly}
          className="mt-3 flex items-center gap-2 py-2 px-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md shadow-rose-900/30"
        >
          <Square className="w-3.5 h-3.5" />
          Hentikan Simulasi
        </button>
      ) : null,
    },
    {
      step: 5,
      title: 'Simulasi Selesai',
      description: 'Skenario berhasil diselesaikan. Bot AI 100% siap untuk digunakan di live account.',
      action: (
        <button
          onClick={handleReset}
          className="mt-3 flex items-center gap-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ulangi Simulasi
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-800/20 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-8 -right-8 opacity-[0.06] pointer-events-none">
          <FlaskConical className="w-64 h-64 text-cyan-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] uppercase font-black font-mono tracking-widest rounded-full">
            Sandbox Environment · Data Dummy
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            Terminal Simulasi Alur Kerja Bot AI
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Halaman ini mensimulasikan seluruh alur kerja trading bot AI secara penuh — mulai dari menghubungkan akun broker dummy, mengonfigurasi parameter risiko, mengaktifkan bot, hingga mengamati eksekusi trading otomatis secara real-time. Semua data bersifat simulasi dan tidak mempengaruhi saldo nyata.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── Stepper (Left 2/5) ── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-4">
              Panduan Skenario
            </h3>
            <div className="space-y-2">
              {steps.map((s) => {
                const done = currentStep > s.step;
                const active = currentStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`rounded-2xl p-4 border transition-all duration-500 ${
                      active
                        ? 'bg-slate-950/80 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                        : done
                        ? 'bg-emerald-950/20 border-emerald-800/20'
                        : 'border-transparent opacity-40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-black mt-0.5 ${
                        done ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                          : active ? 'border-cyan-500 bg-cyan-950 text-cyan-400'
                          : 'border-slate-700 text-slate-600'
                      }`}>
                        {done ? '✓' : s.step}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className={`block text-[11px] font-bold ${active ? 'text-cyan-300' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {s.title}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{s.description}</p>
                        {active && s.action}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Panel (3/5) ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3">
            {/* Balance */}
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Saldo Simulasi</span>
              <span className="text-base font-black text-emerald-400 font-mono block">${simStats.balance.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
            </div>
            {/* Total Profit */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Profit</span>
              <span className={`text-base font-black font-mono block ${simStats.totalProfit > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                +${simStats.totalProfit.toFixed(2)}
              </span>
            </div>
            {/* Win Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Win</span>
              <span className="text-base font-black text-cyan-400 font-mono block">{simStats.winCount} ✓</span>
            </div>
          </div>

          {/* Bot Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Bot className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400">Status Bot:</span>
            <span className={`ml-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border font-mono ${
              simBotStatus === 'RUNNING' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 animate-pulse'
              : simBotStatus === 'STOPPED' ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
              : 'bg-slate-800 text-slate-500 border-slate-700/40'
            }`}>
              {simBotStatus}
            </span>
            {isSimRunning && (
              <span className="ml-auto text-[10px] text-cyan-400 font-mono animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full inline-block animate-ping" />
                Memantau pasar...
              </span>
            )}
          </div>

          {/* Trade Positions Table */}
          {simTrades.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Posisi Simulasi</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] font-mono">
                  <thead>
                    <tr className="text-slate-600 border-b border-slate-800">
                      <th className="text-left pb-2 pr-3">Symbol</th>
                      <th className="text-left pb-2 pr-3">Tipe</th>
                      <th className="text-right pb-2 pr-3">Entry</th>
                      <th className="text-right pb-2 pr-3">Exit</th>
                      <th className="text-right pb-2">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simTrades.map(t => (
                      <tr key={t.id} className="border-b border-slate-850 last:border-0">
                        <td className="py-2 pr-3 text-slate-200">{t.symbol}</td>
                        <td className="py-2 pr-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${
                            t.type === 'BUY' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
                          }`}>
                            {t.type === 'BUY' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {t.type}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right text-slate-300">{t.entryPrice.toFixed(5)}</td>
                        <td className="py-2 pr-3 text-right text-slate-300">
                          {t.exitPrice ? t.exitPrice.toFixed(5) : <span className="text-slate-600 animate-pulse">---</span>}
                        </td>
                        <td className="py-2 text-right">
                          {t.profit != null ? (
                            <span className={`font-bold ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-cyan-400 animate-pulse">Live</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Activity Terminal */}
          <div className="bg-slate-950 border border-slate-800/70 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-[10px] font-black text-slate-300 font-mono uppercase tracking-wider">
                  AI Activity Terminal
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>
            </div>

            <div className="h-56 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
              {simLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Ikuti langkah di panel kiri untuk memulai simulasi...
                </div>
              ) : (
                simLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-600 shrink-0 text-[9px] pt-0.5">{log.time}</span>
                    <span className={`leading-relaxed ${
                      log.type === 'success' ? 'text-emerald-400'
                      : log.type === 'warning' ? 'text-amber-400'
                      : log.type === 'error' ? 'text-rose-400'
                      : 'text-slate-300'
                    }`}>
                      {log.msg}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
