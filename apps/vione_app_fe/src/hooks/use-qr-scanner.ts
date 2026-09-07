import { useEffect, useRef, useState } from "react";

export type ScannerStatus = "idle" | "starting" | "scanning" | "denied" | "unsupported" | "error";

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

type TorchTrack = MediaStreamTrack;
interface TorchCapabilities {
  torch?: boolean;
}

/**
 * Live camera QR scanner with multi-tier fallback for all mobile browsers & WebViews.
 * 1. Native BarcodeDetector (fast, hardware accelerated on Chrome Android)
 * 2. Canvas-based ZXing frame decoder (rock-solid on iOS Safari, Samsung Internet, WebViews)
 * 3. File upload / gallery image decoding support
 */
export function useQrScanner(opts: {
  active: boolean;
  onDetect: (value: string) => void;
  torch?: boolean;
}) {
  const { active, onDetect, torch = false } = opts;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<TorchTrack | null>(null);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const [status, setStatus] = useState<ScannerStatus>("idle");

  useEffect(() => {
    if (!active) {
      setStatus("idle");
      return;
    }
    let stream: MediaStream | null = null;
    let raf = 0;
    let intervalTimer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    let lastValue = "";
    let lastTime = 0;

    async function getCameraStream(): Promise<MediaStream> {
      // 1. Try environment camera with ideal dimensions
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
      } catch {
        /* fallback to relaxed facingMode */
      }

      // 2. Try simple environment camera
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        /* fallback to any camera */
      }

      // 3. Try any available camera
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    async function start() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      setStatus("starting");

      try {
        stream = await getCameraStream();
      } catch (e) {
        if (stopped) return;
        const err = e as DOMException;
        setStatus(err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError" ? "denied" : "error");
        return;
      }

      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      trackRef.current = (stream.getVideoTracks()[0] as TorchTrack) ?? null;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.muted = true;
        video.autoplay = true;
        try {
          await video.play();
        } catch {
          /* autoplay restriction guard — user can tap video or we retry when ready */
        }
      }

      // Wait for video stream to provide dimensions
      const waitForVideo = async (maxWaitMs = 3000): Promise<boolean> => {
        const startT = Date.now();
        while (Date.now() - startT < maxWaitMs) {
          if (stopped) return false;
          if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.readyState >= 2) {
            return true;
          }
          await new Promise((r) => setTimeout(r, 50));
        }
        return !!videoRef.current;
      };

      await waitForVideo();
      if (stopped) return;

      setStatus("scanning");

      const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (Ctor) {
        try {
          const detector = new Ctor({ formats: ["qr_code"] });
          const tick = async () => {
            if (stopped || !videoRef.current) return;
            try {
              if (videoRef.current.readyState >= 2) {
                const codes = await detector.detect(videoRef.current);
                if (codes.length) {
                  const value = String(codes[0].rawValue ?? "");
                  const now = Date.now();
                  if (value && (value !== lastValue || now - lastTime > 2500)) {
                    lastValue = value;
                    lastTime = now;
                    onDetectRef.current(value);
                  }
                }
              }
            } catch {
              /* Frame not ready / unreadable — continue */
            }
            if (!stopped) {
              raf = requestAnimationFrame(tick);
            }
          };
          raf = requestAnimationFrame(tick);
          return;
        } catch {
          /* BarcodeDetector construction failed — fall back to ZXing */
        }
      }

      // Fallback: Canvas-based ZXing frame scanning
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const scanFrame = async () => {
          if (stopped || !videoRef.current || !ctx) return;
          const v = videoRef.current;
          if (v.readyState < 2 || v.videoWidth === 0) return;

          try {
            // Scale frame down for maximum performance on mobile CPU
            const maxDim = 480;
            const scale = Math.min(1, maxDim / Math.max(v.videoWidth, v.videoHeight));
            const w = Math.floor(v.videoWidth * scale);
            const h = Math.floor(v.videoHeight * scale);

            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }
            ctx.drawImage(v, 0, 0, w, h);

            const result = await reader.decodeFromCanvas(canvas);
            if (result) {
              const value = result.getText();
              const now = Date.now();
              if (value && (value !== lastValue || now - lastTime > 2500)) {
                lastValue = value;
                lastTime = now;
                onDetectRef.current(value);
              }
            }
          } catch {
            /* Normal: frame did not contain a readable QR */
          }
        };

        intervalTimer = setInterval(() => {
          void scanFrame();
        }, 150);
      } catch (err) {
        console.warn("[QR Scanner] Fallback engine error:", err);
        // If canvas reader fails to initialize, remain in scanning state if stream is alive
        if (stream && stream.active) {
          setStatus("scanning");
        } else {
          setStatus("error");
        }
      }
    }

    void start();

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (intervalTimer) clearInterval(intervalTimer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
    };
  }, [active]);

  // Torch / flashlight control (only when hardware supports it).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || status !== "scanning") return;
    const caps = track.getCapabilities?.() as TorchCapabilities | undefined;
    if (caps?.torch) {
      track
        .applyConstraints({ advanced: [{ torch }] } as unknown as MediaTrackConstraints)
        .catch(() => {});
    }
  }, [torch, status]);

  // Helper to scan a static image file (e.g. from photo gallery)
  const scanImageFile = async (file: File): Promise<string | null> => {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (Ctor) {
        try {
          const detector = new Ctor({ formats: ["qr_code"] });
          const codes = await detector.detect(img);
          URL.revokeObjectURL(url);
          if (codes.length && codes[0].rawValue) {
            const val = String(codes[0].rawValue);
            onDetectRef.current(val);
            return val;
          }
        } catch {
          /* continue to zxing */
        }
      }

      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      if (result) {
        const val = result.getText();
        onDetectRef.current(val);
        return val;
      }
    } catch {
      /* could not decode image */
    }
    return null;
  };

  return { videoRef, status, scanImageFile };
}
