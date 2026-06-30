'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

import { useBotStore } from '../store/useBotStore';

export default function LiveChatWidget() {
  const { appConfig } = useBotStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: `Halo! Saya Budi dari Layanan Pelanggan ${appConfig?.appName || 'Forex Bot AI'}. Ada yang bisa saya bantu mengenai pengaturan bot atau langganan Anda hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    setIsTyping(true);

    // Simulate Agent Response based on keywords
    setTimeout(() => {
      let replyText = 'Maaf, saya tidak begitu memahami pertanyaan Anda. Apakah Anda memerlukan bantuan mengenai pembayaran QRIS, aktivasi Bot, atau verifikasi KYC?';
      const textLower = userText.toLowerCase();

      if (textLower.includes('halo') || textLower.includes('hi') || textLower.includes('p')) {
        replyText = 'Halo! Senang bisa menyapa Anda kembali. Ada yang bisa saya bantu mengenai kendala akun Anda?';
      } else if (textLower.includes('qris') || textLower.includes('bayar') || textLower.includes('checkout')) {
        replyText = 'Untuk pembayaran QRIS, silakan buka modal Upgrade, pilih tab "QRIS", dan pindai barcode. Pembayaran akan terverifikasi otomatis dalam 3 detik!';
      } else if (textLower.includes('bot') || textLower.includes('jalan') || textLower.includes('start')) {
        replyText = 'Untuk menjalankan bot, nyalakan tombol "Start Bot" di Panel Kontrol AI sebelah kanan dashboard utama Anda.';
      } else if (textLower.includes('kyc') || textLower.includes('ktp') || textLower.includes('verifikasi')) {
        replyText = 'Anda dapat mengunggah KTP/Paspor di tab "Keamanan & KYC". Dokumen Anda akan langsung masuk ke antrean persetujuan admin.';
      } else if (textLower.includes('backtest') || textLower.includes('simulasi')) {
        replyText = 'Fitur Backtest membolehkan Anda menguji parameter AI pada data historis. Silakan buka tab "Simulasi" di Sidebar navigasi.';
      }

      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: `[CS Agent Budi] ${replyText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 animate-scale-up h-[450px]">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg relative">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-slate-900"></span>
              </div>
              <div>
                <h4 className="text-xs font-black font-mono tracking-wider">LIVE SUPPORT</h4>
                <span className="text-[9px] text-cyan-200 block font-mono">Agen Online • Respon Instan</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/25">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-cyan-400 shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-cyan-500 text-slate-950 rounded-br-none font-medium' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[8px] mt-1 block text-right font-mono ${isUser ? 'text-slate-900/60' : 'text-slate-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                  {isUser && (
                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 items-end">
                <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-3 text-xs text-slate-450 flex items-center gap-1.5 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Budi sedang mengetik...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-850/60 flex gap-2">
            <input
              type="text"
              placeholder="Ketik pesan di sini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-550 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl transition-all duration-300 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-tr from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full shadow-2xl shadow-cyan-500/20 border border-cyan-400/25 transition-all duration-300 active:scale-90 flex items-center justify-center animate-bounce"
        title="Hubungi Layanan Pelanggan"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
