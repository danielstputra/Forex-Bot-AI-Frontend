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
    const wsUrl = 'ws://localhost:5000/socket.io/?EIO=4&transport=websocket';
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
                const newBar: OhlcvData = { time, open, high, low, close };
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

    // AI Simulation - Triggers real orders in database every 12 seconds if bot is running
    this.aiIntervalId = setInterval(() => {
      const currentStore = useBotStore.getState();
      if (currentStore.status !== 'RUNNING') return;

      const pair = currentStore.selectedPair;
      currentStore.addLog(`[AI Engine] Menganalisis pergerakan ${pair} secara real-time...`, 'INFO');

      if (Math.random() < 0.3 && currentStore.activeTrades.length < 5) {
        this.triggerRealTrade();
      }
    }, 12000);

    // Trade Closer - Closes trades in database after some time
    this.tradeCheckIntervalId = setInterval(() => {
      const currentStore = useBotStore.getState();
      if (currentStore.status !== 'RUNNING' || currentStore.activeTrades.length === 0) return;

      const tradeToClose = currentStore.activeTrades[0];
      if (Math.random() < 0.25) {
        const exitPrice = this.currentPrices[tradeToClose.pair] || tradeToClose.entryPrice;
        const pipsDiff = tradeToClose.type === 'BUY' 
          ? exitPrice - tradeToClose.entryPrice 
          : tradeToClose.entryPrice - exitPrice;
        const multiplier = tradeToClose.pair === 'USD/JPY' ? 1000 : 100000;
        const profit = parseFloat((pipsDiff * tradeToClose.lotSize * multiplier).toFixed(2));

        currentStore.closeTrade(tradeToClose.id, exitPrice, profit);
      }
    }, 8000);
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
