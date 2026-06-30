'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { formatToLocalTime, getLocalTimezoneName } from '../utils/timezone';
import { Download, CheckCircle, TrendingUp, TrendingDown, Clock, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BacktestResultView() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { backtestResult, strategyParams, selectedPair, user, theme } = useBotStore();
  const t = useI18nStore((state) => state.t);
  
  const [hoveredTrade, setHoveredTrade] = useState<any | null>(null);

  const result = backtestResult;

  // Initialize Historical Chart
  useEffect(() => {
    if (!chartContainerRef.current || !result) return;

    // Generate historical OHLCV data specifically for the backtest chart
    const data: any[] = [];
    let currentPrice = 1.0850;
    const now = Date.now();
    const timeStep = 60000 * 15; // 15 minutes
    const decimals = 4;

    for (let i = 100; i >= 0; i--) {
      const time = now - i * timeStep;
      const change = (Math.random() - 0.5) * 0.001;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 0.0003;
      const low = Math.min(open, close) - Math.random() * 0.0003;

      data.push({
        time: Math.floor(time / 1000),
        open: parseFloat(open.toFixed(decimals)),
        high: parseFloat(high.toFixed(decimals)),
        low: parseFloat(low.toFixed(decimals)),
        close: parseFloat(close.toFixed(decimals)),
      });

      currentPrice = close;
    }

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#090d16' : '#ffffff';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#475569', width: 1, style: 3 },
        horzLine: { color: '#475569', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: gridColor,
        textColor: textColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    // Map backtest trades to chart markers
    const markers: any[] = [];
    result.trades.forEach((trade) => {
      const tradeTime = new Date(trade.timestamp).getTime();
      // Find closest bar
      let barTime = data[0].time;
      let minDiff = Math.abs(tradeTime - data[0].time * 1000);

      for (let bar of data) {
        const diff = Math.abs(tradeTime - bar.time * 1000);
        if (diff < minDiff) {
          minDiff = diff;
          barTime = bar.time;
        }
      }

      if (trade.type === 'BUY') {
        markers.push({
          time: barTime,
          position: 'belowBar',
          color: '#10b981',
          shape: 'arrowUp',
          text: `BUY @ ${trade.entryPrice.toFixed(4)}`,
        });
      } else {
        markers.push({
          time: barTime,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: `SELL @ ${trade.entryPrice.toFixed(4)}`,
        });
      }
    });

    createSeriesMarkers(candlestickSeries, markers);

    // Tooltip logic on hover
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current || !chartContainerRef.current) return;
      
      const tooltip = tooltipRef.current;
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > 320
      ) {
        tooltip.style.display = 'none';
        return;
      }

      // Check if there is a trade at this time
      const tradeAtTime = result.trades.find(t => {
        const tTime = Math.floor(new Date(t.timestamp).getTime() / 1000);
        return tTime === (param.time as number);
      });

      if (tradeAtTime) {
        tooltip.style.display = 'block';
        const isWin = (tradeAtTime.profit || 0) > 0;
        
        tooltip.innerHTML = `
          <div class="space-y-1.5 text-[10px] font-mono">
            <div class="flex justify-between gap-4 border-b border-slate-800 pb-1">
              <span class="font-bold text-cyan-400">${tradeAtTime.id}</span>
              <span class="px-1.5 py-0.5 rounded ${tradeAtTime.type === 'BUY' ? 'bg-emerald-950 text-emerald-450' : 'bg-rose-950 text-rose-450'}">${tradeAtTime.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-450">Entry:</span>
              <span class="text-slate-200">${tradeAtTime.entryPrice.toFixed(4)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-450">Exit:</span>
              <span class="text-slate-200">${tradeAtTime.exitPrice?.toFixed(4)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-450">Size:</span>
              <span class="text-slate-200">${tradeAtTime.lotSize} Lot</span>
            </div>
            <div class="flex justify-between border-t border-slate-800 pt-1 font-bold">
              <span class="text-slate-450">Profit:</span>
              <span class="${isWin ? 'text-emerald-450' : 'text-rose-450'}">${isWin ? '+' : ''}$${tradeAtTime.profit?.toFixed(2)}</span>
            </div>
          </div>
        `;

        const toolWidth = 130;
        const toolHeight = 90;
        const y = param.point.y - toolHeight - 10;
        const x = param.point.x - toolWidth / 2;

        tooltip.style.left = `${Math.max(10, Math.min(chartContainerRef.current.clientWidth - toolWidth - 10, x))}px`;
        tooltip.style.top = `${Math.max(10, y)}px`;
      } else {
        tooltip.style.display = 'none';
      }
    });

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [result, theme]);

  // Export Backtest Report to Excel with Dynamic Columns & Custom Header
  const handleExportBacktest = () => {
    if (!result || !user) return;

    // AOA (Array of Arrays) for Custom Excel Layout
    const reportData = [
      [`${useBotStore.getState().appConfig?.appName?.toUpperCase() || 'FOREX BOT AI'} - STRATEGY BACKTESTING REPORT`],
      [],
      ['STRATEGY CONFIGURATION', '', '', 'REPORT METADATA'],
      ['Risk-to-Reward Ratio:', `1 : ${strategyParams.riskRewardRatio.toFixed(1)}`, '', 'Generated By:', user.email],
      ['Risk Per Trade (%):', `${strategyParams.riskPercentage.toFixed(1)}%`, '', 'Generated At:', new Date().toLocaleString()],
      ['News Filter Active:', strategyParams.newsFilter ? 'YES' : 'NO', '', 'Timezone:', getLocalTimezoneName()],
      ['MA Crossover Active:', strategyParams.maCrossover ? 'YES' : 'NO', '', 'Target Instrument:', selectedPair],
      ['RSI Filter Active:', strategyParams.rsiFilter ? 'YES' : 'NO'],
      ['Volatility Stop Active:', strategyParams.volatilityStop ? 'YES' : 'NO'],
      [],
      ['SIMULATION PERFORMANCE METRICS'],
      ['Total Trades', 'Win Rate', 'Net Profit ($)', 'Profit Factor', 'Max Drawdown'],
      [result.totalTrades, `${result.winRate}%`, `$${result.netProfit.toFixed(2)}`, result.profitFactor, `${result.maxDrawdown}%`],
      [],
      ['DETAILED TRADE LOGS'],
      ['Trade ID', 'Timestamp', 'Type', 'Lot Size', 'Entry Price', 'Exit Price', 'Profit/Loss ($)', 'Status']
    ];

    // Add Trade Records
    result.trades.forEach(t => {
      reportData.push([
        t.id,
        new Date(t.timestamp).toLocaleString(),
        t.type,
        t.lotSize,
        t.entryPrice,
        t.exitPrice || 0,
        t.profit || 0,
        t.status
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    
    // Autofit column widths
    worksheet['!cols'] = Array(9).fill({ wch: 18 });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Backtest Report');
    XLSX.writeFile(workbook, `Forex_Bot_AI_Backtest_${selectedPair.replace('/', '_')}_${Date.now()}.xlsx`);
  };

  // Mini-Pivot Grid for Backtest Results
  const pivotSummary = useMemo(() => {
    if (!result) return null;
    const summary: Record<string, { count: number; profit: number; wins: number }> = {};
    result.trades.forEach(t => {
      const key = t.type;
      if (!summary[key]) {
        summary[key] = { count: 0, profit: 0, wins: 0 };
      }
      summary[key].count += 1;
      summary[key].profit += t.profit || 0;
      if ((t.profit || 0) > 0) {
        summary[key].wins += 1;
      }
    });

    return Object.entries(summary).map(([key, d]) => ({
      type: key,
      count: d.count,
      profit: parseFloat(d.profit.toFixed(2)),
      winRate: ((d.wins / d.count) * 100).toFixed(1)
    }));
  }, [result]);

  if (!result) return null;

  return (
    <div className="space-y-6 animate-scale-up">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Net Profit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">{t('backtest.netProfit')}</span>
          <span className="text-lg font-black font-mono text-emerald-400">${result.netProfit.toFixed(2)}</span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">{t('backtest.winRate')}</span>
          <span className="text-lg font-black font-mono text-slate-100">{result.winRate}%</span>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">{t('backtest.profitFactor')}</span>
          <span className="text-lg font-black font-mono text-cyan-400">{result.profitFactor}</span>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">{t('backtest.maxDrawdown')}</span>
          <span className="text-lg font-black font-mono text-rose-400">{result.maxDrawdown}%</span>
        </div>

        {/* Total Trades */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1.5 shadow-md col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">{t('backtest.totalTrades')}</span>
          <span className="text-lg font-black font-mono text-slate-100">{result.totalTrades}</span>
        </div>
      </div>

      {/* Historical Chart Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl relative">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              {t('backtest.historicalChart')}
            </h3>
            <p className="text-xs text-slate-400">
              Visualisasi posisi trading yang dieksekusi selama periode pengujian.
            </p>
          </div>
          <button
            onClick={handleExportBacktest}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs rounded-xl font-bold transition-all duration-300 active:scale-95 shadow"
          >
            <Download className="w-4 h-4" />
            {t('backtest.exportReport')}
          </button>
        </div>

        {/* Chart Canvas */}
        <div className="relative">
          <div ref={chartContainerRef} className="w-full rounded-2xl overflow-hidden border border-slate-850" />
          
          {/* Floating HTML Tooltip */}
          <div 
            ref={tooltipRef} 
            className="absolute z-30 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl pointer-events-none hidden transition-all duration-100"
            style={{ width: '130px', height: '90px' }}
          />
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Dekatkan kursor (*hover*) ke penanda BUY/SELL di atas untuk melihat rincian presisi eksekusi strategi AI.</span>
        </div>
      </div>

      {/* Bottom Layout - Table & Pivot */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trade Log Table (2/3) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl xl:col-span-2">
          <h4 className="text-xs font-bold font-mono text-slate-350 uppercase tracking-wider mb-4">LOG SIMULASI</h4>
          <div className="overflow-x-auto max-h-[220px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-normal">ID</th>
                  <th className="py-2.5 px-3 font-normal">Waktu</th>
                  <th className="py-2.5 px-3 font-normal">Tipe</th>
                  <th className="py-2.5 px-3 font-normal">Lot</th>
                  <th className="py-2.5 px-3 font-normal">Entry</th>
                  <th className="py-2.5 px-3 font-normal">Exit</th>
                  <th className="py-2.5 px-3 font-normal text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                {result.trades.map((trade) => {
                  const isProfit = (trade.profit || 0) > 0;
                  return (
                    <tr 
                      key={trade.id} 
                      className="hover:bg-slate-950/20 transition-colors duration-200"
                      onMouseEnter={() => setHoveredTrade(trade)}
                      onMouseLeave={() => setHoveredTrade(null)}
                    >
                      <td className="py-2.5 px-3 text-slate-200 font-semibold">{trade.id}</td>
                      <td className="py-2.5 px-3 text-slate-550">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatToLocalTime(trade.timestamp)}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          trade.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>{trade.type}</span>
                      </td>
                      <td className="py-2.5 px-3">{trade.lotSize}</td>
                      <td className="py-2.5 px-3">{trade.entryPrice.toFixed(4)}</td>
                      <td className="py-2.5 px-3">{trade.exitPrice?.toFixed(4)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${trade.profit?.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pivot Summary (1/3) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold font-mono text-slate-350 uppercase tracking-wider mb-4">ANALISIS PIVOT MATRIKS</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                  <th className="py-2.5 px-2 font-normal">Tipe</th>
                  <th className="py-2.5 px-2 font-normal text-center">Jumlah</th>
                  <th className="py-2.5 px-2 font-normal text-center">Win Rate</th>
                  <th className="py-2.5 px-2 font-normal text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                {pivotSummary?.map((row) => {
                  const isProfit = row.profit > 0;
                  return (
                    <tr key={row.type} className="hover:bg-slate-950/20 transition-colors duration-200">
                      <td className="py-3 px-2 text-slate-200 font-bold">{row.type}</td>
                      <td className="py-3 px-2 text-center">{row.count}</td>
                      <td className="py-3 px-2 text-center text-purple-400 font-bold">{row.winRate}%</td>
                      <td className={`py-3 px-2 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${row.profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
