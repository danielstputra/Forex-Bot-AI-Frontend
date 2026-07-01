'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { HelpCircle, Plus, ChevronRight, CheckCircle2, Clock, AlertCircle, FileText, ArrowLeft, Send, RefreshCw, UserPlus, Link, Sliders, Play, Wallet, Check } from 'lucide-react';

export default function HelpCenterView() {
  const {
    supportTickets,
    supportArticles,
    fetchSupportTickets,
    fetchSupportArticles,
    createSupportTicket
  } = useBotStore();

  const [currentHelpTab, setCurrentHelpTab] = useState<'tutorial' | 'kb' | 'tickets'>('tutorial');
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [activeTicketMessages, setActiveTicketMessages] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('TRADING');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [ticketMsg, setTicketMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const tutorialSteps = [
    {
      step: 1,
      title: "Registrasi Akun & Pengamanan Profil",
      icon: UserPlus,
      color: "text-cyan-400 bg-cyan-950/40 border-cyan-800/40",
      description: "Langkah pertama sebelum memulai transaksi otomatis adalah mempersiapkan keamanan akun Anda.",
      items: [
        "Buat Akun Baru: Isi nama legal, email aktif, dan kata sandi yang kuat pada halaman registrasi.",
        "Pilih Sub-Profil: Setiap akun utama mendukung hingga 5 sub-profil (misal: mode profil ramah anak atau profil khusus dengan PIN pelindung).",
        "Aktivasi Keamanan Dua Faktor (2FA): Masuk ke halaman Profil Anda, aktifkan 2FA melalui Google Authenticator untuk melindungi akun dari serangan pengambilalihan."
      ]
    },
    {
      step: 2,
      title: "Koneksi Akun Broker MT4 / MT5",
      icon: Link,
      color: "text-purple-400 bg-purple-950/40 border-purple-800/40",
      description: "Bot AI membutuhkan jembatan untuk mengeksekusi posisi di pasar forex global.",
      items: [
        "Masuk ke Menu Broker: Cari menu Broker atau klik tautan 'Link Broker' di panel kiri bawah.",
        "Masukkan Kredensial: Isi nama broker Anda, nomor akun trading, sandi akun broker, dan alamat server trading asli.",
        "Enkripsi Tingkat Tinggi: Sandi Anda akan secara otomatis dienkripsi menggunakan protokol militer AES-256-GCM saat dikirim dan disimpan.",
        "Verifikasi Koneksi: Pastikan indikator koneksi berubah menjadi hijau atau bertuliskan CONNECTED."
      ]
    },
    {
      step: 3,
      title: "Atur Parameter Risiko & Target Pasangan Mata Uang",
      icon: Sliders,
      color: "text-amber-400 bg-amber-950/40 border-amber-800/40",
      description: "Kendalikan strategi trading bot agar sesuai dengan toleransi modal Anda.",
      items: [
        "Tingkat Risiko: Pilih Conservative (risiko sangat rendah), Moderate (sedang), atau Aggressive (tingkat pengembalian tinggi).",
        "Ukuran Lot: Atur ukuran lot dasar (Trade Size) mulai dari 0.01 lot sesuai anjuran manajemen modal.",
        "Maksimum Drawdown: Tentukan sirkuit pemutus otomatis (misal 5% drawdown harian) untuk menonaktifkan bot secara darurat jika terjadi kerugian berturut-turut.",
        "Target Pairs: Centang pasangan mata uang yang ingin dipantau oleh AI (misal EUR/USD, GBP/USD)."
      ]
    },
    {
      step: 4,
      title: "Mulai Bot AI & Pantau Konsol Keputusan",
      icon: Play,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
      description: "Nyalakan mesin AI dan amati proses pengambilan keputusan otomatis secara real-time.",
      items: [
        "Klik START BOT: Tombol berkedip hijau di panel kontrol akan aktif dan mengubah status menjadi RUNNING.",
        "Pantau AI Console: Konsol di kanan bawah akan memperlihatkan analisis real-time seperti pemindaian zona Order Block & FVG (Smart Money Concepts), pola Candlestick (Engulfing, Doji, Hammer), skor konfluensi teknikal, serta verifikasi tanda tangan HMAC-SHA256 untuk keamanan request.",
        "Manajemen Transaksi Aktif: Sinyal beli/jual yang valid akan otomatis membuka posisi di broker. Bot juga otomatis mengelola Stop Loss, TP1 Scale-Out (50% lot tutup di rasio 1:1), dan TP2 Trailing Stop menggunakan indikator volatilitas ATR."
      ]
    },
    {
      step: 5,
      title: "Penarikan Profit Secara Aman (Withdrawal)",
      icon: Wallet,
      color: "text-blue-400 bg-blue-950/40 border-blue-800/40",
      description: "Realisasikan keuntungan trading dari wallet Anda secara instan.",
      items: [
        "Masuk ke Fintech Hub: Buka halaman Fintech Hub di menu navigasi sebelah kiri.",
        "Pilih Withdrawal: Isi jumlah penarikan, metode pembayaran yang diinginkan, serta detail rekening tujuan.",
        "Proses Verifikasi: Admin akan memproses penarikan dana Anda secara instan ke metode pembayaran yang didukung."
      ]
    }
  ];

  useEffect(() => {
    fetchSupportTickets();
    fetchSupportArticles();
  }, [fetchSupportTickets, fetchSupportArticles]);

  const fetchMessagesForTicket = async (ticketId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const { appConfig } = useBotStore.getState();
      const backendUrl = appConfig?.backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/support/tickets/${ticketId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTicketMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch ticket messages:', err);
    }
  };

  const handleSelectTicket = async (ticket: any) => {
    setActiveTicket(ticket);
    await fetchMessagesForTicket(ticket.id);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    setLoading(true);

    try {
      await createSupportTicket(newTitle.trim(), newCategory, newDesc.trim(), newPriority);
      setIsCreating(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMsg.trim() || !activeTicket) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const { appConfig } = useBotStore.getState();
      const backendUrl = appConfig?.backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: ticketMsg.trim() })
      });

      if (res.ok) {
        setTicketMsg('');
        await fetchMessagesForTicket(activeTicket.id);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            Pusat Bantuan & Panduan Pemula
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pelajari cara penggunaan bot AI melalui panduan interaktif kami, telusuri Knowledge Base, atau buat tiket bantuan langsung.
          </p>
        </div>
        <button
          onClick={() => { fetchSupportTickets(); fetchSupportArticles(); }}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-2xl max-w-md font-mono">
        <button
          onClick={() => { setCurrentHelpTab('tutorial'); setIsCreating(false); setActiveTicket(null); }}
          className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all duration-300 ${
            currentHelpTab === 'tutorial'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Panduan Bot AI
        </button>
        <button
          onClick={() => { setCurrentHelpTab('kb'); setIsCreating(false); setActiveTicket(null); }}
          className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all duration-300 ${
            currentHelpTab === 'kb'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Knowledge Base
        </button>
        <button
          onClick={() => { setCurrentHelpTab('tickets'); }}
          className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all duration-300 ${
            currentHelpTab === 'tickets'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Tiket Bantuan
        </button>
      </div>

      {/* Tab: Panduan Bot AI (Tutorial) */}
      {currentHelpTab === 'tutorial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-8">
          <div className="space-y-2">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Panduan Langkah-demi-Langkah Forex Bot AI</h3>
            <p className="text-xs text-slate-400">
              Ikuti 5 fase utama ini untuk menyiapkan profil, menghubungkan akun broker pihak ketiga, menyalakan mesin keputusan, hingga mencairkan profit Anda sukses 100%.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 md:pl-8 space-y-10 py-2">
            {tutorialSteps.map((tStep) => {
              const StepIcon = tStep.icon;
              return (
                <div key={tStep.step} className="relative">
                  {/* Circle number marker */}
                  <span className="absolute -left-[43px] md:-left-[51px] top-0 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 h-9 w-9 text-xs font-bold font-mono text-cyan-400 shadow-md">
                    0{tStep.step}
                  </span>

                  <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-5 space-y-4 hover:border-slate-800 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${tStep.color}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">{tStep.title}</h4>
                    </div>

                    <p className="text-[11px] text-slate-405 leading-relaxed">
                      {tStep.description}
                    </p>

                    <ul className="space-y-2">
                      {tStep.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed font-mono">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Knowledge Base */}
      {currentHelpTab === 'kb' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">Knowledge Base & FAQ</h3>
          <div className="space-y-4">
            {supportArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                Belum ada artikel pengetahuan yang dipublikasikan.
              </div>
            ) : (
              supportArticles.map((art: any) => (
                <div key={art.id} className="p-4.5 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-900/20 text-[9px] font-bold rounded font-mono">
                      {art.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{art.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-455 leading-relaxed font-mono">
                    {art.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Support Tickets & Chats */}
      {currentHelpTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2/3 - Articles & Tickets */}
          <div className="lg:col-span-2 space-y-6">
            {activeTicket ? (
              /* Ticket Chat View */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[500px]">
                <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                  <button
                    onClick={() => setActiveTicket(null)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{activeTicket.subject}</h4>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        activeTicket.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-900/30'
                      }`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {activeTicket.id} | Kategori: {activeTicket.category}</span>
                  </div>
                </div>

                {/* Chat Message Box */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-400 leading-relaxed font-mono">
                    <span className="text-slate-500 font-bold block mb-1">PERTANYAAN AWAL:</span>
                    {activeTicket.description}
                  </div>

                  {activeTicketMessages.map((msg: any) => {
                    const isAgent = msg.sender?.role !== 'USER';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'} space-y-1`}>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {isAgent ? `Agent: ${msg.sender?.legalName || 'Staff Support'}` : 'Anda'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`p-3 max-w-sm rounded-2xl text-xs ${
                          isAgent
                            ? 'bg-slate-800 text-slate-200 rounded-tl-none'
                            : 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-850 pt-4">
                  <input
                    type="text"
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Ketik pesan tanggapan Anda..."
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : isCreating ? (
              /* Create Ticket View */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">Buat Tiket Bantuan Baru</h3>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Kategori Masalah</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="GENERAL">Pertanyaan Umum</option>
                        <option value="BILLING">Deposit & Penarikan</option>
                        <option value="TRADING">Koneksi Broker & VPS</option>
                        <option value="PARTNERSHIP">Afiliasi & Kemitraan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Prioritas</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="LOW">Rendah (Pertanyaan Umum)</option>
                        <option value="MEDIUM">Sedang (Kendala Fitur)</option>
                        <option value="HIGH">Tinggi (Penarikan / Eror Transaksi)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Subjek Masalah</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Contoh: Gagal Menghubungkan Broker Exness"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Deskripsi Detail Kendala</label>
                    <textarea
                      required
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Tuliskan sedetail mungkin kendala yang Anda hadapi agar tim kami dapat menganalisisnya dengan cepat..."
                      className="w-full h-36 bg-slate-950 border border-slate-850 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none font-mono font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    {loading ? 'Submitting Ticket...' : 'Kirim Tiket Bantuan'}
                  </button>
                </form>
              </div>
            ) : (
              /* Knowledge Base View fallback */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Silakan pilih tiket bantuan untuk merespon</h3>
                <p className="text-xs text-slate-500">Pilih dari daftar tiket aktif di sebelah kanan untuk memulai obrolan dengan tim support kami.</p>
              </div>
            )}
          </div>

          {/* Right 1/3 - Support Tickets List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Tiket Bantuan Anda</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500 font-mono text-center px-4">
                Belum ada tiket bantuan aktif.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {supportTickets.map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`w-full text-left p-4.5 border rounded-2xl transition-all flex items-center justify-between gap-3 ${
                      activeTicket?.id === t.id
                        ? 'bg-slate-800 border-cyan-500/50 shadow'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-750'
                    }`}
                  >
                    <div className="space-y-1 truncate flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{t.subject}</h4>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/20'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-900/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block">ID: {t.id} | Prioritas: {t.priority}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-555" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
