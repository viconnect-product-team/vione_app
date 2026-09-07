// BC-Mobile-5E — Tap-to-Connect sheet (NFC + QR).
//
// Luồng tự động (auto-exchange):
//   1. Đọc NFC tag / quét QR → lấy token
//   2. Gọi nfcTap() ngay lập tức — không cần bấm nút phụ
//   3. Backend: resolve token → tạo kết nối → trả về profile người được chạm & phát realtime WebSocket
//   4. Hiển thị: avatar + tên + chức danh/công ty + thông tin liên hệ chính xác

import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AtSign,
  Briefcase,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  Nfc,
  Phone,
  QrCode,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { useNfcScanner } from "@/hooks/use-nfc-scanner";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { IdentityConnectSDK } from "@/lib/business-connect/mobile/identity-connect.sdk";
import type { NfcTapResult, NfcTapProfile } from "@/lib/business-connect/mobile/identity-connect.sdk";
import { MeSheet } from "@/components/business-connect/mobile/me/MeSheet";
import { parseTapConnectValue } from "@/lib/business-connect/mobile/tap-connect";
import { reportIdentityMetric } from "@/lib/business-connect/mobile/identity.telemetry";

// ─── Styles ──────────────────────────────────────────────────────────────────

const PRIMARY_BTN =
  "flex min-h-12 w-full items-center justify-center gap-2 bc-cta-gold rounded-full px-6 text-[15px] font-semibold disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none";
const SECONDARY_BTN =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 text-[14px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-mobile-bg)] motion-reduce:transition-none";

// ─── Main sheet ──────────────────────────────────────────────────────────────

export function TapToConnectSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [camera, setCamera] = useState(false);
  const [tapResult, setTapResult] = useState<NfcTapResult | null>(null);
  const [tapping, setTapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  async function handleDetected(raw: string) {
    if (processingRef.current) return;
    const target = parseTapConnectValue(raw, window.location.origin);
    if (target.kind === "unknown") {
      setError(t("bc.mobile.tapConnect.unknown"));
      return;
    }
    processingRef.current = true;
    setError(null);
    setCamera(false);
    setTapping(true);
    reportIdentityMetric("PUBLIC_CARD_CONNECT_TAPPED");

    try {
      const result = await IdentityConnectSDK.nfcTap(target.token);
      setTapResult(result);
      if (result.ok && result.reason === "created") {
        reportIdentityMetric("PUBLIC_CARD_CONNECT_SENT");
      }
    } catch {
      setError(t("bc.mobile.connection.error"));
      reportIdentityMetric("PUBLIC_CARD_CONNECT_FAILED");
    } finally {
      setTapping(false);
      processingRef.current = false;
    }
  }

  const nfc = useNfcScanner({ active: !tapResult && !tapping, onDetect: handleDetected });
  const { videoRef, status: qrStatus, scanImageFile } = useQrScanner({
    active: camera && !tapResult && !tapping,
    onDetect: handleDetected,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await scanImageFile(file);
    if (!res) {
      setError("Không tìm thấy mã QR trong ảnh được chọn.");
    }
  };

  function handleReset() {
    setTapResult(null);
    setError(null);
    processingRef.current = false;
  }

  return (
    <MeSheet
      title={t("bc.mobile.tapConnect.title")}
      subtitle={t("bc.mobile.tapConnect.subtitle")}
      onClose={onClose}
    >
      <div className="grid gap-4 pb-2">
        {tapping ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2
              aria-hidden="true"
              className="h-8 w-8 animate-spin text-[var(--bc-mobile-accent)] motion-reduce:animate-none"
              strokeWidth={1.6}
            />
            <p className="text-[14px] text-[var(--bc-mobile-muted)]">
              Đang trao đổi thông tin…
            </p>
          </div>
        ) : tapResult ? (
          <TapResult result={tapResult} onReset={handleReset} />
        ) : (
          <>
            <div className="grid justify-items-center gap-3 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-5 py-7 text-center">
              <div className="relative">
                <Nfc
                  aria-hidden="true"
                  className="h-10 w-10 text-[var(--bc-mobile-accent)]"
                  strokeWidth={1.4}
                />
                {nfc.status === "scanning" && (
                  <span className="absolute -inset-2 animate-ping rounded-full border border-[var(--bc-mobile-accent)] opacity-30 motion-reduce:animate-none" />
                )}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[var(--bc-mobile-text)]">
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
                  <p className="mt-1 text-[13px] text-[var(--bc-mobile-muted)]">
                    Áp thẻ NFC hoặc điện thoại vào giữa mặt lưng máy để kết nối
                  </p>
                ) : nfc.status === "unsupported" ? (
                  <p className="mt-1 text-[12px] text-[var(--bc-mobile-muted)]">
                    Chạm NFC hỗ trợ trên Google Chrome (Android). Bạn cũng có thể quét mã QR hoặc chọn ảnh QR bên dưới.
                  </p>
                ) : nfc.status === "denied" ? (
                  <p className="mt-1 text-[12px] text-[var(--bc-mobile-muted)]">
                    Vui lòng cấp quyền NFC trong cài đặt trình duyệt Google Chrome để kích hoạt.
                  </p>
                ) : null}
              </div>
            </div>

            {camera && (
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                {qrStatus === "scanning" && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-[var(--bc-mobile-accent)] shadow-[0_0_20px_rgba(216,178,130,0.3)] animate-pulse"
                  />
                )}
                {qrStatus !== "scanning" && (
                  <div
                    role="status"
                    className="absolute inset-0 grid place-items-center px-6 text-center text-[13.5px] text-[var(--bc-mobile-muted)] bg-[var(--bc-mobile-surface-2)]/90"
                  >
                    {qrStatus === "starting" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--bc-mobile-accent)]" />
                        <p>{t("bc.mobile.tapConnect.cameraStarting")}</p>
                      </div>
                    ) : (
                      <p>
                        {qrStatus === "denied"
                          ? t("bc.mobile.tapConnect.cameraDenied")
                          : qrStatus === "unsupported"
                            ? t("bc.mobile.tapConnect.cameraUnsupported")
                            : qrStatus === "error"
                              ? t("bc.mobile.tapConnect.cameraError")
                              : t("bc.mobile.tapConnect.cameraStarting")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={() => setCamera((v) => !v)} className={SECONDARY_BTN}>
                <QrCode aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {camera ? t("bc.mobile.tapConnect.stopQr") : t("bc.mobile.tapConnect.useQr")}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={SECONDARY_BTN}
              >
                <span>Tải ảnh QR từ thư viện</span>
              </button>
            </div>

            {error && (
              <p role="alert" className="text-center text-[13.5px] text-rose-400">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </MeSheet>
  );
}

// ─── Result card ─────────────────────────────────────────────────────────────

function TapResult({ result, onReset }: { result: NfcTapResult; onReset: () => void }) {
  const t = useT();

  if (!result.ok || result.state === "unavailable") {
    return (
      <div className="grid gap-3">
        <p role="status" className="text-center text-[14px] text-[var(--bc-mobile-muted)]">
          {result.state === "self"
            ? t("bc.mobile.tapConnect.self")
            : t("bc.mobile.tapConnect.unavailable")}
        </p>
        <button type="button" onClick={onReset} className={SECONDARY_BTN}>
          <Nfc aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.tapConnect.again")}
        </button>
      </div>
    );
  }

  const profile = result.profile;
  const isNew = result.reason === "created";
  const isConnected = result.state === "connected";

  return (
    <div className="grid gap-4">
      {/* Profile card */}
      <div className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 bg-gradient-to-br from-[var(--bc-mobile-surface-2)] to-[var(--bc-mobile-surface)] px-5 pt-6 pb-4">
          {/* Avatar */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName ?? ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[24px] font-semibold text-[var(--bc-mobile-accent)]">
                {(profile?.displayName ?? "HV")[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="truncate text-[17px] font-semibold leading-tight text-[var(--bc-mobile-text)]">
              {profile?.displayName ?? "Hội viên ViOne"}
            </h2>
            {profile?.headline && (
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--bc-mobile-muted)]">
                {profile.headline}
              </p>
            )}
            {/* Status badge */}
            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${
                isConnected
                  ? "bg-[color-mix(in_oklab,var(--bc-mobile-accent)_15%,transparent)] text-[var(--bc-mobile-accent-strong)]"
                  : "bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)]"
              }`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                  {t("bc.mobile.connection.connected")}
                </>
              ) : isNew ? (
                <>
                  <UserPlus className="h-3 w-3" strokeWidth={2} />
                  Đã gửi kết nối
                </>
              ) : (
                <>
                  <UserCheck className="h-3 w-3" strokeWidth={2} />
                  Đang chờ xác nhận
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact details */}
        {profile && <ProfileContacts profile={profile} />}
      </div>

      {/* Info message */}
      <div
        className={`rounded-2xl px-4 py-3 text-center text-[13px] leading-snug ${
          isNew
            ? "bg-[color-mix(in_oklab,var(--bc-mobile-accent)_12%,transparent)] text-[var(--bc-mobile-accent-strong)]"
            : "bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-muted)]"
        }`}
      >
        {isNew
          ? "✓ Đã gửi yêu cầu kết nối! Họ sẽ nhận được thông báo và thấy thông tin của bạn khi chấp nhận."
          : isConnected
            ? "Bạn đã kết nối với người này rồi."
            : "Yêu cầu kết nối đang chờ họ xác nhận."}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to="/connect-app/network/requests" className={SECONDARY_BTN}>
          {t("bc.mobile.tapConnect.viewInProfile")}
        </Link>
        <button type="button" onClick={onReset} className={SECONDARY_BTN}>
          <Nfc aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.tapConnect.again")}
        </button>
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
    <div className="divide-y divide-[var(--bc-mobile-border)]">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-2.5">
          <span className="shrink-0 text-[var(--bc-mobile-muted)]">{row.icon}</span>
          {row.href ? (
            <a
              href={row.href}
              className="truncate text-[13.5px] text-[var(--bc-mobile-accent)] underline-offset-2 hover:underline"
              target={row.href.startsWith("http") ? "_blank" : undefined}
              rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {row.label}
            </a>
          ) : (
            <span className="truncate text-[13.5px] text-[var(--bc-mobile-text)]">{row.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
