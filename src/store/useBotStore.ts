import { create } from 'zustand';
import { BotStatus, BotConfig, TradeRecord, AiLog, AccountStats, OhlcvData, AIStrategyParams, BacktestResult } from '../types';
import { mockSocketService } from '../services/mockSocket';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface UserSession {
  id: string;
  email: string;
  legalName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN' | 'SUPERADMIN';
  tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  twoFactorOn?: boolean;
  phone?: string;
  country?: string;
  kycStatus?: string;
}

interface BotState {
  status: BotStatus;
  config: BotConfig;
  stats: AccountStats;
  activeTrades: TradeRecord[];
  tradeHistory: TradeRecord[];
  logs: AiLog[];
  chartData: Record<string, OhlcvData[]>;
  selectedPair: string;
  user: UserSession | null;
  
  // Actions
  setStatus: (status: BotStatus) => Promise<void>;
  updateConfig: (config: Partial<BotConfig>) => Promise<void>;
  setSelectedPair: (pair: string) => void;
  addTrade: (trade: TradeRecord) => void;
  closeTrade: (id: string, exitPrice: number, profit: number) => void;
  panicSell: () => Promise<void>;
  addLog: (message: string, level: AiLog['level']) => void;
  clearLogs: () => void;
  updateStats: (stats: Partial<AccountStats>) => void;
  setChartData: (pair: string, data: OhlcvData[]) => void;
  addChartTick: (pair: string, tick: OhlcvData) => void;
  
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // SaaS Actions
  login: (email: string, password: string) => Promise<any>;
  faceIdLogin: (email: string) => Promise<any>;
  loginDemo: () => void;
  logout: () => void;
  upgradeSubscription: (tier: string) => Promise<void>;
  setup2fa: (code: string) => Promise<{ success: boolean }>;
  updateProfile: (data: { legalName?: string; phone?: string; country?: string; newPassword?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isUpgradeOpen: boolean;
  setUpgradeOpen: (open: boolean) => void;

  // Real Data Integrations
  initSession: () => Promise<void>;
  executeRealTrade: (pair: string, type: 'BUY' | 'SELL', lotSize: number, entryPrice: number) => Promise<void>;

  // Fase 10: Backtesting State & Actions
  strategyParams: AIStrategyParams;
  backtestStatus: 'IDLE' | 'RUNNING' | 'COMPLETED';
  backtestProgress: number;
  backtestResult: BacktestResult | null;
  updateStrategyParams: (params: Partial<AIStrategyParams>) => void;
  runBacktest: () => void;
  resetBacktest: () => void;
  
  // Notifications State & Actions
  notifications: Array<{ id: string; message: string; read: boolean; timestamp: string }>;
  addNotification: (message: string) => void;
  markAllAsRead: () => void;

  // Audit Trail & B2B White-Labeling
  auditLogs: Array<{ id: string; timestamp: string; action: string; ipAddress: string; status: string }>;
  addAuditLog: (action: string, status?: string) => void;
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;
  customSubdomains: string[];
  addCustomSubdomain: (domain: string) => void;
  removeCustomSubdomain: (domain: string) => void;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  setKycStatus: (status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED') => void;

  // Fintech & Broker Integrations
  wallets: any[];
  vpsInstance: any | null;
  brokerAccounts: any[];
  adminDeposits: any[];
  adminWithdrawals: any[];
  fetchWallets: () => Promise<void>;
  requestDeposit: (currency: string, amount: number, paymentMethod: string, file: File | null) => Promise<any>;
  requestWithdrawal: (currency: string, amount: number, paymentMethod: string, payoutDetails: string) => Promise<void>;
  fetchVps: () => Promise<void>;
  deployVps: (planName: string, region: string) => Promise<void>;
  fetchBrokerAccounts: () => Promise<void>;
  linkBrokerAccount: (data: { brokerName: string; accountNumber: string; passwordCipher: string; serverAddress: string; leverage: number }) => Promise<void>;
  fetchAdminFinancialQueue: () => Promise<void>;
  approveAdminDeposit: (id: string) => Promise<void>;
  rejectAdminDeposit: (id: string) => Promise<void>;
  approveAdminWithdrawal: (id: string) => Promise<void>;
  rejectAdminWithdrawal: (id: string) => Promise<void>;
  adminSubscriptionPlans: any[];
  fetchAdminSubscriptionPlans: () => Promise<void>;
  createAdminSubscriptionPlan: (data: any) => Promise<void>;
  updateAdminSubscriptionPlan: (id: string, data: any) => Promise<void>;
  deleteAdminSubscriptionPlan: (id: string) => Promise<void>;

  // B2B White-Labeling Actions
  initTenant: () => Promise<void>;
  updateTenantTheme: (primaryColor: string, secondaryColor: string) => Promise<void>;
  uploadTenantLogo: (file: File) => Promise<void>;

  // Affiliate, Support, and Loyalty Integrations
  affiliateStats: any | null;
  supportTickets: any[];
  supportArticles: any[];
  loyaltyStatus: any | null;
  fetchAffiliateStats: () => Promise<void>;
  requestAffiliatePayout: (amount: number, paymentMethod: string, payoutDetails: string) => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  createSupportTicket: (subject: string, category: string, description: string, priority: string) => Promise<void>;
  fetchSupportArticles: () => Promise<void>;
  fetchLoyaltyStatus: () => Promise<void>;
  claimLoyaltyReward: (rewardName: string, pointsSpent: number) => Promise<void>;
  economicEvents: any[];
  newsSentiments: any[];
  fetchEconomicEvents: () => Promise<void>;
  fetchNewsSentiments: () => Promise<void>;
  pammPools: any[];
  pammInvestors: any[];
  pammPayouts: any[];
  apiKeys: any[];
  priceAlerts: any[];
  fetchPammPools: () => Promise<void>;
  createPammPool: (name: string, description: string, minInvestment: number, performanceFeePct: number) => Promise<void>;
  fetchPammInvestors: (poolId: string) => Promise<void>;
  savePammAllocation: (poolId: string, method: string, allocations?: any[]) => Promise<void>;
  fetchPammPayouts: () => Promise<void>;
  fetchApiKeys: () => Promise<void>;
  generateApiKey: (name: string, permission: string) => Promise<any>;
  revokeApiKey: (id: string, name: string) => Promise<void>;
  fetchPriceAlerts: () => Promise<void>;
  createPriceAlert: (symbol: string, targetPrice: number, condition: string) => Promise<void>;
  deletePriceAlert: (id: string) => Promise<void>;
  leaders: any[];
  copyConnections: any[];
  fetchLeaders: () => Promise<void>;
  fetchCopyConnections: () => Promise<void>;
  startCopying: (leaderId: string, multiplier: number) => Promise<void>;
  stopCopying: (connectionId: string) => Promise<void>;
  // Inbox
  inboxMessages: any[];
  fetchInbox: () => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  markAllMessagesRead: () => Promise<void>;
  deleteInboxMessage: (id: string) => Promise<void>;
  // BacktestHistory
  backtestHistoryList: any[];
  fetchBacktestHistory: () => Promise<void>;
  saveBacktestResult: (strategyName: string, params: any, result: any) => Promise<void>;
  deleteBacktestHistory: (id: string) => Promise<void>;
  // Subscription
  subscriptionPlans: any[];
  currentSubscription: any | null;
  invoices: any[];
  fetchSubscriptionPlans: () => Promise<void>;
  fetchCurrentSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;

  // Additional 6 Schema Gaps
  dbAuditLogs: any[];
  fetchDbAuditLogs: () => Promise<void>;
  kycDocuments: any[];
  fetchKycDocuments: () => Promise<void>;
  submitKycDoc: (data: { documentType: string; documentNumber: string; fileUrl: string }) => Promise<void>;
  brokerSyncLogs: Record<string, any[]>;
  fetchBrokerSyncLogs: (accountId: string) => Promise<void>;
  syncBrokerAccount: (accountId: string) => Promise<void>;
  strategyLicenses: any[];
  fetchStrategyLicenses: () => Promise<void>;
  generateStrategyLicense: (data: { ipBound?: string; validDays?: number }) => Promise<any>;
  revokeStrategyLicense: (id: string) => Promise<void>;
  orderExecutionLogs: any[];
  fetchOrderExecutionLogs: () => Promise<void>;
  tenants: any[];
  tenantSubscriptions: any[];
  fetchAllTenants: () => Promise<void>;
  fetchTenantSubscriptions: () => Promise<void>;
  createTenantSubscription: (data: { tenantId: string; planName: string; price: number; validDays?: number }) => Promise<void>;
  updateTenantSubscriptionStatus: (id: string, status: string) => Promise<void>;

  // User & App Config Management
  usersList: any[];
  appConfig: any | null;
  fetchUsersList: () => Promise<void>;
  updateUserStatus: (id: string, status: string) => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  fetchAppConfig: () => Promise<void>;
  updateAppConfig: (config: any) => Promise<void>;

  // System Menu Management
  systemMenus: any[];
  fetchSystemMenus: () => Promise<void>;
  createSystemMenu: (data: any) => Promise<void>;
  updateSystemMenu: (id: string, data: any) => Promise<void>;
  deleteSystemMenu: (id: string) => Promise<void>;

  // Roles & Permissions
  rolesList: any[];
  roleMenuAccesses: any[];
  userMenuPermissions: any[];
  myAuthorizedMenus: any[];
  fetchRolesList: () => Promise<void>;
  createRole: (data: any) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  fetchRoleMenuAccess: (roleId: string) => Promise<void>;
  saveRoleMenuAccess: (roleId: string, accesses: any[]) => Promise<void>;
  fetchUserMenuPermissions: (userId: string) => Promise<void>;
  saveUserMenuPermissions: (userId: string, permissions: any[]) => Promise<void>;
  fetchMyAuthorizedMenus: () => Promise<void>;

  // Advanced Auth Flow Actions
  registerUser: (data: any) => Promise<any>;
  verifyAccount: (token: string) => Promise<any>;
  verifyOtp: (email: string, code: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  googleLogin: (data: any) => Promise<any>;
}




const initialConfig: BotConfig = {
  riskLevel: 'MODERATE',
  tradeSize: 0.1,
  maxDrawdown: 5.0,
  targetPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
};

const initialStats: AccountStats = {
  balance: 10000.00,
  equity: 10000.00,
  margin: 0.00,
  winRate: 72.5,
  totalTrades: 48,
  totalProfit: 1450.25,
};

const initialHistory: TradeRecord[] = [
  {
    id: 'TX-9821',
    pair: 'EUR/USD',
    type: 'BUY',
    entryPrice: 1.0854,
    exitPrice: 1.0872,
    lotSize: 0.2,
    profit: 36.00,
    status: 'CLOSED',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    closedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  }
];

const defaultStrategyParams: AIStrategyParams = {
  riskRewardRatio: 2.0,
  riskPercentage: 2.0,
  newsFilter: true,
  maCrossover: true,
  rsiFilter: true,
  volatilityStop: true
};

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const useBotStore = create<BotState>((set, get) => ({
  status: 'IDLE',
  wallets: [],
  vpsInstance: null,
  brokerAccounts: [],
  adminDeposits: [],
  adminWithdrawals: [],
  affiliateStats: null,
  supportTickets: [],
  supportArticles: [],
  loyaltyStatus: null,
  economicEvents: [],
  newsSentiments: [],
  pammPools: [],
  pammInvestors: [],
  pammPayouts: [],
  apiKeys: [],
  priceAlerts: [],
  leaders: [],
  copyConnections: [],
  inboxMessages: [],
  backtestHistoryList: [],
  subscriptionPlans: [],
  currentSubscription: null,
  invoices: [],
  config: initialConfig,
  stats: initialStats,
  activeTrades: [],
  tradeHistory: initialHistory,
  logs: [
    {
      id: 'L-1',
      timestamp: new Date().toISOString(),
      message: 'Sistem Bot AI diinisialisasi. Menunggu autentikasi pengguna...',
      level: 'INFO',
    }
  ],
  chartData: {},
  selectedPair: 'EUR/USD',
  user: null,
  notifications: [],
  auditLogs: [
    {
      id: 'AUD-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      action: 'User Login',
      ipAddress: '182.16.24.105',
      status: 'SUCCESS'
    }
  ],
  customLogoUrl: null,
  customSubdomains: ['app.forexbot.ai', 'trading.forexbot.ai'],
  kycStatus: 'NOT_SUBMITTED',
  rolesList: [],
  roleMenuAccesses: [],
  userMenuPermissions: [],
  myAuthorizedMenus: [],
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  initSession: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const profile = await response.json();
        set({
          user: {
            id: profile.id,
            email: profile.email,
            legalName: profile.legalName,
            role: profile.role,
            tier: profile.tier || 'BASIC',
            twoFactorOn: profile.twoFactorOn
          },
          kycStatus: profile.kycStatus,
          config: {
            riskLevel: profile.botConfig?.riskTolerance >= 3.0 ? 'AGGRESSIVE' : (profile.botConfig?.riskTolerance <= 1.0 ? 'CONSERVATIVE' : 'MODERATE'),
            tradeSize: profile.botConfig?.lotMultiplier || 0.1,
            maxDrawdown: profile.botConfig?.maxDrawdown || 20.0,
            targetPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD']
          }
        });

        // Auto-connect WebSocket when session is restored
        mockSocketService.connect();
        get().fetchMyAuthorizedMenus();
      } else {
        // Token expired or invalid
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
    }
  },

  setStatus: async (status) => {
    let success = true;
    const currentStore = get();

    // Paywall and validation checks
    if (status === 'RUNNING' && currentStore.user) {
      if (currentStore.user.tier === 'FREE' && currentStore.selectedPair !== 'EUR/USD') {
        success = false;
        set((state) => ({
          logs: [
            {
              id: `L-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: `[Paywall] Gagal memulai: Fitur Multi-Pair terkunci pada paket FREE.`,
              level: 'ERROR',
            },
            ...state.logs
          ]
        }));
      }
    }

    if (!success) {
      get().addAuditLog(`Bot Status Update to ${status} Failed (Paywall)`, 'FAILED');
      return;
    }

    try {
      const endpoint = status === 'RUNNING' ? 'start' : 'stop';
      const response = await fetch(`${getApiUrl()}/trading/bot/${endpoint}`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        set({ status });
        get().addAuditLog(`Bot Status Updated to ${status}`);
        
        if (status === 'IDLE') {
          // If stopped, clear active trades locally
          set({ activeTrades: [] });
        }
      } else {
        console.error('Failed to update bot status on server');
      }
    } catch (err) {
      console.error('Error updating bot status:', err);
    }
  },
  
  updateConfig: async (newConfig) => {
    set((state) => ({
      config: { ...state.config, ...newConfig }
    }));

    try {
      const riskTolerance = newConfig.riskLevel === 'AGGRESSIVE' ? 3.0 : (newConfig.riskLevel === 'CONSERVATIVE' ? 1.0 : 2.0);
      await fetch(`${getApiUrl()}/trading/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          riskTolerance,
          lotMultiplier: newConfig.tradeSize,
          maxDrawdown: newConfig.maxDrawdown
        })
      });
      get().addAuditLog('Bot Configuration Updated');
    } catch (err) {
      console.error('Failed to sync bot config to server:', err);
    }
  },
  
  setSelectedPair: (selectedPair) => set((state) => {
    if (state.status === 'RUNNING' && state.user?.tier === 'FREE' && selectedPair !== 'EUR/USD') {
      return {
        logs: [
          {
            id: `L-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `[Paywall] Pergantian Pair diabaikan: Fitur Premium terkunci untuk akun FREE.`,
            level: 'WARNING',
          },
          ...state.logs
        ]
      };
    }
    return { selectedPair };
  }),
  
  addTrade: (trade) => set((state) => {
    const updatedActive = [trade, ...state.activeTrades];
    const margin = updatedActive.reduce((sum, t) => sum + t.lotSize * 1000, 0);
    return {
      activeTrades: updatedActive,
      stats: { ...state.stats, margin }
    };
  }),

  executeRealTrade: async (pair, type, lotSize, entryPrice) => {
    // Bypass API for FREE tier
    if (get().user?.tier === 'FREE') {
      const newTrade: TradeRecord = {
        id: 'MOCK-' + Math.floor(Math.random() * 10000),
        pair,
        type,
        entryPrice,
        lotSize,
        status: 'OPEN',
        timestamp: new Date().toISOString()
      };
      get().addTrade(newTrade);
      get().addLog(
        `[Eksekusi AI - MOCK] ORDER DUMMY BERHASIL: ${type} ${pair} pada harga ${entryPrice}. Ukuran Lot: ${lotSize}. ID: ${newTrade.id}`,
        'SUCCESS'
      );
      get().addNotification(`Order Baru (Dummy): ${type} ${pair} dibuka pada harga ${entryPrice} (Lot: ${lotSize})`);
      get().addAuditLog(`Mock Order Executed: ${type} ${pair} (Lot: ${lotSize})`);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/trading/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          currencyPair: pair,
          tradeType: type,
          lotSize,
          entryPrice
        })
      });

      if (response.ok) {
        const data = await response.json();
        const mainTrade = data.mainTrade;

        const newTrade: TradeRecord = {
          id: mainTrade.id.substring(0, 8),
          pair: mainTrade.currencyPair,
          type: mainTrade.tradeType as any,
          entryPrice: mainTrade.entryPrice,
          lotSize: mainTrade.lotSize,
          status: 'OPEN',
          timestamp: mainTrade.executedAt
        };

        get().addTrade(newTrade);
        get().addLog(
          `[Eksekusi AI] ORDER RIIL BERHASIL: ${type} ${pair} pada harga ${entryPrice}. Ukuran Lot: ${lotSize}. ID: ${newTrade.id}`,
          'SUCCESS'
        );
        get().addNotification(`Order Baru: ${type} ${pair} dibuka pada harga ${entryPrice} (Lot: ${lotSize})`);
        get().addAuditLog(`Order Executed: ${type} ${pair} (Lot: ${lotSize})`);
      }
    } catch (err) {
      console.error('Failed to execute real trade:', err);
    }
  },
  
  closeTrade: (id, exitPrice, profit) => set((state) => {
    const tradeToClose = state.activeTrades.find(t => t.id === id);
    if (!tradeToClose) return {};
    
    const closedTrade: TradeRecord = {
      ...tradeToClose,
      exitPrice,
      profit,
      status: 'CLOSED',
      closedAt: new Date().toISOString()
    };
    
    const remainingActive = state.activeTrades.filter(t => t.id !== id);
    const newHistory = [closedTrade, ...state.tradeHistory];
    
    const newBalance = state.stats.balance + profit;
    const margin = remainingActive.reduce((sum, t) => sum + t.lotSize * 1000, 0);
    const totalTrades = state.stats.totalTrades + 1;
    const profitableTrades = newHistory.filter(t => (t.profit || 0) > 0).length;
    const winRate = parseFloat(((profitableTrades / totalTrades) * 100).toFixed(1));
    const totalProfit = state.stats.totalProfit + profit;

    return {
      activeTrades: remainingActive,
      tradeHistory: newHistory,
      stats: {
        ...state.stats,
        balance: parseFloat(newBalance.toFixed(2)),
        equity: parseFloat(newBalance.toFixed(2)),
        margin,
        totalTrades,
        winRate,
        totalProfit: parseFloat(totalProfit.toFixed(2))
      }
    };
  }),
  
  panicSell: async () => {
    const store = get();
    if (store.activeTrades.length === 0) {
      set((state) => ({
        status: 'PANIC',
        logs: [
          {
            id: `L-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: 'Picu PANIC SELL: Tidak ada posisi aktif untuk ditutup.',
            level: 'WARNING',
          },
          ...state.logs
        ]
      }));
      return;
    }

    try {
      // Call stop bot on server which closes all positions in DB
      await fetch(`${getApiUrl()}/trading/bot/stop`, {
        method: 'POST',
        headers: getHeaders()
      });

      const closedTrades: TradeRecord[] = store.activeTrades.map(t => ({
        ...t,
        exitPrice: t.entryPrice * 0.999,
        profit: parseFloat((t.type === 'BUY' ? -t.entryPrice * 0.001 * t.lotSize * 100000 : t.entryPrice * 0.001 * t.lotSize * 100000).toFixed(2)),
        status: 'CLOSED',
        closedAt: new Date().toISOString()
      }));
      
      const totalPanicProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
      const newHistory = [...closedTrades, ...store.tradeHistory];
      const newBalance = store.stats.balance + totalPanicProfit;
      const totalTrades = store.stats.totalTrades + closedTrades.length;
      const profitableTrades = newHistory.filter(t => (t.profit || 0) > 0).length;
      const winRate = parseFloat(((profitableTrades / totalTrades) * 100).toFixed(1));
      const totalProfit = store.stats.totalProfit + totalPanicProfit;

      set({
        status: 'PANIC',
        activeTrades: [],
        tradeHistory: newHistory,
        stats: {
          ...store.stats,
          balance: parseFloat(newBalance.toFixed(2)),
          equity: parseFloat(newBalance.toFixed(2)),
          margin: 0,
          totalTrades,
          winRate,
          totalProfit: parseFloat(totalProfit.toFixed(2))
        },
        logs: [
          {
            id: `L-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `!!! PANIC SELL TRIGGERED !!! Menutup ${closedTrades.length} posisi secara paksa pada server database. Bot dinonaktifkan.`,
            level: 'ERROR',
          },
          ...store.logs
        ]
      });

      get().addAuditLog('Panic Sell Triggered - Closed All Positions on Server');
    } catch (err) {
      console.error('Failed to trigger panic sell on server:', err);
    }
  },
  
  addLog: (message, level) => set((state) => ({
    logs: [
      {
        id: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        message,
        level,
      },
      ...state.logs
    ].slice(0, 100)
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats }
  })),
  
  setChartData: (pair, data) => set((state) => ({
    chartData: { ...state.chartData, [pair]: data }
  })),
  
  addChartTick: (pair, tick) => set((state) => {
    const currentData = state.chartData[pair] || [];
    let updatedData = [...currentData];
    
    if (updatedData.length > 0) {
      const lastBar = updatedData[updatedData.length - 1];
      if (lastBar.time === tick.time) {
        updatedData[updatedData.length - 1] = tick;
      } else {
        updatedData.push(tick);
      }
    } else {
      updatedData.push(tick);
    }
    
    if (updatedData.length > 500) {
      updatedData = updatedData.slice(updatedData.length - 500);
    }
    
    return {
      chartData: { ...state.chartData, [pair]: updatedData }
    };
  }),

  // SaaS Actions
  login: async (email, password) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      if (data.status === 'OTP_REQUIRED') {
        return { status: 'OTP_REQUIRED', email: data.email };
      }

      localStorage.setItem('token', data.access_token);

      set((state) => ({
        user: {
          id: data.user.id,
          email: data.user.email,
          legalName: data.user.legalName,
          role: data.user.role,
          tier: data.user.tier || 'BASIC',
          twoFactorOn: data.user.twoFactorOn
        },
        kycStatus: data.user.kycStatus,
        logs: [
          {
            id: `L-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `Pengguna masuk: ${data.user.email} (Peran: ${data.user.role})`,
            level: 'SUCCESS',
          },
          ...state.logs
        ]
      }));

      get().addAuditLog(`User Login: ${data.user.email}`);
      get().fetchMyAuthorizedMenus();
      mockSocketService.connect();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to log in:', err);
      return { success: false, error: err.message };
    }
  },

  faceIdLogin: async (email) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/faceid-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'FaceID login gagal.');
      }

      localStorage.setItem('token', data.access_token);

      set((state) => ({
        user: {
          id: data.user.id,
          email: data.user.email,
          legalName: data.user.legalName,
          role: data.user.role,
          tier: data.user.tier || 'BASIC',
          twoFactorOn: data.user.twoFactorOn
        },
        kycStatus: data.user.kycStatus,
        logs: [
          {
            id: `L-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `Pengguna masuk via FaceID: ${data.user.email} (Peran: ${data.user.role})`,
            level: 'SUCCESS',
          },
          ...state.logs
        ]
      }));

      get().addAuditLog(`User FaceID Login: ${data.user.email}`);
      get().fetchMyAuthorizedMenus();
      mockSocketService.connect();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to log in via FaceID:', err);
      return { success: false, error: err.message };
    }
  },
  
  loginDemo: () => {
    localStorage.setItem('token', 'demo-token-123');
    set((state) => ({
      user: {
        id: 'demo-user-id',
        email: 'demo@forexbot.ai',
        legalName: 'Demo Account (Mock)',
        role: 'USER',
        tier: 'FREE'
      },
      kycStatus: 'APPROVED',
      status: 'IDLE',
      activeTrades: [],
      tradeHistory: [
        {
          id: 'T-DEMO1',
          pair: 'EUR/USD',
          type: 'BUY',
          entryPrice: 1.0855,
          exitPrice: 1.0875,
          lotSize: 0.1,
          profit: 20.00,
          status: 'CLOSED',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          closedAt: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 'T-DEMO2',
          pair: 'GBP/USD',
          type: 'SELL',
          entryPrice: 1.2720,
          exitPrice: 1.2705,
          lotSize: 0.2,
          profit: 30.00,
          status: 'CLOSED',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          closedAt: new Date(Date.now() - 6000000).toISOString()
        }
      ],
      logs: [
        {
          id: `L-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Membuka sesi demonstrasi instan menggunakan data simulasi.',
          level: 'INFO'
        }
      ]
    }));
    get().addAuditLog('Demo User Login');
    mockSocketService.connect();
  },

  logout: () => {
    const userEmail = get().user?.email;
    localStorage.removeItem('token');
    
    set((state) => ({
      user: null,
      status: 'IDLE',
      activeTrades: [],
      logs: [
        {
          id: `L-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Pengguna keluar. Menghentikan semua aktivitas bot.',
          level: 'WARNING',
        },
        ...state.logs
      ]
    }));

    mockSocketService.disconnect();
    get().addAuditLog(`User Logout: ${userEmail}`);
  },
  
  upgradeSubscription: async (tier) => {
    try {
      const response = await fetch(`${getApiUrl()}/subscription/upgrade`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ tier })
      });
      const data = await response.json();
      if (response.ok) {
        set((state) => ({
          user: state.user ? { ...state.user, tier: data.tier } : null,
          currentSubscription: data,
          logs: [
            {
              id: `L-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: `Berhasil upgrade ke ${data.planName}. Berlaku hingga ${new Date(data.validUntil).toLocaleDateString('id-ID')}.`,
              level: 'SUCCESS',
            },
            ...state.logs
          ]
        }));
        get().addAuditLog(`Subscription Upgraded to ${tier}`);
        get().addNotification(`Upgrade berhasil! Lisensi Anda sekarang: ${data.planName}`);
        // Refresh subscription data
        get().fetchCurrentSubscription();
        get().fetchInvoices();
      } else {
        throw new Error(data.message || 'Upgrade gagal');
      }
    } catch (err: any) {
      console.error('Failed to upgrade subscription:', err);
      get().addNotification(err.message || 'Upgrade subscription gagal.');
    }
  },
  
  setup2fa: async (code) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/2fa/setup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (response.ok) {
        set((state) => ({
          user: state.user ? { ...state.user, twoFactorOn: true } : null,
          logs: [
            {
              id: `L-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan pada akun.',
              level: 'SUCCESS',
            },
            ...state.logs
          ]
        }));
        get().addAuditLog('Two-Factor Authentication (2FA) Enabled');
        get().addNotification('2FA berhasil diaktifkan!');
        return { success: true };
      } else {
        throw new Error(data.message || 'Gagal mengaktifkan 2FA');
      }
    } catch (err: any) {
      console.error('Failed to setup 2FA:', err);
      get().addNotification(err.message || 'Aktivasi 2FA gagal.');
      throw err;
    }
  },

  updateProfile: async (payload) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            legalName: data.legalName,
            phone: data.phone,
            country: data.country
          } : null
        }));
        get().addNotification('Profil berhasil diperbarui!');
        get().addAuditLog('User Profile Updated');
      } else {
        throw new Error(data.message || 'Gagal memperbarui profil');
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      get().addNotification(err.message || 'Gagal memperbarui profil.');
      throw err;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/profile`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        localStorage.removeItem('token');
        set({ user: null });
        get().addNotification('Akun Anda berhasil dihapus.');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menghapus akun');
      }
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      get().addNotification(err.message || 'Gagal menghapus akun.');
      throw err;
    }
  },

  isUpgradeOpen: false,
  setUpgradeOpen: (isUpgradeOpen) => set({ isUpgradeOpen }),

  // competence of backtest remains local simulation
  strategyParams: defaultStrategyParams,
  backtestStatus: 'IDLE',
  backtestProgress: 0,
  backtestResult: null,

  updateStrategyParams: (params) => set((state) => ({
    strategyParams: { ...state.strategyParams, ...params }
  })),

  runBacktest: () => {
    set({ backtestStatus: 'RUNNING', backtestProgress: 0, backtestResult: null });
    const store = get();
    store.addLog('[SignalR Backtest] Menghubungkan ke layanan simulasi...', 'INFO');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      set({ backtestProgress: progress });

      if (progress === 10) {
        store.addLog('[SignalR Backtest] Membaca 50,000 bar data historis EUR/USD (15m)...', 'INFO');
      } else if (progress === 30) {
        store.addLog(`[SignalR Backtest] Menerapkan filter indikator: MA Crossover (${store.strategyParams.maCrossover}), RSI (${store.strategyParams.rsiFilter}).`, 'INFO');
      } else if (progress === 60) {
        store.addLog(`[SignalR Backtest] Mensimulasikan eksekusi dengan toleransi risiko ${store.strategyParams.riskPercentage}% dan R:R ${store.strategyParams.riskRewardRatio}...`, 'INFO');
      } else if (progress === 80) {
        store.addLog('[SignalR Backtest] Menyusun drawdown portofolio & matrik analitik...', 'INFO');
      } else if (progress === 100) {
        clearInterval(interval);
        
        const winRate = 62.5;
        const netProfit = 2450.50;
        const result = {
          netProfit,
          profitFactor: 1.65,
          maxDrawdown: 4.2,
          winRate,
          totalTrades: 54,
          trades: []
        };
        
        set({
          backtestStatus: 'COMPLETED',
          backtestResult: result
        });
        
        store.addLog('[SignalR Backtest] Simulasi SELESAI. Menyimpan hasil ke database...', 'SUCCESS');
        // Auto-save to database
        get().saveBacktestResult('AI Strategy (MA+RSI)', store.strategyParams, result);
      }
    }, 400);
  },

  resetBacktest: () => set({
    backtestStatus: 'IDLE',
    backtestProgress: 0,
    backtestResult: null
  }),

  addNotification: (message) => set((state) => ({
    notifications: [
      {
        id: `N-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        message,
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...state.notifications
    ].slice(0, 50)
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  addAuditLog: (action, status = 'SUCCESS') => set((state) => ({
    auditLogs: [
      {
        id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        action,
        ipAddress: '127.0.0.1',
        status
      },
      ...state.auditLogs
    ].slice(0, 100)
  })),

  setCustomLogoUrl: (url) => set({ customLogoUrl: url }),

  addCustomSubdomain: (domain) => set((state) => ({
    customSubdomains: [...state.customSubdomains, domain]
  })),

  removeCustomSubdomain: (domain) => set((state) => ({
    customSubdomains: state.customSubdomains.filter(d => d !== domain)
  })),

  setKycStatus: (status) => set({ kycStatus: status }),

  fetchWallets: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/wallets`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const wallets = await response.json();
        set({ wallets });
      }
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
    }
  },

  requestDeposit: async (currency, amount, paymentMethod, file) => {
    try {
      const formData = new FormData();
      formData.append('currency', currency);
      formData.append('amount', amount.toString());
      formData.append('paymentMethod', paymentMethod);
      if (file) {
        formData.append('proof', file);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiUrl()}/wallets/deposit`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        get().addNotification(`Permintaan deposit sebesar ${amount} ${currency} berhasil diajukan.`);
        get().addAuditLog(`Deposit Request Submitted: ${amount} ${currency}`);
        get().fetchWallets();
        return data;
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengajukan deposit');
      }
    } catch (err) {
      console.error('Deposit request failed:', err);
      throw err;
    }
  },

  requestWithdrawal: async (currency, amount, paymentMethod, payoutDetails) => {
    try {
      const response = await fetch(`${getApiUrl()}/wallets/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currency, amount, paymentMethod, payoutDetails })
      });

      if (response.ok) {
        get().addNotification(`Permintaan penarikan sebesar ${amount} ${currency} berhasil diajukan.`);
        get().addAuditLog(`Withdrawal Request Submitted: ${amount} ${currency}`);
        get().fetchWallets();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengajukan penarikan');
      }
    } catch (err) {
      console.error('Withdrawal request failed:', err);
      throw err;
    }
  },

  fetchVps: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/vps`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const vpsInstance = await response.json();
        set({ vpsInstance });
      }
    } catch (err) {
      console.error('Failed to fetch VPS:', err);
    }
  },

  deployVps: async (planName, region) => {
    try {
      const response = await fetch(`${getApiUrl()}/vps/provision`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ planName, region })
      });

      if (response.ok) {
        const vpsInstance = await response.json();
        set({ vpsInstance });
        get().addNotification(`VPS Cloud di region ${region} berhasil dideploy.`);
        get().addAuditLog(`VPS Deployed: ${region}`);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mendeploy VPS');
      }
    } catch (err) {
      console.error('VPS deployment failed:', err);
      throw err;
    }
  },

  fetchBrokerAccounts: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/broker/accounts`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const brokerAccounts = await response.json();
        set({ brokerAccounts });
      }
    } catch (err) {
      console.error('Failed to fetch broker accounts:', err);
    }
  },

  linkBrokerAccount: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/broker/link`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        get().addNotification(`Akun Broker #${data.accountNumber} berhasil terhubung.`);
        get().addAuditLog(`Broker Connected: ${data.brokerName} (${data.accountNumber})`);
        get().fetchBrokerAccounts();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menghubungkan broker');
      }
    } catch (err) {
      console.error('Broker linking failed:', err);
      throw err;
    }
  },

  fetchAdminFinancialQueue: async () => {
    try {
      const depRes = await fetch(`${getApiUrl()}/backoffice/financial/deposits`, {
        headers: getHeaders()
      });
      const witRes = await fetch(`${getApiUrl()}/backoffice/financial/withdrawals`, {
        headers: getHeaders()
      });

      if (depRes.ok && witRes.ok) {
        const adminDeposits = await depRes.json();
        const adminWithdrawals = await witRes.json();
        set({ adminDeposits, adminWithdrawals });
      }
    } catch (err) {
      console.error('Failed to fetch financial queues:', err);
    }
  },

  approveAdminDeposit: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/financial/deposit/approve/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Deposit disetujui.');
        get().fetchAdminFinancialQueue();
      }
    } catch (err) {
      console.error('Failed to approve deposit:', err);
    }
  },

  rejectAdminDeposit: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/financial/deposit/reject/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Deposit ditolak.');
        get().fetchAdminFinancialQueue();
      }
    } catch (err) {
      console.error('Failed to reject deposit:', err);
    }
  },

  approveAdminWithdrawal: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/financial/withdraw/approve/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Penarikan disetujui.');
        get().fetchAdminFinancialQueue();
      }
    } catch (err) {
      console.error('Failed to approve withdrawal:', err);
    }
  },

  rejectAdminWithdrawal: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/financial/withdraw/reject/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Penarikan ditolak.');
        get().fetchAdminFinancialQueue();
      }
    } catch (err) {
      console.error('Failed to reject withdrawal:', err);
    }
  },

  adminSubscriptionPlans: [],
  fetchAdminSubscriptionPlans: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/subscription-plans`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const adminSubscriptionPlans = await response.json();
        set({ adminSubscriptionPlans });
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
    }
  },

  createAdminSubscriptionPlan: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/subscription-plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Paket langganan berhasil dibuat.');
        get().fetchAdminSubscriptionPlans();
      }
    } catch (err) {
      console.error('Failed to create subscription plan:', err);
    }
  },

  updateAdminSubscriptionPlan: async (id, data) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/subscription-plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Paket langganan berhasil diperbarui.');
        get().fetchAdminSubscriptionPlans();
      }
    } catch (err) {
      console.error('Failed to update subscription plan:', err);
    }
  },

  deleteAdminSubscriptionPlan: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/subscription-plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Paket langganan berhasil dihapus.');
        get().fetchAdminSubscriptionPlans();
      }
    } catch (err) {
      console.error('Failed to delete subscription plan:', err);
    }
  },

  initTenant: async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'app.forexbot.ai';
      const response = await fetch(`${getApiUrl()}/tenant/init?domain=${hostname}`);
      if (response.ok) {
        const data = await response.json();
        set({
          customLogoUrl: data.logoUrl ? `${getApiUrl()}${data.logoUrl}` : null
        });

        // Dynamically apply brand colors in the DOM
        if (data.theme) {
          const root = document.documentElement;
          root.style.setProperty('--primary-color', data.theme.primaryColor);
          root.style.setProperty('--secondary-color', data.theme.secondaryColor);
        }
      }
    } catch (err) {
      console.error('Failed to initialize tenant branding:', err);
    }
  },

  updateTenantTheme: async (primaryColor, secondaryColor) => {
    try {
      const response = await fetch(`${getApiUrl()}/tenant/theme`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ primaryColor, secondaryColor })
      });

      if (response.ok) {
        get().addNotification('Tema warna brand berhasil diperbarui.');
        get().addAuditLog(`White-Label: Primary brand color changed to ${primaryColor}`);
        get().initTenant(); // Reload branding
      }
    } catch (err) {
      console.error('Failed to update tenant theme:', err);
    }
  },

  uploadTenantLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiUrl()}/tenant/logo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        get().addNotification('Logo kustom berhasil diperbarui.');
        get().addAuditLog('White-Label: Custom brand logo uploaded');
        get().initTenant(); // Reload branding
      }
    } catch (err) {
      console.error('Failed to upload tenant logo:', err);
    }
  },

  fetchAffiliateStats: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/affiliate/stats`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const affiliateStats = await response.json();
        set({ affiliateStats });
      }
    } catch (err) {
      console.error('Failed to fetch affiliate stats:', err);
    }
  },

  requestAffiliatePayout: async (amount, paymentMethod, payoutDetails) => {
    try {
      const response = await fetch(`${getApiUrl()}/affiliate/payout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, paymentMethod, payoutDetails })
      });

      if (response.ok) {
        get().addNotification(`Permintaan penarikan komisi sebesar $${amount} berhasil diajukan.`);
        get().addAuditLog(`Affiliate Payout Requested: $${amount}`);
        get().fetchAffiliateStats();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengajukan penarikan komisi');
      }
    } catch (err) {
      console.error('Affiliate payout request failed:', err);
      throw err;
    }
  },

  fetchSupportTickets: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/support/tickets`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const supportTickets = await response.json();
        set({ supportTickets });
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    }
  },

  createSupportTicket: async (subject, category, description, priority) => {
    try {
      const response = await fetch(`${getApiUrl()}/support/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ subject, category, description, priority })
      });

      if (response.ok) {
        get().addNotification(`Tiket bantuan "${subject}" berhasil dibuat.`);
        get().addAuditLog(`Support Ticket Created: ${subject}`);
        get().fetchSupportTickets();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal membuat tiket bantuan');
      }
    } catch (err) {
      console.error('Failed to create support ticket:', err);
      throw err;
    }
  },

  fetchSupportArticles: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/support/articles`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const supportArticles = await response.json();
        set({ supportArticles });
      }
    } catch (err) {
      console.error('Failed to fetch support articles:', err);
    }
  },

  fetchLoyaltyStatus: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/loyalty/status`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const loyaltyStatus = await response.json();
        set({ loyaltyStatus });
      }
    } catch (err) {
      console.error('Failed to fetch loyalty status:', err);
    }
  },

  claimLoyaltyReward: async (rewardName, pointsSpent) => {
    try {
      const response = await fetch(`${getApiUrl()}/loyalty/claim`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rewardName, pointsSpent })
      });

      if (response.ok) {
        get().addNotification(`Hadiah "${rewardName}" berhasil diklaim.`);
        get().addAuditLog(`Loyalty Reward Claimed: ${rewardName}`);
        get().fetchLoyaltyStatus();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengklaim hadiah');
      }
    } catch (err) {
      console.error('Failed to claim loyalty reward:', err);
      throw err;
    }
  },

  fetchEconomicEvents: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/market/economic-events`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const economicEvents = await response.json();
        set({ economicEvents });
      }
    } catch (err) {
      console.error('Failed to fetch economic events:', err);
    }
  },

  fetchNewsSentiments: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/market/news-sentiment`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const newsSentiments = await response.json();
        set({ newsSentiments });
      }
    } catch (err) {
      console.error('Failed to fetch news sentiments:', err);
    }
  },

  fetchPammPools: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/pamm/pools`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const pammPools = await response.json();
        set({ pammPools });
      }
    } catch (err) {
      console.error('Failed to fetch PAMM pools:', err);
    }
  },

  createPammPool: async (name, description, minInvestment, performanceFeePct) => {
    try {
      const response = await fetch(`${getApiUrl()}/pamm/pools`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description, minInvestment, performanceFeePct })
      });
      if (response.ok) {
        get().addNotification(`Pool PAMM "${name}" berhasil dibuat.`);
        get().addAuditLog(`PAMM Pool Created: ${name}`);
        get().fetchPammPools();
      }
    } catch (err) {
      console.error('Failed to create PAMM pool:', err);
    }
  },

  fetchPammInvestors: async (poolId) => {
    try {
      const response = await fetch(`${getApiUrl()}/pamm/pools/${poolId}/investors`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        // Format to match PammDashboard's InvestorAccount interface
        const pammInvestors = data.map((d: any) => ({
          id: d.id,
          name: d.investor?.legalName || 'Investor',
          balance: d.allocatedCapital,
          share: d.sharePercentage,
          floating: parseFloat((d.allocatedCapital * 0.0024).toFixed(2)), // simulated floating profit
          status: d.status
        }));
        set({ pammInvestors });
      }
    } catch (err) {
      console.error('Failed to fetch PAMM investors:', err);
    }
  },

  savePammAllocation: async (poolId, method, allocations) => {
    try {
      const response = await fetch(`${getApiUrl()}/pamm/pools/${poolId}/allocation`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ method, allocations })
      });
      if (response.ok) {
        get().addNotification('Matriks alokasi PAMM berhasil disimpan.');
        get().addAuditLog(`PAMM Allocation Matrix Updated (Method: ${method})`);
        get().fetchPammInvestors(poolId);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menyimpan alokasi');
      }
    } catch (err: any) {
      console.error('Failed to save PAMM allocation:', err);
      get().addNotification(err.message || 'Gagal menyimpan alokasi');
      throw err;
    }
  },

  fetchPammPayouts: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/pamm/payouts`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        // Format to match PammDashboard's payout history
        const pammPayouts = data.map((d: any) => ({
          period: new Date(d.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
          profitGenerated: d.amount * 5, // simulated gross profit
          feeRate: 20,
          collectedFee: d.amount,
          date: d.paidAt ? d.paidAt.split('T')[0] : d.createdAt.split('T')[0]
        }));
        set({ pammPayouts });
      }
    } catch (err) {
      console.error('Failed to fetch PAMM payouts:', err);
    }
  },

  fetchApiKeys: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/developer/keys`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const apiKeys = await response.json();
        set({ apiKeys });
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  },

  generateApiKey: async (name, permission) => {
    try {
      const response = await fetch(`${getApiUrl()}/developer/keys`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, permission })
      });
      if (response.ok) {
        const data = await response.json();
        get().addNotification(`API Key '${name}' berhasil dibuat.`);
        get().addAuditLog(`API Key Created: ${name} (Permission: ${permission})`);
        get().fetchApiKeys();
        return data; // Return raw key
      }
    } catch (err) {
      console.error('Failed to generate API key:', err);
    }
  },

  revokeApiKey: async (id, name) => {
    try {
      const response = await fetch(`${getApiUrl()}/developer/keys/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification(`API Key '${name}' telah dicabut.`);
        get().addAuditLog(`API Key Revoked: ${name}`);
        get().fetchApiKeys();
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  },

  fetchPriceAlerts: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/price-alerts`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const priceAlerts = await response.json();
        set({ priceAlerts });
      }
    } catch (err) {
      console.error('Failed to fetch price alerts:', err);
    }
  },

  createPriceAlert: async (symbol, targetPrice, condition) => {
    try {
      const response = await fetch(`${getApiUrl()}/price-alerts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ symbol, targetPrice, condition })
      });
      if (response.ok) {
        get().addNotification(`Price alert untuk ${symbol} berhasil dibuat.`);
        get().addAuditLog(`Price Alert Created: ${symbol} ${condition} ${targetPrice}`);
        get().fetchPriceAlerts();
      }
    } catch (err) {
      console.error('Failed to create price alert:', err);
    }
  },

  deletePriceAlert: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/price-alerts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Price alert berhasil dihapus.');
        get().fetchPriceAlerts();
      }
    } catch (err) {
      console.error('Failed to delete price alert:', err);
    }
  },

  fetchLeaders: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/social/leaders`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const leaders = await response.json();
        set({ leaders });
      }
    } catch (err) {
      console.error('Failed to fetch leaders:', err);
    }
  },

  fetchCopyConnections: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/social/connections`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const copyConnections = await response.json();
        set({ copyConnections });
      }
    } catch (err) {
      console.error('Failed to fetch copy connections:', err);
    }
  },

  startCopying: async (leaderId, multiplier) => {
    try {
      const response = await fetch(`${getApiUrl()}/social/copy/${leaderId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ multiplier })
      });
      if (response.ok) {
        get().addNotification('Berhasil menyalin trader.');
        get().fetchCopyConnections();
        get().fetchLeaders();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menyalin trader');
      }
    } catch (err: any) {
      console.error('Failed to start copying:', err);
      get().addNotification(err.message || 'Gagal menyalin trader');
      throw err;
    }
  },

  stopCopying: async (connectionId) => {
    try {
      const response = await fetch(`${getApiUrl()}/social/copy/${connectionId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Berhenti menyalin trader.');
        get().fetchCopyConnections();
        get().fetchLeaders();
      }
    } catch (err) {
      console.error('Failed to stop copying:', err);
    }
  },

  // ============================================================
  // INBOX ACTIONS
  // ============================================================
  fetchInbox: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/inbox`, { headers: getHeaders() });
      if (response.ok) {
        const inboxMessages = await response.json();
        set({ inboxMessages });
      }
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
    }
  },

  markMessageRead: async (id) => {
    try {
      await fetch(`${getApiUrl()}/inbox/${id}/read`, { method: 'POST', headers: getHeaders() });
      set((state) => ({
        inboxMessages: state.inboxMessages.map(m => m.id === id ? { ...m, isRead: true } : m)
      }));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  },

  markAllMessagesRead: async () => {
    try {
      await fetch(`${getApiUrl()}/inbox/read-all`, { method: 'POST', headers: getHeaders() });
      set((state) => ({
        inboxMessages: state.inboxMessages.map(m => ({ ...m, isRead: true }))
      }));
    } catch (err) {
      console.error('Failed to mark all messages as read:', err);
    }
  },

  deleteInboxMessage: async (id) => {
    try {
      await fetch(`${getApiUrl()}/inbox/${id}`, { method: 'DELETE', headers: getHeaders() });
      set((state) => ({
        inboxMessages: state.inboxMessages.filter(m => m.id !== id)
      }));
    } catch (err) {
      console.error('Failed to delete inbox message:', err);
    }
  },

  // ============================================================
  // BACKTEST HISTORY ACTIONS
  // ============================================================
  fetchBacktestHistory: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backtest/history`, { headers: getHeaders() });
      if (response.ok) {
        const backtestHistoryList = await response.json();
        set({ backtestHistoryList });
      }
    } catch (err) {
      console.error('Failed to fetch backtest history:', err);
    }
  },

  saveBacktestResult: async (strategyName, params, result) => {
    try {
      await fetch(`${getApiUrl()}/backtest/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ strategyName, paramsJson: params, resultJson: result })
      });
      // Refresh history list
      get().fetchBacktestHistory();
    } catch (err) {
      console.error('Failed to save backtest result:', err);
    }
  },

  deleteBacktestHistory: async (id) => {
    try {
      await fetch(`${getApiUrl()}/backtest/history/${id}`, { method: 'DELETE', headers: getHeaders() });
      set((state) => ({
        backtestHistoryList: state.backtestHistoryList.filter(h => h.id !== id)
      }));
    } catch (err) {
      console.error('Failed to delete backtest history:', err);
    }
  },

  // ============================================================
  // SUBSCRIPTION ACTIONS
  // ============================================================
  fetchSubscriptionPlans: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/subscription/plans`, { headers: getHeaders() });
      if (response.ok) {
        const subscriptionPlans = await response.json();
        set({ subscriptionPlans });
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
    }
  },

  fetchCurrentSubscription: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/subscription/current`, { headers: getHeaders() });
      if (response.ok) {
        const currentSubscription = await response.json();
        set({ currentSubscription });
      }
    } catch (err) {
      console.error('Failed to fetch current subscription:', err);
    }
  },

  fetchInvoices: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/subscription/invoices`, { headers: getHeaders() });
      if (response.ok) {
        const invoices = await response.json();
        set({ invoices });
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  },

  // ============================================================
  // ADDITIONAL 6 SCHEMA GAPS ACTIONS
  // ============================================================
  dbAuditLogs: [],
  kycDocuments: [],
  brokerSyncLogs: {},
  strategyLicenses: [],
  orderExecutionLogs: [],
  tenants: [],
  tenantSubscriptions: [],

  fetchDbAuditLogs: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/audit-logs`, { headers: getHeaders() });
      if (response.ok) {
        const dbAuditLogs = await response.json();
        set({ dbAuditLogs });
      }
    } catch (err) {
      console.error('Failed to fetch DB audit logs:', err);
    }
  },

  fetchKycDocuments: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/kyc/documents`, { headers: getHeaders() });
      if (response.ok) {
        const kycDocuments = await response.json();
        set({ kycDocuments });
      }
    } catch (err) {
      console.error('Failed to fetch KYC documents:', err);
    }
  },

  submitKycDoc: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/kyc/document`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Dokumen KYC berhasil dikirim.');
        get().fetchKycDocuments();
        // Refresh profile to get new KYC status
        get().initSession();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mengirim KYC');
      }
    } catch (err: any) {
      console.error('Failed to submit KYC:', err);
      get().addNotification(err.message || 'Gagal mengirim KYC');
      throw err;
    }
  },

  fetchBrokerSyncLogs: async (accountId) => {
    try {
      const response = await fetch(`${getApiUrl()}/broker/sync-logs/${accountId}`, { headers: getHeaders() });
      if (response.ok) {
        const logs = await response.json();
        set((state) => ({
          brokerSyncLogs: { ...state.brokerSyncLogs, [accountId]: logs }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch broker sync logs:', err);
    }
  },

  syncBrokerAccount: async (accountId) => {
    try {
      const response = await fetch(`${getApiUrl()}/broker/sync/${accountId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        get().addNotification(data.message || 'Akun broker berhasil disinkronkan.');
        get().fetchBrokerSyncLogs(accountId);
        get().fetchBrokerAccounts();
      } else {
        throw new Error(data.message || 'Gagal sinkronisasi');
      }
    } catch (err: any) {
      console.error('Failed to sync broker account:', err);
      get().addNotification(err.message || 'Gagal sinkronisasi');
    }
  },

  fetchStrategyLicenses: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/trading/license`, { headers: getHeaders() });
      if (response.ok) {
        const strategyLicenses = await response.json();
        set({ strategyLicenses });
      }
    } catch (err) {
      console.error('Failed to fetch strategy licenses:', err);
    }
  },

  generateStrategyLicense: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/trading/license/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        get().addNotification('Lisensi strategi berhasil dibuat.');
        get().fetchStrategyLicenses();
        return result;
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal membuat lisensi');
      }
    } catch (err: any) {
      console.error('Failed to generate license:', err);
      get().addNotification(err.message || 'Gagal membuat lisensi');
      throw err;
    }
  },

  revokeStrategyLicense: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/trading/license/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Lisensi strategi dinonaktifkan.');
        get().fetchStrategyLicenses();
      }
    } catch (err) {
      console.error('Failed to revoke license:', err);
    }
  },

  fetchOrderExecutionLogs: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/trading/order-logs`, { headers: getHeaders() });
      if (response.ok) {
        const orderExecutionLogs = await response.json();
        set({ orderExecutionLogs });
      }
    } catch (err) {
      console.error('Failed to fetch order execution logs:', err);
    }
  },

  fetchAllTenants: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/tenant/all`, { headers: getHeaders() });
      if (response.ok) {
        const tenants = await response.json();
        set({ tenants });
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  },

  fetchTenantSubscriptions: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/tenant/subscriptions`, { headers: getHeaders() });
      if (response.ok) {
        const tenantSubscriptions = await response.json();
        set({ tenantSubscriptions });
      }
    } catch (err) {
      console.error('Failed to fetch tenant subscriptions:', err);
    }
  },

  createTenantSubscription: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/tenant/subscriptions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Subscription tenant berhasil dibuat.');
        get().fetchTenantSubscriptions();
        get().fetchAllTenants();
      }
    } catch (err) {
      console.error('Failed to create tenant subscription:', err);
    }
  },

  updateTenantSubscriptionStatus: async (id, status) => {
    try {
      const response = await fetch(`${getApiUrl()}/tenant/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        get().addNotification('Status subscription berhasil diubah.');
        get().fetchTenantSubscriptions();
      }
    } catch (err) {
      console.error('Failed to update tenant subscription status:', err);
    }
  },

  // ─── USER & APP CONFIG MANAGEMENT ──────────────────────────────────────────
  usersList: [],
  appConfig: null,

  fetchUsersList: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/users`, { headers: getHeaders() });
      if (response.ok) {
        const usersList = await response.json();
        set({ usersList });
      }
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    }
  },

  updateUserStatus: async (id, status) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/users/${id}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        get().addNotification('Status pengguna berhasil diubah.');
        get().fetchUsersList();
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/users/${id}/role`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role })
      });
      if (response.ok) {
        get().addNotification('Peran pengguna berhasil diubah.');
        get().fetchUsersList();
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  },

  fetchAppConfig: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/config`, { headers: getHeaders() });
      if (response.ok) {
        const appConfig = await response.json();
        set({ appConfig });
      }
    } catch (err) {
      console.error('Failed to fetch app config:', err);
    }
  },

  updateAppConfig: async (config) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      if (response.ok) {
        get().addNotification('Konfigurasi aplikasi berhasil diperbarui.');
        get().fetchAppConfig();
      }
    } catch (err) {
      console.error('Failed to update app config:', err);
    }
  },

  // ─── SYSTEM MENU MANAGEMENT ───────────────────────────────────────────────
  systemMenus: [],

  fetchSystemMenus: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/menus`, { headers: getHeaders() });
      if (response.ok) {
        const systemMenus = await response.json();
        set({ systemMenus });
      }
    } catch (err) {
      console.error('Failed to fetch system menus:', err);
    }
  },

  createSystemMenu: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/menus`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Menu sistem berhasil ditambahkan.');
        get().fetchSystemMenus();
      }
    } catch (err) {
      console.error('Failed to create system menu:', err);
    }
  },

  updateSystemMenu: async (id, data) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/menus/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Menu sistem berhasil diperbarui.');
        get().fetchSystemMenus();
      }
    } catch (err) {
      console.error('Failed to update system menu:', err);
    }
  },

  deleteSystemMenu: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/menus/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Menu sistem berhasil dihapus.');
        get().fetchSystemMenus();
      }
    } catch (err) {
      console.error('Failed to delete system menu:', err);
    }
  },

  // ─── DYNAMIC ROLES & PERMISSIONS ACTIONS ─────────────────────────────────────
  fetchRolesList: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/roles`, { headers: getHeaders() });
      if (response.ok) {
        const rolesList = await response.json();
        set({ rolesList });
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  },

  createRole: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (response.ok) {
        get().addNotification('Peran baru berhasil ditambahkan.');
        get().fetchRolesList();
      }
    } catch (err) {
      console.error('Failed to create role:', err);
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        get().addNotification('Peran berhasil dihapus.');
        get().fetchRolesList();
      }
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  },

  fetchRoleMenuAccess: async (roleId) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/roles/${roleId}/menu-access`, { headers: getHeaders() });
      if (response.ok) {
        const roleMenuAccesses = await response.json();
        set({ roleMenuAccesses });
      }
    } catch (err) {
      console.error('Failed to fetch role menu access:', err);
    }
  },

  saveRoleMenuAccess: async (roleId, accesses) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/roles/${roleId}/menu-access`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ accesses })
      });
      if (response.ok) {
        get().addNotification('Hak akses peran berhasil disimpan.');
        get().fetchRoleMenuAccess(roleId);
        get().fetchMyAuthorizedMenus();
      }
    } catch (err) {
      console.error('Failed to save role menu access:', err);
    }
  },

  fetchUserMenuPermissions: async (userId) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/users/${userId}/menu-permissions`, { headers: getHeaders() });
      if (response.ok) {
        const userMenuPermissions = await response.json();
        set({ userMenuPermissions });
      }
    } catch (err) {
      console.error('Failed to fetch user menu permissions:', err);
    }
  },

  saveUserMenuPermissions: async (userId, permissions) => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/users/${userId}/menu-permissions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ permissions })
      });
      if (response.ok) {
        get().addNotification('Izin khusus menu pengguna berhasil disimpan.');
        get().fetchUserMenuPermissions(userId);
        get().fetchMyAuthorizedMenus();
      }
    } catch (err) {
      console.error('Failed to save user menu permissions:', err);
    }
  },

  fetchMyAuthorizedMenus: async () => {
    try {
      const response = await fetch(`${getApiUrl()}/backoffice/my-authorized-menus`, { headers: getHeaders() });
      if (response.ok) {
        const myAuthorizedMenus = await response.json();
        set({ myAuthorizedMenus });
      }
    } catch (err) {
      console.error('Failed to fetch authorized menus:', err);
    }
  },

  // ─── ADVANCED AUTH FLOW ACTIONS ──────────────────────────────────────────────
  registerUser: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (response.ok) {
        get().addNotification('Registrasi sukses. Silakan cek email Anda untuk verifikasi.');
        return { success: true, message: resData.message };
      } else {
        throw new Error(resData.message || 'Registrasi gagal.');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      return { success: false, error: err.message };
    }
  },

  verifyAccount: async (token) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            legalName: data.user.legalName,
            role: data.user.role,
            tier: data.user.tier || 'BASIC'
          },
          kycStatus: data.user.kycStatus
        });
        get().addNotification('Akun berhasil diverifikasi! Anda otomatis masuk.');
        get().fetchMyAuthorizedMenus();
        return { success: true };
      } else {
        throw new Error(data.message || 'Verifikasi gagal.');
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      return { success: false, error: err.message };
    }
  },

  verifyOtp: async (email, code) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            legalName: data.user.legalName,
            role: data.user.role,
            tier: data.user.tier || 'BASIC'
          },
          kycStatus: data.user.kycStatus
        });
        get().addNotification('Verifikasi OTP sukses! Selamat datang.');
        get().fetchMyAuthorizedMenus();
        return { success: true };
      } else {
        throw new Error(data.message || 'OTP tidak valid.');
      }
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      return { success: false, error: err.message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        get().addNotification('Tautan reset kata sandi telah dikirim.');
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Gagal meminta reset sandi.');
      }
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      return { success: false, error: err.message };
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (response.ok) {
        get().addNotification('Kata sandi berhasil diperbarui. Silakan login.');
        return { success: true, message: resData.message };
      } else {
        throw new Error(resData.message || 'Gagal mereset kata sandi.');
      }
    } catch (err: any) {
      console.error('Reset password failed:', err);
      return { success: false, error: err.message };
    }
  },

  googleLogin: async (data) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (response.ok) {
        localStorage.setItem('token', resData.access_token);
        set({
          user: {
            id: resData.user.id,
            email: resData.user.email,
            legalName: resData.user.legalName,
            role: resData.user.role,
            tier: resData.user.tier || 'BASIC'
          },
          kycStatus: resData.user.kycStatus
        });
        get().addNotification('Masuk dengan Google sukses!');
        get().fetchMyAuthorizedMenus();
        return { success: true };
      } else {
        throw new Error(resData.message || 'Login Google gagal.');
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      return { success: false, error: err.message };
    }
  },
}));



function getApiUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  const state = useBotStore.getState();
  return state.appConfig?.backendUrl || process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`;
}
