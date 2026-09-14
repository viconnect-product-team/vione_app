import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  QrCode,
  Wifi,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  History,
  CloudOff,
  Cloud,
  User,
  UserPlus,
  MessageSquare,
  Building2,
  BadgeCheck,
  X,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import {
  getMyCheckinState,
  checkInMyself,
  type MyCheckinRecord,
  type CheckinStatus,
} from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import { extractScanCode } from "@/lib/scan";
import { extractNdefPayload, type NdefReadingEventLike } from "@/hooks/use-nfc-scanner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";

export const Route = createFileRoute("/association/checkin")({
  component: CheckinScreen,
});

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function CheckinScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"qr" | "nfc">("qr");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MyCheckinRecord | null>(null);
  const [history, setHistory] = useState<MyCheckinRecord[]>([]);
  const [online, setOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scannedMember, setScannedMember] = useState<{
    code: string;
    name: string;
    personName: string;
    personTitle: string;
    avatar?: string | null;
    coverUrl?: string | null;
    userId?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const fetchState = useServerFn(getMyCheckinState);
  const submitCheckin = useServerFn(checkInMyself);

  const statusMap: Record<
    CheckinStatus,
    { label: string; sub: string; Icon: typeof CheckCircle2; color: string; bg: string }
  > = {
    success: {
      label: t("m.checkin.statusSuccessLabel"),
      sub: t("m.checkin.statusSuccessSub"),
      Icon: CheckCircle2,
      color: "#3fbf7f",
      bg: "rgba(63,191,127,0.14)",
    },
    already: {
      label: t("m.checkin.statusAlreadyLabel"),
      sub: t("m.checkin.statusAlreadySub"),
      Icon: AlertTriangle,
      color: "#e8a04c",
      bg: "rgba(232,160,76,0.14)",
    },
    invalid: {
      label: t("m.checkin.statusInvalidLabel"),
      sub: t("m.checkin.statusInvalidSub"),
      Icon: XCircle,
      color: "#ff6b6b",
      bg: "rgba(255,107,107,0.14)",
    },
  };

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchState();
      setHistory(rows);
    } catch {
      /* keep last known server-fetched state; do NOT invent local truth */
    }
  }, [fetchState]);

  useEffect(() => {
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    void refresh();
    const goOnline = () => {
      setOnline(true);
      void refresh();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Real QR (camera) + NFC scanning ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrControls = useRef<{ stop: () => void } | null>(null);
  const nfcAbort = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopScan = useCallback(() => {
    qrControls.current?.stop();
    qrControls.current = null;
    try {
      nfcAbort.current?.abort();
    } catch {
      /* ignore */
    }
    nfcAbort.current = null;
    setScanning(false);
  }, []);

  // Debounced handler: ignore duplicates within a short window and require
  // the server to be reachable — Option A (online-required check-in).
  const lastScan = useRef<{ payload: string; t: number } | null>(null);
  const handlePayload = useCallback(
    async (raw: string) => {
      const resolved = extractScanCode(raw) || raw.trim();
      if (!resolved) return;
      const now = Date.now();
      if (
        lastScan.current &&
        lastScan.current.payload === resolved &&
        now - lastScan.current.t < 3000
      ) {
        return;
      }
      lastScan.current = { payload: resolved, t: now };

      // 1. Check if payload is a member card code or URL
      const cardMatch =
        resolved.match(/(M1983-[0-9A-Za-z-]+)/i) ||
        (raw.includes("/card/") ? raw.split("/card/")[1]?.split(/[\/?#]/)[0] : null);
      const memberCode = cardMatch ? (typeof cardMatch === "string" ? cardMatch : cardMatch[1]) : null;

      if (memberCode) {
        try {
          const cardData = await fetchNestApi<any>(`/business-cards/public-card/${memberCode}`);
          if (cardData && (cardData.fullName || cardData.name || cardData.memberCode)) {
            stopScan();
            setScannedMember({
              code: cardData.memberCode || memberCode,
              name: cardData.companyName || cardData.company || "Công ty thành viên CEO 1983",
              personName: cardData.fullName || cardData.displayName || cardData.name || "Hội viên Doanh Nhân",
              personTitle: cardData.executiveRole || cardData.jobTitle || cardData.headline || "Ban Thường Trực • Hội viên CEO 1983",
              avatar: cardData.avatarUrl || cardData.avatar || null,
              coverUrl: cardData.coverUrl || cardData.cover || null,
              userId: cardData.userId || null,
              phone: cardData.phone || null,
              email: cardData.email || null,
            });
            return;
          }
        } catch {}
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setResult({
          id: `local-offline-${now}`,
          eventId: null,
          eventTitle: t("m.checkin.offline"),
          status: "invalid",
          method: mode,
          at: new Date().toISOString(),
        });
        return;
      }

      if (submitting) return;
      setSubmitting(true);
      try {
        const rec = await submitCheckin({ data: { payload: resolved, method: mode } });
        setResult(rec);
        await refresh();
      } catch {
        setResult({
          id: `local-error-${now}`,
          eventId: null,
          eventTitle: t("m.checkin.statusInvalidLabel"),
          status: "invalid",
          method: mode,
          at: new Date().toISOString(),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [mode, submitCheckin, refresh, submitting, t, stopScan],
  );

  const startScan = useCallback(async () => {
    setError(null);
    setResult(null);
    if (mode === "qr") {
      // 1. Check camera permission trước
      try {
        if (navigator.permissions) {
          const perm = await navigator.permissions.query({ name: "camera" as PermissionName });
          if (perm.state === "denied") {
            setError(t("m.checkin.cameraError") + " — Camera bị chặn, vui lòng cấp quyền trong cài đặt trình duyệt.");
            setScanning(false);
            return;
          }
        }
      } catch {
        /* permissions API không khả dụng — tiếp tục thử */
      }

      // 2. Thử lấy stream camera sau (environment) trước
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        try {
          // Fallback: camera bất kỳ
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch {
          setError(t("m.checkin.cameraError"));
          setScanning(false);
          return;
        }
      }

      // 3. Attach stream vào video element
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        try {
          await videoRef.current.play();
        } catch {
          /* Autoplay restriction — user will tap */
        }
      }

      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoElement(videoRef.current!, (res, _err) => {
          if (res) void handlePayload(res.getText());
        });
        qrControls.current = {
          stop: () => {
            controls.stop();
            // Stop camera tracks to release camera indicator
            if (videoRef.current?.srcObject) {
              const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
              tracks.forEach((t) => t.stop());
              videoRef.current.srcObject = null;
            }
          },
        };
        setScanning(true);
      } catch {
        // Stop stream on failure
        if (stream) stream.getTracks().forEach((t) => t.stop());
        setError(t("m.checkin.cameraError"));
        setScanning(false);
      }
    } else {
      if (typeof window === "undefined") {
        setError(t("m.checkin.nfcNotSupported"));
        return;
      }

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor);
      if (!window.isSecureContext && !isLocal) {
        setError("Chạm NFC yêu cầu kết nối bảo mật HTTPS hoặc ứng dụng di động ViOne.");
        return;
      }

      const NDEFReader = (window as unknown as { NDEFReader?: new () => any }).NDEFReader;
      if (!NDEFReader || typeof NDEFReader !== "function") {
        setError("Thiết bị hoặc trình duyệt chưa hỗ trợ Web NFC. Vui lòng mở bằng Google Chrome trên Android hoặc chuyển sang quét QR.");
        return;
      }

      try {
        const reader = new NDEFReader();
        const abort = new AbortController();
        nfcAbort.current = abort;
        await reader.scan({ signal: abort.signal });
        reader.onreading = (ev: NdefReadingEventLike) => {
          const payload = extractNdefPayload(ev);
          if (payload) {
            void handlePayload(payload);
          }
        };
        reader.onreadingerror = () => {
          /* tag moved or partial read — keep listening */
        };
        setScanning(true);
      } catch (e: any) {
        if (e?.name === "NotAllowedError" || e?.message?.includes("not allowed") || e?.message?.includes("permission")) {
          setError("Quyền NFC bị từ chối. Hãy cho phép quyền NFC trong cài đặt trình duyệt Chrome.");
        } else {
          setError("Không thể bật NFC. Hãy kiểm tra xem NFC đã được bật trong Cài đặt của máy và mở khóa màn hình.");
        }
        setScanning(false);
      }
    }
  }, [mode, handlePayload, t]);


  function toggleScan() {
    if (scanning) stopScan();
    else void startScan();
  }

  useEffect(() => {
    stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  useEffect(() => () => stopScan(), [stopScan]);

  return (
    <div className="vba-animate">
      <MemberHeader title={t("m.checkin.headerTitle")} back />

      {/* Mode toggle */}
      <div className="px-4 pt-4">
        <div className="relative grid grid-cols-2 rounded-2xl border border-[var(--vba-border-soft)] bg-[var(--vba-bg-2)] p-1">
          <span
            className="vba-gold-grad absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300"
            style={{
              transform: mode === "qr" ? "translateX(0)" : "translateX(calc(100% + 0.5rem))",
            }}
          />
          <button
            onClick={() => setMode("qr")}
            className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition"
            style={{ color: mode === "qr" ? "#1a1206" : "var(--vba-text-dim)" }}
          >
            <QrCode className="h-4 w-4" /> {t("m.checkin.modeQr")}
          </button>
          <button
            onClick={() => setMode("nfc")}
            className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition"
            style={{ color: mode === "nfc" ? "#1a1206" : "var(--vba-text-dim)" }}
          >
            <Wifi className="h-4 w-4" /> {t("m.checkin.modeNfc")}
          </button>
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="px-4 pt-4">
        <div className="vba-card relative grid aspect-square place-items-center overflow-hidden p-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(var(--vba-gold-soft) 1px,transparent 1px),linear-gradient(90deg,var(--vba-gold-soft) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          {mode === "qr" ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: scanning ? 1 : 0 }}
                muted
                playsInline
              />
              <div className="relative h-[62%] w-[62%]">
                <span className="absolute -left-1 -top-1 h-9 w-9 rounded-tl-2xl border-l-[3px] border-t-[3px] border-[var(--vba-gold)]" />
                <span className="absolute -right-1 -top-1 h-9 w-9 rounded-tr-2xl border-r-[3px] border-t-[3px] border-[var(--vba-gold)]" />
                <span className="absolute -bottom-1 -left-1 h-9 w-9 rounded-bl-2xl border-b-[3px] border-l-[3px] border-[var(--vba-gold)]" />
                <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-br-2xl border-b-[3px] border-r-[3px] border-[var(--vba-gold)]" />
                {scanning && (
                  <span className="absolute inset-x-2 top-2 h-0.5 animate-[mscan_1.4s_ease-in-out_infinite] rounded-full bg-[var(--vba-gold)] shadow-[0_0_14px_var(--vba-gold)]" />
                )}
                {!scanning && (
                  <ScanLine className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-[var(--vba-text-dim)]" />
                )}
              </div>
            </>
          ) : (
            <div className="relative grid place-items-center">
              {scanning &&
                [0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute h-28 w-28 animate-ping rounded-full border-2 border-[var(--vba-gold)] opacity-40"
                    style={{ animationDelay: `${i * 0.4}s`, animationDuration: "1.8s" }}
                  />
                ))}
              <span className="vba-gold-grad grid h-24 w-24 place-items-center rounded-full text-[#1a1206]">
                <Wifi className="h-10 w-10 -rotate-90" />
              </span>
              {scanning && (
                <p className="mt-3 text-center text-[12px] font-medium text-[var(--vba-gold)]">
                  Áp thẻ vào vị trí giữa lưng điện thoại
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.1)] px-3 py-2 text-[12px] text-[#ff6b6b]">
            {error}
          </p>
        )}

        <button
          onClick={toggleScan}
          disabled={submitting}
          className="vba-gold-grad mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-[#1a1206] disabled:opacity-60"
        >
          <ScanLine className="h-4 w-4" />
          {scanning
            ? t("m.checkin.stopScan")
            : mode === "qr"
              ? t("m.checkin.startQr")
              : t("m.checkin.startNfc")}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="px-4 pt-4">
          <ResultCard rec={result} statusMap={statusMap} />
        </div>
      )}

      {/* Connection status — no local queue, online is required */}
      <div className="px-4 pt-5">
        <div className="vba-card flex items-center gap-3 p-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={{
              background: online ? "rgba(63,191,127,0.14)" : "rgba(255,107,107,0.14)",
            }}
          >
            {online ? (
              <Cloud className="h-4.5 w-4.5" style={{ color: "#3fbf7f" }} />
            ) : (
              <CloudOff className="h-4.5 w-4.5" style={{ color: "#ff6b6b" }} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--vba-text)]">
              {online ? t("m.checkin.synced") : t("m.checkin.offline")}
            </div>
            <div className="text-[11px] text-[var(--vba-text-muted)]">
              {online ? t("m.checkin.syncSubOnline") : t("m.checkin.syncSubOffline")}
            </div>
          </div>
        </div>
      </div>

      {/* History (server-authoritative) */}
      <div className="px-4 pb-4 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--vba-gold)]" />
          <h2 className="text-[14px] font-bold text-[var(--vba-text)]">
            {t("m.checkin.historyTitle")}
          </h2>
        </div>
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--vba-border-soft)] py-8 text-center text-[12px] text-[var(--vba-text-muted)]">
            {t("m.checkin.historyEmpty")}
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((r: any) => {
              const s = statusMap[r.status as CheckinStatus];
              return (
                <div key={r.id} className="vba-card flex items-center gap-3 p-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ background: s.bg }}
                  >
                    <s.Icon className="h-4.5 w-4.5" style={{ color: s.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                      {r.eventTitle}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--vba-text-muted)]">
                      {r.method === "qr" ? "QR" : "NFC"} · {fmtTime(r.at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scanned Member Profile Modal — Rich Opponent Identity Display */}
      {scannedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setScannedMember(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white animate-scale-in border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover photo banner */}
            <div className="relative h-28 w-full overflow-hidden bg-slate-900">
              <img
                src={
                  scannedMember.coverUrl
                    ? resolveMediaUrl(scannedMember.coverUrl) || scannedMember.coverUrl
                    : heroImg
                }
                alt="Cover"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button
                onClick={() => setScannedMember(null)}
                className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/75 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-4 text-[10.5px] font-bold text-white/90 drop-shadow-sm flex items-center gap-1">
                <span>CLB DOANH NHÂN CEO 1983</span>
              </div>
            </div>

            {/* Body content */}
            <div className="p-5 pt-0 text-center space-y-3">
              {/* Overlapping Avatar with Verified Badge */}
              <div className="relative -mt-10 mx-auto w-20 h-20">
                {scannedMember.avatar ? (
                  <img
                    src={resolveMediaUrl(scannedMember.avatar) || scannedMember.avatar}
                    alt={scannedMember.personName}
                    className="w-full h-full rounded-2xl object-cover ring-3 ring-white dark:ring-[#0f172a] shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 font-bold text-xl ring-3 ring-white dark:ring-[#0f172a] shadow-lg">
                    <User className="h-10 w-10" />
                  </div>
                )}
                <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-sky-500 fill-white dark:fill-slate-900" />
              </div>

              {/* Name & Association Role */}
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {scannedMember.personName || "Hội viên CLB CEO 1983"}
                </h3>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                    {scannedMember.personTitle || "Ban Thường Trực • Hội viên CEO 1983"}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {scannedMember.code}
                  </span>
                </div>
              </div>

              {/* Enterprise / Company name */}
              {scannedMember.name && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2.5 border border-slate-100 dark:border-white/5 text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                  <Building2 className="h-4 w-4 text-sky-500 shrink-0" />
                  <span className="truncate">{scannedMember.name}</span>
                </div>
              )}

              {/* Action Buttons: Message & Connect */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const pName = scannedMember.personName || scannedMember.name;
                    const cCode = scannedMember.code;
                    setScannedMember(null);
                    navigate({
                      to: "/association/messages" as any,
                      search: { peerCode: cCode, peerName: pName } as any,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-50 dark:bg-sky-950/30 py-2.5 text-[12px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Nhắn tin
                </button>

                <button
                  type="button"
                  disabled={connecting}
                  onClick={async () => {
                    setConnecting(true);
                    try {
                      await fetchNestApi("/network/requests", {
                        method: "POST",
                        body: JSON.stringify({
                          targetUserId: scannedMember.userId || scannedMember.code,
                          memberCode: scannedMember.code,
                          message: `Xin chào! Tôi đã quét mã QR của bạn và rất mong được kết nối!`,
                        }),
                      });
                      toast.success("Đã gửi lời mời kết nối thành công!");
                      setScannedMember(null);
                    } catch {
                      toast.error("Không thể gửi lời mời kết nối");
                    } finally {
                      setConnecting(false);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 py-2.5 text-[12px] font-bold text-white transition active:scale-95 cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{connecting ? "Đang gửi..." : "Kết nối ngay"}</span>
                </button>
              </div>

              <div className="pt-1">
                <Link
                  to="/card/$code"
                  params={{ code: scannedMember.code }}
                  className="text-[11.5px] font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white underline"
                >
                  Xem chi tiết thẻ VIP doanh nhân
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  rec,
  statusMap,
}: {
  rec: MyCheckinRecord;
  statusMap: Record<
    CheckinStatus,
    { label: string; sub: string; Icon: typeof CheckCircle2; color: string; bg: string }
  >;
}) {
  const s = statusMap[rec.status];
  return (
    <div className="vba-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{ background: s.bg }}
        >
          <s.Icon className="h-6 w-6" style={{ color: s.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold" style={{ color: s.color }}>
            {s.label}
          </div>
          <div className="truncate text-[12px] text-[var(--vba-text-muted)]">{s.sub}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-[12px] text-[var(--vba-text-muted)]">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-[var(--vba-gold)]" />
          <span className="truncate text-[var(--vba-text)]">{rec.eventTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--vba-gold)]" />
          <span>{fmtTime(rec.at)}</span>
        </div>
      </div>
    </div>
  );
}
