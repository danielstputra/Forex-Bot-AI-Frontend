'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export default function OfflineFallback() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-slate-955/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Offline Icon */}
        <div className="relative flex items-center justify-center mx-auto">
          <div className="p-5 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20 animate-pulse">
            <WifiOff className="w-12 h-12" />
          </div>
        </div>

        {/* Alert Messages */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-wider">Koneksi Terputus</h2>
          <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
            Kami mendeteksi jaringan internet Anda terputus. Menunggu jaringan tersambung kembali...
          </p>
        </div>

        {/* Safe AI Server Confirmation */}
        <div className="bg-slate-950 border border-slate-850/60 rounded-2xl p-4 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-slate-400 leading-normal font-mono">
            <span className="font-bold text-emerald-400 block mb-0.5">SISTEM CLOUD AMAN</span>
            Mesin kecerdasan buatan (AI Trading Engine) di server backend tetap berjalan normal dan aman untuk menjaga posisi modal Anda.
          </div>
        </div>

      </div>
    </div>
  );
}
