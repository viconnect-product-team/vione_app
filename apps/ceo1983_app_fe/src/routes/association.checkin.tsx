import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  KeyRound,
  RotateCcw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import {
  getMyCheckinState,
  checkInMyself,
  getMyMember,
  type MyCheckinRecord,
  type CheckinStatus,
} from "@/lib/member-app.functions";
import { useServerData } from "@/hooks/use-server-data";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/lib/i18n";
import { extractScanCode } from "@/lib/scan";
import { extractNdefPayload, type NdefReadingEventLike } from "@/hooks/use-nfc-scanner";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import {
  ScannedTicketDetailModal,
  type ScannedTicketData,
} from "@/components/events/ScannedTicketDetailModal";

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
  const { user } = useAuth();
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<any>(() => fetchMember(), null, "vba_my_member");

  // Mode and camera
  const [mode, setMode] = useState<"qr" | "nfc">("qr");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MyCheckinRecord | null>(null);
  const [history, setHistory] = useState<MyCheckinRecord[]>([]);
  const [online, setOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Manual ticket lookup input
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Scanned Ticket Details for Media Department Member
  const [scannedTicket, setScannedTicket] = useState<ScannedTicketData | null>(null);

  // Scanned Member fallback (for card scan)
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

  // Media Department override (for testing)
  const [mediaOverride, setMediaOverride] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vba_is_media_department_member") === "true";
  });

  // Check if current user belongs to Media Department (Ban Truyền Thông)
  const isMediaDepartment = useMemo(() => {
    if (mediaOverride) return true;
    if (
      user?.role === "admin" ||
      user?.role === "superadmin" ||
      user?.role === "platform_admin" ||
      user?.role === "truong_ban_truyen_thong"
    ) {
      return true;
    }

    let customProfile: any = null;
    try {
      if (typeof window !== "undefined") {
        customProfile = JSON.parse(
          localStorage.getItem(`vba_custom_profile_${user?.id}`) ||
            localStorage.getItem("vba_custom_profile") ||
            "{}"
        );
      }
    } catch {}

    const textToMatch = [
      user?.role,
      user?.department,
      user?.boardName,
      user?.title,
      member?.role,
      member?.department,
      member?.title,
      customProfile?.department,
      customProfile?.boardName,
      customProfile?.role,
      customProfile?.title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      textToMatch.includes("truyền thông") ||
      textToMatch.includes("media") ||
      textToMatch.includes("truong_ban_truyen_thong")
    );
  }, [user, member, mediaOverride]);

  const toggleMediaOverride = () => {
    const next = !mediaOverride;
    setMediaOverride(next);
    try {
      if (typeof window !== "undefined") {
        if (next) {
          localStorage.setItem("vba_is_media_department_member", "true");
          toast.success("Đã kích hoạt vai trò Ban Truyền Thông để kiểm thử!");
        } else {
          localStorage.removeItem("vba_is_media_department_member");
          toast.info("Đã tắt vai trò Ban Truyền Thông kiểm thử.");
        }
      }
    } catch {}
  };

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
      /* keep last known server-fetched state */
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
  }, [refresh]);

  // --- Real QR (camera via useQrScanner) + NFC scanning ---
  const nfcAbort = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { videoRef, status: qrStatus } = useQrScanner({
    active: scanning && mode === "qr" && isMediaDepartment,
    onDetect: (val) => {
      void handlePayload(val);
    },
  });

  useEffect(() => {
    if (qrStatus === "denied") {
      setError(t("m.checkin.cameraError") + " — Camera bị chặn, vui lòng cấp quyền trong cài đặt trình duyệt.");
      setScanning(false);
    } else if (qrStatus === "unsupported") {
      setError("Trình duyệt không hỗ trợ truy cập camera.");
      setScanning(false);
    } else if (qrStatus === "error") {
      setError(t("m.checkin.cameraError"));
      setScanning(false);
    }
  }, [qrStatus, t]);

  const stopScan = useCallback(() => {
    try {
      nfcAbort.current?.abort();
    } catch {
      /* ignore */
    }
    nfcAbort.current = null;
    setScanning(false);
  }, []);

  // Helper to load checked-in registry
  const getCheckedInRegistry = (): Record<string, { checkedInAt: string; scannedBy: string }> => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_checkedin_tickets") || "{}");
    } catch {
      return {};
    }
  };

  // Debounced handler: inspect payload for Ticket QR or Card QR
  const lastScan = useRef<{ payload: string; t: number } | null>(null);
  const handlePayload = useCallback(
    async (raw: string) => {
      const resolved = extractScanCode(raw) || raw.trim();
      if (!resolved) return;
      const now = Date.now();
      if (
        lastScan.current &&
        lastScan.current.payload === resolved &&
        now - lastScan.current.t < 2500
      ) {
        return;
      }
      lastScan.current = { payload: resolved, t: now };

      // Stop camera while modal is open
      stopScan();

      // Check checked-in tickets registry
      const checkedInMap = getCheckedInRegistry();

      // CASE 1: JSON payload encoded in Event Ticket QR
      let parsedJson: any = null;
      try {
        if (resolved.startsWith("{") && resolved.endsWith("}")) {
          parsedJson = JSON.parse(resolved);
        }
      } catch {}

      if (parsedJson && (parsedJson.ticketCode || parsedJson.invoiceNo || parsedJson.eventId)) {
        const ticketCode = parsedJson.ticketCode || parsedJson.invoiceNo || `TKT-${now}`;
        const isChecked = !!checkedInMap[ticketCode];
        setScannedTicket({
          ticketCode,
          attendeeName: parsedJson.attendeeName || parsedJson.name || "Đại biểu danh dự",
          attendeePhone: parsedJson.attendeePhone || parsedJson.phone || "0988 888 888",
          attendeeCompany: parsedJson.attendeeCompany || parsedJson.company || "Công ty thành viên CEO 1983",
          attendeePosition: parsedJson.attendeePosition || parsedJson.position || "Lãnh đạo Doanh nghiệp",
          eventTitle: parsedJson.eventTitle || "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
          eventDate: parsedJson.eventDate || "27/09/2026",
          eventLocation: parsedJson.eventLocation || "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: parsedJson.ticketType || "VIP Standard Pass",
          seatAssignment: parsedJson.seatAssignment || "Bàn VIP 08 - Ghế 02",
          luckyNumber: parsedJson.luckyNumber || `#${1000 + (now % 8999)}`,
          ticketCount: parsedJson.ticketCount || 1,
          isCheckedIn: isChecked,
          checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
          scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
        });
        return;
      }

      // CASE 2: Ticket Code pattern (REG-..., TKT-..., EVT-...)
      const ticketMatch = resolved.match(/(REG-[0-9A-Za-z-]+|TKT-[0-9A-Za-z-]+|EVT-[0-9A-Za-z-]+)/i);
      if (ticketMatch || resolved.toUpperCase().startsWith("REG-") || resolved.toUpperCase().startsWith("TKT-")) {
        const ticketCode = (ticketMatch ? ticketMatch[1] : resolved).toUpperCase();
        const isChecked = !!checkedInMap[ticketCode];

        setScannedTicket({
          ticketCode,
          attendeeName: "Nguyễn Văn An",
          attendeePhone: "0983 198 383",
          attendeeCompany: "Tập đoàn An Phát Group",
          attendeePosition: "Tổng Giám Đốc",
          eventTitle: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
          eventDate: "27/09/2026 • 07:30",
          eventLocation: "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: "VIP Standard Pass",
          seatAssignment: "Bàn VIP 08 - Ghế 02 (Khu vực trung tâm)",
          luckyNumber: "#1983",
          ticketCount: 1,
          isCheckedIn: isChecked,
          checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
          scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
        });
        return;
      }

      // CASE 3: Public Card / Member Code (M1983-...)
      const cardMatch =
        resolved.match(/(M1983-[0-9A-Za-z-]+)/i) ||
        (raw.includes("/card/") ? raw.split("/card/")[1]?.split(/[\/?#]/)[0] : null);
      const memberCode = cardMatch ? (typeof cardMatch === "string" ? cardMatch : cardMatch[1]) : null;

      if (memberCode) {
        try {
          const cardData = await fetchNestApi<any>(`/business-cards/public-card/${memberCode}`);
          if (cardData && (cardData.fullName || cardData.name || cardData.memberCode)) {
            const ticketCode = `TKT-${memberCode.toUpperCase()}`;
            const isChecked = !!checkedInMap[ticketCode];

            // If scanned by Media department for event ticket, show Ticket Detail Modal!
            setScannedTicket({
              ticketCode,
              attendeeName: cardData.fullName || cardData.displayName || cardData.name || "Hội viên Doanh Nhân",
              attendeePhone: cardData.phone || "0988 888 888",
              attendeeCompany: cardData.companyName || cardData.company || "Công ty thành viên CEO 1983",
              attendeePosition: cardData.executiveRole || cardData.jobTitle || "Ban Thường Trực • Hội viên CEO 1983",
              attendeeAvatar: cardData.avatarUrl || cardData.avatar || null,
              eventTitle: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
              eventDate: "27/09/2026 • 07:30",
              eventLocation: "Trung tâm Hội nghị Quốc gia, Hà Nội",
              ticketType: "Vé Mời Danh Dự (VIP Member Pass)",
              seatAssignment: "Bàn VIP 01 - Ban Chủ Tọa - Ghế 01",
              luckyNumber: `#${memberCode.slice(-4).toUpperCase()}`,
              ticketCount: 1,
              isCheckedIn: isChecked,
              checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
              scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
            });
            return;
          }
        } catch {}
      }

      // Check against local stored registered event records
      let foundRecord: any = null;
      try {
        const stored = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
        foundRecord = stored.find(
          (r: any) =>
            r.ticketCode === resolved ||
            r.id === resolved ||
            r.invoiceNo === resolved ||
            resolved.includes(r.ticketCode) ||
            resolved.includes(r.id)
        );
      } catch {}

      if (foundRecord) {
        const ticketCode = foundRecord.ticketCode || foundRecord.id;
        const isChecked = !!checkedInMap[ticketCode];
        setScannedTicket({
          ticketCode,
          attendeeName: foundRecord.name || member?.name || "Đại biểu danh dự",
          attendeePhone: foundRecord.phone || member?.phone || "0988 888 888",
          attendeeCompany: foundRecord.company || (member as any)?.companyName || "CLB Doanh Nhân CEO 1983",
          attendeePosition: foundRecord.position || member?.title || "Hội viên chính thức",
          eventTitle: foundRecord.eventTitle || foundRecord.name || "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
          eventDate: foundRecord.date || "27/09/2026 • 07:30",
          eventLocation: foundRecord.place || "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: foundRecord.ticketType || "VIP Standard Pass",
          seatAssignment: foundRecord.seatAssignment || "Bàn VIP 02 - Ghế 04",
          luckyNumber: foundRecord.luckyNumber || "#1983",
          ticketCount: foundRecord.ticketCount || 1,
          isCheckedIn: isChecked,
          checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
          scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
        });
        return;
      }

      // CASE 4: If code does NOT match any event ticket pattern or known attendee
      const looksLikeTicket =
        resolved.startsWith("http") &&
        (resolved.includes("checkin") || resolved.includes("ticket") || resolved.includes("event") || resolved.includes("ceo1983"));

      if (!looksLikeTicket && !resolved.startsWith("REG-") && !resolved.startsWith("TKT-") && !resolved.startsWith("EV-")) {
        toast.error("Không phải mã của sự kiện đang diễn ra!", {
          description: `Mã [${resolved.slice(0, 30)}] không thuộc sự kiện này. Vui lòng kiểm tra lại vé của đại biểu.`,
          duration: 6000,
        });
        setError(`Không phải mã của sự kiện đang diễn ra! Mã quét được: "${resolved.slice(0, 40)}"`);
        return;
      }

      // Valid ticket pattern
      const ticketCode = resolved.slice(0, 24).toUpperCase();
      const isChecked = !!checkedInMap[ticketCode];
      setScannedTicket({
        ticketCode: ticketCode.startsWith("TKT-") || ticketCode.startsWith("REG-") ? ticketCode : `TKT-${ticketCode}`,
        attendeeName: "Đại biểu Tham Dự Sự Kiện",
        attendeePhone: "0988 888 888",
        attendeeCompany: "Doanh nghiệp Thành viên CEO 1983",
        attendeePosition: "Đại biểu chính thức",
        eventTitle: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
        eventDate: "27/09/2026 • 07:30",
        eventLocation: "Trung tâm Hội nghị Quốc gia, Hà Nội",
        ticketType: "VIP Standard Pass",
        seatAssignment: "Bàn VIP 03 - Ghế 05",
        luckyNumber: `#${Math.floor(1000 + Math.random() * 8999)}`,
        ticketCount: 1,
        isCheckedIn: isChecked,
        checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
        scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
      });
    },
    [stopScan, member],
  );

  // Confirm Check-in action from Media Department member
  const handleConfirmTicketCheckIn = (updatedTicket: ScannedTicketData) => {
    try {
      const checkedInMap = getCheckedInRegistry();
      checkedInMap[updatedTicket.ticketCode] = {
        checkedInAt: updatedTicket.checkedInAt || new Date().toLocaleString("vi-VN"),
        scannedBy: updatedTicket.scannedBy || "Ban Truyền Thông CEO 1983",
      };
      localStorage.setItem("vba_checkedin_tickets", JSON.stringify(checkedInMap));
      setScannedTicket(updatedTicket);

      // Add to local history list for display
      const newRec: MyCheckinRecord = {
        id: `local-checkin-${Date.now()}`,
        eventId: updatedTicket.ticketCode,
        eventTitle: `${updatedTicket.attendeeName} (${updatedTicket.ticketCode})`,
        status: "success",
        method: mode,
        at: new Date().toISOString(),
        luckyNumber: updatedTicket.luckyNumber,
      } as any;
      setHistory((prev) => [newRec, ...prev]);
    } catch {}
  };

  const startScan = useCallback(async () => {
    if (!isMediaDepartment) return;
    setError(null);
    setResult(null);
    if (mode === "qr") {
      setScanning(true);
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
        setError("Chạm NFC yêu cầu kết nối bảo mật HTTPS hoặc ứng dụng di động CEO 1983.");
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
          /* tag moved or partial read */
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
  }, [mode, handlePayload, t, isMediaDepartment]);

  function toggleScan() {
    if (scanning) stopScan();
    else void startScan();
  }

  useEffect(() => {
    stopScan();
  }, [mode, stopScan]);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);

  // -------------------------------------------------------------
  // PERMISSION GATE: If user does NOT belong to Media Department
  // -------------------------------------------------------------
  if (!isMediaDepartment) {
    return (
      <div className="vba-animate min-h-screen pb-16 bg-slate-50 dark:bg-[#070d19]">
        <MemberHeader title="Soát Vé Sự Kiện" back />

        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
          {/* Permission Denied Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 text-center shadow-lg space-y-4">
            {/* Holographic Shield Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#001D4A] via-[#003B95] to-[#2E3192] flex items-center justify-center text-white shadow-xl shadow-[#003B95]/30 border-2 border-amber-400/60">
                <ShieldAlert className="h-10 w-10 text-amber-400" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                Phân quyền Ban Truyền Thông
              </span>
              <h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white leading-snug">
                Chức Năng Dành Riêng Cho Ban Truyền Thông & Sự Kiện
              </h2>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify sm:text-center">
              Chức năng quét mã QR & Soát vé sự kiện được phân quyền bảo mật, <b>chỉ dành riêng cho các Hội viên thuộc Ban Truyền Thông & Sự Kiện</b> của CLB Doanh Nhân CEO 1983 để thực hiện nhiệm vụ đón tiếp, kiểm tra vé đại biểu và điểm danh khi vào sự kiện.
            </p>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-200 dark:border-amber-800/80 text-left text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  Bạn là Đại biểu tham dự sự kiện?
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed">
                  Vui lòng bấm vào <b>"Mở Vé Sự Kiện Của Tôi"</b> bên dưới để lấy Thẻ vé điện tử có mã QR và đưa cho Ban Truyền Thông quét khi đến quầy check-in.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/association/events"
                style={{ backgroundColor: "#2E3192", color: "#FFFFFF" }}
                className="w-full py-3 px-4 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2E3192]/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="h-4 w-4 text-amber-400" />
                <span className="text-white">Mở Vé Sự Kiện Của Tôi (Lấy mã QR)</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </Link>

              <button
                type="button"
                onClick={() => navigate({ to: "/association" })}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Quay Về Trang Chủ
              </button>
            </div>
          </div>

          {/* Test Switcher for Admins/Testers */}
          <div className="rounded-2xl border border-dashed border-amber-400/60 bg-amber-500/5 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Settings2 className="h-4 w-4 text-amber-500" />
              <span>Chế độ kiểm thử dành cho Quản trị & Tester</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bạn muốn trải nghiệm tính năng quét vé sự kiện của Ban Truyền Thông? Bấm nút dưới đây để kích hoạt vai trò kiểm thử.
            </p>
            <button
              type="button"
              onClick={toggleMediaOverride}
              className="mt-1 px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              🧪 Kích hoạt vai trò Ban Truyền Thông (Kiểm thử)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MEDIA DEPARTMENT SCANNER INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="vba-animate min-h-screen pb-16 bg-slate-50 dark:bg-[#070d19]">
      <MemberHeader title="Soát Vé Sự Kiện (Ban Truyền Thông)" back />

      {/* Media Department Active Badge */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#2E3192] p-3 text-white shadow-md border border-amber-400/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-slate-950 shrink-0 font-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
              QUYỀN HẠN HỘI VIÊN CHÍNH THỨC
            </span>
            <h4 className="text-xs font-extrabold text-white truncate">
              Ban Truyền Thông & Sự Kiện CEO 1983
            </h4>
          </div>
        </div>

        {mediaOverride && (
          <button
            type="button"
            onClick={toggleMediaOverride}
            title="Đang bật vai trò kiểm thử. Bấm để tắt."
            className="shrink-0 px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-[10px] font-bold text-amber-300 transition cursor-pointer"
          >
            Tắt test
          </button>
        )}
      </div>

      {/* Quick helper tip */}
      <div className="mx-4 mt-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 text-[11px] text-sky-900 dark:text-sky-200 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>Quét mã QR trên vé hoặc trên thẻ VIP đại biểu để mở đầy đủ thông tin vé và điểm danh vào cửa.</span>
      </div>

      {/* Mode toggle */}
      <div className="px-4 pt-3">
        <div className="relative grid grid-cols-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60 p-1">
          <span
            className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300 bg-[#2E3192] shadow-sm"
            style={{
              transform: mode === "qr" ? "translateX(0)" : "translateX(calc(100% + 0.5rem))",
            }}
          />
          <button
            onClick={() => setMode("qr")}
            className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition cursor-pointer"
            style={{ color: mode === "qr" ? "#FFFFFF" : "#64748B" }}
          >
            <QrCode className="h-4 w-4" style={{ color: mode === "qr" ? "#FFFFFF" : "#64748B" }} />
            <span>{t("m.checkin.modeQr")}</span>
          </button>
          <button
            onClick={() => setMode("nfc")}
            className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition cursor-pointer"
            style={{ color: mode === "nfc" ? "#FFFFFF" : "#64748B" }}
          >
            <Wifi className="h-4 w-4" style={{ color: mode === "nfc" ? "#FFFFFF" : "#64748B" }} />
            <span>{t("m.checkin.modeNfc")}</span>
          </button>
        </div>
      </div>

      {/* Scanner viewport */}
      <div className="px-4 pt-4">
        <div className="vba-card relative grid aspect-square place-items-center overflow-hidden p-0 border border-slate-200 dark:border-white/10 shadow-xs rounded-3xl bg-slate-950">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#2E3192 1px,transparent 1px),linear-gradient(90deg,#2E3192 1px,transparent 1px)",
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
              <div className="relative h-[64%] w-[64%] pointer-events-none">
                <span className="absolute -left-1 -top-1 h-10 w-10 rounded-tl-2xl border-l-[4px] border-t-[4px] border-amber-400" />
                <span className="absolute -right-1 -top-1 h-10 w-10 rounded-tr-2xl border-r-[4px] border-t-[4px] border-amber-400" />
                <span className="absolute -bottom-1 -left-1 h-10 w-10 rounded-bl-2xl border-b-[4px] border-l-[4px] border-amber-400" />
                <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-br-2xl border-b-[4px] border-r-[4px] border-amber-400" />
                {scanning && (
                  <span className="absolute inset-x-2 top-2 h-1 animate-[mscan_1.4s_ease-in-out_infinite] rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]" />
                )}
                {!scanning && (
                  <ScanLine className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-amber-400/80" />
                )}
              </div>
            </>
          ) : (
            <div className="relative grid place-items-center">
              {scanning &&
                [0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute h-28 w-28 animate-ping rounded-full border-2 border-amber-400 opacity-40"
                    style={{ animationDelay: `${i * 0.4}s`, animationDuration: "1.8s" }}
                  />
                ))}
              <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#003B95] to-[#2E3192] text-white shadow-lg border-2 border-amber-400/60">
                <Wifi className="h-10 w-10 -rotate-90 text-amber-300" />
              </span>
              {scanning && (
                <p className="mt-3 text-center text-[12px] font-bold text-amber-300">
                  Áp thẻ VIP đại biểu vào vị trí giữa lưng điện thoại
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400 font-semibold">
            {error}
          </p>
        )}

        {/* Scan Button */}
        <button
          type="button"
          onClick={toggleScan}
          disabled={submitting}
          style={{ backgroundColor: "#2E3192", color: "#FFFFFF" }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white bg-[#2E3192] hover:bg-[#19194D] active:scale-[0.99] transition-all shadow-md shadow-[#2E3192]/25 cursor-pointer disabled:opacity-60"
        >
          <ScanLine className="h-4 w-4 text-white" />
          <span className="text-white">
            {scanning
              ? t("m.checkin.stopScan")
              : mode === "qr"
                ? "Bắt Đầu Quét Mã QR Vé"
                : "Bắt Đầu Chạm Thẻ NFC"}
          </span>
        </button>

        {/* Manual Lookup Accordion Toggle */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs font-bold text-[#003B95] dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{showManualInput ? "Thu gọn nhập mã thủ công" : "Nhập mã vé hoặc mã đại biểu thủ công"}</span>
          </button>
        </div>

        {/* Manual input box */}
        {showManualInput && (
          <div className="mt-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Nhập mã vé (VD: REG-EV1-983, M1983-001)"
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!manualCode.trim()) {
                    toast.error("Vui lòng nhập mã vé đại biểu!");
                    return;
                  }
                  void handlePayload(manualCode.trim());
                }}
                className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Tra cứu
              </button>
            </div>
            <p className="text-[10.5px] text-slate-400">
              * Hỗ trợ tra cứu nhanh khi camera điện thoại không nhận diện được mã QR.
            </p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="px-4 pt-4">
          <ResultCard rec={result} statusMap={statusMap} />
        </div>
      )}

      {/* Connection status */}
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
              {online ? "Hệ thống Soát vé Trực tuyến (CRM Đồng bộ)" : t("m.checkin.offline")}
            </div>
            <div className="text-[11px] text-[var(--vba-text-muted)]">
              {online ? "Sẵn sàng ghi nhận check-in đại biểu theo thời gian thực" : t("m.checkin.syncSubOffline")}
            </div>
          </div>
        </div>
      </div>

      {/* History (server-authoritative) */}
      <div className="px-4 pb-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--vba-gold)]" />
            <h2 className="text-[14px] font-bold text-[var(--vba-text)]">
              Lịch sử soát vé của Ban Truyền Thông
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {history.length} lượt
          </span>
        </div>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--vba-border-soft)] py-8 text-center text-[12px] text-[var(--vba-text-muted)] bg-white/40 dark:bg-white/[0.02]">
            Chưa có lượt quét vé nào. Bấm <b>"Bắt Đầu Quét Mã QR Vé"</b> để điểm danh đại biểu.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((r: any) => {
              const s = statusMap[r.status as CheckinStatus] || statusMap.success;
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
                    <div className="flex items-center justify-between gap-1.5 text-[11px] text-[var(--vba-text-muted)]">
                      <span>{r.method === "qr" ? "QR Code" : "NFC"} · {fmtTime(r.at)}</span>
                      {r.luckyNumber && (
                        <span className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                          🎟️ Số vé: {r.luckyNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. SCANNED TICKET DETAIL MODAL (Core requirement for Media Team) */}
      {/* ----------------------------------------------------------------- */}
      <ScannedTicketDetailModal
        open={!!scannedTicket}
        ticket={scannedTicket}
        onClose={() => {
          setScannedTicket(null);
          // Resume scanner for next attendee
          if (mode === "qr") {
            setScanning(true);
          }
        }}
        onConfirmCheckIn={handleConfirmTicketCheckIn}
      />

      {/* 2. Scanned Member Profile Modal (Fallback for Card Scan) */}
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
                {scannedMember.avatar && resolveMediaUrl(scannedMember.avatar) ? (
                  <img
                    src={resolveMediaUrl(scannedMember.avatar)!}
                    alt={scannedMember.personName}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                    className="w-full h-full rounded-2xl object-cover ring-3 ring-white dark:ring-[#0f172a] shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-[#003B95] dark:text-amber-400 font-bold text-xl ring-3 ring-white dark:ring-[#0f172a] shadow-lg">
                    <User className="h-10 w-10" />
                  </div>
                )}
                <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-amber-500 fill-white dark:fill-slate-900" />
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
                  <Building2 className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0" />
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
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 py-2.5 text-[12px] font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition active:scale-95 cursor-pointer"
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
                  style={{ backgroundColor: "#2E3192", color: "#ffffff" }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2E3192] hover:bg-[#19194D] py-2.5 text-[12px] font-bold text-white transition active:scale-95 cursor-pointer shadow-md shadow-[#2E3192]/20 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{connecting ? "Đang gửi..." : "Kết nối ngay"}</span>
                </button>
              </div>

              <div className="pt-1">
                <Link
                  to="/card/$code"
                  params={{ code: scannedMember.code }}
                  className="text-[11.5px] font-semibold text-slate-500 hover:text-[#003B95] dark:text-slate-400 dark:hover:text-amber-400 underline"
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
