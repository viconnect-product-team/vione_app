// BC-Mobile-5E — Tap-to-Connect sheet (Zalo-grade QR Scanner & NFC Touch).
//
// Trải nghiệm chuẩn Zalo / Banking:
//   1. Mở camera toàn màn hình, khung quét vuông có tia laser quét liên tục.
//   2. Khi camera thấy mã QR -> Chuông ping + rung nhẹ -> Tự động nhận diện & nạp thông tin người dùng.
//   3. Hiển thị Card Profile xem trước: Avatar, Tên, Chức danh, Công ty, Thông tin liên hệ.
//   4. Cho phép nhập lời nhắn và bấm nút "Gửi yêu cầu kết nối" -> Lập tức gửi thông báo Real-time cho người nhận!

import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AtSign,
  Briefcase,
  Camera,
  CheckCircle2,
  Globe,
  ImagePlus,
  Loader2,
  MapPin,
  MessageSquare,
  Nfc,
  Phone,
  QrCode,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck,
  UserPlus,
  Zap,
  ZapOff,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { useNfcScanner } from "@/hooks/use-nfc-scanner";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { IdentityConnectSDK } from "@/lib/business-connect/mobile/identity-connect.sdk";
import type { NfcTapResult, NfcTapProfile } from "@/lib/business-connect/mobile/identity-connect.sdk";
import { MeSheet } from "@/components/business-connect/mobile/me/MeSheet";
import { parseTapConnectValue } from "@/lib/business-connect/mobile/tap-connect";
import { reportIdentityMetric } from "@/lib/business-connect/mobile/identity.telemetry";
import { toast } from "sonner";

// ─── Styles ──────────────────────────────────────────────────────────────────

const PRIMARY_BTN =
  "flex min-h-12 w-full items-center justify-center gap-2 bc-cta-gold rounded-full px-6 text-[15px] font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none cursor-pointer active:scale-[0.98] transition-transform";
const SECONDARY_BTN =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none cursor-pointer";

// ─── Main sheet ──────────────────────────────────────────────────────────────

export function TapToConnectSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [mode, setMode] = useState<"qr" | "nfc">("qr");
  const [torch, setTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  
  // State for resolved profile before / after connecting
  const [detectedToken, setDetectedToken] = useState<string | null>(null);
  const [resolvedResult, setResolvedResult] = useState<NfcTapResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("Xin chào, tôi muốn kết nối với bạn qua ViOne.");
  const [requestSent, setRequestSent] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const processingRef = useRef(false);

  // Khi camera hoặc NFC phát hiện mã QR
  async function handleDetected(raw: string) {
    if (processingRef.current) return;
    const target = parseTapConnectValue(raw, window.location.origin);
    if (target.kind === "unknown") {
      setError(t("bc.mobile.tapConnect.unknown"));
      return;
    }
    processingRef.current = true;
    setError(null);
    setResolving(true);
    setDetectedToken(target.token);
    reportIdentityMetric("PUBLIC_CARD_CONNECT_TAPPED");

    try {
      // 1. Phân giải thông tin người dùng ngay lập tức (Zalo style)
      const result = await IdentityConnectSDK.resolveQr(target.token);
      setResolvedResult(result);
      if (!result.ok) {
        if (result.reason === "not_found") {
          setError("Không tìm thấy hội viên hoặc mã QR đã hết hạn.");
        } else if (result.reason === "self") {
          setError("Đây là mã QR của chính bạn.");
        }
      }
    } catch {
      setError(t("bc.mobile.connection.error"));
      reportIdentityMetric("PUBLIC_CARD_CONNECT_FAILED");
    } finally {
      setResolving(false);
      processingRef.current = false;
    }
  }

  // Gửi lời mời kết nối thực sự tới người nhận
  async function handleSendConnect() {
    if (!detectedToken || sendingRequest) return;
    setSendingRequest(true);
    setError(null);

    try {
      const result = await IdentityConnectSDK.nfcTap(detectedToken, requestMessage);
      setResolvedResult(result);
      setRequestSent(true);
      reportIdentityMetric("PUBLIC_CARD_CONNECT_SENT");
      toast.success("✓ Đã gửi yêu cầu kết nối thành công!", {
        description: `Thông báo đã được gửi tới ${result.profile?.displayName || "hội viên"}.`,
      });
    } catch {
      setError("Không thể gửi yêu cầu kết nối. Vui lòng thử lại.");
      reportIdentityMetric("PUBLIC_CARD_CONNECT_FAILED");
    } finally {
      setSendingRequest(false);
    }
  }

  // NFC is active throughout the interaction
  const nfc = useNfcScanner({ active: !resolvedResult && !resolving, onDetect: handleDetected });

  // Real-time camera QR scanner is active whenever mode === "qr"
  const { videoRef, status: qrStatus, hasTorch, scanImageFile } = useQrScanner({
    active: mode === "qr" && !resolvedResult && !resolving,
    torch,
    facingMode,
    onDetect: handleDetected,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captureInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsDecodingFile(true);
    try {
      const res = await scanImageFile(file);
      if (!res) {
        setError("Không tìm thấy mã QR hợp lệ trong ảnh. Vui lòng thử góc chụp rõ hơn.");
      }
    } catch {
      setError("Không thể đọc ảnh này. Vui lòng chọn ảnh khác.");
    } finally {
      setIsDecodingFile(false);
      e.target.value = "";
    }
  };

  function handleReset() {
    setResolvedResult(null);
    setDetectedToken(null);
    setRequestSent(false);
    setError(null);
    processingRef.current = false;
  }

  return (
    <MeSheet
      title={resolvedResult?.ok ? "Thông tin Hội viên" : t("bc.mobile.tapConnect.title")}
      subtitle={resolvedResult?.ok ? "Xác nhận kết nối danh thiếp" : t("bc.mobile.tapConnect.subtitle")}
      onClose={onClose}
    >
      <div className="grid gap-3.5 pb-2">
        {resolving ? (
          <div className="flex flex-col items-center gap-3 py-12 animate-fade-in">
            <Loader2
              aria-hidden="true"
              className="h-10 w-10 animate-spin text-[var(--bc-mobile-accent)] motion-reduce:animate-none"
              strokeWidth={2}
            />
            <p className="text-[15px] font-semibold text-[var(--bc-mobile-text)]">
              Đang tìm kiếm thông tin hội viên…
            </p>
            <p className="text-[12.5px] text-[var(--bc-mobile-muted)]">
              Nhận diện mã QR và kiểm tra trạng thái kết nối
            </p>
          </div>
        ) : resolvedResult && resolvedResult.ok && resolvedResult.profile ? (
          /* Zalo-style Profile Preview Card */
          <ZaloProfilePreview
            result={resolvedResult}
            requestMessage={requestMessage}
            onMessageChange={setRequestMessage}
            onSendConnect={handleSendConnect}
            sending={sendingRequest}
            sent={requestSent}
            onReset={handleReset}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)]">
              <button
                type="button"
                onClick={() => {
                  setMode("qr");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer ${
                  mode === "qr"
                    ? "bg-[var(--bc-mobile-accent)] text-[#0b0c10] shadow-md"
                    : "text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]"
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Quét mã QR Live</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("nfc");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13.5px] font-bold transition-all cursor-pointer ${
                  mode === "nfc"
                    ? "bg-[var(--bc-mobile-accent)] text-[#0b0c10] shadow-md"
                    : "text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]"
                }`}
              >
                <Nfc className="h-4 w-4" />
                <span>Chạm thẻ NFC</span>
              </button>
            </div>

            {mode === "qr" ? (
              /* Authentic Zalo / Banking App Camera Viewfinder */
              <div className="relative aspect-[3/4] sm:aspect-square w-full overflow-hidden rounded-3xl bg-black border border-[var(--bc-mobile-border)] shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />

                {/* Floating Top Controls (Torch + Flip Camera) */}
                <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2">
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={() => setTorch((v) => !v)}
                      aria-label="Bật/Tắt đèn pin"
                      className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                        torch
                          ? "bg-[var(--bc-mobile-accent)] text-[#0b0c10] ring-2 ring-[var(--bc-mobile-accent)]/50"
                          : "bg-black/60 text-white hover:bg-black/80"
                      }`}
                    >
                      {torch ? <Zap className="h-4.5 w-4.5 fill-current" /> : <ZapOff className="h-4.5 w-4.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
                    aria-label="Đổi camera"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer shadow-lg"
                  >
                    <RefreshCw className="h-4.5 w-4.5" />
                  </button>
                </div>

                {qrStatus === "scanning" && (
                  <>
                    {/* Centered Square Viewfinder with Dark Vignette Mask (like Zalo / Banking Apps) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div
                        className="relative w-[72%] aspect-square rounded-2xl border-2 border-[var(--bc-mobile-accent)]/40 overflow-hidden"
                        style={{
                          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 30px rgba(216, 178, 130, 0.25) inset",
                        }}
                      >
                        {/* 4 Thick Glowing Corner Brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--bc-mobile-accent)] rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--bc-mobile-accent)] rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--bc-mobile-accent)] rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--bc-mobile-accent)] rounded-br-xl" />

                        {/* Animated Laser Scanning Beam */}
                        <div className="scanner-laser-line" />
                      </div>
                    </div>

                    {/* Subtitle guidance overlay on viewfinder */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-30">
                      <span className="px-4 py-1.5 rounded-full bg-black/75 text-[12.5px] font-semibold text-[#f5f7fa] backdrop-blur-md shadow-xl border border-white/10 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[var(--bc-mobile-accent)] animate-pulse" />
                        <span>Hướng camera về mã QR để quét tự động</span>
                      </span>
                    </div>
                  </>
                )}

                {qrStatus !== "scanning" && (
                  <div
                    role="status"
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[13.5px] text-[var(--bc-mobile-muted)] bg-[var(--bc-mobile-surface-2)]/95"
                  >
                    {qrStatus === "starting" ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <Loader2 className="h-7 w-7 animate-spin text-[var(--bc-mobile-accent)]" />
                        <p className="font-medium text-[var(--bc-mobile-text)]">{t("bc.mobile.tapConnect.cameraStarting")}</p>
                      </div>
                    ) : qrStatus === "unsupported" ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bc-mobile-accent)]/15 text-[var(--bc-mobile-accent)]">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--bc-mobile-text)]">Chụp ảnh mã QR</p>
                          <p className="mt-1 text-[12px] text-[var(--bc-mobile-muted)]">
                            Chụp ảnh mã QR bằng máy ảnh điện thoại để kết nối ngay
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => captureInputRef.current?.click()}
                          className="flex items-center gap-2 rounded-full bg-[var(--bc-mobile-accent)] px-5 py-2.5 text-[13.5px] font-bold text-[#050c15] shadow-md active:scale-95 transition-transform cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Chụp ảnh QR ngay</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <p className="font-medium text-[var(--bc-mobile-text)]">
                          {qrStatus === "denied"
                            ? t("bc.mobile.tapConnect.cameraDenied")
                            : qrStatus === "error"
                              ? t("bc.mobile.tapConnect.cameraError")
                              : t("bc.mobile.tapConnect.cameraStarting")}
                        </p>
                        {qrStatus === "denied" && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 py-2 text-[13px] font-medium text-[var(--bc-mobile-text)]"
                          >
                            <ImagePlus className="h-4 w-4 text-[var(--bc-mobile-accent)]" />
                            <span>Chọn ảnh từ thư viện</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* NFC Mode View */
              <div className="grid justify-items-center gap-3 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-5 py-10 text-center">
                <div className="relative">
                  <Nfc
                    aria-hidden="true"
                    className="h-12 w-12 text-[var(--bc-mobile-accent)]"
                    strokeWidth={1.5}
                  />
                  {nfc.status === "scanning" && (
                    <span className="absolute -inset-3 animate-ping rounded-full border border-[var(--bc-mobile-accent)] opacity-40 motion-reduce:animate-none" />
                  )}
                </div>
                <div>
                  <p className="text-[16px] font-bold text-[var(--bc-mobile-text)]">
                    {nfc.status === "scanning"
                      ? t("bc.mobile.tapConnect.listening")
                      : nfc.status === "denied"
                        ? t("bc.mobile.tapConnect.nfcDenied")
                        : nfc.status === "unsupported"
                          ? t("bc.mobile.tapConnect.nfcUnsupported")
                          : nfc.status === "insecure"
                            ? "Yêu cầu kết nối HTTPS bảo mật để dùng NFC"
                            : nfc.status === "error"
                              ? t("bc.mobile.tapConnect.nfcError")
                              : t("bc.mobile.tapConnect.starting")}
                  </p>
                  {nfc.status === "scanning" ? (
                    <p className="mt-1.5 text-[13.5px] text-[var(--bc-mobile-muted)] max-w-[280px]">
                      Áp thẻ danh thiếp NFC hoặc điện thoại vào giữa mặt lưng máy để kết nối tự động
                    </p>
                  ) : nfc.status === "unsupported" ? (
                    <p className="mt-1 text-[12px] text-[var(--bc-mobile-muted)]">
                      NFC hỗ trợ trên Google Chrome (Android). Bạn có thể chuyển sang tab Quét QR ở trên.
                    </p>
                  ) : nfc.status === "denied" ? (
                    <p className="mt-1 text-[12px] text-[var(--bc-mobile-muted)]">
                      Vui lòng cấp quyền NFC trong cài đặt trình duyệt để kích hoạt.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={captureInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Actions for Gallery Image & Snapshot */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                disabled={isDecodingFile}
                onClick={() => captureInputRef.current?.click()}
                className={SECONDARY_BTN}
              >
                {isDecodingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--bc-mobile-accent)]" />
                ) : (
                  <Camera aria-hidden="true" className="h-4 w-4 text-[var(--bc-mobile-accent)]" strokeWidth={1.8} />
                )}
                <span>Chụp ảnh tĩnh</span>
              </button>

              <button
                type="button"
                disabled={isDecodingFile}
                onClick={() => fileInputRef.current?.click()}
                className={SECONDARY_BTN}
              >
                {isDecodingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--bc-mobile-accent)]" />
                ) : (
                  <ImagePlus aria-hidden="true" className="h-4 w-4 text-[var(--bc-mobile-accent)]" strokeWidth={1.8} />
                )}
                <span>Ảnh từ thư viện</span>
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-center text-[13px] font-medium text-rose-400 animate-fade-in"
              >
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </MeSheet>
  );
}

// ─── Zalo-style Profile Preview Card ─────────────────────────────────────────

function ZaloProfilePreview({
  result,
  requestMessage,
  onMessageChange,
  onSendConnect,
  sending,
  sent,
  onReset,
  onClose,
}: {
  result: NfcTapResult;
  requestMessage: string;
  onMessageChange: (val: string) => void;
  onSendConnect: () => void;
  sending: boolean;
  sent: boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const profile = result.profile;
  const isConnected = result.state === "connected";
  const isOutgoingPending = result.state === "outgoing_pending" || sent;
  const isIncomingPending = result.state === "incoming_pending";
  const isSelf = result.state === "self";

  return (
    <div className="grid gap-4 animate-fade-in">
      {/* Luxury Profile Card */}
      <div className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] overflow-hidden shadow-2xl">
        {/* Profile Header */}
        <div className="relative flex flex-col items-center text-center bg-gradient-to-b from-[var(--bc-mobile-surface-2)] via-[var(--bc-mobile-surface)] to-[var(--bc-mobile-surface)] px-6 pt-7 pb-4">
          {/* Avatar with luxury golden glow */}
          <div className="relative mb-3.5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)] shadow-[0_8px_20px_-4px_rgba(216,178,130,0.35)]">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[28px] font-bold text-[var(--bc-mobile-accent)] bg-[var(--bc-mobile-surface-2)]">
                  {(profile?.displayName ?? "HV")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bc-mobile-accent)] text-[#050c15] shadow-md">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
            </span>
          </div>

          {/* Name & Headline */}
          <h2 className="text-[19px] font-bold tracking-tight text-[var(--bc-mobile-text)]">
            {profile?.displayName ?? "Hội viên ViOne"}
          </h2>
          {(profile?.jobTitle || profile?.companyName) && (
            <p className="mt-1 text-[13.5px] font-medium text-[var(--bc-mobile-accent)]">
              {[profile.jobTitle, profile.companyName].filter(Boolean).join(" · ")}
            </p>
          )}
          {profile?.headline && (
            <p className="mt-1 line-clamp-2 text-[12.5px] text-[var(--bc-mobile-muted)] max-w-[320px]">
              {profile.headline}
            </p>
          )}

          {/* Relationship Status Badge */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã là bạn bè / đối tác kết nối</span>
              </span>
            ) : isOutgoingPending ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Đã gửi lời mời (Đang chờ đối phương xác nhận)</span>
              </span>
            ) : isIncomingPending ? (
              <span className="flex items-center gap-1.5 text-sky-400">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Hội viên này đã gửi lời mời cho bạn</span>
              </span>
            ) : isSelf ? (
              <span className="text-[var(--bc-mobile-muted)]">Mã QR của chính bạn</span>
            ) : (
              <span className="flex items-center gap-1.5 text-[var(--bc-mobile-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--bc-mobile-accent)]" />
                <span>Chưa kết nối trên mạng lưới ViOne</span>
              </span>
            )}
          </div>
        </div>

        {/* Contact details */}
        {profile && <ProfileContacts profile={profile} />}
      </div>

      {/* Message input & Connect Action (Zalo style) */}
      {!isConnected && !isSelf && !isIncomingPending && (
        <div className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3.5 grid gap-2.5">
          <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--bc-mobile-muted)] flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-[var(--bc-mobile-accent)]" />
            <span>{isOutgoingPending ? "Gửi lại lời nhắn kết nối:" : "Lời nhắn gửi kèm:"}</span>
          </label>
          <input
            type="text"
            value={requestMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Nhập lời nhắn kết nối..."
            className="w-full rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3.5 py-2.5 text-[13.5px] text-[var(--bc-mobile-text)] placeholder:text-[var(--bc-mobile-muted)]/60 focus:border-[var(--bc-mobile-accent)] focus:outline-none"
          />
        </div>
      )}

      {/* Primary Action Button */}
      {isConnected ? (
        <div className="grid gap-2">
          <Link
            to="/connect-app/inbox"
            onClick={onClose}
            className={PRIMARY_BTN}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Nhắn tin ngay</span>
          </Link>
        </div>
      ) : isOutgoingPending ? (
        <div className="grid gap-2.5">
          <button
            type="button"
            disabled={sending}
            onClick={onSendConnect}
            className={PRIMARY_BTN}
          >
            {sending ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Send className="h-4.5 w-4.5" />
            )}
            <span>Gửi lại yêu cầu kết nối ngay</span>
          </button>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-center text-[12px] text-amber-300 font-medium">
            ✓ Đã gửi yêu cầu kết nối trước đó. Bấm nút trên để gửi nhắc lại thông báo tới người nhận.
          </div>
        </div>
      ) : isIncomingPending ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={sending}
            onClick={onSendConnect}
            className={PRIMARY_BTN}
          >
            {sending ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5" />
            )}
            <span>Đồng ý kết nối</span>
          </button>
        </div>
      ) : isSelf ? null : (
        <button
          type="button"
          disabled={sending}
          onClick={onSendConnect}
          className={PRIMARY_BTN}
        >
          {sending ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Send className="h-4.5 w-4.5" />
          )}
          <span>Gửi yêu cầu kết nối</span>
        </button>
      )}

      {/* Bottom helper actions */}
      <div className="flex items-center gap-2 mt-1">
        <button type="button" onClick={onReset} className={SECONDARY_BTN}>
          <Camera aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          <span>Quét mã khác</span>
        </button>
        <Link
          to="/connect-app/network"
          search={{ tab: "requests" }}
          onClick={onClose}
          className={SECONDARY_BTN}
        >
          <span>Xem mạng lưới</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Profile contact rows ────────────────────────────────────────────────────

function ProfileContacts({ profile }: { profile: NfcTapProfile }) {
  const rows: { icon: React.ReactNode; label: string; href?: string }[] = [];

  if (profile.jobTitle || profile.companyName) {
    rows.push({
      icon: <Briefcase className="h-3.5 w-3.5" strokeWidth={1.8} />,
      label: [profile.jobTitle, profile.companyName].filter(Boolean).join(" · "),
    });
  }
  if (profile.primaryPhone) {
    rows.push({
      icon: <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />,
      label: profile.primaryPhone,
      href: `tel:${profile.primaryPhone}`,
    });
  }
  if (profile.primaryEmail) {
    rows.push({
      icon: <AtSign className="h-3.5 w-3.5" strokeWidth={1.8} />,
      label: profile.primaryEmail,
      href: `mailto:${profile.primaryEmail}`,
    });
  }
  if (profile.website) {
    rows.push({
      icon: <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />,
      label: profile.website.replace(/^https?:\/\//, ""),
      href: profile.website,
    });
  }
  if (profile.city) {
    rows.push({
      icon: <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />,
      label: profile.city,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="divide-y divide-[var(--bc-mobile-border)] border-t border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]/30">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-2.5">
          <span className="shrink-0 text-[var(--bc-mobile-muted)]">{row.icon}</span>
          {row.href ? (
            <a
              href={row.href}
              className="truncate text-[13px] font-medium text-[var(--bc-mobile-accent)] underline-offset-2 hover:underline"
              target={row.href.startsWith("http") ? "_blank" : undefined}
              rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {row.label}
            </a>
          ) : (
            <span className="truncate text-[13px] text-[var(--bc-mobile-text)]">{row.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
