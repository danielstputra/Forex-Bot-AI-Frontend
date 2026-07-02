'use client';

import React from 'react';
import { useBotStore } from '../store/useBotStore';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useBotStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in font-sans ${
              isError
                ? 'bg-rose-950/80 border-rose-800/40 text-rose-200'
                : isSuccess
                ? 'bg-emerald-950/80 border-emerald-800/40 text-emerald-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {!isError && !isSuccess && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
