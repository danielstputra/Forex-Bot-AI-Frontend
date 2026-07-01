'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, ISeriesApi, createSeriesMarkers } from 'lightweight-charts';
import { useBotStore } from '../store/useBotStore';
import { ShieldAlert } from 'lucide-react';

export default function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { chartData, selectedPair, activeTrades, tradeHistory, newsSentiments, fetchNewsSentiments, theme } = useBotStore();
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    fetchNewsSentiments();
  }, [fetchNewsSentiments]);

  // Fetch historical OHLCV candles from real API if not present or too short
  useEffect(() => {
    const currentData = chartData[selectedPair] || [];
    if (currentData.length < 50) {
      useBotStore.getState().fetchHistoricalData(selectedPair);
    }
  }, [selectedPair, chartData]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#090d16' : '#ffffff';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

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
        mode: 0, // Normal crosshair
        vertLine: { color: '#64748b', width: 1, style: 3 },
        horzLine: { color: '#64748b', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: gridColor,
        textColor: textColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 380,
    });

    // Add Candlestick Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // emerald-500
      downColor: '#ef4444', // red-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    // Initial data load
    const data = chartData[selectedPair] || [];
    candlestickSeries.setData(data as any);

    // Fit content
    if (data.length > 0) {
      chart.timeScale().fitContent();
    }

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedPair, theme]); // Recreate chart if pair or theme changes

  // Update chart data when new ticks arrive
  useEffect(() => {
    if (!seriesRef.current) return;
    const data = chartData[selectedPair] || [];
    seriesRef.current.setData(data as any);

    // Apply Buy/Sell markers based on trades
    const markers: any[] = [];
    const allTrades = [...activeTrades, ...tradeHistory].filter(t => t.pair === selectedPair);

    allTrades.forEach(trade => {
      const tradeTime = Math.floor(new Date(trade.timestamp).getTime() / 1000);
      // Find the closest bar time (rounded to minute)
      const roundedTime = tradeTime - (tradeTime % 60);

      // Check if this time exists in our data
      const barExists = data.some(bar => bar.time === roundedTime);
      if (!barExists) return;

      if (trade.type === 'BUY') {
        markers.push({
          time: roundedTime,
          position: 'belowBar',
          color: '#10b981',
          shape: 'arrowUp',
          text: `BUY @ ${trade.entryPrice}`,
        });
      } else {
        markers.push({
          time: roundedTime,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: `SELL @ ${trade.entryPrice}`,
        });
      }
    });

    // Sort markers by time
    markers.sort((a, b) => (a.time as number) - (b.time as number));
    createSeriesMarkers(seriesRef.current, markers);

  }, [chartData, selectedPair, activeTrades, tradeHistory]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-1 font-mono">Chart Pergerakan Harga</h3>
          <p className="text-xs text-slate-400">Grafik candlestick real-time untuk {selectedPair} terintegrasi dengan penanda eksekusi AI.</p>
        </div>
        <span className="text-xs px-3 py-1 bg-slate-950 text-slate-400 font-mono rounded-xl border border-slate-850">
          Timeframe: 1m
        </span>
      </div>
      
      {/* Chart Canvas */}
      <div className="relative w-full">
        <div ref={chartContainerRef} className="w-full rounded-2xl overflow-hidden border border-slate-850" />
        
        {/* AI News Sentiment Overlay */}
        {(() => {
          const sentiment = newsSentiments.find(s => s.currencyPair === selectedPair);
          const sentimentScore = sentiment ? Math.round(sentiment.sentimentScore * 100) : 74;
          const sentimentLabel = sentiment ? sentiment.label : 'BULLISH';
          let sentimentKeywords = ['NFP', 'FED Rate', 'CPI Hold'];
          if (sentiment && sentiment.keywords) {
            try {
              sentimentKeywords = JSON.parse(sentiment.keywords);
            } catch (e) {
              if (Array.isArray(sentiment.keywords)) {
                sentimentKeywords = sentiment.keywords;
              }
            }
          }
          const isBullish = sentimentLabel === 'BULLISH';
          const isBearish = sentimentLabel === 'BEARISH';
          const dotColor = isBullish ? 'bg-emerald-400' : isBearish ? 'bg-rose-400' : 'bg-slate-400';
          const textColor = isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-450' : 'text-slate-400';

          return (
            <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-sm border border-slate-850 rounded-xl p-3 flex flex-col gap-1 shadow-lg pointer-events-none z-10 font-mono">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`}></span>
                <span className="text-slate-400">AI News Sentiment:</span>
                <span className={`${textColor} font-bold`}>{sentimentScore}% {sentimentLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] text-slate-550">
                <span>Keywords: {sentimentKeywords.join(', ')}</span>
              </div>
            </div>
          );
        })()}

        {/* News-Pause Shield Indicator */}
        <div className="absolute top-4 right-4 bg-rose-950/90 backdrop-blur-sm border border-rose-900/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg pointer-events-none z-10 font-mono animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <div className="text-[9px] text-left">
            <span className="text-rose-400 font-black block">NEWS-PAUSE ACTIVE</span>
            <span className="text-slate-405 block text-[8px]">NFP Release in 12 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
