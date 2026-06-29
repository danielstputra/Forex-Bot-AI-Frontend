'use client';

import React, { useEffect } from 'react';
import { Calendar, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';

interface EconomicEvent {
  time: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  previous: string;
  forecast: string;
  actual: string | null;
}

export default function EconomicCalendar() {
  const { economicEvents, fetchEconomicEvents } = useBotStore();

  useEffect(() => {
    fetchEconomicEvents();
  }, [fetchEconomicEvents]);

  const events: EconomicEvent[] = economicEvents.length > 0 ? economicEvents : [
    { time: '19:30', currency: 'USD', event: 'Non-Farm Employment Change (NFP)', impact: 'HIGH', previous: '175K', forecast: '185K', actual: null },
    { time: '19:30', currency: 'USD', event: 'Unemployment Rate', impact: 'HIGH', previous: '3.9%', forecast: '3.9%', actual: null },
    { time: '21:00', currency: 'USD', event: 'Federal Funds Rate (Fed Interest Rate Decision)', impact: 'HIGH', previous: '5.50%', forecast: '5.50%', actual: null },
    { time: '16:00', currency: 'EUR', event: 'CPI Flash Estimate y/y', impact: 'MEDIUM', previous: '2.4%', forecast: '2.6%', actual: '2.6%' },
    { time: '13:00', currency: 'GBP', event: 'GDP m/m', impact: 'MEDIUM', previous: '0.4%', forecast: '0.2%', actual: '0.1%' },
    { time: '09:30', currency: 'AUD', event: 'CPI y/y', impact: 'LOW', previous: '3.5%', forecast: '3.4%', actual: '3.4%' },
  ];

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-cyan-400" />
          Kalender Ekonomi Makroekonomi
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Jadwal rilis data ekonomi penting dunia. Bot AI akan secara otomatis membatasi aktivitas trading 15 menit sebelum dan sesudah rilis berita berdampak tinggi (*High-Impact News*).
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-rose-950/25 border border-rose-800/30 p-4 rounded-3xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed font-mono">
          <span className="font-bold text-rose-500 block mb-0.5">NEWS-PAUSE PROTOCOL ACTIVE</span>
          Mesin bot AI dikonfigurasi untuk memasuki status penangguhan sementara (*temporary suspension*) selama rilis berita berkode **HIGH IMPACT (NFP & Suku Bunga)** guna menghindari volatilitas ekstrem dan slip harga (*slippage*).
        </div>
      </div>

      {/* Calendar Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                <th className="py-3 px-4 font-normal"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Waktu</span></th>
                <th className="py-3 px-4 font-normal">Mata Uang</th>
                <th className="py-3 px-4 font-normal">Nama Peristiwa / Berita</th>
                <th className="py-3 px-4 font-normal">Tingkat Dampak</th>
                <th className="py-3 px-4 text-right font-normal">Sebelumnya</th>
                <th className="py-3 px-4 text-right font-normal">Konsensus</th>
                <th className="py-3 px-4 text-right font-normal">Aktual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
              {events.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-955/20 transition-colors duration-250">
                  <td className="py-3.5 px-4 text-slate-400 font-bold">{ev.time}</td>
                  <td className="py-3.5 px-4 text-slate-200 font-bold">{ev.currency}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{ev.event}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 w-max ${
                      ev.impact === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-900/30 animate-pulse' :
                      ev.impact === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                      'bg-slate-950 text-slate-500 border border-slate-850'
                    }`}>
                      {ev.impact === 'HIGH' ? '🔴 HIGH IMPACT' : ev.impact === 'MEDIUM' ? '🟡 MEDIUM IMPACT' : '⚪ LOW IMPACT'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">{ev.previous}</td>
                  <td className="py-3.5 px-4 text-right text-slate-400">{ev.forecast}</td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    {ev.actual ? (
                      <span className={ev.actual >= ev.forecast ? 'text-emerald-400' : 'text-rose-450'}>
                        {ev.actual}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Menunggu...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
