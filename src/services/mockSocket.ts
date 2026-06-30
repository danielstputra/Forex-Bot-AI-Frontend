import { useBotStore } from '../store/useBotStore';
import { OhlcvData, TradeRecord } from '../types';

class RealSocketService {
  private ws: WebSocket | null = null;
  private aiIntervalId: NodeJS.Timeout | null = null;
  private tradeCheckIntervalId: NodeJS.Timeout | null = null;
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
        store.addLog('Koneksi WebSocket terputus dari server.', 'WARNING');
      };
      
      this.ws.onerror = () => {
        store.addLog('Koneksi WebSocket mengalami error.', 'ERROR');
      };

    } catch (err: any) {
      console.error('Failed to establish WebSocket connection:', err);
    }

    // AI Simulation is now handled 100% autonomously by the Backend Trading Engine.
    this.aiIntervalId = setInterval(() => {
      const currentStore = useBotStore.getState();
      if (currentStore.status !== 'RUNNING') return;
      const pair = currentStore.selectedPair;
      currentStore.addLog(`[Backend Engine] Monitoring market movements for ${pair}...`, 'INFO');
    }, 15000);
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
