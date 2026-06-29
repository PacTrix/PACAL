"use client";

import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

// BarcodeDetector API types (Chrome Android 83+)
interface BarcodeDetectorResult {
  rawValue: string;
  format: string;
}

declare global {
  interface Window {
    BarcodeDetector: new (options: { formats: string[] }) => {
      detect(image: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
    };
  }
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // État côté client uniquement pour éviter le mismatch d'hydratation SSR/client
  const [canScan, setCanScan] = useState(false);
  useEffect(() => {
    setCanScan("BarcodeDetector" in window);
  }, []);

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startScan = async () => {
    setError(null);
    if (!window.isSecureContext) {
      setError("Le scan nécessite HTTPS. Activez HTTPS sur le NAS (Tailscale cert ou reverse proxy Synology).");
      return;
    }
    if (!canScan) {
      setError("Scan non supporté par ce navigateur. Utilisez Chrome sur Android.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setScanning(true);

      const detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8"],
      });

      // Attendre que la vidéo ait une première frame avant de démarrer la détection
      // BarcodeDetector.detect() retourne [] silencieusement si readyState < 2
      await new Promise<void>((resolve) => {
        if (!videoRef.current) { resolve(); return; }
        if (videoRef.current.readyState >= 2) { resolve(); return; }
        videoRef.current.onloadeddata = () => resolve();
      });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results.length > 0 && results[0]) {
            onDetected(results[0].rawValue);
            stopScan();
            return;
          }
        } catch {
          // Détection échouée sur cette frame, on continue
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={scanning ? stopScan : startScan}
        className="rounded border border-brand-marine px-3 py-1 text-sm text-brand-marine hover:bg-brand-marine hover:text-white transition-colors"
      >
        {scanning ? "⏹ Arrêter" : "📷 Scan"}
      </button>
      <div className={`relative w-full max-w-xs ${scanning ? "" : "hidden"}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded border border-gray-300"
        />
        {scanning && (
          <>
            <p className="absolute top-1.5 left-0 right-0 text-center text-xs text-white/80">
              Pointez un code-barres EAN
            </p>
            <div className="pointer-events-none absolute inset-4 rounded border-2 border-white/60" />
            <div className="pointer-events-none absolute top-1/2 left-4 right-4 h-0.5 bg-green-400" />
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
