'use client';

import React, { useEffect, useState } from 'react';
import { useBotStore } from '../store/useBotStore';
import { Mail, MailOpen, Trash2, CheckCheck, Inbox, AlertCircle } from 'lucide-react';

export default function InboxView() {
  const { inboxMessages, fetchInbox, markMessageRead, markAllMessagesRead, deleteInboxMessage } = useBotStore();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const unreadCount = inboxMessages.filter(m => !m.isRead).length;
  const selectedMsg = inboxMessages.find(m => m.id === selected);

  const handleSelect = async (id: string, isRead: boolean) => {
    setSelected(id);
    if (!isRead) {
      await markMessageRead(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-cyan-400" />
            Kotak Masuk
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-cyan-500 text-slate-950 text-xs font-black rounded-full ml-1">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Notifikasi, pengumuman sistem, dan pesan dari admin.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllMessagesRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all duration-300"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
        {/* Message List */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {inboxMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Inbox className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-mono">Kotak masuk kosong</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/60">
              {inboxMessages.map(msg => (
                <li
                  key={msg.id}
                  onClick={() => handleSelect(msg.id, msg.isRead)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 ${
                    selected === msg.id
                      ? 'bg-cyan-500/10 border-l-2 border-cyan-500'
                      : 'hover:bg-slate-850/50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {msg.isRead
                      ? <MailOpen className="w-4 h-4 text-slate-500" />
                      : <Mail className="w-4 h-4 text-cyan-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-mono truncate ${msg.isRead ? 'text-slate-400' : 'text-slate-100 font-bold'}`}>
                      {msg.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {!msg.isRead && (
                    <span className="w-2 h-2 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message Detail */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[320px]">
          {selectedMsg ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 font-mono leading-tight">{selectedMsg.title}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(selectedMsg.createdAt).toLocaleString('id-ID', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => { deleteInboxMessage(selectedMsg.id); setSelected(null); }}
                  className="shrink-0 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-slate-800" />
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedMsg.content}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-slate-500 gap-3">
              <Mail className="w-12 h-12 opacity-20" />
              <p className="text-xs font-mono">Pilih pesan untuk dibaca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
