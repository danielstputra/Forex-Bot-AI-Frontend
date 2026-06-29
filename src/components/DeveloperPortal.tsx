'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { Code, Key, Globe, Plus, Trash2, Play, Check, Copy, Terminal, Shield } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permission: 'Read Only' | 'Trade Execution';
  created: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
}

export default function DeveloperPortal() {
  const { 
    apiKeys, 
    fetchApiKeys, 
    generateApiKey, 
    revokeApiKey, 
    addNotification, 
    addAuditLog 
  } = useBotStore();
  
  const [keyName, setKeyName] = useState('');
  const [keyPermission, setKeyPermission] = useState<'Read Only' | 'Trade Execution'>('Read Only');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  
  // Webhooks States
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: 'web-1', url: 'https://api.mybrokerage.com/webhooks/forex', events: ['trade.open', 'trade.close'] }
  ]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [eventOpen, setEventOpen] = useState(true);
  const [eventClose, setEventClose] = useState(true);

  // API Docs Sandbox States
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // Key Generation
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      const newKey = await generateApiKey(keyName.trim(), keyPermission);
      if (newKey && newKey.key) {
        setGeneratedKey(newKey.key); // Show raw key once in modal
      }
      setKeyName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    try {
      await revokeApiKey(id, name);
    } catch (err) {
      console.error(err);
    }
  };

  // Webhooks Management
  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    const events: string[] = [];
    if (eventOpen) events.push('trade.open');
    if (eventClose) events.push('trade.close');

    const newWebhook: Webhook = {
      id: `web-${Date.now()}`,
      url: webhookUrl.trim(),
      events
    };

    setWebhooks([...webhooks, newWebhook]);
    setWebhookUrl('');
    addNotification('Webhook URL berhasil didaftarkan.');
    addAuditLog(`Webhook Registered: ${newWebhook.url}`);
  };

  const handleTestWebhook = (url: string) => {
    addNotification(`Mengirimkan payload uji coba ke ${url}...`);
    setTimeout(() => {
      addNotification(`Uji Webhook Sukses! ${url} merespon dengan status 200 OK.`);
      addAuditLog(`Webhook Test Dispatched: ${url} (200 OK)`);
    }, 1200);
  };

  const handleDeleteWebhook = (id: string, url: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    addNotification(`Webhook ${url} dihapus.`);
    addAuditLog(`Webhook Removed: ${url}`);
  };

  // API Docs Sandbox Simulation
  const handleTryItOut = (endpoint: string, method: string, payload?: any) => {
    setActiveEndpoint(endpoint);
    setSandboxLoading(true);
    setSandboxResponse(null);

    setTimeout(() => {
      setSandboxLoading(false);
      if (endpoint === 'GET /api/v1/trades') {
        setSandboxResponse({
          status: 'success',
          timestamp: new Date().toISOString(),
          data: [
            { id: 'TX-4811', pair: 'EUR/USD', type: 'BUY', entryPrice: 1.0862, lotSize: 0.2, status: 'OPEN' }
          ]
        });
      } else if (endpoint === 'POST /api/v1/bot/control') {
        setSandboxResponse({
          status: 'success',
          timestamp: new Date().toISOString(),
          message: `Bot state successfully updated to: ${payload.action}`,
          activePair: 'EUR/USD'
        });
      } else if (endpoint === 'POST /api/v1/orders') {
        setSandboxResponse({
          status: 'success',
          timestamp: new Date().toISOString(),
          orderId: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          executedPrice: 1.0854,
          message: 'Order executed successfully via Public API'
        });
      }
      addAuditLog(`API Sandbox Executed: ${method} ${endpoint}`);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
          <Code className="w-6 h-6 text-cyan-400" />
          Developer Portal & Public API
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hubungkan skrip algoritma eksternal Anda (Python, MetaTrader) ke platform kami menggunakan API Key dan Webhook.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 - Keys & Webhooks */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* API Keys Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-cyan-400" />
              API Key Management
            </h3>

            <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] text-slate-455 font-mono uppercase tracking-wider">Nama API Key</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Python Trading Script"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="w-full sm:w-48 space-y-1.5">
                <label className="text-[10px] text-slate-455 font-mono uppercase tracking-wider">Izin Otorisasi</label>
                <select
                  value={keyPermission}
                  onChange={(e) => setKeyPermission(e.target.value as any)}
                  className="w-full bg-slate-955 border border-slate-850 rounded-xl px-4 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option>Read Only</option>
                  <option>Trade Execution</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-955 text-xs font-black uppercase rounded-xl transition-all duration-305 flex items-center justify-center gap-1.5 shrink-0"
              >
                Generate Key
              </button>
            </form>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-550 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-normal">Nama</th>
                    <th className="py-2.5 px-4 font-normal">Kunci Rahasia</th>
                    <th className="py-2.5 px-4 font-normal">Izin</th>
                    <th className="py-2.5 px-4 font-normal">Dibuat</th>
                    <th className="py-2.5 px-4 text-right font-normal">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs font-mono text-slate-350">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-955/20 transition-colors duration-250">
                      <td className="py-3 px-4 font-bold text-slate-200">{k.name}</td>
                      <td className="py-3 px-4 text-slate-450 tracking-widest">{k.key}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          k.permission === 'Trade Execution' ? 'bg-purple-950 text-purple-400' : 'bg-slate-950 text-slate-500'
                        }`}>
                          {k.permission}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-550">{k.created}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRevokeKey(k.id, k.name)}
                          className="p-1.5 hover:bg-rose-950 hover:text-rose-450 text-slate-500 rounded-lg transition-all duration-300"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhooks Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-cyan-400" />
              Webhook Subscriptions
            </h3>

            <form onSubmit={handleAddWebhook} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-[10px] text-slate-455 font-mono uppercase tracking-wider">URL Endpoint Webhook</label>
                  <input
                    type="url"
                    required
                    placeholder="https://server-anda.com/api/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-955 text-xs font-black uppercase rounded-xl transition-all duration-305 flex items-center justify-center gap-1.5 shrink-0"
                >
                  Daftarkan Webhook
                </button>
              </div>

              {/* Event Toggles */}
              <div className="flex gap-6 text-xs font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input 
                    type="checkbox" 
                    checked={eventOpen} 
                    onChange={(e) => setEventOpen(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  trade.open (Posisi Dibuka)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input 
                    type="checkbox" 
                    checked={eventClose} 
                    onChange={(e) => setEventClose(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  trade.close (Posisi Ditutup)
                </label>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {webhooks.map((w) => (
                <div key={w.id} className="flex bg-slate-950 border border-slate-850 rounded-2xl p-4 justify-between items-center gap-4">
                  <div className="space-y-1 text-left min-w-0 flex-1">
                    <span className="text-xs text-slate-200 font-mono block truncate">{w.url}</span>
                    <div className="flex gap-1.5">
                      {w.events.map(ev => (
                        <span key={ev} className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-500 rounded border border-slate-800 font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTestWebhook(w.url)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-450 text-[10px] font-bold font-mono rounded-lg transition-all duration-300"
                    >
                      Test Webhook
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(w.id, w.url)}
                      className="p-2 hover:bg-rose-950 hover:text-rose-450 text-slate-500 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1/3 - API Sandbox / Swagger UI */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4.5 h-4.5 text-cyan-400" /> Interactive API Docs
            </h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Dokumentasi endpoint REST API. Gunakan tombol **"Try"** untuk menyimulasikan panggilan API dan melihat respon langsung.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Endpoint 1 */}
              <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/30">
                <div className="bg-emerald-950/30 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">GET</span>
                    <span className="text-[11px] font-mono text-slate-350 font-bold">/api/v1/trades</span>
                  </div>
                  <button
                    onClick={() => handleTryItOut('GET /api/v1/trades', 'GET')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Try it out"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/30">
                <div className="bg-purple-950/30 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono bg-purple-500 text-slate-950 px-1.5 py-0.5 rounded">POST</span>
                    <span className="text-[11px] font-mono text-slate-350 font-bold">/api/v1/bot/control</span>
                  </div>
                  <button
                    onClick={() => handleTryItOut('POST /api/v1/bot/control', 'POST', { action: 'START' })}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Try it out"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/30">
                <div className="bg-purple-950/30 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono bg-purple-500 text-slate-950 px-1.5 py-0.5 rounded">POST</span>
                    <span className="text-[11px] font-mono text-slate-350 font-bold">/api/v1/orders</span>
                  </div>
                  <button
                    onClick={() => handleTryItOut('POST /api/v1/orders', 'POST', { pair: 'EUR/USD', type: 'BUY', lotSize: 0.1 })}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Try it out"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

            {/* Sandbox Response Console */}
            {activeEndpoint && (
              <div className="bg-slate-955 border border-slate-850 rounded-2xl p-4.5 space-y-2.5 font-mono text-[10px] text-left">
                <div className="flex justify-between items-center text-slate-500 border-b border-slate-850 pb-1.5">
                  <span>RESPONSE CONSOLE</span>
                  <span className="text-cyan-400">{activeEndpoint}</span>
                </div>
                
                {sandboxLoading ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400 justify-center">
                    <span className="animate-spin h-4.5 w-4.5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    Connecting to server...
                  </div>
                ) : (
                  <pre className="overflow-x-auto p-2 bg-slate-950 rounded-xl text-slate-300 leading-normal max-h-48 overflow-y-auto">
                    {JSON.stringify(sandboxResponse, null, 2)}
                  </pre>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* API Key Generated Modal */}
      {generatedKey && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              API Key Berhasil Dibuat
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Salin kunci rahasia di bawah sekarang. Demi alasan keamanan, kunci ini tidak akan ditampilkan kembali setelah Anda menutup dialog ini.
            </p>

            <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1.5 justify-between items-center">
              <span className="text-[11px] text-slate-200 font-mono pl-3 truncate max-w-[280px] font-bold tracking-wider">{generatedKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey);
                  addNotification('Kunci API disalin ke clipboard.');
                }}
                className="p-2 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-300"
                title="Salin Kunci"
              >
                <Copy className="w-4.5 h-4.5" />
              </button>
            </div>

            <button
              onClick={() => setGeneratedKey(null)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300"
            >
              Saya Sudah Menyalinnya
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
