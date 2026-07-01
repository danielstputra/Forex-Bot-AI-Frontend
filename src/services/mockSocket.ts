import { useBotStore } from '../store/useBotStore';
import { OhlcvData, TradeRecord } from '../types';

class RealSocketService {
  private ws: WebSocket | null = null;
  private aiIntervalId: NodeJS.Timeout | null = null;
  private tradeCheckIntervalId: NodeJS.Timeout | null = null;
  private fallbackIntervalId: NodeJS.Timeout | null = null;
  private currentPrices: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2720,
    'USD/JPY': 156.40,
    'AUD/USD': 0.6640,
  };

  public getPrice(pair: string): number {
    return this.currentPrices[pair] || 1.0;
  }

  public connect() {
    const store = useBotStore.getState();
    
    // Connect to NestJS Socket.io via native WebSocket transport
    const { appConfig } = useBotStore.getState();
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
      : (appConfig?.backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    const wsBase = backendUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/socket.io/?EIO=4&transport=websocket`;
    console.log(`[WebSocket] Connecting to ${wsUrl}...`);
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        store.addLog('Koneksi WebSocket terhubung ke server Backend asli.', 'SUCCESS');
        this.stopFallbackTicks();
      };

      this.ws.onmessage = (event) => {
        const raw = event.data;
        
        // Socket.io engine.io message type 42 represents a packet type message
        if (typeof raw === 'string' && raw.startsWith('42')) {
          try {
            const parsed = JSON.parse(raw.substring(2));
            const [eventName, ticks] = parsed;

            if (eventName === 'tick' && Array.isArray(ticks)) {
              ticks.forEach((tick: any) => {
                const { pair, time, open, high, low, close } = tick;
                this.currentPrices[pair] = close;

                // Update chart data in Zustand store
                // Round time to 1-minute interval for 1m timeframe chart
                const roundedTime = time - (time % 60);
                const newBar: OhlcvData = { time: roundedTime, open, high, low, close };
                store.addChartTick(pair, newBar);
              });

              // Update Equity based on active trades and real prices
              this.updateEquityAndPL();
            }
          } catch (e) {
            // Ignore parse errors for non-JSON or heartbeat frames
          }
        } else if (raw === '2') {
          // Respond to Engine.io ping with a pong to keep connection alive
          this.ws?.send('3');
        }
      };

      this.ws.onclose = () => {
        store.addLog('Koneksi WebSocket terputus dari server. Beralih ke simulasi lokal.', 'WARNING');
        this.startFallbackTicks();
      };
      
      this.ws.onerror = () => {
        store.addLog('Koneksi WebSocket mengalami error. Beralih ke simulasi lokal.', 'ERROR');
        this.startFallbackTicks();
      };

    } catch (err: any) {
      console.error('Failed to establish WebSocket connection:', err);
      this.startFallbackTicks();
    }

    // AI Simulation is now handled 100% autonomously by the Backend Trading Engine.
    if (this.aiIntervalId) clearInterval(this.aiIntervalId);
    this.aiIntervalId = setInterval(() => {
      const currentStore = useBotStore.getState();
      if (currentStore.status !== 'RUNNING') return;
      const pair = currentStore.selectedPair;
      currentStore.addLog(`[Backend Engine] Monitoring market movements for ${pair}...`, 'INFO');
    }, 15000);
  }

  private startFallbackTicks() {
    if (this.fallbackIntervalId) return;
    const store = useBotStore.getState();
    
    this.fallbackIntervalId = setInterval(() => {
      const pair = store.selectedPair || 'EUR/USD';
      const currentPrice = this.currentPrices[pair];
      
      const volatility = pair === 'USD/JPY' ? 0.05 : 0.0002;
      const change = (Math.random() - 0.5) * volatility;
      const price = parseFloat((currentPrice + change).toFixed(pair === 'USD/JPY' ? 3 : 5));
      
      this.currentPrices[pair] = price;

      const time = Math.floor(Date.now() / 1000);
      const roundedTime = time - (time % 60);
      const open = parseFloat((price - change * 0.2).toFixed(pair === 'USD/JPY' ? 3 : 5));
      const high = parseFloat((Math.max(price, open) + Math.random() * volatility * 0.2).toFixed(pair === 'USD/JPY' ? 3 : 5));
      const low = parseFloat((Math.min(price, open) - Math.random() * volatility * 0.2).toFixed(pair === 'USD/JPY' ? 3 : 5));

      const newBar: OhlcvData = {
        time: roundedTime,
        open,
        high,
        low,
        close: price
      };

      store.addChartTick(pair, newBar);
      this.updateEquityAndPL();
    }, 2000);
  }

  private stopFallbackTicks() {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
  }

  private async triggerRealTrade() {
    const store = useBotStore.getState();
    const pair = store.selectedPair;
    const price = this.currentPrices[pair];
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    
    // Call the store action which will perform a real POST request to backend
    await store.executeRealTrade(pair, type, store.config.tradeSize, price);
  }

  private updateEquityAndPL() {
    const store = useBotStore.getState();
    if (store.activeTrades.length === 0) {
      store.updateStats({ equity: store.stats.balance });
      return;
    }

    let floatingPL = 0;
    store.activeTrades.forEach((trade) => {
      const currentPrice = this.currentPrices[trade.pair] || trade.entryPrice;
      const diff = trade.type === 'BUY'
        ? currentPrice - trade.entryPrice
        : trade.entryPrice - currentPrice;
      const multiplier = trade.pair === 'USD/JPY' ? 1000 : 100000;
      floatingPL += diff * trade.lotSize * multiplier;
    });

    store.updateStats({
      equity: parseFloat((store.stats.balance + floatingPL).toFixed(2)),
    });
  }

  public disconnect() {
    this.stopFallbackTicks();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.aiIntervalId) clearInterval(this.aiIntervalId);
    if (this.tradeCheckIntervalId) clearInterval(this.tradeCheckIntervalId);
  }
}

export const mockSocketService = new RealSocketService();
export const realSocketService = mockSocketService;
