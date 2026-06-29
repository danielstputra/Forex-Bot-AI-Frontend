'use client';

import React, { useState, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { HelpCircle, Plus, ChevronRight, CheckCircle2, Clock, AlertCircle, FileText, ArrowLeft, Send, RefreshCw } from 'lucide-react';

export default function HelpCenterView() {
  const {
    supportTickets,
    supportArticles,
    fetchSupportTickets,
    fetchSupportArticles,
    createSupportTicket
  } = useBotStore();

  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [activeTicketMessages, setActiveTicketMessages] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('TRADING');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [ticketMsg, setTicketMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupportTickets();
    fetchSupportArticles();
  }, [fetchSupportTickets, fetchSupportArticles]);

  const fetchMessagesForTicket = async (ticketId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`http://localhost:5000/support/tickets/${ticketId}/messages`, {
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
      const res = await fetch(`http://localhost:5000/support/tickets/${activeTicket.id}/messages`, {
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
            Pusat Bantuan & Tiket Support
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cari solusi mandiri di Knowledge Base atau hubungkan langsung dengan tim dukungan teknis kami melalui tiket live.
          </p>
        </div>
        <button
          onClick={() => { fetchSupportTickets(); fetchSupportArticles(); }}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

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
                <div className="p-3 bg-slate-950 border border-slate-855 rounded-2xl text-xs text-slate-400 leading-relaxed font-mono">
                  <span className="text-slate-500 font-bold block mb-1">PERTANYAAN AWAL:</span>
                  {activeTicket.description}
                </div>

                {activeTicketMessages.map((msg: any) => {
                  const isAgent = msg.sender.role !== 'USER';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'} space-y-1`}>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {isAgent ? `Agent: ${msg.sender.legalName}` : 'Anda'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    className="w-full h-36 bg-slate-950 border border-slate-855 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none font-mono"
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
            /* Knowledge Base View */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Knowledge Base & FAQ</h3>
              <div className="space-y-4">
                {supportArticles.map((art) => (
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
                ))}
              </div>
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
              {supportTickets.map((t) => (
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
                  <ChevronRight className="w-4 h-4 text-slate-550" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
