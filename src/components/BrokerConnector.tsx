'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { Shield, Link, Unlink, RefreshCw, Layers, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function BrokerConnector() {
  const t = useI18nStore((state) => state.t);
  const {
    brokerAccounts,
    fetchBrokerAccounts,
    linkBrokerAccount,
    brokerSyncLogs,
    fetchBrokerSyncLogs,
    syncBrokerAccount,
    disconnectBrokerAccount
  } = useBotStore();

  const [brokerName, setBrokerName] = useState('IC Markets');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [serverAddress, setServerAddress] = useState('ICMarkets-Demo01');
  const [leverage, setLeverage] = useState('500');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrokerAccounts();
  }, [fetchBrokerAccounts]);

  useEffect(() => {
    if (selectedAccId) {
      fetchBrokerSyncLogs(selectedAccId);
    }
  }, [selectedAccId, fetchBrokerSyncLogs]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await linkBrokerAccount({
        brokerName,
        accountNumber,
        passwordCipher: password, // The service will encrypt it
        serverAddress,
        leverage: parseInt(leverage)
      });
      setSuccess(t('broker.successMsg'));
      setAccountNumber('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || t('broker.failMsg'));
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (accountId: string) => {
    await syncBrokerAccount(accountId);
  };

  const logs = selectedAccId ? (brokerSyncLogs[selectedAccId] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Link Account Form */}
      <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
          <Link className="text-cyan-400 h-5 w-5" />
          {t('broker.connectTitle')}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t('broker.connectDesc')}
        </p>

        {error && <div className="p-3 bg-red-950/40 border border-red-900/45 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
        {success && <div className="p-3 bg-emerald-950/40 border border-emerald-900/45 text-emerald-400 text-xs rounded-xl font-mono">{success}</div>}

        <form onSubmit={handleLink} className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{t('broker.selectBroker')}</label>
            <select
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="IC Markets">IC Markets</option>
              <option value="Pepperstone">Pepperstone</option>
              <option value="Exness">Exness</option>
              <option value="OctaFX">OctaFX</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{t('broker.accountNumber')}</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 8920138"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{t('broker.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{t('broker.serverAddress')}</label>
            <input
              type="text"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              placeholder="Contoh: ICMarkets-Demo01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">{t('broker.leverage')}</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="100">1:100</option>
              <option value="200">1:200</option>
              <option value="500">1:500 ({t('common.verified')})</option>
              <option value="1000">1:1000</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono py-1">
            <Shield className="h-3 w-3 text-cyan-500" />
            {t('broker.encrypted')}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            {loading ? t('broker.connecting') : t('broker.connect')}
          </button>
        </form>
      </div>

      {/* Connected Accounts & Logs List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="text-cyan-400 h-5 w-5" />
              {t('broker.connectedTitle')}
            </h3>
            <button
              onClick={() => fetchBrokerAccounts()}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-850"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {brokerAccounts.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl space-y-2 bg-slate-950/20">
              <Unlink className="h-8 w-8 text-slate-600" />
              <span className="text-xs text-slate-400 font-mono">{t('broker.noAccounts')}</span>
              <span className="text-[10px] text-slate-600 font-mono">{t('broker.useForm')}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {brokerAccounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccId(acc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAccId === acc.id 
                      ? 'bg-slate-950/80 border-cyan-500/50 shadow-md shadow-cyan-950/30' 
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-750'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200 font-mono">{acc.brokerName}</h4>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/35 px-2 py-0.5 rounded-full font-bold font-mono">
                          {acc.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Login: {acc.accountNumber} | Leverage: 1:{acc.leverage}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">{t('broker.balance')}</span>
                          <span className="text-xs font-bold text-slate-200 font-mono">${acc.balance.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">{t('broker.equity')}</span>
                          <span className="text-xs font-bold text-cyan-400 font-mono">${acc.equity.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSync(acc.id);
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-slate-350 hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                          title={t('broker.syncNow')}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t('broker.confirmDisconnect'))) {
                              disconnectBrokerAccount(acc.id);
                            }
                          }}
                          className="p-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/40 rounded-xl text-slate-400 hover:text-rose-455 transition-all flex items-center justify-center cursor-pointer"
                          title={t('broker.disconnect')}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync Logs Panel */}
        {selectedAccId && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl animate-scale-up">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="text-cyan-400 h-4 w-4" />
              {t('broker.syncLogs')}
            </h3>

            {logs.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono">{t('broker.noSyncLogs')}</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {logs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.status}
                        </span>
                      </div>
                      {log.errorMessage && (
                        <p className="text-[10px] text-rose-400/80">{log.errorMessage}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.syncedAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
