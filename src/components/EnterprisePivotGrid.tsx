'use client';

import React, { useState, useMemo } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { Grid3X3, ArrowUpDown, DollarSign, Percent, FileBarChart } from 'lucide-react';

type GroupByOption = 'pair' | 'type';

interface AggregatedRow {
  groupValue: string;
  count: number;
  totalVolume: number;
  totalProfit: number;
  winRate: number;
}

export default function EnterprisePivotGrid() {
  const { tradeHistory } = useBotStore();
  const t = useI18nStore((state) => state.t);
  const [groupBy, setGroupBy] = useState<GroupByOption>('pair');

  // Aggregate trade history based on selected dimension
  const aggregatedData = useMemo<AggregatedRow[]>(() => {
    if (tradeHistory.length === 0) return [];

    const groups: Record<string, { count: number; volume: number; profit: number; wins: number }> = {};

    tradeHistory.forEach((trade) => {
      const key = groupBy === 'pair' ? trade.pair : trade.type;
      
      if (!groups[key]) {
        groups[key] = { count: 0, volume: 0, profit: 0, wins: 0 };
      }

      groups[key].count += 1;
      groups[key].volume += trade.lotSize;
      const profit = trade.profit || 0;
      groups[key].profit += profit;
      if (profit > 0) {
        groups[key].wins += 1;
      }
    });

    return Object.entries(groups).map(([key, data]) => ({
      groupValue: key,
      count: data.count,
      totalVolume: parseFloat(data.volume.toFixed(2)),
      totalProfit: parseFloat(data.profit.toFixed(2)),
      winRate: parseFloat(((data.wins / data.count) * 100).toFixed(1)),
    }));
  }, [tradeHistory, groupBy]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl h-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl text-white shadow-md">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              {t('pivot.title')}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('pivot.desc')}
            </p>
          </div>
        </div>

        {/* Group By Selector */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {t('pivot.groupBy')}:
          </span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="pair">{t('pivot.group.pair')}</option>
            <option value="type">{t('pivot.group.type')}</option>
          </select>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Profit */}
        <div className="bg-slate-950/35 border border-slate-850/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Profit</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              ${tradeHistory.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Volume */}
        <div className="bg-slate-950/35 border border-slate-850/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <FileBarChart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Volume</div>
            <div className="text-sm font-bold font-mono text-slate-200">
              {tradeHistory.reduce((sum, t) => sum + t.lotSize, 0).toFixed(2)} Lot
            </div>
          </div>
        </div>

        {/* Card 3: Win Rate */}
        <div className="bg-slate-950/35 border border-slate-850/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Win Rate</div>
            <div className="text-sm font-bold font-mono text-slate-200">
              {((tradeHistory.filter(t => (t.profit || 0) > 0).length / tradeHistory.length) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Card 4: Total Trades */}
        <div className="bg-slate-950/35 border border-slate-850/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-slate-800 text-slate-400 rounded-xl">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Trades</div>
            <div className="text-sm font-bold font-mono text-slate-200">
              {tradeHistory.length} Trades
            </div>
          </div>
        </div>
      </div>

      {/* Pivot Grid Table */}
      <div className="flex-1 overflow-x-auto min-h-[220px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 text-[11px] font-mono text-slate-550 uppercase tracking-wider">
              <th className="py-3 px-4 font-normal">{t('pivot.col.group')}</th>
              <th className="py-3 px-4 font-normal text-center">{t('pivot.col.count')}</th>
              <th className="py-3 px-4 font-normal text-center">{t('pivot.col.volume')}</th>
              <th className="py-3 px-4 font-normal text-center">{t('pivot.col.winrate')}</th>
              <th className="py-3 px-4 font-normal text-right">{t('pivot.col.profit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40 text-xs font-mono">
            {aggregatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              aggregatedData.map((row) => {
                const isProfit = row.totalProfit > 0;
                return (
                  <tr key={row.groupValue} className="hover:bg-slate-950/20 transition-colors duration-200">
                    <td className="py-3.5 px-4 text-slate-200 font-bold">{row.groupValue}</td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{row.count}</td>
                    <td className="py-3.5 px-4 text-center text-slate-300">{row.totalVolume}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850/50">
                          <div 
                            className="bg-purple-500 h-full rounded-full" 
                            style={{ width: `${row.winRate}%` }} 
                          />
                        </div>
                        <span className="text-slate-200 font-bold">{row.winRate}%</span>
                      </div>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${row.totalProfit.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
