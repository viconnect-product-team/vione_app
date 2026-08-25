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
 * Live camera QR scanner backed by the native BarcodeDetector API.
 * Gracefully reports `unsupported` when the browser lacks the API so the
 * caller can fall back to manual search or the demo trigger.
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
    let stopped = false;
    let lastValue = "";
    let lastTime = 0;

    async function start() {
      const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      setStatus("starting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (e) {
        setStatus((e as DOMException)?.name === "NotAllowedError" ? "denied" : "error");
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
        try {
          await video.play();
        } catch {
          /* autoplay guard */
        }
      }
      const detector = new Ctor({ formats: ["qr_code"] });
      setStatus("scanning");
      const tick = async () => {
        if (stopped || !videoRef.current) return;
        try {
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
        } catch {
          /* frame not ready yet */
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
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

  return { videoRef, status };
}
