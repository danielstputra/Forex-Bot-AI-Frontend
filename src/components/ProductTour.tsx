'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ArrowRight, X } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

export default function ProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isElementVisible, setIsElementVisible] = useState(true);

  const steps: TourStep[] = [
    {
      targetId: 'tour-header',
      title: 'Pemantauan Keuangan',
      content: 'Pantau Saldo, Ekuitas, dan Margin Anda secara real-time di sini. Pergerakan ekuitas akan memberikan efek kedipan visual.',
      position: 'bottom'
    },
    {
      targetId: 'tour-control',
      title: 'Panel Kontrol AI',
      content: 'Nyalakan bot, atur tingkat risiko (Conservative/Moderate/Aggressive), tentukan lot size, serta batasi risiko maksimal Anda di panel ini.',
      position: 'left'
    },
    {
      targetId: 'tour-console',
      title: 'Log Keputusan AI',
      content: 'Lihat jalannya algoritma AI secara real-time. Di sini Anda juga dapat memverifikasi tanda tangan digital HMAC & enkripsi AES yang aktif.',
      position: 'left'
    },
    {
      targetId: 'tour-sidebar',
      title: 'Navigasi Multi-Fitur',
      content: 'Pindah antar tab untuk melihat riwayat transaksi, menjalankan simulasi (Backtesting), atau mengganti bahasa antarmuka.',
      position: 'right'
    }
  ];

  useEffect(() => {
    // Detect mobile viewport size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show tour if not completed before
    const completed = localStorage.getItem('forex_bot_tour_completed');
    if (!completed) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update coordinates of the highlighted element
  useEffect(() => {
    if (!isActive) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const step = steps[currentStep];
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Check if element is visually displayed with width/height, and is not completely offscreen
        const visible = rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
        
        setIsElementVisible(visible);
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll element into view smoothly if needed and visible
        if (visible) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setIsElementVisible(false);
      }
    };

    updateCoords();
    // Re-calculate on resize or scroll
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);
    
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem('forex_bot_tour_completed', 'true');
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const showCutout = !isMobile && isElementVisible && coords;

  // Calculate popover positioning
  const getPopoverStyle = (): React.CSSProperties => {
    if (isMobile || !isElementVisible || !coords) {
      return {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100vw - 32px)',
        maxWidth: '340px',
        top: 'auto',
        zIndex: 50,
      };
    }

    const spacing = 12;
    const popWidth = 280;
    
    let top = 0;
    let left = 0;

    if (step.position === 'bottom') {
      top = coords.top + coords.height + spacing;
      left = coords.left + coords.width / 2 - popWidth / 2;
    } else if (step.position === 'top') {
      top = coords.top - 160 - spacing; // Est height
      left = coords.left + coords.width / 2 - popWidth / 2;
    } else if (step.position === 'left') {
      top = coords.top + coords.height / 2 - 80;
      left = coords.left - popWidth - spacing;
    } else {
      // Right
      top = coords.top + coords.height / 2 - 80;
      left = coords.left + coords.width + spacing;
    }

    // Boundary constraints check for desktop to prevent offscreen overflow
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < spacing) {
      left = spacing;
    } else if (left + popWidth > viewportWidth - spacing) {
      left = viewportWidth - popWidth - spacing;
    }

    // Simple height check (approximate card height as 180px)
    const estCardHeight = 180;
    if (top < spacing) {
      top = spacing;
    } else if (top + estCardHeight > viewportHeight - spacing) {
      top = viewportHeight - estCardHeight - spacing;
    }

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dark Backdrop Overlay with cutout using SVG or CSS shadow */}
      <div 
        className="absolute inset-0 bg-slate-955/75 transition-all duration-300 pointer-events-auto"
        style={{
          clipPath: showCutout && coords ? `polygon(
            0% 0%, 
            0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 
            100% 0%
          )` : 'none'
        }}
      />

      {/* Highlight border */}
      {showCutout && coords && (
        <div 
          className="absolute border-2 border-cyan-500 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          style={{
            top: `${coords.top - 4}px`,
            left: `${coords.left - 4}px`,
            width: `${coords.width + 8}px`,
            height: `${coords.height + 8}px`,
          }}
        />
      )}

      {/* Popover Card */}
      <div 
        className="absolute bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl z-50 pointer-events-auto max-w-[340px] w-full space-y-4 animate-scale-up"
        style={getPopoverStyle()}
      >
        {/* Close */}
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <span className="text-[9px] px-2 py-0.5 bg-cyan-950 text-cyan-400 font-mono font-bold rounded-md">
          Langkah {currentStep + 1} dari {steps.length}
        </span>

        {/* Content */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-100 font-mono">{step.title}</h4>
          <p className="text-[10px] text-slate-405 leading-relaxed">{step.content}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-850">
          <button 
            onClick={handleClose} 
            className="text-[10px] text-slate-500 hover:text-slate-405 font-semibold"
          >
            Lewati
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-[10px] font-bold rounded-lg transition-all duration-300"
          >
            {currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
