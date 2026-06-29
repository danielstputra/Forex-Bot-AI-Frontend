'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { X, CreditCard, Calendar, Lock, CheckCircle2, Award, QrCode } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'card' | 'qris';

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, upgradeSubscription, fetchSubscriptionPlans, subscriptionPlans } = useBotStore();
  const { t } = useI18nStore();
  
  const [selectedTier, setSelectedTier] = useState<'PREMIUM' | 'ENTERPRISE'>('PREMIUM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load live subscription plans from DB on open
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen, fetchSubscriptionPlans]);

  // QRIS Simulated Payout Timer
  useEffect(() => {
    if (isOpen && paymentMethod === 'qris' && !paymentSuccess && !isPaying) {
      setIsPaying(true);
      
      // Simulate QRIS scan & verification in 3 seconds
      const timer = setTimeout(async () => {
        await upgradeSubscription(selectedTier);
        setIsPaying(false);
        setPaymentSuccess(true);
        
        // Close modal after success message
        setTimeout(() => {
          setPaymentSuccess(false);
          onClose();
        }, 2000);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, paymentMethod, selectedTier]);

  if (!isOpen) return null;

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16 || expiry.length < 4 || cvc.length < 3) return;
    
    setIsPaying(true);
    
    // Simulate credit card delay (1.5s) then call real API
    setTimeout(async () => {
      await upgradeSubscription(selectedTier);
      setIsPaying(false);
      setPaymentSuccess(true);
      
      // Close modal after showing success message
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  // Get live price from DB or fallback to hardcoded
  const getPrice = (tier: string, fallback: string) => {
    const plan = subscriptionPlans.find((p: any) => p.tier === tier);
    return plan ? `$${plan.priceYearly}` : fallback;
  };

  const pricingTiers = [
    {
      id: 'PREMIUM' as const,
      name: t('upgrade.premium'),
      price: getPrice('PREMIUM', '$49'),
      desc: t('upgrade.premium.desc'),
      features: [
        'Akses Semua Currency Pairs',
        'Parameter Risiko Moderate',
        'Real-time Charting & Live Ticks',
        'Ekspor Laporan Excel Standar',
        'Koneksi API Aman (HMAC)',
      ]
    },
    {
      id: 'ENTERPRISE' as const,
      name: t('upgrade.enterprise'),
      price: getPrice('ENTERPRISE', '$199'),
      desc: t('upgrade.enterprise.desc'),
      features: [
        'Semua Fitur Paket Premium',
        'Parameter Risiko AGGRESSIVE',
        'Enterprise Pivot Grid Analysis',
        'Institutional Excel Templates',
        'Enkripsi Data End-to-End (AES)',
      ],
      highlight: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <Award className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-slate-100 font-mono">{t('upgrade.title')}</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{t('upgrade.desc')}</p>
        </div>

        {paymentSuccess ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-scale-up text-center">
            <div className="p-4 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full">
              <CheckCircle2 className="w-16 h-16 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-emerald-400">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-400">
                {t('upgrade.success')} <span className="text-cyan-400 font-bold font-mono">{selectedTier}</span>.
              </p>
            </div>
          </div>
        ) : (
          /* Checkout Interface */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column - Pricing Tiers */}
            <div className="space-y-4">
              {pricingTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-305 relative overflow-hidden ${
                    selectedTier === tier.id
                      ? 'bg-slate-950/40 border-cyan-500 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-950/10 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  {tier.highlight && (
                    <span className="absolute top-3 right-4 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[9px] font-bold uppercase tracking-wider rounded-md">
                      Best Value
                    </span>
                  )}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-bold text-slate-100">{tier.name}</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">
                      {tier.price}<span className="text-xs text-slate-500 font-normal">/bln</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{tier.desc}</p>
                  <ul className="space-y-1 text-[10px] text-slate-500 font-mono">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/70"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {/* Right Column - Payment Method Selector & Form */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    paymentMethod === 'card' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Credit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    paymentMethod === 'qris' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QRIS (Instant)
                </button>
              </div>

              {paymentMethod === 'card' ? (
                /* Card Form */
                <form onSubmit={handleUpgrade} className="bg-slate-955/40 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h3 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-cyan-400" /> Secure Checkout
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-450 font-mono uppercase tracking-wider">{t('upgrade.card')}</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={16}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 font-mono uppercase tracking-wider">Expiry Date</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-450 font-mono uppercase tracking-wider">CVC / CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="***"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-550 leading-relaxed font-mono">
                    Dengan menekan "Upgrade Sekarang", Anda menyetujui penagihan berulang otomatis. Pembayaran dienkripsi secara penuh.
                  </p>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-55 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-cyan-950/35 active:scale-95"
                  >
                    {isPaying ? 'Memproses Pembayaran...' : t('upgrade.pay')}
                  </button>
                </form>
              ) : (
                /* QRIS Form */
                <div className="bg-slate-955/40 border border-slate-850 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                  <h3 className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-cyan-400" /> QRIS Instant Payment
                  </h3>

                  {/* SVG QRIS Code */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-800 w-48 h-48 flex items-center justify-center shadow-lg relative overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />

                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />

                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />

                      <rect x="40" y="40" width="20" height="20" />
                      
                      {/* Random dots to look like QRIS */}
                      <rect x="35" y="10" width="10" height="10" />
                      <rect x="55" y="15" width="10" height="5" />
                      <rect x="45" y="25" width="15" height="10" />
                      <rect x="15" y="45" width="10" height="15" />
                      <rect x="10" y="55" width="10" height="10" />
                      <rect x="80" y="45" width="15" height="15" />
                      <rect x="85" y="60" width="5" height="10" />
                      <rect x="45" y="75" width="15" height="15" />
                      <rect x="55" y="90" width="10" height="5" />
                    </svg>

                    {/* QRIS Logo overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white border border-slate-800 text-[8px] font-black px-1.5 py-0.5 rounded font-mono shadow-md">
                      QRIS
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-200">Pindai QRIS di atas untuk membayar</p>
                    <p className="text-[10px] text-slate-455">
                      Dukungan semua e-wallet (GoPay, OVO, Dana, LinkAja) & Mobile Banking.
                    </p>
                  </div>

                  {isPaying && (
                    <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-2 animate-pulse mt-2 bg-cyan-950/20 px-3 py-1.5 rounded-lg border border-cyan-800/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      Menunggu pembayaran QRIS...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
