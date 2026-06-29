'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { setThemeColor } from '../utils/ThemeEngine';
import { 
  Users, DollarSign, Activity, Settings, CheckCircle, 
  XCircle, Ban, ShieldAlert, Cpu, HardDrive, Wifi, 
  Upload, Globe, Plus, Trash2, Palette 
} from 'lucide-react';

type AdminTab = 'kyc' | 'revenue' | 'health' | 'whitelabel' | 'financial';

export default function BackofficeView() {
  const { 
    kycStatus, setKycStatus, addAuditLog, addNotification,
    customLogoUrl, setCustomLogoUrl, customSubdomains,
    addCustomSubdomain, removeCustomSubdomain, user,
    adminDeposits, adminWithdrawals, fetchAdminFinancialQueue,
    approveAdminDeposit, rejectAdminDeposit, approveAdminWithdrawal, rejectAdminWithdrawal,
    updateTenantTheme, uploadTenantLogo
  } = useBotStore();

  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('kyc');
  const [themeColor, setThemeColorState] = useState('#06b6d4'); // Default cyan-500
  const [newSubdomain, setNewSubdomain] = useState('');
  
  // Server Health Mock States
  const [cpu, setCpu] = useState(12.5);
  const [ram, setRam] = useState(34.2);
  const [latency, setLatency] = useState(14);

  // Fluctuating server health metrics
  useEffect(() => {
    fetchAdminFinancialQueue();
    const interval = setInterval(() => {
      setCpu(parseFloat((10 + Math.random() * 8).toFixed(1)));
      setRam(parseFloat((33 + Math.random() * 2).toFixed(1)));
      setLatency(Math.floor(12 + Math.random() * 6));
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchAdminFinancialQueue]);

  const handleKycAction = (status: 'APPROVED' | 'REJECTED') => {
    setKycStatus(status);
    addNotification(`Dokumen KYC Anda telah ${status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'} oleh Admin.`);
    addAuditLog(`Admin Action: KYC ${status} for user ${user?.email}`);
  };

  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setThemeColorState(color);
    setThemeColor(color); // Apply locally
    await updateTenantTheme(color, '#7c3aed');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadTenantLogo(file);
    }
  };

  const handleResetLogo = () => {
    setCustomLogoUrl(null);
    addNotification('Logo di-reset ke bawaan.');
    addAuditLog('White-Label: Custom brand logo reset');
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubdomain || customSubdomains.includes(newSubdomain)) return;
    addCustomSubdomain(newSubdomain);
    addNotification(`Domain ${newSubdomain} berhasil ditambahkan.`);
    addAuditLog(`White-Label: Subdomain ${newSubdomain} added`);
    setNewSubdomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    removeCustomSubdomain(domain);
    addNotification(`Domain ${domain} berhasil dihapus.`);
    addAuditLog(`White-Label: Subdomain ${domain} removed`);
  };

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          Superadmin & Backoffice Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Panel manajemen rahasia internal untuk mengawasi status kepatuhan KYC, memantau server, melacak metrik keuangan, dan kustomisasi White-Labeling.
        </p>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 max-w-2xl w-full">
        <button
          onClick={() => setActiveSubTab('kyc')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 ${
            activeSubTab === 'kyc' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          KYC & Users
        </button>
        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 ${
            activeSubTab === 'revenue' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          MRR & Revenue
        </button>
        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 ${
            activeSubTab === 'health' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Server Health
        </button>
        <button
          onClick={() => setActiveSubTab('whitelabel')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 ${
            activeSubTab === 'whitelabel' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          B2B White-Label
        </button>
        <button
          onClick={() => { setActiveSubTab('financial'); fetchAdminFinancialQueue(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 ${
            activeSubTab === 'financial' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Finansial Queue
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[400px]">
        
        {activeSubTab === 'kyc' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">KYC Document Verification Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                    <th className="py-3 px-4 font-normal">User Email</th>
                    <th className="py-3 px-4 font-normal">Document Name</th>
                    <th className="py-3 px-4 font-normal">Status</th>
                    <th className="py-3 px-4 text-right font-normal">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                  {/* Current user's KYC Document Status */}
                  {user && (
                    <tr className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{user.email} (Anda)</td>
                      <td className="py-3.5 px-4 text-slate-450">KTP_Selfie_Verification.jpg</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          kycStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/35' :
                          kycStatus === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-900/35' :
                          kycStatus === 'PENDING' ? 'bg-amber-950 text-amber-400 border-amber-900/35' :
                          'bg-slate-950 text-slate-500 border-slate-850'
                        }`}>
                          {kycStatus === 'NOT_SUBMITTED' ? 'BELUM UNGHAH' : kycStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {kycStatus === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleKycAction('APPROVED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-[10px] rounded-lg transition-all duration-300"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleKycAction('REJECTED')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-750 text-white font-bold text-[10px] rounded-lg transition-all duration-300"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">Selesai Ditinjau</span>
                        )}
                      </td>
                    </tr>
                  )}
                  
                  {/* Static Mock Users */}
                  <tr className="hover:bg-slate-955/20 transition-colors duration-250">
                    <td className="py-3.5 px-4">trader.jakarta@gmail.com</td>
                    <td className="py-3.5 px-4 text-slate-450">Passport_Upload.png</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/35 text-[10px] font-bold rounded">
                        APPROVED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 bg-slate-950 hover:bg-rose-950 border border-slate-850 hover:border-rose-900/30 text-slate-455 hover:text-rose-400 rounded-lg transition-all duration-300" title="Suspend Account">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-955/20 transition-colors duration-250">
                    <td className="py-3.5 px-4">scalper.bali@yahoo.com</td>
                    <td className="py-3.5 px-4 text-slate-450">KTP_Verif_Final.jpg</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-900/35 text-[10px] font-bold rounded">
                        REJECTED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] text-slate-500 font-mono italic">Selesai Ditinjau</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'revenue' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Financial KPI Analytics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">MRR (SaaS Revenue)</span>
                <span className="text-lg font-black font-mono text-slate-100">$12,450</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Subscribers</span>
                <span className="text-lg font-black font-mono text-slate-100">254</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Churn Rate (Monthly)</span>
                <span className="text-lg font-black font-mono text-rose-400">1.8%</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Affiliate Payouts</span>
                <span className="text-lg font-black font-mono text-emerald-450">$1,240</span>
              </div>
            </div>

            {/* SVG MRR Chart */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
              <span className="text-[10px] text-slate-405 font-mono uppercase block">Monthly Recurring Revenue (MRR) Growth</span>
              <div className="h-48 w-full relative flex items-end pt-6">
                <svg className="w-full h-full text-cyan-500" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <path
                    d="M0,100 Q80,80 160,75 T320,40 T480,10 L500,10 L500,120 L0,120 Z"
                    fill="url(#mrr-gradient)"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <defs>
                    <linearGradient id="mrr-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-cyan-500)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-cyan-500)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Months label */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-slate-550 font-mono px-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun (Current)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'health' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">System Health & Server Monitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CPU */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-450 flex items-center gap-1"><Cpu className="w-4 h-4 text-cyan-400" /> CPU Load</span>
                  <span className="text-slate-100 font-bold">{cpu}%</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${cpu * 4}%` }} // Adjusted multiplier for visual scaling
                  />
                </div>
              </div>

              {/* RAM */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-450 flex items-center gap-1"><HardDrive className="w-4 h-4 text-purple-400" /> Memory Usage</span>
                  <span className="text-slate-100 font-bold">{ram}%</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${ram}%` }}
                  />
                </div>
              </div>

              {/* Latency */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-450 flex items-center gap-1"><Wifi className="w-4 h-4 text-emerald-400" /> API Latency</span>
                  <span className="text-emerald-400 font-bold">{latency} ms</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(latency / 30) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Overall Server Info */}
            <div className="bg-slate-950 border border-slate-850/60 p-4.5 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Server Location: <span className="text-slate-200">Singapore SG1-A</span></span>
              <span>Uptime: <span className="text-emerald-400 font-bold">99.98%</span></span>
              <span>Active Threads: <span className="text-slate-200">34 / 256</span></span>
            </div>
          </div>
        )}

        {activeSubTab === 'financial' && (
          <div className="space-y-8">
            {/* Deposits Queue */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Pending Deposits Verification Queue</h3>
              {adminDeposits.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 font-mono">
                  No pending deposits.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4 font-normal">User</th>
                        <th className="py-3 px-4 font-normal">Amount</th>
                        <th className="py-3 px-4 font-normal">Method</th>
                        <th className="py-3 px-4 font-normal">Proof</th>
                        <th className="py-3 px-4 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminDeposits.map((dep) => (
                        <tr key={dep.id} className="border-b border-slate-850/40 text-xs font-mono text-slate-300 hover:bg-slate-850/20">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{dep.wallet.user.legalName}</span>
                            <span className="text-[10px] text-slate-500">{dep.wallet.user.email}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-cyan-400 font-bold">
                            ${dep.amount.toLocaleString()} {dep.wallet.currency}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{dep.paymentMethod}</td>
                          <td className="py-3 px-4">
                            {dep.proofUrl ? (
                              <a
                                href={`http://localhost:5000${dep.proofUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline text-[10px]"
                              >
                                View Proof File
                              </a>
                            ) : (
                              <span className="text-slate-600 text-[10px]">No Proof</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => approveAdminDeposit(dep.id)}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectAdminDeposit(dep.id)}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all font-bold"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Withdrawals Queue */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Pending Withdrawals Queue</h3>
              {adminWithdrawals.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 font-mono">
                  No pending withdrawals.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4 font-normal">User</th>
                        <th className="py-3 px-4 font-normal">Amount</th>
                        <th className="py-3 px-4 font-normal">Method</th>
                        <th className="py-3 px-4 font-normal">Payout Details</th>
                        <th className="py-3 px-4 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminWithdrawals.map((wit) => (
                        <tr key={wit.id} className="border-b border-slate-850/40 text-xs font-mono text-slate-300 hover:bg-slate-850/20">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{wit.wallet.user.legalName}</span>
                            <span className="text-[10px] text-slate-500">{wit.wallet.user.email}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-purple-400 font-bold">
                            ${wit.amount.toLocaleString()} {wit.wallet.currency}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{wit.paymentMethod}</td>
                          <td className="py-3 px-4 text-slate-400 text-[10px] max-w-[200px] truncate" title={wit.payoutDetails}>
                            {wit.payoutDetails}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => approveAdminWithdrawal(wit.id)}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectAdminWithdrawal(wit.id)}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all font-bold"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'whitelabel' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Institutional White-Labeling Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Logo & Theme Color */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-5">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">Dynamic Styling</h4>
                
                {/* Theme Color Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Aksen Warna Utama Aplikasi</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={handleColorChange}
                      className="w-10 h-10 border border-slate-750 bg-transparent rounded-lg cursor-pointer"
                    />
                    <div className="text-xs font-mono">
                      <span className="text-slate-200 font-bold block">{themeColor.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500">Geser warna untuk mengganti tema aksen instan.</span>
                    </div>
                  </div>
                </div>

                {/* Custom Logo Upload */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Logo Institusi Kustom</label>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-32 border border-slate-800 rounded-xl flex items-center justify-center bg-slate-900 relative overflow-hidden shrink-0">
                      {customLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={customLogoUrl} alt="Custom Logo" className="max-h-10 object-contain px-2" />
                      ) : (
                        <span className="text-[9px] text-slate-550 font-mono uppercase">LOGO DEFAULT</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <label className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-150 text-[10px] font-bold font-mono rounded-xl cursor-pointer transition-all duration-300 inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Pilih Logo
                        <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </label>
                      {customLogoUrl && (
                        <button
                          onClick={handleResetLogo}
                          className="text-[9px] text-rose-450 hover:text-rose-400 font-mono underline block"
                        >
                          Reset ke Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subdomain Management */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">Custom Subdomain Management</h4>
                
                {/* Form */}
                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="app.namabroker.com"
                      value={newSubdomain}
                      onChange={(e) => setNewSubdomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl transition-all duration-300"
                    title="Tambah Domain"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                {/* Subdomains List */}
                <div className="space-y-2 pt-2">
                  {customSubdomains.map((dom) => (
                    <div key={dom} className="flex bg-slate-900 border border-slate-850 rounded-xl p-2.5 justify-between items-center">
                      <span className="text-xs text-slate-250 font-mono">{dom}</span>
                      <button
                        onClick={() => handleRemoveDomain(dom)}
                        className="p-1.5 hover:bg-slate-800 hover:text-rose-450 text-slate-500 rounded-lg transition-all duration-300"
                        title="Hapus Domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
