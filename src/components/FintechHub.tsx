'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { ShieldCheck, Cpu, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

export default function FintechHub() {
  const {
    wallets,
    vpsInstance,
    fetchWallets,
    fetchVps,
    requestDeposit,
    requestWithdrawal,
    deployVps,
    appConfig
  } = useBotStore();

  const [activeTab, setActiveTab] = useState<'wallet' | 'vps'>('wallet');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);

  const [vpsPlan, setVpsPlan] = useState('VPS Basic');
  const [vpsRegion, setVpsRegion] = useState('Singapore');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWallets();
    fetchVps();
  }, [fetchWallets, fetchVps]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    setActiveQrUrl(null);

    try {
      const res = await requestDeposit(currency, parseFloat(amount), paymentMethod, proofFile);
      if (paymentMethod === 'QRIS' && res?.qrUrl) {
        setActiveQrUrl(res.qrUrl);
        setMsg({ type: 'success', text: 'QRIS berhasil dibuat! Silakan scan untuk membayar.' });
      } else {
        setMsg({ type: 'success', text: 'Deposit submitted successfully! Awaiting admin approval.' });
        setAmount('');
        setProofFile(null);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit deposit.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await requestWithdrawal(currency, parseFloat(amount), paymentMethod, payoutDetails);
      setMsg({ type: 'success', text: 'Withdrawal submitted successfully! Awaiting admin approval.' });
      setAmount('');
      setPayoutDetails('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit withdrawal.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeployVps = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await deployVps(vpsPlan, vpsRegion);
      setMsg({ type: 'success', text: 'VPS provisioned successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to deploy VPS.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => { setActiveTab('wallet'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'wallet'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet className="h-4 w-4" />
          Multi-Currency Wallet
        </button>
        <button
          onClick={() => { setActiveTab('vps'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'vps'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Dedicated VPS Hosting
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-lg border ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {activeTab === 'wallet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balances */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white">Wallet Balances</h3>
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">{w.currency} Wallet</span>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {w.currency === 'USD' ? '$' : ''}
                      {w.balance.toLocaleString(undefined, { minimumFractionDigits: w.currency === 'BTC' ? 6 : 2 })}
                      {w.currency !== 'USD' ? ` ${w.currency}` : ''}
                    </h4>
                    {w.address && (
                      <span className="text-[10px] text-gray-500 font-mono block mt-1 truncate max-w-[200px]">
                        Address: {w.address}
                      </span>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${w.currency === 'USD' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => fetchWallets()}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Balances
            </button>
          </div>

          {/* Deposit & Withdraw Forms */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Form / QRIS Screen */}
            {activeQrUrl ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-md font-bold text-white font-mono">PEMBAYARAN QRIS INSTAN</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Scan QRIS di bawah ini menggunakan **GoPay, ShopeePay, DANA, OVO**, atau Mobile Banking Anda.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-750 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeQrUrl} alt="Midtrans QRIS Code" className="w-48 h-48 object-contain" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-slate-500">Jumlah Bayar:</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    Rp {(parseFloat(amount) * (currency === 'USD' ? 16000 : 1)).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    (Setara dengan {currency === 'USD' ? '$' : ''}{amount} {currency !== 'USD' ? currency : ''})
                  </div>
                </div>
                <div className="w-full pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setActiveQrUrl(null);
                      setAmount('');
                      setProofFile(null);
                      setMsg({ type: '', text: '' });
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-855 border border-slate-850 text-slate-300 font-medium rounded-xl text-xs transition-all"
                  >
                    Tutup / Batalkan
                  </button>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      await fetchWallets();
                      setLoading(false);
                      setActiveQrUrl(null);
                      setAmount('');
                      setProofFile(null);
                      setMsg({ type: 'success', text: 'Permintaan deposit QRIS diproses. Saldo akan otomatis bertambah saat pembayaran terverifikasi.' });
                    }}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/15"
                  >
                    Saya Sudah Bayar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ArrowDownRight className="text-cyan-400" />
                    Deposit Funds
                  </h3>
                </div>
                <form onSubmit={handleDeposit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Select Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USD">USD (Bank Transfer / QRIS)</option>
                      <option value="USDT">USDT (TRC20 Crypto)</option>
                      <option value="BTC">BTC (Bitcoin Network)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {currency === 'USD' ? (
                        <>
                          <option value="BANK_TRANSFER">Bank Transfer (BCA/Mandiri)</option>
                          <option value="QRIS">QRIS Instant Payment</option>
                        </>
                      ) : (
                        <option value="CRYPTO">Crypto Wallet Transfer</option>
                      )}
                    </select>
                  </div>

                  {/* Dynamic Payment Details & QR Code */}
                  {(() => {
                    const selectedWallet = wallets.find((w) => w.currency === currency);
                    
                    if (currency === 'USD' && paymentMethod === 'BANK_TRANSFER') {
                      return (
                        <div className="p-3.5 bg-slate-950/80 border border-white/10 rounded-xl space-y-2.5">
                          <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider">Detail Transfer Bank</span>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bank:</span>
                              <span className="text-gray-200 font-semibold">{(appConfig as any)?.bankName || 'BCA (Bank Central Asia)'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">No. Rekening:</span>
                              <span className="text-cyan-400 font-mono font-bold select-all">{(appConfig as any)?.bankAccountNumber || '8021308212'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Nama Penerima:</span>
                              <span className="text-gray-200 font-semibold">{(appConfig as any)?.bankRecipientName || 'PT Forex Bot AI Global'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (currency === 'USD' && paymentMethod === 'QRIS') {
                      return (
                        <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-2.5 text-center">
                          <span className="text-[10px] text-cyan-400 font-mono block uppercase tracking-wider">QRIS Instant Payment</span>
                          <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-[10px] text-gray-455 leading-relaxed font-mono">
                            Kode QRIS dinamis akan dibuat otomatis oleh Payment Gateway aktif (Midtrans/Xendit) setelah Anda memasukkan nominal dan mengeklik tombol <span className="text-cyan-400 font-bold">"Submit Deposit"</span> di bawah.
                          </div>
                        </div>
                      );
                    }

                    if ((currency === 'USDT' || currency === 'BTC') && selectedWallet?.address) {
                      return (
                        <div className="p-3.5 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col items-center gap-2.5 text-center">
                          <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider">Scan Alamat Deposit {currency}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedWallet.address)}`} 
                            alt={`${currency} Deposit`} 
                            className="w-28 h-28 p-1 bg-white rounded-lg border border-slate-750"
                          />
                          <div className="space-y-1 w-full">
                            <span className="text-[9px] text-gray-500 font-mono block">ALAMAT DOMPET {currency}</span>
                            <span className="text-[10px] text-purple-400 font-mono font-bold select-all break-all block px-2 py-1 bg-white/5 rounded-lg border border-white/5">{selectedWallet.address}</span>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {paymentMethod !== 'QRIS' && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Upload Payment Proof (JPG, PNG, PDF)</label>
                      <input
                        type="file"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-500/30"
                        required={paymentMethod !== 'QRIS'}
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/15"
                  >
                    {loading ? 'Processing...' : 'Submit Deposit'}
                  </button>
                </form>
              </div>
            )}

            {/* Withdrawal Form */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowUpRight className="text-purple-400" />
                  Withdraw Funds
                </h3>
              </div>
              <form onSubmit={handleWithdrawal} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Select Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="USD">USD (Bank Transfer)</option>
                    <option value="USDT">USDT (TRC20 Crypto)</option>
                    <option value="BTC">BTC (Bitcoin Network)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    {currency === 'USD' ? (
                      <option value="BANK_TRANSFER">Local Bank Transfer</option>
                    ) : (
                      <option value="CRYPTO">Crypto Address</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Payout Destination Details</label>
                  <textarea
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={currency === 'USD' ? "BCA - 80213082 - A/N Budi Setiawan" : "Enter your TRC20/BTC wallet address"}
                    className="w-full h-[76px] bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-purple-500/15"
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* VPS Hosting Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VPS Info Card */}
          <div className="lg:col-span-1 p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  VPS Server Status
                </span>
                <Cpu className="h-6 w-6 text-purple-400" />
              </div>

              {vpsInstance ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white">{vpsInstance.planName}</h4>
                    <span className="text-xs text-gray-400 font-mono">Location: {vpsInstance.region}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono block">IP ADDRESS</span>
                    <span className="text-sm font-bold text-white font-mono">{vpsInstance.ipAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVE RUNNING (24/7 VPS ONLINE)
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">No VPS Deployed</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bot Anda saat ini berjalan pada sesi browser lokal. Jalankan bot 24/7 di server cloud VPS khusus agar trading tetap berjalan meskipun perangkat Anda mati.
                  </p>
                </div>
              )}
            </div>

            {vpsInstance && (
              <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-500 font-mono">
                Expires: {new Date(vpsInstance.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Deploy VPS Form */}
          <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Cpu className="text-purple-400" />
              Deploy New Dedicated VPS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Server Plan</label>
                <select
                  value={vpsPlan}
                  onChange={(e) => setVpsPlan(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="VPS Basic">VPS Basic (1 Core CPU, 2GB RAM) - FREE</option>
                  <option value="VPS Advanced">VPS Pro (2 Core CPU, 4GB RAM) - $15/mo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Server Region</label>
                <select
                  value={vpsRegion}
                  onChange={(e) => setVpsRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="Singapore">Singapore (Best for SE Asia)</option>
                  <option value="Tokyo">Tokyo, Japan (Low Latency)</option>
                  <option value="New York">New York, US (Near WallStreet Servers)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              * VPS Basic gratis untuk seluruh pelanggan paket **PRO** dan **ENTERPRISE**. Saldo dompet Anda akan dikurangi secara otomatis jika Anda memilih paket VPS Pro berbayar.
            </p>
            <button
              onClick={handleDeployVps}
              disabled={loading || !!vpsInstance}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Deploying Virtual Server...' : (vpsInstance ? 'VPS Already Active' : 'Deploy Virtual Dedicated VPS')}
            </button>
          </div>
        </div>
      )}
      {/* Real QRIS Payment Checkout Modal */}
      {activeQrUrl && (
        <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">QRIS Pembayaran Instan</h3>
              <p className="text-[10px] text-slate-450">
                Pindai kode QR di bawah ini menggunakan GoPay, ShopeePay, OVO, Dana, atau LinkAja Anda untuk menyelesaikan pembayaran.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border border-slate-800 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={activeQrUrl} 
                alt="Active QRIS Payment" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal Deposit:</span>
                <span className="text-cyan-400 font-bold">${amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status Transaksi:</span>
                <span className="text-amber-400 font-bold animate-pulse">Menunggu Pembayaran...</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveQrUrl(null);
                setAmount('');
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer active:scale-95"
            >
              Tutup & Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
