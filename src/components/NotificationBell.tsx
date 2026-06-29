'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCheck, Eye, ShieldAlert } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';

export default function NotificationBell() {
  const { notifications, markAllAsRead } = useBotStore();
  const [isOpen, setIsOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    
    if (permission === 'granted') {
      new Notification('Forex Bot AI', {
        body: 'Notifikasi push desktop berhasil diaktifkan! Anda akan menerima peringatan eksekusi trading.',
        icon: '/vercel.svg' // Fallback icon
      });
    }
  };

  const formatTimeAgo = (isoStr: string) => {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return 'Baru saja';
    return `${diffMin} menit lalu`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300 active:scale-95"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-550 text-[9px] font-bold text-white font-mono animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-850 flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-200">Notifikasi ({unreadCount})</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-850/40">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                Tidak ada notifikasi baru.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3.5 transition-colors duration-200 ${notif.read ? 'bg-transparent' : 'bg-slate-950/20'}`}
                >
                  <p className={`text-[11px] leading-relaxed ${notif.read ? 'text-slate-400' : 'text-slate-250 font-medium'}`}>
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Push Alert Enable Footer */}
          <div className="p-3 bg-slate-950/50 border-t border-slate-850 text-center">
            {pushPermission === 'granted' ? (
              <div className="text-[9px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Desktop Push Active
              </div>
            ) : (
              <button
                onClick={handleRequestPush}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 mx-auto"
              >
                <BellOff className="w-3.5 h-3.5" /> Enable Desktop Alerts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
