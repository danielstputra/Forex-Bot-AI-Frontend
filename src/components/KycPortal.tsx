'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBotStore } from '../store/useBotStore';
import { useI18nStore } from '../store/useI18nStore';
import { UploadCloud, CheckCircle, Image as ImageIcon, Trash2, ShieldCheck, Loader2, FileText, Clock } from 'lucide-react';

export default function KycPortal() {
  const t = useI18nStore((state) => state.t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { kycDocuments, fetchKycDocuments, submitKycDoc, user } = useBotStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('KTP');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchKycDocuments();
  }, [fetchKycDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCompleted(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsCompleted(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentNumber) return;

    setIsUploading(true);

    try {
      // 1. Upload file to backend
      const formData = new FormData();
      formData.append('document', selectedFile);

      const token = localStorage.getItem('token');
      const { appConfig } = useBotStore.getState();
      const backendUrl = appConfig?.backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const uploadRes = await fetch(`${backendUrl}/auth/kyc/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(errorText || 'Gagal mengunggah file');
      }

      const uploadResult = await uploadRes.json();
      const fileUrl = uploadResult.fileUrl;

      // 2. Submit KYC Document record to DB
      await submitKycDoc({
        documentType,
        documentNumber,
        fileUrl
      });

      setIsCompleted(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDocumentNumber('');
    } catch (err: any) {
      console.error('KYC Upload failed:', err);
      alert(err.message || 'Gagal memproses KYC');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-850 pb-4 mb-5">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Verifikasi Identitas (KYC)
            </h3>
            <p className="text-[11px] text-slate-400">
              Unggah dokumen identitas diri Anda untuk kepatuhan regulasi finansial.
            </p>
          </div>
        </div>

        {isCompleted ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center py-8 gap-4 animate-scale-up text-center">
            <div className="p-3.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-400 font-mono uppercase">DOKUMEN DIUNGGAH</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Dokumen identitas Anda berhasil diunggah dan sedang ditinjau oleh tim kepatuhan (*compliance team*). Proses verifikasi memakan waktu maksimal 24 jam.
              </p>
            </div>
            <button
              onClick={() => setIsCompleted(false)}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg text-slate-200 transition-colors"
            >
              Kirim Dokumen Baru
            </button>
          </div>
        ) : (
          /* Upload Area */
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">Tipe Dokumen</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                >
                  <option value="KTP">KTP</option>
                  <option value="PASSPORT">Paspor</option>
                  <option value="DRIVERS_LICENSE">SIM</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">Nomor Identitas</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Contoh: 317XXXXXXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {!previewUrl ? (
              /* Drag & Drop Area */
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/20 hover:bg-slate-950/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300 animate-bounce" />
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-300 block">Pilih dokumen identitas (KTP / Paspor)</span>
                  <span className="text-[10px] text-slate-550 font-mono mt-1 block">Format: JPG, PNG, PDF (Maks. 5MB)</span>
                </div>
              </div>
            ) : (
              /* File Preview & Actions */
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                  <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900 flex items-center justify-center shrink-0">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 w-full text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-mono">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span className="truncate max-w-[150px]">{selectedFile?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-550 font-mono">
                      {(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <button
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:text-rose-450 rounded-xl text-slate-400 transition-all duration-300 disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading || !documentNumber}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengunggah & Memverifikasi...
                    </>
                  ) : (
                    'Kirim Dokumen'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Riwayat Dokumen KYC */}
      {kycDocuments && kycDocuments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2 mb-4 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-cyan-400" />
            Riwayat Dokumen Anda
          </h4>
          <div className="space-y-3">
            {kycDocuments.map((doc: any) => (
              <div key={doc.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200 font-mono">
                    {doc.documentType} - {doc.documentNumber}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    doc.status === 'APPROVED' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/35'
                      : doc.status === 'REJECTED'
                      ? 'bg-rose-950 text-rose-400 border border-rose-900/35'
                      : 'bg-amber-955/20 text-amber-400 border border-amber-900/35'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

