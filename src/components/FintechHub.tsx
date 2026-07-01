'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBotStore } from '../store/useBotStore';
import {
  Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, Copy,
  CheckCircle2, Clock, QrCode, Smartphone, Building2, ShoppingBag,
  ChevronRight, X, ExternalLink, AlertCircle, Zap
} from 'lucide-react';

// ─── Payment Method Configuration ────────────────────────────────────────────
interface PaymentMethodConfig {
  id: string;
  label: string;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
  logo: string; // emoji / character as logo
  category: 'ewallet' | 'va' | 'qris' | 'retail' | 'manual' | 'crypto';
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  // QRIS
  { id: 'QRIS', label: 'QRIS', description: 'Semua E-Wallet', color: 'bg-red-500/10', textColor: 'text-red-400', borderColor: 'border-red-500/30', logo: '▣', category: 'qris' },
  // E-Wallet
  { id: 'GOPAY', label: 'GoPay', description: 'Gojek', color: 'bg-green-500/10', textColor: 'text-green-400', borderColor: 'border-green-500/30', logo: '🟢', category: 'ewallet' },
  { id: 'SHOPEEPAY', label: 'ShopeePay', description: 'Shopee', color: 'bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500/30', logo: '🟠', category: 'ewallet' },
  { id: 'DANA', label: 'DANA', description: 'via Xendit', color: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', logo: '🔵', category: 'ewallet' },
  { id: 'OVO', label: 'OVO', description: 'via Xendit', color: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', logo: '🟣', category: 'ewallet' },
  { id: 'LINKAJA', label: 'LinkAja', description: 'via Xendit', color: 'bg-rose-500/10', textColor: 'text-rose-400', borderColor: 'border-rose-500/30', logo: '🔴', category: 'ewallet' },
  // Virtual Account
  { id: 'VA_BCA', label: 'BCA', description: 'Virtual Account', color: 'bg-blue-600/10', textColor: 'text-blue-300', borderColor: 'border-blue-600/30', logo: 'BCA', category: 'va' },
  { id: 'VA_MANDIRI', label: 'Mandiri', description: 'Virtual Account', color: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/30', logo: 'MDR', category: 'va' },
  { id: 'VA_BNI', label: 'BNI', description: 'Virtual Account', color: 'bg-orange-600/10', textColor: 'text-orange-300', borderColor: 'border-orange-600/30', logo: 'BNI', category: 'va' },
  { id: 'VA_BRI', label: 'BRI', description: 'Virtual Account', color: 'bg-sky-500/10', textColor: 'text-sky-400', borderColor: 'border-sky-500/30', logo: 'BRI', category: 'va' },
  { id: 'VA_CIMB', label: 'CIMB', description: 'Virtual Account', color: 'bg-red-600/10', textColor: 'text-red-300', borderColor: 'border-red-600/30', logo: 'CMB', category: 'va' },
  { id: 'VA_PERMATA', label: 'Permata', description: 'Virtual Account', color: 'bg-teal-500/10', textColor: 'text-teal-400', borderColor: 'border-teal-500/30', logo: 'PRM', category: 'va' },
  // Retail
  { id: 'ALFAMART', label: 'Alfamart', description: 'Bayar di kasir', color: 'bg-red-500/10', textColor: 'text-red-400', borderColor: 'border-red-500/30', logo: 'ALF', category: 'retail' },
  { id: 'INDOMARET', label: 'Indomaret', description: 'Bayar di kasir', color: 'bg-red-700/10', textColor: 'text-red-300', borderColor: 'border-red-700/30', logo: 'IDM', category: 'retail' },
  // Manual
  { id: 'BANK_TRANSFER', label: 'Transfer Bank', description: 'Manual + Bukti', color: 'bg-slate-500/10', textColor: 'text-slate-300', borderColor: 'border-slate-500/30', logo: '🏦', category: 'manual' },
];

const CRYPTO_METHODS: PaymentMethodConfig[] = [
  { id: 'CRYPTO_USDT', label: 'USDT', description: 'TRC20 Network', color: 'bg-emerald-500/10', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', logo: '₮', category: 'crypto' },
  { id: 'CRYPTO_BTC', label: 'Bitcoin', description: 'BTC Network', color: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/30', logo: '₿', category: 'crypto' },
];

const CATEGORY_LABELS: Record<string, string> = {
  qris: '▣ QRIS — Universal Scan',
  ewallet: '📱 E-Wallet',
  va: '🏦 Virtual Account',
  retail: '🏪 Minimarket',
  manual: '🔄 Transfer Manual',
};

// ─── Helper: Copy to Clipboard ──────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors" title="Salin">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );
}

// ─── Payment Result Modal ────────────────────────────────────────────────────
interface PaymentResult {
  depositId: string;
  paymentType: string;
  qrUrl?: string;
  deeplink?: string;
  checkoutUrl?: string;
  vaNumber?: string;
  vaBank?: string;
  paymentCode?: string;
  retailStore?: string;
  amountIdr: number;
  expiresAt?: string;
}

function PaymentResultModal({ result, onClose, onConfirm }: { result: PaymentResult; onClose: () => void; onConfirm: () => void }) {
  const [polling, setPolling] = useState(false);
  const [paid, setPaid] = useState(false);
  const { fetchWallets } = useBotStore();

  const handleConfirm = async () => {
    setPolling(true);
    await fetchWallets();
    setPolling(false);
    setPaid(true);
    setTimeout(() => { onConfirm(); }, 1500);
  };

  const amountStr = `Rp ${result.amountIdr.toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative p-5 border-b border-slate-800 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {paid ? 'Pembayaran Terverifikasi!' : 'Menunggu Pembayaran'}
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">{result.paymentType.replace('_', ' ')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Nominal: <span className="text-cyan-400 font-bold">{amountStr}</span></p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* QR Code (QRIS / GoPay) */}
          {result.qrUrl && (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.qrUrl} alt="QR Code" className="w-44 h-44 object-contain" />
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Scan dengan <span className="text-white font-semibold">GoPay, ShopeePay, DANA, OVO, LinkAja</span>, atau Mobile Banking Anda
              </p>
              {/* Logos */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {['🟢 GoPay', '🟠 ShopeePay', '🔵 DANA', '🟣 OVO', '🔴 LinkAja'].map(l => (
                  <span key={l} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Deeplink / Checkout URL (ShopeePay, DANA, OVO, LinkAja) */}
          {!result.qrUrl && (result.deeplink || result.checkoutUrl) && (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 text-center space-y-2 w-full">
                <Smartphone className="w-10 h-10 mx-auto text-cyan-400" />
                <p className="text-sm font-semibold text-slate-200">Bayar via Aplikasi</p>
                <p className="text-[10px] text-slate-400">Klik tombol di bawah untuk membuka aplikasi {result.paymentType} Anda</p>
              </div>
              <a
                href={result.deeplink || result.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                Buka {result.paymentType}
              </a>
            </div>
          )}

          {/* Virtual Account */}
          {result.vaNumber && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Building2 className="w-4 h-4" />
                  <span className="uppercase tracking-wider font-mono">Bank {result.vaBank}</span>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Nomor Virtual Account</div>
                  <div className="flex items-center">
                    <span className="text-xl font-black text-white font-mono tracking-widest">{result.vaNumber}</span>
                    <CopyButton text={result.vaNumber} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total Bayar:</div>
                  <div className="text-sm font-bold text-cyan-400">{amountStr}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Transfer tepat nominal di atas. Saldo akan otomatis ditambahkan setelah pembayaran terverifikasi oleh bank.
              </div>
            </div>
          )}

          {/* Retail Payment Code (Alfamart / Indomaret) */}
          {result.paymentCode && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="uppercase tracking-wider font-mono">{result.retailStore}</span>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Kode Pembayaran</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-black text-white font-mono tracking-widest">{result.paymentCode}</span>
                    <CopyButton text={result.paymentCode} />
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total: <span className="text-amber-400">{amountStr}</span></div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-400 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Tunjukkan kode ini kepada kasir {result.retailStore} terdekat. Bayar sesuai nominal. Saldo aktif otomatis.
              </div>
            </div>
          )}

          {/* Expiry */}
          {result.expiresAt && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              Berlaku hingga: <span className="text-slate-300">{new Date(result.expiresAt).toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">
            Tutup
          </button>
          <button
            onClick={handleConfirm}
            disabled={polling || paid}
            className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            {polling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            {polling ? 'Memverifikasi...' : paid ? 'Terverifikasi!' : 'Sudah Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main FintechHub ──────────────────────────────────────────────────────────
export default function FintechHub() {
  const { wallets, vpsInstance, fetchWallets, fetchVps, requestDeposit, requestWithdrawal, deployVps, appConfig } = useBotStore();

  const [activeTab, setActiveTab] = useState<'wallet' | 'vps'>('wallet');
  const [depositMode, setDepositMode] = useState<'pick' | 'form'>('pick');
  const [withdrawMode, setWithdrawMode] = useState<'pick' | 'form'>('pick');

  // Deposit state
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [payoutDetails, setPayoutDetails] = useState('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // VPS state
  const [vpsPlan, setVpsPlan] = useState('VPS Basic');
  const [vpsRegion, setVpsRegion] = useState('Singapore');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchWallets(); fetchVps(); }, [fetchWallets, fetchVps]);

  const amountIdr = amount ? Math.round(parseFloat(amount) * (currency === 'USD' ? 16200 : 1)) : 0;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await requestDeposit(currency, parseFloat(amount), selectedMethod.id, proofFile);
      if (res && (res.qrUrl || res.vaNumber || res.paymentCode || res.checkoutUrl || res.deeplink)) {
        setPaymentResult({ ...res, amountIdr });
      } else if (res) {
        setMsg({ type: 'success', text: 'Deposit diajukan. Admin akan memverifikasi dalam 1×24 jam.' });
        setAmount(''); setProofFile(null); setDepositMode('pick'); setSelectedMethod(null);
        await fetchWallets();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal mengajukan deposit.' });
    } finally { setLoading(false); }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await requestWithdrawal(currency, parseFloat(amount), selectedMethod.id, payoutDetails);
      setMsg({ type: 'success', text: 'Penarikan diajukan. Diproses dalam 1×24 jam kerja.' });
      setAmount(''); setPayoutDetails(''); setWithdrawMode('pick'); setSelectedMethod(null);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal mengajukan penarikan.' });
    } finally { setLoading(false); }
  };

  const handleDeployVps = async () => {
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      await deployVps(vpsPlan, vpsRegion);
      setMsg({ type: 'success', text: 'VPS berhasil di-deploy!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal deploy VPS.' });
    } finally { setLoading(false); }
  };

  // ─── Payment Method Picker UI ─────────────────────────────────────────────
  const renderMethodPicker = (onSelect: (m: PaymentMethodConfig) => void, isCrypto: boolean = false) => {
    const categories = isCrypto
      ? [{ key: 'crypto', label: '🔐 Aset Kripto', items: CRYPTO_METHODS }]
      : (['qris', 'ewallet', 'va', 'retail', 'manual'] as const).map(cat => ({
          key: cat,
          label: CATEGORY_LABELS[cat],
          items: PAYMENT_METHODS.filter(m => m.category === cat)
        }));

    return (
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.key}>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 px-1">{cat.label}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {cat.items.map(m => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${m.color} ${m.borderColor}`}
                >
                  <span className="text-lg sm:text-xl leading-none">{m.logo}</span>
                  <span className={`text-[10px] sm:text-xs font-bold ${m.textColor} text-center leading-tight`}>{m.label}</span>
                  <span className="text-[8px] text-slate-500 text-center hidden sm:block">{m.description}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const isCryptoCurrency = currency !== 'USD';
  const selectedWallet = wallets.find(w => w.currency === currency);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-slate-800 pb-4">
        <button onClick={() => { setActiveTab('wallet'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'wallet' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <Wallet className="h-4 w-4" /> Multi-Currency Wallet
        </button>
        <button onClick={() => { setActiveTab('vps'); setMsg({ type: '', text: '' }); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'vps' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <Cpu className="h-4 w-4" /> Dedicated VPS
        </button>
      </div>

      {/* Global Message */}
      {msg.text && (
        <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          {msg.text}
        </div>
      )}

      {/* ─── WALLET TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Wallet Balances */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Saldo Wallet</h3>
            {wallets.map(w => (
              <div key={w.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{w.currency} Wallet</div>
                    <div className="text-xl font-black text-white mt-0.5">
                      {w.currency === 'USD' ? '$' : ''}{w.balance.toLocaleString(undefined, { minimumFractionDigits: w.currency === 'BTC' ? 6 : 2 })}
                      {w.currency !== 'USD' ? ` ${w.currency}` : ''}
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl ${w.currency === 'USD' ? 'bg-cyan-500/10 text-cyan-400' : w.currency === 'USDT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                {w.address && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Deposit Address</div>
                    <div className="flex items-center mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono truncate">{w.address}</span>
                      <CopyButton text={w.address} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={fetchWallets} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 rounded-xl text-xs transition-all border border-slate-700/50">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Saldo
            </button>
          </div>

          {/* Deposit & Withdraw */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

            {/* ── DEPOSIT ────────────────────────────────────────────── */}
            <div className="p-4 sm:p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-cyan-400" /> Deposit
                </h3>
                {depositMode === 'form' && (
                  <button onClick={() => { setDepositMode('pick'); setSelectedMethod(null); }} className="text-[10px] text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    ← Ganti Metode
                  </button>
                )}
              </div>

              {/* Currency Selector */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Mata Uang</label>
                <select value={currency} onChange={e => { setCurrency(e.target.value); setDepositMode('pick'); setSelectedMethod(null); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="USD">USD — Dollar (IDR Gateway)</option>
                  <option value="USDT">USDT — TRC20 Crypto</option>
                  <option value="BTC">BTC — Bitcoin Network</option>
                </select>
              </div>

              {/* Method Picker or Form */}
              {depositMode === 'pick' ? (
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Pilih Metode Pembayaran</label>
                  {isCryptoCurrency ? (
                    /* Crypto deposit: show address QR */
                    <div className="flex flex-col items-center gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                      {selectedWallet?.address ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedWallet.address)}`}
                            alt={`${currency} Deposit Address`} className="w-32 h-32 p-1.5 bg-white rounded-xl border border-slate-700" />
                          <div className="w-full text-center">
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Alamat {currency} Anda</div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-[10px] text-purple-400 font-mono font-bold break-all">{selectedWallet.address}</span>
                              <CopyButton text={selectedWallet.address} />
                            </div>
                          </div>
                          <div className="text-[9px] text-amber-400 text-center">⚠ Hanya kirim {currency} ke alamat ini. Aset lain akan hilang permanen.</div>
                        </>
                      ) : <p className="text-xs text-slate-500">Memuat alamat wallet...</p>}
                    </div>
                  ) : (
                    renderMethodPicker(m => { setSelectedMethod(m); setDepositMode('form'); })
                  )}
                </div>
              ) : (
                /* Deposit Form */
                <form onSubmit={handleDeposit} className="space-y-3">
                  {/* Selected Method Badge */}
                  {selectedMethod && (
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${selectedMethod.color} ${selectedMethod.borderColor}`}>
                      <span className="text-base">{selectedMethod.logo}</span>
                      <div>
                        <div className={`text-xs font-bold ${selectedMethod.textColor}`}>{selectedMethod.label}</div>
                        <div className="text-[9px] text-slate-500">{selectedMethod.description}</div>
                      </div>
                      <Zap className={`w-3 h-3 ml-auto ${selectedMethod.textColor}`} />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Nominal (USD)</label>
                    <div className="relative">
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="Contoh: 100" min="1" required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 pr-24" />
                      {amount && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">≈ Rp{amountIdr.toLocaleString('id-ID')}</span>}
                    </div>
                  </div>

                  {selectedMethod?.id === 'BANK_TRANSFER' && (
                    <>
                      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1.5 text-xs">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Rekening Tujuan</div>
                        <div className="flex justify-between"><span className="text-slate-400">Bank:</span><span className="text-white font-semibold">{(appConfig as any)?.bankName || 'BCA'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400">No. Rekening:</span><span className="text-cyan-400 font-mono font-bold flex items-center">{(appConfig as any)?.bankAccountNumber || '8021308212'}<CopyButton text={(appConfig as any)?.bankAccountNumber || '8021308212'} /></span></div>
                        <div className="flex justify-between"><span className="text-slate-400">A/N:</span><span className="text-white">{(appConfig as any)?.bankRecipientName || 'PT Forex Bot AI'}</span></div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Upload Bukti Transfer</label>
                        <input type="file" onChange={e => setProofFile(e.target.files?.[0] || null)} required
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 cursor-pointer" />
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={loading || !amount}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {loading ? 'Memproses...' : `Bayar ${selectedMethod?.label || ''}`}
                  </button>
                </form>
              )}
            </div>

            {/* ── WITHDRAW ───────────────────────────────────────────── */}
            <div className="p-4 sm:p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-purple-400" /> Withdraw
                </h3>
                {withdrawMode === 'form' && (
                  <button onClick={() => { setWithdrawMode('pick'); setSelectedMethod(null); }} className="text-[10px] text-slate-400 hover:text-white transition-colors">
                    ← Ganti
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Mata Uang</label>
                <select value={currency} onChange={e => { setCurrency(e.target.value); setWithdrawMode('pick'); setSelectedMethod(null); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option value="USD">USD (Bank / E-Wallet)</option>
                  <option value="USDT">USDT (TRC20)</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>

              {withdrawMode === 'pick' ? (
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Pilih Metode Penarikan</label>
                  {renderMethodPicker(m => { setSelectedMethod(m); setWithdrawMode('form'); }, isCryptoCurrency)}
                </div>
              ) : (
                <form onSubmit={handleWithdrawal} className="space-y-3">
                  {selectedMethod && (
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${selectedMethod.color} ${selectedMethod.borderColor}`}>
                      <span className="text-base">{selectedMethod.logo}</span>
                      <div>
                        <div className={`text-xs font-bold ${selectedMethod.textColor}`}>{selectedMethod.label}</div>
                        <div className="text-[9px] text-slate-500">{selectedMethod.description}</div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Nominal</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Contoh: 50" min="1" required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Detail Tujuan Penarikan</label>
                    <textarea value={payoutDetails} onChange={e => setPayoutDetails(e.target.value)} required
                      placeholder={isCryptoCurrency ? 'Masukkan alamat wallet TRC20/BTC Anda' : selectedMethod?.id === 'BANK_TRANSFER' ? 'BCA - 8021308212 - A/N Nama Anda' : 'Nomor HP terdaftar di aplikasi'}
                      className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                    {loading ? 'Memproses...' : 'Ajukan Penarikan'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── VPS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'vps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">VPS Status</span>
                <Cpu className="h-5 w-5 text-purple-400" />
              </div>
              {vpsInstance ? (
                <div className="space-y-3">
                  <h4 className="text-xl font-black text-white">{vpsInstance.planName}</h4>
                  <div className="text-xs text-slate-400 font-mono">{vpsInstance.region}</div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">IP Address</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-white font-mono">{vpsInstance.ipAddress}</span>
                      <CopyButton text={vpsInstance.ipAddress} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> RUNNING 24/7
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-white">Tidak Ada VPS</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Bot Anda berjalan di sesi browser. Deploy VPS untuk trading otomatis 24/7.</p>
                </div>
              )}
            </div>
            {vpsInstance && <div className="mt-4 pt-3 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono">Expires: {new Date(vpsInstance.expiresAt).toLocaleDateString('id-ID')}</div>}
          </div>

          <div className="lg:col-span-2 p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2"><Cpu className="text-purple-400 w-4 h-4" /> Deploy VPS Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Paket Server</label>
                <select value={vpsPlan} onChange={e => setVpsPlan(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option value="VPS Basic">VPS Basic (1 Core, 2GB RAM) — FREE</option>
                  <option value="VPS Advanced">VPS Pro (2 Core, 4GB RAM) — $15/mo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Region Server</label>
                <select value={vpsRegion} onChange={e => setVpsRegion(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option value="Singapore">🇸🇬 Singapore (Terbaik untuk Asia)</option>
                  <option value="Tokyo">🇯🇵 Tokyo (Latensi Rendah)</option>
                  <option value="New York">🇺🇸 New York (Dekat Wall Street)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">VPS Basic gratis untuk pelanggan PRO & ENTERPRISE. Saldo wallet dipotong otomatis untuk paket VPS Pro berbayar.</p>
            <button onClick={handleDeployVps} disabled={loading || !!vpsInstance}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
              {loading ? 'Deploying...' : vpsInstance ? 'VPS Sudah Aktif' : 'Deploy VPS Sekarang'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Payment Result Modal ───────────────────────────────────────────── */}
      {paymentResult && (
        <PaymentResultModal
          result={paymentResult}
          onClose={() => { setPaymentResult(null); setDepositMode('pick'); setSelectedMethod(null); setAmount(''); }}
          onConfirm={() => { setPaymentResult(null); setDepositMode('pick'); setSelectedMethod(null); setAmount(''); fetchWallets(); }}
        />
      )}
    </div>
  );
}
