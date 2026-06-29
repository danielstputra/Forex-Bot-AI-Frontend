export type BotStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'PANIC';

export type RiskLevel = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export interface BotConfig {
  riskLevel: RiskLevel;
  tradeSize: number; // in Lots
  maxDrawdown: number; // in Percentage
  targetPairs: string[];
}

export interface TradeRecord {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  profit?: number;
  status: 'OPEN' | 'CLOSED';
  timestamp: string;
  closedAt?: string;
}

export interface OhlcvData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface AiLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}

export interface AccountStats {
  balance: number;
  equity: number;
  margin: number;
  winRate: number;
  totalTrades: number;
  totalProfit: number;
}

// Fase 10: Backtesting Types
export interface AIStrategyParams {
  riskRewardRatio: number; // e.g. 1.5 for 1:1.5
  riskPercentage: number;  // e.g. 2 for 2%
  newsFilter: boolean;
  maCrossover: boolean;
  rsiFilter: boolean;
  volatilityStop: boolean;
}

export interface BacktestResult {
  netProfit: number;
  profitFactor: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  trades: TradeRecord[];
}
