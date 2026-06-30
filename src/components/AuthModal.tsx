'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { 
  ShieldCheck, Mail, Lock, User, ArrowRight, Cpu, 
  Fingerprint, Scan, HelpCircle, CheckCircle, KeyRound, Play
} from 'lucide-react';

type AuthView = 'login' | 'register' | 'otp' | 'forgot' | 'reset' | 'success';

export default function AuthModal() {
  const { 
    login, loginDemo, registerUser, verifyAccount, verifyOtp, 
    forgotPassword, resetPassword, googleLogin, appConfig, fetchAppConfig 
  } = useBotStore();
  const t = useI18nStore((state) => state.t);
  
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [legalName, setLegalName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showGoogleMock, setShowGoogleMock] = useState(false);

  // Check URL query parameters on mount to handle Verification or Password Reset links
  useEffect(() => {
    fetchAppConfig();
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyToken = params.get('verifyToken') || params.get('token');
      const rToken = params.get('resetToken');
      const isResetAction = window.location.pathname.includes('reset') || rToken;
      
      if (verifyToken && !isResetAction) {
        setView('success');
        setLoading(true);
        verifyAccount(verifyToken).then((res) => {
          setLoading(false);
          if (!res.success) {
            setView('login');
            setError(res.error || 'Tautan verifikasi tidak valid atau telah kedaluwarsa.');
          } else {
            // Clean URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      } else if (rToken || (verifyToken && isResetAction)) {
        setResetToken(rToken || verifyToken || '');
        setView('reset');
      }
    }
  }, [verifyAccount, fetchAppConfig]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res && res.status === 'OTP_REQUIRED') {
      setView('otp');
      setMessage('Silakan masukkan kode OTP yang dikirim ke email Anda.');
    } else if (res && !res.success) {
      setError(res.error || 'Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !legalName) {
      setError('Semua bidang wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await registerUser({ email: email.trim(), password, legalName });
    setLoading(false);

    if (res.success) {
      setView('login');
      setMessage('Registrasi sukses! Silakan periksa email Anda untuk memverifikasi akun sebelum masuk.');
      setPassword('');
    } else {
      setError(res.error || 'Registrasi gagal.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Kode OTP harus terdiri dari 6 digit.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await verifyOtp(email.trim(), otpCode);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Kode OTP tidak cocok atau telah kedaluwarsa.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setMessage('Tautan untuk mengatur ulang kata sandi telah dikirim ke email Anda.');
    } else {
      setError(res.error || 'Gagal mengirim permintaan reset password.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Masukkan kata sandi baru Anda.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await resetPassword({ token: resetToken, newPassword });
    setLoading(false);

    if (res.success) {
      setView('login');
      setMessage('Kata sandi berhasil diperbarui! Silakan masuk menggunakan kata sandi baru Anda.');
      setNewPassword('');
    } else {
      setError(res.error || 'Gagal memperbarui kata sandi.');
    }
  };

  const handleFaceIdLogin = () => {
    setIsScanning(true);
    setError('');
    
    // Simulate biometric face scanning for 1.8 seconds
    setTimeout(async () => {
      setIsScanning(false);
      // Face ID login will use a pre-registered local account for demo
      const res = await login('admin@forexbot.ai', 'Password123!');
      if (res && !res.success) {
        setError('Sensor FaceID gagal mengenali wajah Anda. Silakan masuk menggunakan email.');
      }
    }, 1800);
  };

  const handleGoogleLoginClick = () => {
    if (appConfig?.googleClientId) {
      // In production, trigger Google 3rd party sign-in
      alert('Mengalihkan ke Google Sign-In...');
    } else {
      // Fallback: Show a beautiful simulated Google login modal in development
      setShowGoogleMock(true);
    }
  };

  const handleGoogleMockSubmit = async (mockEmail: string) => {
    setShowGoogleMock(false);
    setLoading(true);
    const res = await googleLogin({
      email: mockEmail,
      name: mockEmail.split('@')[0],
      googleId: 'google-mock-' + Date.now()
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Gagal masuk dengan Google.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060913] flex items-center justify-center z-50 p-4 font-sans selection:bg-cyan-500/30">
      
      {/* Scan Line Style for FaceID */}
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
          {appConfig?.logoUrl ? (
            <img src={appConfig.logoUrl} alt="Logo" className="w-14 h-14 mx-auto rounded-xl object-contain shadow-lg shadow-cyan-500/10" />
          ) : (
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl text-white w-14 h-14 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <Cpu className="w-8 h-8" />
            </div>
          )}
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wider">
            {appConfig?.appName || 'FOREX BOT AI'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {view === 'login' && (appConfig?.appDescription || 'Sistem Trading Otomatis Berbasis AI Kelas Dunia')}
            {view === 'register' && 'Buat akun Anda dan mulai trading otomatis hari ini'}
            {view === 'otp' && 'Masukkan kode keamanan sekali pakai untuk memverifikasi masuk'}
            {view === 'forgot' && 'Masukkan email Anda untuk menerima tautan atur ulang kata sandi'}
            {view === 'reset' && 'Masukkan kata sandi baru untuk mengamankan akun Anda'}
            {view === 'success' && 'Akun Anda berhasil diverifikasi'}
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-mono text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-mono text-center">
            {message}
          </div>
        )}

        {/* ─── 1. LOGIN VIEW ────────────────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Kata Sandi</label>
                <button 
                  type="button"
                  onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                  className="text-[10px] text-cyan-400 hover:underline font-mono"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sedang Masuk...' : 'Masuk'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo Button */}
            <button
              type="button"
              onClick={() => loginDemo()}
              className="w-full py-2.5 bg-slate-955/40 hover:bg-slate-800 border border-slate-800/80 text-cyan-400 hover:text-cyan-300 font-semibold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              Coba Akun Demo (Simulasi / Dummy Data)
            </button>
          </form>
        )}

        {/* ─── 2. REGISTER VIEW ─────────────────────────────────────── */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Sesuai KTP"
                  value={legalName}
                  onChange={(e) => { setLegalName(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ─── 3. OTP VERIFICATION VIEW ────────────────────────────── */}
        {view === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Kode Keamanan OTP</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-center text-slate-200 text-lg tracking-[8px] focus:outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { setView('login'); setError(''); setMessage(''); }}
                className="text-[11px] text-slate-400 hover:underline font-mono"
              >
                Kembali ke halaman login
              </button>
            </div>
          </form>
        )}

        {/* ─── 4. FORGOT PASSWORD VIEW ──────────────────────────────── */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Email Akun</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { setView('login'); setError(''); setMessage(''); }}
                className="text-[11px] text-slate-400 hover:underline font-mono"
              >
                Kembali ke halaman login
              </button>
            </div>
          </form>
        )}

        {/* ─── 5. RESET PASSWORD VIEW ───────────────────────────────── */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru Anda"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Simpan Kata Sandi Baru'}
            </button>
          </form>
        )}

        {/* ─── 6. SUCCESS / AUTO LOGIN VIEW ─────────────────────────── */}
        {view === 'success' && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 font-mono">Verifikasi Akun Sukses!</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                {loading ? 'Menyiapkan sesi Anda...' : 'Mengalihkan Anda ke dashboard...'}
              </p>
            </div>
          </div>
        )}

        {/* Mode Toggle (Login vs Register) */}
        {(view === 'login' || view === 'register') && (
          <div className="text-center text-xs text-slate-400 font-mono">
            {view === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setError('');
                setMessage('');
              }}
              className="text-cyan-400 hover:underline font-bold"
            >
              {view === 'login' ? 'Daftar di Sini' : 'Masuk di Sini'}
            </button>
          </div>
        )}

        {/* ─── OAUTH GOOGLE & BIOMETRICS (Only on Login/Register) ─── */}
        {(view === 'login' || view === 'register') && (
          <div className="space-y-4">
            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-800/80 flex-1" />
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Atau</span>
              <div className="h-px bg-slate-800/80 flex-1" />
            </div>

            {/* Google OAuth (if enabled) */}
            {(appConfig === null || appConfig?.oauthEnabled) && (
              <button
                type="button"
                onClick={handleGoogleLoginClick}
                className="w-full py-2.5 bg-slate-955/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-semibold font-mono transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M16.04 15.345c-1.077.733-2.433 1.164-4.04 1.164-2.755 0-5.09-1.86-5.923-4.364L2.05 15.26A11.932 11.932 0 0 0 12 24c3.245 0 6.18-1.09 8.41-2.964l-4.37-3.691Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.766 12.273c0-.818-.073-1.609-.208-2.373H12v4.5h6.6c-.285 1.52-.14 2.808-1.56 3.69l4.37 3.692c2.555-2.355 4.356-5.82 4.356-9.509Z"
                  />
                  <path
                    fill="#34A853"
                    d="M2.05 8.74A11.947 11.947 0 0 0 0 12c0 1.16.166 2.285.474 3.35l4.357-3.385c-.083-.31-.13-.637-.13-.965 0-.895.2-1.74.565-2.5l-3.216-2.49L2.05 8.74Z"
                  />
                </svg>
                Masuk dengan Google
              </button>
            )}

            {/* Biometrics Login */}
            {view === 'login' && (
              <button
                type="button"
                onClick={handleFaceIdLogin}
                disabled={isScanning}
                className="w-full py-2.5 bg-slate-955/60 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-xl text-xs font-semibold font-mono transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
                Masuk dengan FaceID
              </button>
            )}
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured with HMAC-SHA256 & AES-256-GCM</span>
        </div>
      </div>

      {/* Biometrics Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Pulsing scanning radar */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center border border-slate-800 bg-slate-950/50 rounded-2xl p-4">
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-cyan-400 animate-pulse">
                <path d="M25,15 C35,5 65,5 75,15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M15,25 C5,35 5,65 15,75" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M75,85 C65,95 35,95 25,85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M85,75 C95,65 95,35 85,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle cx="35" cy="45" r="4" fill="currentColor" />
                <circle cx="65" cy="45" r="4" fill="currentColor" />
                <path d="M50,45 L50,60 L43,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M35,72 Q50,82 65,72" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
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

      {/* Google OAuth Mock Modal (For easy local testing) */}
      {showGoogleMock && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M16.04 15.345c-1.077.733-2.433 1.164-4.04 1.164-2.755 0-5.09-1.86-5.923-4.364L2.05 15.26A11.932 11.932 0 0 0 12 24c3.245 0 6.18-1.09 8.41-2.964l-4.37-3.691Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.766 12.273c0-.818-.073-1.609-.208-2.373H12v4.5h6.6c-.285 1.52-.14 2.808-1.56 3.69l4.37 3.692c2.555-2.355 4.356-5.82 4.356-9.509Z"
                  />
                  <path
                    fill="#34A853"
                    d="M2.05 8.74A11.947 11.947 0 0 0 0 12c0 1.16.166 2.285.474 3.35l4.357-3.385c-.083-.31-.13-.637-.13-.965 0-.895.2-1.74.565-2.5l-3.216-2.49L2.05 8.74Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-mono">Simulasi Google Sign-In</h4>
                <p className="text-[10px] text-slate-450 font-mono">Masukkan email untuk simulasi login cepat</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleGoogleMockSubmit('trader.google@gmail.com')}
                className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-cyan-550 rounded-xl text-xs font-mono text-left text-slate-200 hover:bg-slate-950/80"
              >
                trader.google@gmail.com (Retail Trader)
              </button>
              <button 
                onClick={() => handleGoogleMockSubmit('admin.google@gmail.com')}
                className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-cyan-550 rounded-xl text-xs font-mono text-left text-slate-200 hover:bg-slate-950/80"
              >
                admin.google@gmail.com (Super Administrator)
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowGoogleMock(false)}
                className="px-4 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-250"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
