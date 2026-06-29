'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { Shield, Link, Unlink, RefreshCw, Layers } from 'lucide-react';

export default function BrokerConnector() {
  const {
    brokerAccounts,
    fetchBrokerAccounts,
    linkBrokerAccount
  } = useBotStore();

  const [brokerName, setBrokerName] = useState('IC Markets');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [serverAddress, setServerAddress] = useState('ICMarkets-Demo01');
  const [leverage, setLeverage] = useState('500');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBrokerAccounts();
  }, [fetchBrokerAccounts]);

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
      setSuccess('Broker account successfully connected!');
      setAccountNumber('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to connect broker account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Link Account Form */}
      <div className="lg:col-span-1 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Link className="text-cyan-400 h-5 w-5" />
          Link MT4 / MT5 Account
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Hubungkan akun trading MT4 atau MT5 Anda untuk mengizinkan bot AI mengeksekusi order secara langsung pada broker Anda.
        </p>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">{success}</div>}

        <form onSubmit={handleLink} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Select Broker</label>
            <select
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="IC Markets">IC Markets</option>
              <option value="Pepperstone">Pepperstone</option>
              <option value="Exness">Exness</option>
              <option value="OctaFX">OctaFX</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Account Number (Login)</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 8920138"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Server Address</label>
            <input
              type="text"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              placeholder="e.g. ICMarkets-Demo01"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="100">1:100</option>
              <option value="200">1:200</option>
              <option value="500">1:500 (Recommended)</option>
              <option value="1000">1:1000</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <Shield className="h-3 w-3 text-cyan-500" />
            Password is encrypted using militar-grade AES-256-GCM.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/15"
          >
            {loading ? 'Connecting to Broker...' : 'Connect Account'}
          </button>
        </form>
      </div>

      {/* Connected Accounts List */}
      <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="text-cyan-400 h-5 w-5" />
            Connected Broker Accounts
          </h3>
          <button
            onClick={() => fetchBrokerAccounts()}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {brokerAccounts.length === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl space-y-2">
            <Unlink className="h-8 w-8 text-gray-600" />
            <span className="text-sm text-gray-400">No broker accounts connected.</span>
            <span className="text-xs text-gray-600">Link an account using the form on the left.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {brokerAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-md font-bold text-white">{acc.brokerName}</h4>
                    <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-semibold font-mono">
                      {acc.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    Login: {acc.accountNumber} | Leverage: 1:{acc.leverage}
                  </div>
                </div>

                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">BALANCE</span>
                    <span className="text-md font-bold text-white font-mono">${acc.balance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">EQUITY</span>
                    <span className="text-md font-bold text-cyan-400 font-mono">${acc.equity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
