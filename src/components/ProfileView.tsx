'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { User, Mail, Phone, Globe, Lock, ShieldCheck, Award, Save, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

export default function ProfileView() {
  const { user, updateProfile, deleteAccount } = useBotStore();

  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'HAPUS AKUN SAYA') return;
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal menghapus akun.' });
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    } finally {
      setDeleting(false);
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
                    type="text"
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

          {/* Danger Zone: Delete Account */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-rose-500/10 pb-2">
              <Trash2 className="w-4 h-4" />
              Danger Zone - Hapus Akun
            </h3>
            
            <p className="text-xs text-gray-450 leading-relaxed">
              Tindakan ini bersifat <span className="text-rose-400 font-bold font-mono">PERMANEN</span> dan tidak dapat dibatalkan. Menghapus akun Anda akan menghapus seluruh data bot, riwayat transaksi, pengaturan broker, dan saldo dompet Anda dari sistem secara permanen.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-rose-650 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-rose-600/15 cursor-pointer"
            >
              Hapus Akun Permanen
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
            <div className="p-3.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-sm font-bold text-white uppercase font-mono">Apakah Anda sangat yakin?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tindakan ini <span className="font-bold text-rose-400">TIDAK BISA DIBATALKAN</span>. Ini akan menghapus akun Anda secara permanen beserta semua data yang terasosiasi.
              </p>
              <p className="text-[10px] text-rose-400/90 font-medium">
                Silakan ketik <span className="font-bold font-mono text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded">HAPUS AKUN SAYA</span> di bawah ini untuk mengonfirmasi.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS AKUN SAYA"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm text-center font-bold focus:outline-none focus:border-rose-500 placeholder:text-gray-700"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== 'HAPUS AKUN SAYA' || deleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-850 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/15 cursor-pointer"
                >
                  {deleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Ya, Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
