import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  lang?: 'id' | 'en';
  t?: any; 
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScan, 
  onClose, 
  lang = 'id', 
  t 
}) => {
  const texts = {
    scanTitle: lang === 'id' ? 'PINDAI KODE QR ASET' : 'SCAN ASSET QR CODE',
    scanDesc: t?.scanDesc || (lang === 'id' ? 'Arahkan kamera ke kode QR yang tertempel di alat' : 'Point camera at QR code attached to the tool')
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (context && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            const sanitizedData = code.data.replace(/^ASSET_ID:/i, '').trim();
            onScanRef.current(sanitizedData);
            onCloseRef.current();
            return; 
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.setAttribute("playsinline", "true");
          videoElement.play().catch(() => {}); 
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      } catch (err: any) {
        if (!active) return;
        const message = err?.name === 'NotAllowedError'
          ? (lang === 'id' ? 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser.' : 'Camera permission denied. Enable it in your browser settings.')
          : (lang === 'id' ? 'Gagal mengakses kamera.' : 'Failed to access camera.');
        setError(message);
      }
    };

    startCamera();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [lang]); 

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-xl">
      <div className="relative w-full max-w-lg p-6">
        
        <button 
          onClick={onClose} 
          className="absolute -top-16 right-6 text-zinc-400 hover:text-white transition-colors p-3 bg-zinc-900/50 rounded-full"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-black text-brand tracking-[0.2em] uppercase mb-4 whitespace-nowrap">
            {texts.scanTitle}
          </h2>
          <div className="h-[2px] w-16 bg-brand/30 mx-auto mb-4"></div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.15em] font-bold max-w-[280px] mx-auto leading-relaxed">
            {texts.scanDesc}
          </p>
        </div>

        <div className="relative aspect-square max-w-[320px] mx-auto bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <video ref={videoRef} className="w-full h-full object-cover opacity-90" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_20px_rgba(153,27,27,0.5)] animate-scan-line"></div>
          
          <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
          <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
          <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
        </div>

        {error && (
          <div className="mt-10 p-4 bg-brand/10 border border-brand/20 rounded-2xl text-center">
            <p className="text-brand text-[10px] font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-line { 
          0% { top: 15%; opacity: 0; } 
          50% { opacity: 1; }
          100% { top: 85%; opacity: 0; } 
        } 
        .animate-scan-line { 
          position: absolute; 
          animation: scan-line 3.5s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
};

export default QRScanner;