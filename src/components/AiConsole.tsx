'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';

export default function AiConsole() {
  const { logs, clearLogs } = useBotStore();
  const t = useI18nStore((state) => state.t);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever new logs are added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Format time
  const formatTime = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toTimeString().split(' ')[0];
  };

  return (
    <div id="tour-console" className="bg-slate-955 border border-slate-850 rounded-3xl p-6 flex flex-col h-full shadow-xl">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-4">
        <div className="flex items-center gap-2.5 text-slate-200">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono">{t('console.title')}</h3>
            <p className="text-[11px] text-slate-550">{t('console.desc')}</p>
          </div>
        </div>
        <button
          onClick={clearLogs}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all duration-300"
          title="Hapus Log"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 font-mono text-[11px] leading-relaxed max-h-[380px]">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic text-center py-12">
            {t('console.empty')}
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start border-b border-slate-900/50 pb-1.5">
              <span className="text-slate-600 shrink-0 select-none">[{formatTime(log.timestamp)}]</span>
              <span className={`flex-1 ${
                log.level === 'SUCCESS' ? 'text-emerald-400' :
                log.level === 'WARNING' ? 'text-amber-400' :
                log.level === 'ERROR' ? 'text-rose-500 font-bold' :
                'text-cyan-400/90'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
