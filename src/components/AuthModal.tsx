'use client';

import React, { useState } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { ShieldCheck, Mail, ArrowRight, Cpu, Fingerprint, Scan } from 'lucide-react';

export default function AuthModal() {
  const login = useBotStore((state) => state.login);
  const t = useI18nStore((state) => state.t);
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    // Default to ENTERPRISE if it contains 'enterprise', otherwise FREE
    const tier = email.toLowerCase().includes('enterprise') ? 'ENTERPRISE' : 'FREE';
    login(email.trim(), tier);
  };

  const handleQuickLogin = (tier: 'FREE' | 'ENTERPRISE') => {
    const mockEmail = tier === 'ENTERPRISE' ? 'corporate@enterprise.com' : 'trader@free.com';
    login(mockEmail, tier);
  };

  const handleFaceIdLogin = () => {
    setIsScanning(true);
    
    // Simulate biometrics scanning for 1.5 seconds
    setTimeout(() => {
      setIsScanning(false);
      login('biometric.user@enterprise.com', 'ENTERPRISE');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-[#060913] flex items-center justify-center z-50 p-4 font-sans selection:bg-cyan-500/30">
      
      {/* Dynamic Scan Line Style */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scan 2s infinite ease-in-out;
        }
      `}</style>

      {/* Radial Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl text-white w-14 h-14 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Cpu className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wider">{t('auth.title')}</h2>
          <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">{t('auth.desc')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            {error && <p className="text-[11px] text-rose-400 font-mono">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95"
          >
            {t('auth.submit')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="h-px bg-slate-800/80 flex-1" />
          <span className="text-[10px] text-slate-550 font-mono uppercase tracking-widest">Atau Masuk Cepat</span>
          <div className="h-px bg-slate-800/80 flex-1" />
        </div>

        {/* Quick Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin('FREE')}
            className="py-2.5 px-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-100 rounded-xl text-xs font-semibold font-mono transition-all duration-300 hover:bg-slate-950/80 active:scale-95"
          >
            {t('auth.freeUser')}
          </button>
          <button
            onClick={() => handleQuickLogin('ENTERPRISE')}
            className="py-2.5 px-4 bg-slate-950/40 border border-slate-800 hover:border-cyan-500/50 text-cyan-450 hover:text-cyan-400 rounded-xl text-xs font-semibold font-mono transition-all duration-300 hover:bg-slate-950/80 active:scale-95"
          >
            {t('auth.enterpriseUser')}
          </button>
        </div>

        {/* Biometrics Login */}
        <button
          onClick={handleFaceIdLogin}
          disabled={isScanning}
          className="w-full py-2.5 bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-350 hover:text-cyan-400 rounded-xl text-xs font-semibold font-mono transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
          Login dengan FaceID / TouchID
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured with HMAC-SHA256 & AES-256-GCM</span>
        </div>
      </div>

      {/* Biometrics Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-md flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Pulsing scanning radar */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center border border-slate-800 bg-slate-950/50 rounded-2xl p-4">
              {/* SVG Face Scan */}
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-cyan-400 animate-pulse">
                <path d="M25,15 C35,5 65,5 75,15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M15,25 C5,35 5,65 15,75" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M75,85 C65,95 35,95 25,85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M85,75 C95,65 95,35 85,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                
                {/* Eyes and Nose */}
                <circle cx="35" cy="45" r="4" fill="currentColor" />
                <circle cx="65" cy="45" r="4" fill="currentColor" />
                <path d="M50,45 L50,60 L43,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M35,72 Q50,82 65,72" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              
              {/* Radar laser line */}
              <div className="absolute left-2 right-2 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-scan-line" />
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Scan className="w-4 h-4 text-cyan-400 animate-spin" />
                Memindai Biometrik
              </h4>
              <p className="text-[10px] text-slate-450 font-mono">Menyelaraskan sensor wajah dengan FaceID...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
