'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { User, Mail, Phone, Globe, Lock, ShieldCheck, Award, Save, RefreshCw } from 'lucide-react';

export default function ProfileView() {
  const { user, updateProfile, fetchWallets } = useBotStore();

  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setLegalName(user.legalName || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMsg({ type: '', text: '' });

    try {
      await updateProfile({ legalName, phone, country });
      setMsg({ type: 'success', text: 'Detail profil berhasil diperbarui!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Konfirmasi sandi baru tidak cocok.' });
      return;
    }

    setLoadingPassword(true);
    setMsg({ type: '', text: '' });

    try {
      await updateProfile({ newPassword });
      setMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi.' });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <User className="text-cyan-400 h-6 w-6" />
            Pengaturan Profil Akun
          </h2>
          <p className="text-xs text-gray-400">Kelola detail informasi pribadi Anda dan keamanan kata sandi.</p>
        </div>
        
        {msg.text && (
          <div className={`px-4 py-2 rounded-xl text-xs font-medium font-mono border ${
            msg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-cyan-500/15">
              {user.legalName ? user.legalName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-md font-bold text-white leading-tight">{user.legalName}</h3>
              <p className="text-xs text-gray-400 font-mono">{user.email}</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" />
              {user.tier} Plan
            </div>

            <div className="w-full pt-4 border-t border-white/5 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Status Akun:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> ACTIVE
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">2FA Status:</span>
                <span className={user.twoFactorOn ? 'text-cyan-400 font-bold' : 'text-gray-400'}>
                  {user.twoFactorOn ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Details Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <User className="text-cyan-400 w-4 h-4" />
              Detail Informasi Pribadi
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-mono block">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-mono block">Email (Tidak dapat diubah)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-gray-500 text-sm cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-mono block">No. Telepon (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="tel"
                    placeholder="+62 812-3456-789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-mono block">Negara</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Indonesia"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/15"
                >
                  {loadingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <Lock className="text-cyan-400 w-4 h-4" />
              Perbarui Kata Sandi Akun
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-mono block">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-mono block">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/15"
                >
                  {loadingPassword ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
