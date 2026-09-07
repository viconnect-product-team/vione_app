import { useEffect, useRef, useState } from "react";

export type NfcStatus = "idle" | "scanning" | "denied" | "unsupported" | "insecure" | "error";

export interface NdefRecordLike {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  data?: BufferSource;
}

export interface NdefMessageLike {
  records: NdefRecordLike[];
}

export interface NdefReadingEventLike {
  message: NdefMessageLike;
  serialNumber?: string;
}

interface NDEFReaderLike {
  scan(opts?: { signal?: AbortSignal }): Promise<void>;
  onreading: ((e: NdefReadingEventLike) => void) | null;
  onreadingerror: ((e: Event) => void) | null;
}

type NDEFReaderCtor = new () => NDEFReaderLike;

/**
 * Robust decoder for NDEF records compliant with NFC Forum RTD-TEXT / RTD-URI / MIME.
 * Correctly handles the 1-byte status header + language code offset in Text records.
 */
export function decodeNdefRecord(rec: NdefRecordLike): string {
  if (!rec.data) return "";
  try {
    const rawBuffer = rec.data instanceof ArrayBuffer ? rec.data : rec.data.buffer;
    const offset = "byteOffset" in rec.data ? rec.data.byteOffset : 0;
    const length = rec.data.byteLength;
    const uint8 = new Uint8Array(rawBuffer, offset, length);
    if (uint8.length === 0) return "";

    if (rec.recordType === "text") {
      // NFC Forum Text Record:
      // Byte 0: Status byte (Bit 7: 0=UTF-8, 1=UTF-16; Bits 5..0: language code length L)
      const status = uint8[0];
      const isUtf16 = (status & 0x80) !== 0;
      const langLen = status & 0x3f;

      // Check if byte 0 looks like a valid RFC status byte followed by ASCII language code
      if (langLen > 0 && uint8.length > 1 + langLen) {
        let isAsciiLang = true;
        for (let i = 1; i <= langLen; i++) {
          if (uint8[i] < 0x20 || uint8[i] > 0x7e) {
            isAsciiLang = false;
            break;
          }
        }
        if (isAsciiLang) {
          const textDecoder = new TextDecoder(isUtf16 ? "utf-16" : (rec.encoding || "utf-8"));
          const textBytes = uint8.subarray(1 + langLen);
          return textDecoder.decode(textBytes).trim();
        }
      }
      const decoder = new TextDecoder(rec.encoding || "utf-8");
      return decoder.decode(uint8).trim();
    }

    // For url, mime, or raw text records
    const decoder = new TextDecoder(rec.encoding || "utf-8");
    return decoder.decode(uint8).trim();
  } catch {
    return "";
  }
}

/**
 * Extract the best possible payload from an NDEF reading event.
 * Prefers URL records, then text/vcard records, then MIME records, and falls back to serialNumber.
 */
export function extractNdefPayload(event: NdefReadingEventLike): string {
  if (!event.message?.records || event.message.records.length === 0) {
    return (event.serialNumber ?? "").trim();
  }

  // 1. Try url record first
  for (const rec of event.message.records) {
    if (rec.recordType === "url") {
      const val = decodeNdefRecord(rec);
      if (val) return val;
    }
  }

  // 2. Try text / mime records
  for (const rec of event.message.records) {
    if (rec.recordType === "text" || rec.recordType === "mime" || !rec.recordType) {
      const val = decodeNdefRecord(rec);
      if (val) return val;
    }
  }

  // 3. Fall back to any decoded record
  for (const rec of event.message.records) {
    const val = decodeNdefRecord(rec);
    if (val) return val;
  }

  return (event.serialNumber ?? "").trim();
}

/**
 * Web NFC reader hook (Google Chrome / Edge on Android).
 * Reads NDEF records (URL, vCard text, MIME) or tag serialNumber upon tap.
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

    if (typeof window === "undefined") {
      setStatus("unsupported");
      return;
    }

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocal) {
      setStatus("insecure");
      return;
    }

    const Ctor = (window as unknown as { NDEFReader?: NDEFReaderCtor }).NDEFReader;
    if (!Ctor || typeof Ctor !== "function") {
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

        reader.onreading = (event: NdefReadingEventLike) => {
          if (stopped) return;
          const payload = extractNdefPayload(event);
          if (payload) {
            onDetectRef.current(payload);
          }
        };

        reader.onreadingerror = () => {
          // Non-fatal error during tag read (e.g. tag moved too quickly)
          // Keep scanning so the user can re-tap
        };
      } catch (e: any) {
        if (stopped || aborter.signal.aborted) return;
        if (e?.name === "NotAllowedError" || e?.message?.includes("not allowed") || e?.message?.includes("permission")) {
          setStatus("denied");
        } else if (e?.name === "NotSupportedError") {
          setStatus("unsupported");
        } else {
          setStatus("error");
        }
      }
    }

    void start();
    return () => {
      stopped = true;
      try {
        aborter.abort();
      } catch {
        /* ignore abort errors */
      }
    };
  }, [active]);

  return { status };
}

