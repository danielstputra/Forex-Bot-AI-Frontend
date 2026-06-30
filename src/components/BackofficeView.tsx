'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { setThemeColor } from '../utils/ThemeEngine';
import { 
  Users, DollarSign, Activity, Settings, CheckCircle, 
  XCircle, Ban, ShieldAlert, Cpu, HardDrive, Wifi, 
  Upload, Globe, Plus, Trash2, Palette, Award, Clock, 
  ToggleLeft, ToggleRight, Shield, ShieldCheck, Check, Save 
} from 'lucide-react';

type AdminTab = 'kyc' | 'revenue' | 'health' | 'whitelabel' | 'financial' | 'b2b' | 'users' | 'config' | 'menus' | 'roles';

export default function BackofficeView() {
  const { 
    kycStatus, setKycStatus, addAuditLog, addNotification,
    customLogoUrl, setCustomLogoUrl, customSubdomains,
    addCustomSubdomain, removeCustomSubdomain, user,
    adminDeposits, adminWithdrawals, fetchAdminFinancialQueue,
    approveAdminDeposit, rejectAdminDeposit, approveAdminWithdrawal, rejectAdminWithdrawal,
    updateTenantTheme, uploadTenantLogo,
    tenants, tenantSubscriptions, fetchAllTenants, fetchTenantSubscriptions,
    createTenantSubscription, updateTenantSubscriptionStatus,
    usersList, fetchUsersList, updateUserStatus, updateUserRole,
    appConfig, fetchAppConfig, updateAppConfig,
    systemMenus, fetchSystemMenus, createSystemMenu, updateSystemMenu, deleteSystemMenu,
    rolesList, fetchRolesList, createRole, deleteRole,
    roleMenuAccesses, fetchRoleMenuAccess, saveRoleMenuAccess,
    userMenuPermissions, fetchUserMenuPermissions, saveUserMenuPermissions
  } = useBotStore();

  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('kyc');
  const [themeColor, setThemeColorState] = useState('#06b6d4'); // Default cyan-500
  const [newSubdomain, setNewSubdomain] = useState('');
  
  // Create Tenant Subscription Form State
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [planName, setPlanName] = useState('Standard White-Label');
  const [price, setPrice] = useState('499');
  const [validDays, setValidDays] = useState('365');

  // App Config Settings State
  const [appName, setAppName] = useState('Forex Bot AI');
  const [appDescription, setAppDescription] = useState('Professional SaaS Forex Trading Bot Platform');
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [logoUrlSetting, setLogoUrlSetting] = useState('');
  const [appVersion, setAppVersion] = useState('v3.0.0');
  const [appUrl, setAppUrl] = useState('https://app.forexbot.ai');
  const [appKey, setAppKey] = useState('FX-BOT-AI-KEY-2026');
  const [supportEmail, setSupportEmail] = useState('support@forexbot.ai');
  const [supportTelegram, setSupportTelegram] = useState('@forexbot_support');
  const [defaultLanguage, setDefaultLanguage] = useState('ID');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalMinDeposit, setGlobalMinDeposit] = useState('10');
  const [globalCommissionPct, setGlobalCommissionPct] = useState('0');
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  // Advanced Security & Email Config State
  const [loginOtpEnabled, setLoginOtpEnabled] = useState(false);
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpSender, setSmtpSender] = useState('noreply@forexbot.ai');
  const [googleClientId, setGoogleClientId] = useState('');

  // System Menu Form State
  const [newMenuKey, setNewMenuKey] = useState('');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPath, setNewMenuPath] = useState('');
  const [newMenuIcon, setNewMenuIcon] = useState('HelpCircle');
  const [newMenuOrder, setNewMenuOrder] = useState('0');

  // Edit Menu State
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editMenuKey, setEditMenuKey] = useState('');
  const [editMenuName, setEditMenuName] = useState('');
  const [editMenuPath, setEditMenuPath] = useState('');
  const [editMenuIcon, setEditMenuIcon] = useState('');
  const [editMenuOrder, setEditMenuOrder] = useState('');
  const [editMenuIsActive, setEditMenuIsActive] = useState(true);

  // Roles & Permissions UI State
  const [roleTab, setRoleTab] = useState<'roles' | 'matrix' | 'override'>('roles');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [matrixAccesses, setMatrixAccesses] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userOverrides, setUserOverrides] = useState<any[]>([]);

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

  useEffect(() => {
    if (activeSubTab === 'b2b') {
      fetchAllTenants();
      fetchTenantSubscriptions();
    } else if (activeSubTab === 'users') {
      fetchUsersList();
    } else if (activeSubTab === 'config') {
      fetchAppConfig();
    } else if (activeSubTab === 'menus') {
      fetchSystemMenus();
    } else if (activeSubTab === 'roles') {
      fetchRolesList();
      fetchUsersList();
    }
  }, [activeSubTab, fetchAllTenants, fetchTenantSubscriptions, fetchUsersList, fetchAppConfig, fetchSystemMenus, fetchRolesList]);

  // Load appConfig into local state when fetched
  useEffect(() => {
    if (appConfig) {
      setAppName(appConfig.appName);
      setAppDescription(appConfig.appDescription);
      setBackendUrl(appConfig.backendUrl);
      setLogoUrlSetting(appConfig.logoUrl);
      setAppVersion(appConfig.appVersion);
      setAppUrl(appConfig.appUrl);
      setAppKey(appConfig.appKey);
      setSupportEmail(appConfig.supportEmail);
      setSupportTelegram(appConfig.supportTelegram);
      setDefaultLanguage(appConfig.defaultLanguage);
      setMaintenanceMode(appConfig.maintenanceMode);
      setGlobalMinDeposit(appConfig.globalMinDeposit.toString());
      setGlobalCommissionPct(appConfig.globalCommissionPct.toString());
      
      setLoginOtpEnabled(!!appConfig.loginOtpEnabled);
      setSmtpEnabled(!!appConfig.smtpEnabled);
      setOauthEnabled(!!appConfig.oauthEnabled);
      setSmtpHost(appConfig.smtpHost || 'smtp.mailtrap.io');
      setSmtpPort((appConfig.smtpPort || 2525).toString());
      setSmtpUser(appConfig.smtpUser || '');
      setSmtpPass(appConfig.smtpPass || '');
      setSmtpSender(appConfig.smtpSender || 'noreply@forexbot.ai');
      setGoogleClientId(appConfig.googleClientId || '');

      try {
        setSelectedMenus(JSON.parse(appConfig.activeMenusJson));
      } catch (e) {
        setSelectedMenus([]);
      }
    }
  }, [appConfig]);

  // Load role menu accesses when a role is selected
  useEffect(() => {
    if (selectedRoleId) {
      fetchRoleMenuAccess(selectedRoleId);
    }
  }, [selectedRoleId, fetchRoleMenuAccess]);

  useEffect(() => {
    if (roleMenuAccesses) {
      setMatrixAccesses(roleMenuAccesses);
    }
  }, [roleMenuAccesses]);

  // Load user menu overrides when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserMenuPermissions(selectedUserId);
    }
  }, [selectedUserId, fetchUserMenuPermissions]);

  useEffect(() => {
    if (userMenuPermissions) {
      setUserOverrides(userMenuPermissions);
    }
  }, [userMenuPermissions]);

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

  const handleCreateTenantSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;

    await createTenantSubscription({
      tenantId: selectedTenantId,
      planName,
      price: parseFloat(price),
      validDays: parseInt(validDays)
    });
    setSelectedTenantId('');
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSystemMenu({
      key: newMenuKey,
      name: newMenuName,
      path: newMenuPath,
      iconName: newMenuIcon,
      order: parseInt(newMenuOrder)
    });
    setNewMenuKey('');
    setNewMenuName('');
    setNewMenuPath('');
    setNewMenuIcon('HelpCircle');
    setNewMenuOrder('0');
  };

  const handleStartEditMenu = (menu: any) => {
    setEditingMenuId(menu.id);
    setEditMenuKey(menu.key);
    setEditMenuName(menu.name);
    setEditMenuPath(menu.path);
    setEditMenuIcon(menu.iconName);
    setEditMenuOrder(menu.order.toString());
    setEditMenuIsActive(menu.isActive);
  };

  const handleUpdateMenu = async (id: string) => {
    await updateSystemMenu(id, {
      key: editMenuKey,
      name: editMenuName,
      path: editMenuPath,
      iconName: editMenuIcon,
      order: parseInt(editMenuOrder),
      isActive: editMenuIsActive
    });
    setEditingMenuId(null);
  };

  const handleSaveAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAppConfig({
      appName,
      appDescription,
      backendUrl,
      logoUrl: logoUrlSetting,
      appVersion,
      appUrl,
      appKey,
      supportEmail,
      supportTelegram,
      defaultLanguage,
      maintenanceMode,
      globalMinDeposit: parseFloat(globalMinDeposit),
      globalCommissionPct: parseFloat(globalCommissionPct),
      activeMenus: selectedMenus,
      loginOtpEnabled,
      smtpEnabled,
      oauthEnabled,
      smtpHost,
      smtpPort: parseInt(smtpPort),
      smtpUser,
      smtpPass,
      smtpSender,
      googleClientId
    });
  };

  const handleMenuToggle = (menuId: string) => {
    if (selectedMenus.includes(menuId)) {
      setSelectedMenus(selectedMenus.filter(m => m !== menuId));
    } else {
      setSelectedMenus([...selectedMenus, menuId]);
    }
  };

  // Roles & Permissions Handler
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRole({ name: newRoleName, description: newRoleDesc });
    setNewRoleName('');
    setNewRoleDesc('');
  };

  const handleMatrixCheckboxChange = (index: number, field: 'canRead' | 'canWrite', val: boolean) => {
    const updated = [...matrixAccesses];
    updated[index] = { ...updated[index], [field]: val };
    setMatrixAccesses(updated);
  };

  const handleSaveMatrix = async () => {
    if (!selectedRoleId) return;
    await saveRoleMenuAccess(selectedRoleId, matrixAccesses);
  };

  const handleOverrideCheckboxChange = (index: number, field: 'hasCustomOverride' | 'canRead' | 'canWrite', val: boolean) => {
    const updated = [...userOverrides];
    if (field === 'hasCustomOverride' && !val) {
      // If turning off override, clear read/write values
      updated[index] = { ...updated[index], hasCustomOverride: false, canRead: false, canWrite: false };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setUserOverrides(updated);
  };

  const handleSaveUserOverrides = async () => {
    if (!selectedUserId) return;
    await saveUserMenuPermissions(selectedUserId, userOverrides);
  };

  const allPossibleMenus = [
    { id: 'dashboard', name: 'Dashboard Utama' },
    { id: 'inbox', name: 'Kotak Masuk (Inbox)' },
    { id: 'history', name: 'Riwayat Transaksi' },
    { id: 'fintech', name: 'Fintech Hub (Wallet & VPS)' },
    { id: 'backtest', name: 'Backtesting Engine' },
    { id: 'social', name: 'Social Trading (Copy Trade)' },
    { id: 'pamm', name: 'PAMM/MAM Pools' },
    { id: 'security_kyc', name: 'Keamanan & Verifikasi KYC' },
    { id: 'affiliate', name: 'Program Kemitraan (Afiliasi)' },
    { id: 'help', name: 'Pusat Bantuan (Help Center)' },
    { id: 'audit', name: 'Audit Trail & Kepatuhan' },
    { id: 'developer', name: 'Developer Portal (API)' },
  ];

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
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 max-w-full w-full overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('kyc')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'kyc' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          KYC Queue
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'users' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </button>
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'roles' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'config' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          App Configuration
        </button>
        <button
          onClick={() => setActiveSubTab('menus')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'menus' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Menu Management
        </button>
        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'revenue' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          MRR & Revenue
        </button>
        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'health' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Server Health
        </button>
        <button
          onClick={() => setActiveSubTab('whitelabel')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'whitelabel' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          B2B White-Label
        </button>
        <button
          onClick={() => setActiveSubTab('financial')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'financial' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Finansial Queue
        </button>
        <button
          onClick={() => setActiveSubTab('b2b')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all duration-300 shrink-0 ${
            activeSubTab === 'b2b' ? 'bg-slate-800 text-cyan-400 border border-slate-700/30' : 'text-slate-455 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          B2B Tenants Sub
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[400px]">
        
        {/* ─── 1. KYC QUEUE TAB ─────────────────────────────────────── */}
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
                  {user && (
                    <tr className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{user.email} (Anda)</td>
                      <td className="py-3.5 px-4 text-slate-450">KTP_Selfie_Verification.jpg</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          kycStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/35' :
                          kycStatus === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-900/35' :
                          kycStatus === 'PENDING' ? 'bg-amber-955/20 text-amber-400 border-amber-900/35' :
                          'bg-slate-955 text-slate-500 border-slate-850'
                        }`}>
                          {kycStatus === 'NOT_SUBMITTED' ? 'BELUM UNGGAH' : kycStatus}
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
                          <span className="text-[10px] text-slate-550 font-mono italic">Selesai Ditinjau</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── 2. USER MANAGEMENT TAB ────────────────────────────────── */}
        {activeSubTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">User Management & Role Control</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 font-normal">Nama / Email</th>
                    <th className="py-3 px-4 font-normal">Peran (Role)</th>
                    <th className="py-3 px-4 font-normal">Status Akun</th>
                    <th className="py-3 px-4 font-normal">Status KYC</th>
                    <th className="py-3 px-4 font-normal">Tanggal Gabung</th>
                    <th className="py-3 px-4 text-right font-normal">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                  {usersList.map((usr: any) => (
                    <tr key={usr.id} className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200 block">{usr.legalName}</span>
                        <span className="text-[10px] text-slate-500">{usr.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={usr.role}
                          onChange={(e) => updateUserRole(usr.id, e.target.value)}
                          className="bg-slate-955 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                        >
                          <option value="USER">USER</option>
                          <option value="MANAGER">MANAGER (PAMM)</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERADMIN">SUPERADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          usr.status === 'ACTIVE' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/35'
                            : 'bg-rose-950 text-rose-400 border border-rose-900/35'
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-450">{usr.kycStatus}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-550">
                        {new Date(usr.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {usr.status === 'ACTIVE' ? (
                          <button
                            onClick={() => updateUserStatus(usr.id, 'SUSPENDED')}
                            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-405 border border-rose-900/30 rounded-lg font-bold transition-all text-[10px]"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(usr.id, 'ACTIVE')}
                            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-405 border border-emerald-900/30 rounded-lg font-bold transition-all text-[10px]"
                          >
                            Aktifkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">Tidak ada pengguna ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── 3. ROLES & PERMISSIONS TAB ────────────────────────────── */}
        {activeSubTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Dynamic Access & Privilege Matrix</h3>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  onClick={() => setRoleTab('roles')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                    roleTab === 'roles' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  Manage Roles
                </button>
                <button
                  onClick={() => setRoleTab('matrix')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                    roleTab === 'matrix' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  Role Access Matrix
                </button>
                <button
                  onClick={() => setRoleTab('override')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                    roleTab === 'override' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  User Override
                </button>
              </div>
            </div>

            {/* A. Manage Roles Sub-tab */}
            {roleTab === 'roles' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">Buat Peran Baru</h4>
                  <form onSubmit={handleCreateRoleSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Nama Peran (Key)</label>
                      <input
                        type="text"
                        placeholder="e.g. MARKETING"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Deskripsi</label>
                      <textarea
                        placeholder="Deskripsi hak akses peran..."
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono h-20 resize-none focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      Simpan Peran
                    </button>
                  </form>
                </div>

                <div className="xl:col-span-2 bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">Daftar Peran Platform</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                          <th className="py-2.5 px-3 font-normal">Nama Peran</th>
                          <th className="py-2.5 px-3 font-normal">Deskripsi</th>
                          <th className="py-2.5 px-3 font-normal text-center">Pengguna</th>
                          <th className="py-2.5 px-3 font-normal text-center">Akses Menu</th>
                          <th className="py-2.5 px-3 text-right font-normal">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                        {rolesList.map((roleObj: any) => (
                          <tr key={roleObj.id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-3 font-bold text-slate-200 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-cyan-450" />
                              {roleObj.name}
                            </td>
                            <td className="py-3 px-3 text-slate-450">{roleObj.description || '-'}</td>
                            <td className="py-3 px-3 text-center font-bold text-slate-300">{roleObj._count?.users || 0}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{roleObj._count?.menuAccesses || 0} menu</td>
                            <td className="py-3 px-3 text-right">
                              {roleObj.name !== 'SUPERADMIN' && roleObj.name !== 'USER' && (
                                <button
                                  onClick={() => deleteRole(roleObj.id)}
                                  className="text-[9px] bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900/35 px-2 py-1 rounded transition-all font-bold"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* B. Role Access Matrix Sub-tab */}
            {roleTab === 'matrix' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-955 border border-slate-850 p-4 rounded-2xl max-w-sm">
                  <label className="text-xs font-bold font-mono text-slate-400 uppercase shrink-0">Pilih Peran:</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Peran --</option>
                    {rolesList.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {selectedRoleId ? (
                  <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider">Matriks Hak Akses Menu</h4>
                      <button
                        onClick={handleSaveMatrix}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        Simpan Matriks Akses
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                            <th className="py-2 px-3 font-normal">Nama Menu</th>
                            <th className="py-2 px-3 font-normal">Key Menu</th>
                            <th className="py-2 px-3 font-normal text-center w-32">BACA (Read)</th>
                            <th className="py-2 px-3 font-normal text-center w-32">TULIS (Write)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                          {matrixAccesses.map((menuAccess: any, index: number) => (
                            <tr key={menuAccess.menuId} className="hover:bg-slate-900/40">
                              <td className="py-3 px-3 font-bold text-slate-200">{menuAccess.menuName}</td>
                              <td className="py-3 px-3 text-slate-500">/{menuAccess.menuKey}</td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={menuAccess.canRead}
                                  onChange={(e) => handleMatrixCheckboxChange(index, 'canRead', e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={menuAccess.canWrite}
                                  onChange={(e) => handleMatrixCheckboxChange(index, 'canWrite', e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 border border-slate-850 border-dashed rounded-2xl">
                    Silakan pilih peran terlebih dahulu untuk mengonfigurasi matriks hak akses.
                  </div>
                )}
              </div>
            )}

            {/* C. User Override Sub-tab */}
            {roleTab === 'override' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-955 border border-slate-850 p-4 rounded-2xl max-w-sm">
                  <label className="text-xs font-bold font-mono text-slate-400 uppercase shrink-0">Pilih User:</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih User --</option>
                    {usersList.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.legalName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {selectedUserId ? (
                  <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider">Izin Khusus Kustom (Override Peran)</h4>
                      <button
                        onClick={handleSaveUserOverrides}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        Simpan Izin Khusus
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                            <th className="py-2 px-3 font-normal">Nama Menu</th>
                            <th className="py-2 px-3 font-normal">Key Menu</th>
                            <th className="py-2 px-3 font-normal text-center w-40">Override?</th>
                            <th className="py-2 px-3 font-normal text-center w-32">BACA (Read)</th>
                            <th className="py-2 px-3 font-normal text-center w-32">TULIS (Write)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                          {userOverrides.map((override: any, index: number) => (
                            <tr key={override.menuId} className="hover:bg-slate-900/40">
                              <td className="py-3 px-3 font-bold text-slate-200">{override.menuName}</td>
                              <td className="py-3 px-3 text-slate-500">/{override.menuKey}</td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={override.hasCustomOverride}
                                  onChange={(e) => handleOverrideCheckboxChange(index, 'hasCustomOverride', e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={!override.hasCustomOverride}
                                  checked={override.canRead}
                                  onChange={(e) => handleOverrideCheckboxChange(index, 'canRead', e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer disabled:opacity-30"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={!override.hasCustomOverride}
                                  checked={override.canWrite}
                                  onChange={(e) => handleOverrideCheckboxChange(index, 'canWrite', e.target.checked)}
                                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer disabled:opacity-30"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 border border-slate-850 border-dashed rounded-2xl">
                    Silakan pilih pengguna terlebih dahulu untuk mengonfigurasi override izin khusus menu.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── 4. APP CONFIGURATION TAB ──────────────────────────────── */}
        {activeSubTab === 'config' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">Global App Settings & Menu Customizer</h3>
            
            <form onSubmit={handleSaveAppConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Settings */}
              <div className="lg:col-span-1 space-y-4 bg-slate-955 border border-slate-850 p-5 rounded-2xl">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">System Parameters</h4>
                
                {/* Maintenance Mode */}
                <div className="flex justify-between items-center py-2 border-b border-slate-850/40">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Maintenance Mode</label>
                    <span className="text-[10px] text-slate-550 block leading-tight">Mengunci seluruh akses pengguna ritel.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {maintenanceMode ? (
                      <ToggleRight className="w-9 h-9 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-655" />
                    )}
                  </button>
                </div>

                {/* Min Deposit */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Min Deposit Global ($)</label>
                  <input
                    type="number"
                    value={globalMinDeposit}
                    onChange={(e) => setGlobalMinDeposit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Global Commission */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-455 font-mono uppercase block">Komisi Global Per Lot (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={globalCommissionPct}
                    onChange={(e) => setGlobalCommissionPct(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  Simpan Semua Konfigurasi
                </button>
              </div>

              {/* Middle Branding & Metadata Settings */}
              <div className="lg:col-span-1 space-y-4 bg-slate-955 border border-slate-855 p-5 rounded-2xl">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">Branding & Meta Settings</h4>
                
                {/* App Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Judul Aplikasi (App Title)</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* App Description */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Deskripsi Aplikasi</label>
                  <textarea
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 h-20 resize-none"
                    required
                  />
                </div>

                {/* Backend URL */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Backend Server URL</label>
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* App URL */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Frontend App URL</label>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* App Version */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Versi Aplikasi (App Version)</label>
                  <input
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* App Key */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">System License Key / App Key</label>
                  <input
                    type="text"
                    value={appKey}
                    onChange={(e) => setAppKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">URL Logo Aplikasi</label>
                  <input
                    type="url"
                    value={logoUrlSetting}
                    onChange={(e) => setLogoUrlSetting(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-205 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Support Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Email Pusat Bantuan</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Support Telegram */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Telegram Username Bantuan</label>
                  <input
                    type="text"
                    value={supportTelegram}
                    onChange={(e) => setSupportTelegram(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Default Language */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-mono uppercase block">Bahasa Bawaan (Default)</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ID">Bahasa Indonesia (ID)</option>
                    <option value="EN">English (EN)</option>
                    <option value="JA">日本語 (JA)</option>
                  </select>
                </div>
              </div>

              {/* Right Security & Integrations Config */}
              <div className="lg:col-span-1 space-y-4 bg-slate-955 border border-slate-850 p-5 rounded-2xl">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">Security, SMTP & Google OAuth</h4>
                
                {/* OTP Enabled */}
                <div className="flex justify-between items-center py-2 border-b border-slate-850/40">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Login OTP Verification</label>
                    <span className="text-[10px] text-slate-550 block leading-tight">Wajibkan verifikasi OTP email saat login.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoginOtpEnabled(!loginOtpEnabled)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {loginOtpEnabled ? (
                      <ToggleRight className="w-9 h-9 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-655" />
                    )}
                  </button>
                </div>

                {/* Google OAuth Enabled */}
                <div className="flex justify-between items-center py-2 border-b border-slate-850/40">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Google OAuth Login</label>
                    <span className="text-[10px] text-slate-550 block leading-tight">Izinkan login & register via akun Google.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOauthEnabled(!oauthEnabled)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {oauthEnabled ? (
                      <ToggleRight className="w-9 h-9 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-655" />
                    )}
                  </button>
                </div>

                {/* Google Client ID */}
                {oauthEnabled && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-mono uppercase block">Google Client ID</label>
                    <input
                      type="text"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      placeholder="Masukkan Google Client ID Anda"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* SMTP Enabled */}
                <div className="flex justify-between items-center py-2 border-b border-slate-850/40">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">Real SMTP Service</label>
                    <span className="text-[10px] text-slate-550 block leading-tight">Aktifkan pengiriman email riil via SMTP.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmtpEnabled(!smtpEnabled)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {smtpEnabled ? (
                      <ToggleRight className="w-9 h-9 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-655" />
                    )}
                  </button>
                </div>

                {/* SMTP Server Configurations */}
                {smtpEnabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 font-mono uppercase block">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 font-mono uppercase block">SMTP Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 font-mono uppercase block">SMTP Username</label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 font-mono uppercase block">SMTP Password</label>
                      <input
                        type="password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 font-mono uppercase block">SMTP Sender Address</label>
                      <input
                        type="text"
                        value={smtpSender}
                        onChange={(e) => setSmtpSender(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ─── 5. REVENUE TAB ────────────────────────────────────────── */}
        {activeSubTab === 'revenue' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Financial KPI Analytics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-955 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">MRR (SaaS Revenue)</span>
                <span className="text-lg font-black font-mono text-slate-100">$12,450</span>
              </div>
              <div className="bg-slate-955 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Subscribers</span>
                <span className="text-lg font-black font-mono text-slate-100">254</span>
              </div>
              <div className="bg-slate-955 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Churn Rate (Monthly)</span>
                <span className="text-lg font-black font-mono text-rose-400">1.8%</span>
              </div>
              <div className="bg-slate-955 border border-slate-850 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Affiliate Payouts</span>
                <span className="text-lg font-black font-mono text-emerald-450">$1,240</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 6. SERVER HEALTH TAB ──────────────────────────────────── */}
        {activeSubTab === 'health' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">System Health & Server Monitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CPU */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-455 flex items-center gap-1"><Cpu className="w-4 h-4 text-cyan-400" /> CPU Load</span>
                  <span className="text-slate-100 font-bold">{cpu}%</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${cpu}%` }}
                  />
                </div>
              </div>

              {/* RAM */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-455 flex items-center gap-1"><HardDrive className="w-4 h-4 text-purple-400" /> Memory Usage</span>
                  <span className="text-slate-100 font-bold">{ram}%</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${ram}%` }}
                  />
                </div>
              </div>

              {/* Latency */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-455 flex items-center gap-1"><Wifi className="w-4 h-4 text-emerald-400" /> API Latency</span>
                  <span className="text-emerald-400 font-bold">{latency} ms</span>
                </div>
                <div className="bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${(latency / 30) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── 7. FINANCIAL QUEUE TAB ────────────────────────────────── */}
        {activeSubTab === 'financial' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Pending Deposits Verification Queue</h3>
              {adminDeposits.length === 0 ? (
                <div className="p-4 bg-slate-955 border border-slate-855 rounded-2xl text-center text-xs text-slate-500 font-mono">
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
                        <th className="py-3 px-4 text-right font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminDeposits.map((dep) => (
                        <tr key={dep.id} className="border-b border-slate-850/40 text-xs font-mono text-slate-300 hover:bg-slate-850/20">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{dep.wallet.user.legalName}</span>
                            <span className="text-[10px] text-slate-550">{dep.wallet.user.email}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-cyan-400">
                            ${dep.amount.toLocaleString()} {dep.wallet.currency}
                          </td>
                          <td className="py-3 px-4 text-slate-405">{dep.paymentMethod}</td>
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
          </div>
        )}

        {/* ─── 8. B2B WHITE-LABEL TAB ────────────────────────────────── */}
        {activeSubTab === 'whitelabel' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Institutional White-Labeling Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Logo & Theme Color */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-5">
                <h4 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">Dynamic Styling</h4>
                
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
                      <span className="text-[10px] text-slate-550">Geser warna untuk mengganti tema aksen instan.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] text-slate-455 font-mono uppercase block">Logo Institusi Kustom</label>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-32 border border-slate-800 rounded-xl flex items-center justify-center bg-slate-900 relative overflow-hidden shrink-0">
                      {customLogoUrl ? (
                        <img src={customLogoUrl} alt="Custom Logo" className="max-h-10 object-contain px-2" />
                      ) : (
                        <span className="text-[9px] text-slate-550 font-mono uppercase">LOGO DEFAULT</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <label className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-355 hover:text-slate-150 text-[10px] font-bold font-mono rounded-xl cursor-pointer transition-all duration-300 inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Pilih Logo
                        <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </label>
                      {customLogoUrl && (
                        <button
                          onClick={handleResetLogo}
                          className="text-[9px] text-rose-455 hover:text-rose-400 font-mono underline block"
                        >
                          Reset ke Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subdomain Management */}
              <div className="bg-slate-955 border border-slate-855 p-5 rounded-2xl space-y-4">
                <h4 className="text-[11px] font-bold font-mono text-slate-455 uppercase tracking-wider border-b border-slate-850 pb-2">Custom Subdomain Management</h4>
                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-555 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="p-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 rounded-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {customSubdomains.map((dom) => (
                    <div key={dom} className="flex bg-slate-900 border border-slate-855 rounded-xl p-2.5 justify-between items-center">
                      <span className="text-xs text-slate-250 font-mono">{dom}</span>
                      <button
                        onClick={() => handleRemoveDomain(dom)}
                        className="p-1.5 hover:bg-slate-800 hover:text-rose-450 text-slate-555 rounded-lg transition-all duration-300"
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

        {/* ─── 9. B2B TENANT SUBSCRIPTIONS ───────────────────────────── */}
        {activeSubTab === 'b2b' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Form Create Subscription */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">
                  Tambah Subscription Tenant
                </h4>
                <form onSubmit={handleCreateTenantSub} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Pilih Tenant</label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {tenants.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.domain})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Nama Plan</label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Harga ($)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Durasi (Hari)</label>
                      <input
                        type="number"
                        value={validDays}
                        onChange={(e) => setValidDays(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Create Subscription
                  </button>
                </form>
              </div>

              {/* Tenants List & Subscription History */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">
                    B2B Tenant Subscriptions
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                          <th className="py-2 px-3 font-normal">Tenant</th>
                          <th className="py-2 px-3 font-normal">Plan</th>
                          <th className="py-2 px-3 font-normal">Price</th>
                          <th className="py-2 px-3 font-normal">Valid Until</th>
                          <th className="py-2 px-3 font-normal">Status</th>
                          <th className="py-2 px-3 text-right font-normal">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-355">
                        {tenantSubscriptions.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-bold text-slate-200">
                              {sub.tenant?.name}
                              <span className="text-[9px] text-slate-500 block font-normal">{sub.tenant?.domain}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-305">{sub.planName}</td>
                            <td className="py-2.5 px-3 font-bold text-cyan-404">${sub.price.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-slate-450">{new Date(sub.validUntil).toLocaleDateString('id-ID')}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                sub.status === 'ACTIVE' 
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/35'
                                  : 'bg-rose-955 text-rose-400 border border-rose-900/35'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {sub.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => updateTenantSubscriptionStatus(sub.id, 'EXPIRED')}
                                  className="text-[9px] bg-slate-900 hover:bg-rose-955 hover:text-rose-405 border border-slate-800 px-2 py-1 rounded transition-all font-bold"
                                >
                                  Expire
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateTenantSubscriptionStatus(sub.id, 'ACTIVE')}
                                  className="text-[9px] bg-slate-900 hover:bg-emerald-955 hover:text-emerald-405 border border-slate-800 px-2 py-1 rounded transition-all font-bold"
                                >
                                  Activate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {tenantSubscriptions.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-slate-500">No B2B subscriptions found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── 10. SYSTEM MENU MANAGEMENT TAB ────────────────────────── */}
        {activeSubTab === 'menus' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Left Form: Add New Menu */}
              <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">
                  Tambah Menu Navigasi Baru
                </h4>
                <form onSubmit={handleCreateMenu} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Menu Key (ID Unik)</label>
                    <input
                      type="text"
                      placeholder="e.g. trading_stats"
                      value={newMenuKey}
                      onChange={(e) => setNewMenuKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-455 uppercase font-mono block mb-1">Nama Menu</label>
                    <input
                      type="text"
                      placeholder="e.g. Statistik Trading"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Path Halaman</label>
                    <input
                      type="text"
                      placeholder="e.g. stats"
                      value={newMenuPath}
                      onChange={(e) => setNewMenuPath(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Ikon Lucide</label>
                      <input
                        type="text"
                        placeholder="e.g. LineChart"
                        value={newMenuIcon}
                        onChange={(e) => setNewMenuIcon(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1">Urutan (Order)</label>
                      <input
                        type="number"
                        value={newMenuOrder}
                        onChange={(e) => setNewMenuOrder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    Tambah Menu Ke DB
                  </button>
                </form>
              </div>

              {/* Right Table: Database Menu List */}
              <div className="xl:col-span-2 bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2">
                  Daftar Menu Sistem dari Database
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider font-bold">
                        <th className="py-2 px-3 font-normal w-12 text-center">No</th>
                        <th className="py-2 px-3 font-normal w-12 text-center">Ikon</th>
                        <th className="py-2 px-3 font-normal">Nama / Key</th>
                        <th className="py-2 px-3 font-normal">Path</th>
                        <th className="py-2 px-3 font-normal w-24">Status</th>
                        <th className="py-2 px-3 text-right font-normal w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                      {systemMenus.map((menu: any) => {
                        const isEditing = editingMenuId === menu.id;
                        return (
                          <tr key={menu.id} className="hover:bg-slate-900/40 transition-colors">
                            
                            {/* Order */}
                            <td className="py-2 px-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editMenuOrder}
                                  onChange={(e) => setEditMenuOrder(e.target.value)}
                                  className="w-12 bg-slate-900 border border-slate-800 rounded p-1 text-center text-slate-200 text-xs font-mono focus:outline-none"
                                />
                              ) : (
                                <span className="font-bold text-slate-450">{menu.order}</span>
                              )}
                            </td>

                            {/* Icon Preview */}
                            <td className="py-2 px-3 text-center text-slate-400 font-bold">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editMenuIcon}
                                  onChange={(e) => setEditMenuIcon(e.target.value)}
                                  className="w-20 bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs font-mono focus:outline-none"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-455 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                                  {menu.iconName}
                                </span>
                              )}
                            </td>

                            {/* Name & Key */}
                            <td className="py-2 px-3">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editMenuName}
                                    onChange={(e) => setEditMenuName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs font-mono focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={editMenuKey}
                                    onChange={(e) => setEditMenuKey(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-500 text-[10px] font-mono focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className="font-bold text-slate-202 block">{menu.name}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">ID: {menu.key}</span>
                                </div>
                              )}
                            </td>

                            {/* Path */}
                            <td className="py-2 px-3 text-slate-400">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editMenuPath}
                                  onChange={(e) => setEditMenuPath(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs font-mono focus:outline-none"
                                />
                              ) : (
                                <span className="text-slate-400">{"/"}{menu.path}</span>
                              )}
                            </td>

                            {/* Active Toggle */}
                            <td className="py-2 px-3">
                              {isEditing ? (
                                <select
                                  value={editMenuIsActive ? 'true' : 'false'}
                                  onChange={(e) => setEditMenuIsActive(e.target.value === 'true')}
                                  className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-250 text-xs font-mono focus:outline-none"
                                >
                                  <option value="true">ACTIVE</option>
                                  <option value="false">INACTIVE</option>
                                </select>
                              ) : (
                                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
                                  menu.isActive 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                                    : 'bg-rose-955 text-rose-400 border border-rose-900/30'
                                }`}>
                                  {menu.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-2 px-3 text-right">
                              {isEditing ? (
                                <div className="space-x-1.5 flex justify-end">
                                  <button
                                    onClick={() => handleUpdateMenu(menu.id)}
                                    className="px-2 py-1 bg-cyan-600 hover:bg-cyan-755 text-white font-bold rounded text-[10px] transition-all"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingMenuId(null)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-404 rounded text-[10px] transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="space-x-1.5 flex justify-end">
                                  <button
                                    onClick={() => handleStartEditMenu(menu)}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[10px] transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteSystemMenu(menu.id)}
                                    className="px-2 py-1 bg-rose-955 hover:bg-rose-900 text-rose-404 border border-rose-900/20 rounded text-[10px] transition-all"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                      {systemMenus.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-550 font-mono">No system menus found in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
