import { useEffect, useRef, useState } from "react";

export type NfcStatus = "idle" | "scanning" | "denied" | "unsupported" | "error";

interface NdefRecord {
  recordType: string;
  encoding?: string;
  data?: BufferSource;
}
interface NdefMessage {
  records: NdefRecord[];
}
interface NdefReadingEvent {
  message: NdefMessage;
  serialNumber?: string;
}
interface NDEFReaderLike {
  scan(opts?: { signal?: AbortSignal }): Promise<void>;
  onreading: ((e: NdefReadingEvent) => void) | null;
  onreadingerror: (() => void) | null;
}
type NDEFReaderCtor = new () => NDEFReaderLike;

/**
 * Web NFC reader (Chrome on Android). Reads the first text/url record from a
 * tapped tag and reports it. Reports `unsupported` elsewhere so the caller can
 * fall back to QR or manual check-in.
 */
export function useNfcScanner(opts: { active: boolean; onDetect: (value: string) => void }) {
  const { active, onDetect } = opts;
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const [status, setStatus] = useState<NfcStatus>("idle");

  useEffect(() => {
    if (!active) {
      setStatus("idle");
      return;
    }
    const Ctor = (window as unknown as { NDEFReader?: NDEFReaderCtor }).NDEFReader;
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    const aborter = new AbortController();
    let stopped = false;

    async function start() {
      try {
        const reader = new Ctor!();
        await reader.scan({ signal: aborter.signal });
        if (stopped) return;
        setStatus("scanning");
        reader.onreading = (event: NdefReadingEvent) => {
          let value = event.serialNumber ?? "";
          for (const rec of event.message.records) {
            if ((rec.recordType === "text" || rec.recordType === "url") && rec.data) {
              value = new TextDecoder(rec.encoding || "utf-8").decode(rec.data);
              break;
            }
          }
          if (value) onDetectRef.current(String(value));
        };
      } catch (e) {
        setStatus((e as DOMException)?.name === "NotAllowedError" ? "denied" : "error");
      }
    }

    void start();
    return () => {
      stopped = true;
      aborter.abort();
    };
  }, [active]);

  return { status };
}
