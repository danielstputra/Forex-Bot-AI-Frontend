'use client';

import React, { useState } from 'react';
import { useI18nStore } from '../store/useI18nStore';
import { ShieldAlert, ShieldCheck, Key, Copy, Check } from 'lucide-react';

export default function TwoFactorSetup() {
  const t = useI18nStore((state) => state.t);
  const [otp, setOtp] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleCopy = () => {
    navigator.clipboard.writeText(secretKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError('Kode OTP harus berupa 6 digit angka.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate OTP verification delay
    setTimeout(() => {
      setLoading(false);
      setIsVerified(true);
    }, 1000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-lg w-full">
      <div className="flex items-center gap-2.5 border-b border-slate-850 pb-4 mb-5">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl text-white shadow-md">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Autentikasi Dua Faktor (2FA)
          </h3>
          <p className="text-[11px] text-slate-400">
            Amankan transaksi dan penarikan dana Anda dengan Google Authenticator.
          </p>
        </div>
      </div>

      {isVerified ? (
        /* Success Screen */
        <div className="flex flex-col items-center justify-center py-8 gap-4 animate-scale-up text-center">
          <div className="p-3.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-400 font-mono uppercase">2FA AKTIF</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Akun Anda sekarang dilindungi oleh verifikasi dua langkah. Setiap penyesuaian bot dan penarikan dana memerlukan kode OTP.
            </p>
          </div>
        </div>
      ) : (
        /* Setup Guide */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-950/30 border border-slate-850 p-4 rounded-2xl">
            {/* Mock QR Code SVG */}
            <div className="bg-white p-2.5 rounded-xl flex items-center justify-center w-32 h-32 mx-auto sm:col-span-1 border border-slate-700 shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                <rect x="0" y="0" width="10" height="10" />
                <rect x="20" y="0" width="10" height="10" />
                <rect x="40" y="0" width="20" height="10" />
                <rect x="70" y="0" width="10" height="10" />
                <rect x="90" y="0" width="10" height="10" />
                
                <rect x="0" y="20" width="10" height="10" />
                <rect x="30" y="20" width="20" height="20" />
                <rect x="60" y="20" width="10" height="10" />
                <rect x="80" y="20" width="20" height="10" />
                
                <rect x="10" y="40" width="20" height="10" />
                <rect x="40" y="40" width="10" height="10" />
                <rect x="70" y="40" width="30" height="10" />
                
                <rect x="0" y="60" width="30" height="10" />
                <rect x="40" y="60" width="20" height="20" />
                <rect x="70" y="60" width="10" height="10" />
                <rect x="90" y="60" width="10" height="10" />
                
                <rect x="20" y="80" width="10" height="10" />
                <rect x="70" y="80" width="20" height="20" />
                
                <rect x="0" y="90" width="10" height="10" />
                <rect x="30" y="90" width="20" height="10" />
              </svg>
            </div>
            
            {/* Key Copy */}
            <div className="sm:col-span-2 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Atau Masukkan Kunci Manual</span>
              <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1 justify-between items-center">
                <span className="text-xs text-slate-200 font-mono pl-3 tracking-widest font-bold">{secretKey}</span>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-300"
                  title="Salin Kunci"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Pindai QR Code di atas atau masukkan kunci rahasia ke aplikasi Authenticator Anda (Google Authenticator, Authy, dll).
              </p>
            </div>
          </div>

          {/* OTP Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono">Masukkan Kode OTP 6-Digit</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 text-center text-slate-100 font-mono text-lg font-bold tracking-widest focus:outline-none focus:border-cyan-500"
              />
              {error && <p className="text-[10px] text-rose-450 font-mono text-center">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Aktifkan 2FA'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
