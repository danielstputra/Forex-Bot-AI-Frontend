import { create } from 'zustand';
import { BotStatus, BotConfig, TradeRecord, AiLog, AccountStats, OhlcvData, AIStrategyParams, BacktestResult } from '../types';
import { mockSocketService } from '../services/mockSocket';

export interface UserSession {
  email: string;
  tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
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
  
  // SaaS Actions
  login: (email: string, tier: UserSession['tier']) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (tier: string) => Promise<void>;
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
  requestDeposit: (currency: string, amount: number, paymentMethod: string, file: File | null) => Promise<void>;
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

  initSession: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/auth/profile', {
        headers: getHeaders()
      });

      if (response.ok) {
        const profile = await response.json();
        set({
          user: { email: profile.email, tier: profile.tier || 'BASIC' },
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
      const response = await fetch(`http://localhost:5000/trading/bot/${endpoint}`, {
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
      await fetch('http://localhost:5000/trading/config', {
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
    try {
      const response = await fetch('http://localhost:5000/trading/order', {
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
      await fetch('http://localhost:5000/trading/bot/stop', {
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
  login: async (email, tier) => {
    try {
      // 1. Try to login
      let response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'DefaultPassword123' })
      });

      // 2. If user not found, automatically register them
      if (!response.ok) {
        const regResponse = await fetch('http://localhost:5000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: 'DefaultPassword123',
            legalName: email.split('@')[0]
          })
        });

        if (!regResponse.ok) {
          throw new Error('Registration failed');
        }

        // Try login again
        response = await fetch('http://localhost:5000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'DefaultPassword123' })
        });
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);

        set((state) => ({
          user: { email: data.user.email, tier: data.user.tier },
          kycStatus: data.user.kycStatus,
          logs: [
            {
              id: `L-${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: `Pengguna masuk via API: ${data.user.email} (Lisensi: ${data.user.tier})`,
              level: 'SUCCESS',
            },
            ...state.logs
          ]
        }));

        get().addAuditLog(`User Login: ${data.user.email} (${data.user.tier})`);
        
        // Connect WebSocket
        mockSocketService.connect();
      }
    } catch (err) {
      console.error('Failed to log in:', err);
    }
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
      const response = await fetch('http://localhost:5000/subscription/upgrade', {
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
      const response = await fetch('http://localhost:5000/wallets', {
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
      const response = await fetch('http://localhost:5000/wallets/deposit', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        get().addNotification(`Permintaan deposit sebesar ${amount} ${currency} berhasil diajukan.`);
        get().addAuditLog(`Deposit Request Submitted: ${amount} ${currency}`);
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
      const response = await fetch('http://localhost:5000/wallets/withdraw', {
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
      const response = await fetch('http://localhost:5000/vps', {
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
      const response = await fetch('http://localhost:5000/vps/provision', {
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
      const response = await fetch('http://localhost:5000/broker/accounts', {
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
      const response = await fetch('http://localhost:5000/broker/link', {
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
      const depRes = await fetch('http://localhost:5000/backoffice/financial/deposits', {
        headers: getHeaders()
      });
      const witRes = await fetch('http://localhost:5000/backoffice/financial/withdrawals', {
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
      const response = await fetch(`http://localhost:5000/backoffice/financial/deposit/approve/${id}`, {
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
      const response = await fetch(`http://localhost:5000/backoffice/financial/deposit/reject/${id}`, {
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
      const response = await fetch(`http://localhost:5000/backoffice/financial/withdraw/approve/${id}`, {
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
      const response = await fetch(`http://localhost:5000/backoffice/financial/withdraw/reject/${id}`, {
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

  initTenant: async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'app.forexbot.ai';
      const response = await fetch(`http://localhost:5000/tenant/init?domain=${hostname}`);
      if (response.ok) {
        const data = await response.json();
        set({
          customLogoUrl: data.logoUrl ? `http://localhost:5000${data.logoUrl}` : null
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
      const response = await fetch('http://localhost:5000/tenant/theme', {
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
      const response = await fetch('http://localhost:5000/tenant/logo', {
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
      const response = await fetch('http://localhost:5000/affiliate/stats', {
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
      const response = await fetch('http://localhost:5000/affiliate/payout', {
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
      const response = await fetch('http://localhost:5000/support/tickets', {
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
      const response = await fetch('http://localhost:5000/support/tickets', {
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
      const response = await fetch('http://localhost:5000/support/articles', {
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
      const response = await fetch('http://localhost:5000/loyalty/status', {
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
      const response = await fetch('http://localhost:5000/loyalty/claim', {
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
      const response = await fetch('http://localhost:5000/market/economic-events', {
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
      const response = await fetch('http://localhost:5000/market/news-sentiment', {
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
      const response = await fetch('http://localhost:5000/pamm/pools', {
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
      const response = await fetch('http://localhost:5000/pamm/pools', {
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
      const response = await fetch(`http://localhost:5000/pamm/pools/${poolId}/investors`, {
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
      const response = await fetch(`http://localhost:5000/pamm/pools/${poolId}/allocation`, {
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
      const response = await fetch('http://localhost:5000/pamm/payouts', {
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
      const response = await fetch('http://localhost:5000/developer/keys', {
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
      const response = await fetch('http://localhost:5000/developer/keys', {
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
      const response = await fetch(`http://localhost:5000/developer/keys/${id}`, {
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
      const response = await fetch('http://localhost:5000/price-alerts', {
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
      const response = await fetch('http://localhost:5000/price-alerts', {
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
      const response = await fetch(`http://localhost:5000/price-alerts/${id}`, {
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
      const response = await fetch('http://localhost:5000/social/leaders', {
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
      const response = await fetch('http://localhost:5000/social/connections', {
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
      const response = await fetch(`http://localhost:5000/social/copy/${leaderId}`, {
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
      const response = await fetch(`http://localhost:5000/social/copy/${connectionId}`, {
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
      const response = await fetch('http://localhost:5000/inbox', { headers: getHeaders() });
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
      await fetch(`http://localhost:5000/inbox/${id}/read`, { method: 'POST', headers: getHeaders() });
      set((state) => ({
        inboxMessages: state.inboxMessages.map(m => m.id === id ? { ...m, isRead: true } : m)
      }));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  },

  markAllMessagesRead: async () => {
    try {
      await fetch('http://localhost:5000/inbox/read-all', { method: 'POST', headers: getHeaders() });
      set((state) => ({
        inboxMessages: state.inboxMessages.map(m => ({ ...m, isRead: true }))
      }));
    } catch (err) {
      console.error('Failed to mark all messages as read:', err);
    }
  },

  deleteInboxMessage: async (id) => {
    try {
      await fetch(`http://localhost:5000/inbox/${id}`, { method: 'DELETE', headers: getHeaders() });
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
      const response = await fetch('http://localhost:5000/backtest/history', { headers: getHeaders() });
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
      await fetch('http://localhost:5000/backtest/save', {
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
      await fetch(`http://localhost:5000/backtest/history/${id}`, { method: 'DELETE', headers: getHeaders() });
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
      const response = await fetch('http://localhost:5000/subscription/plans', { headers: getHeaders() });
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
      const response = await fetch('http://localhost:5000/subscription/current', { headers: getHeaders() });
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
      const response = await fetch('http://localhost:5000/subscription/invoices', { headers: getHeaders() });
      if (response.ok) {
        const invoices = await response.json();
        set({ invoices });
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  },
}));
