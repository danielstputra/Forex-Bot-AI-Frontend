'use client';

import React, { useState, useRef } from 'react';
import { useI18nStore } from '../store/useI18nStore';
import { UploadCloud, CheckCircle, Image as ImageIcon, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

export default function KycPortal() {
  const t = useI18nStore((state) => state.t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadProgress(0);
      setIsCompleted(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsCompleted(false);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress interval
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsCompleted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-lg w-full">
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
        </div>
      ) : (
        /* Upload Area */
        <div className="space-y-5">
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
                accept="image/*"
                onChange={handleFileChange}
              />
              <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300 animate-bounce" />
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-300 block">Pilih dokumen identitas (KTP / Paspor)</span>
                <span className="text-[10px] text-slate-550 font-mono mt-1 block">Format: JPG, PNG (Maks. 5MB)</span>
              </div>
            </div>
          ) : (
            /* File Preview & Actions */
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                {/* Image Preview */}
                <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="KTP Preview" className="w-full h-full object-cover" />
                </div>
                
                {/* File Details */}
                <div className="flex-1 w-full text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-mono">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="truncate max-w-[150px]">{selectedFile?.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:text-rose-450 rounded-xl text-slate-400 transition-all duration-300 disabled:opacity-40"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 font-mono text-[10px] text-cyan-400">
                  <div className="flex justify-between">
                    <span>Mengunggah dokumen...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Action Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  'Unggah & Verifikasi'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
