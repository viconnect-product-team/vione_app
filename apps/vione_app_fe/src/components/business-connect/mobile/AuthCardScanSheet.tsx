// Pre-auth business-card QR scanner sheet shown from the sign-in screen.
// Camera starts only while the sheet is open; the stream stops on close.

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, QrCode, X, Zap, ZapOff } from "lucide-react";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useT } from "@/lib/i18n";
import { parseScannedCard, type AuthScanResult } from "@/lib/business-connect/mobile/auth-scan";

type Confirmed = Exclude<AuthScanResult, { kind: "unknown" }>;

export function AuthCardScanSheet({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (result: Confirmed) => void;
}) {
  const t = useT();
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Confirmed | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const libraryInputRef = useRef<HTMLInputElement | null>(null);

  const { videoRef, status, scanImageFile } = useQrScanner({
    active: open && !pending,
    torch,
    onDetect: (value) => {
      const result = parseScannedCard(value, window.location.origin);
      if (result.kind === "unknown") {
        setError(t("bc.mobile.auth.scanUnknown"));
        return;
      }
      setError(null);
      setPending(result);
    },
  });

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const res = await scanImageFile(file);
    if (!res) {
      setError("Không tìm thấy mã QR trên ảnh được chọn.");
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!open) {
      setError(null);
      setTorch(false);
      setPending(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const blocked =
    status === "denied"
      ? t("bc.mobile.auth.scanDenied")
      : status === "unsupported"
        ? t("bc.mobile.auth.scanUnsupported")
        : status === "error"
          ? t("bc.mobile.auth.scanError")
          : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label={t("bc.mobile.auth.scanClose")}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("bc.mobile.auth.scanTitle")}
        className="relative w-full max-w-md rounded-t-3xl border-t border-white/10 px-6 pb-8 pt-5 shadow-2xl"
        style={{ background: "#121316", color: "#F8F7F3" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-white tracking-tight">
            {pending ? t("bc.mobile.auth.scanReviewTitle") : t("bc.mobile.auth.scanTitle")}
          </h2>
          <div className="flex items-center gap-1">
            {pending ? null : (
              <button
                type="button"
                onClick={() => setTorch((v) => !v)}
                aria-pressed={torch}
                aria-label={t("bc.mobile.auth.scanTorch")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#D0A95C] hover:bg-white/5 transition-colors"
              >
                {torch ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("bc.mobile.auth.scanClose")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-[13.5px] text-zinc-400">
          {pending ? t("bc.mobile.auth.scanReviewHint") : t("bc.mobile.auth.scanHint")}
        </p>

        {pending ? (
          <div className="mt-4">
            <dl className="rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-2">
              {[
                ["bc.mobile.auth.scanFieldName", pending.card.fullName],
                ["bc.mobile.auth.scanFieldEmail", pending.card.email],
                ["bc.mobile.auth.scanFieldCompany", pending.card.company],
                ["bc.mobile.auth.scanFieldTitle", pending.card.title],
                ["bc.mobile.auth.scanFieldPhone", pending.card.phone],
                ["bc.mobile.auth.scanFieldWebsite", pending.card.website],
              ].map(([key, value]) => (
                <div
                  key={key as string}
                  className="flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-b-0"
                >
                  <dt className="text-[13px] text-zinc-400">
                    {t(key as Parameters<typeof t>[0])}
                  </dt>
                  <dd
                    className="text-right text-[14px] font-medium"
                    style={{ color: value ? "#F8F7F3" : "#71717A" }}
                  >
                    {(value as string | undefined) ?? t("bc.mobile.auth.scanFieldEmpty")}
                  </dd>
                </div>
              ))}
            </dl>

            {pending.kind === "link" ? (
              <p className="mt-3 text-[13px] text-zinc-400">
                {t("bc.mobile.auth.scanReviewLink")}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onResult(pending)}
                className="h-12 w-full rounded-full text-[15px] font-bold text-[#121316] bg-[linear-gradient(135deg,#F4D699_0%,#D0A95C_40%,#B18B44_80%,#9A742F_100%)] shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {pending.kind === "link"
                  ? t("bc.mobile.auth.scanConfirmOpen")
                  : t("bc.mobile.auth.scanConfirmFill")}
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="h-12 w-full rounded-full border border-white/15 bg-white/5 text-[15px] font-semibold text-white hover:bg-white/10 active:scale-[0.99] transition-all"
              >
                {t("bc.mobile.auth.scanRescan")}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              aria-hidden="true"
            />
            {blocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-950/90 backdrop-blur-sm">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D0A95C]/15 text-[#D0A95C]">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-white">Mở camera chụp ảnh quét QR</p>
                  <p className="mt-1 text-[12px] text-zinc-400">
                    Chụp trực tiếp mã QR hoặc thẻ danh thiếp bằng máy ảnh điện thoại
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F4D699_0%,#D0A95C_40%,#B18B44_80%,#9A742F_100%)] px-6 py-2.5 text-[13.5px] font-bold text-[#121316] shadow-md active:scale-95 transition-transform cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Chụp ảnh thẻ / QR</span>
                </button>
              </div>
            ) : status !== "scanning" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#D0A95C]" aria-hidden="true" />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-[#D0A95C]/80 shadow-[0_0_15px_rgba(208,169,92,0.3)]"
              />
            )}
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageFile}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />

        {!pending && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-3 text-[13px] font-medium text-white hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="h-4 w-4 text-[#D0A95C]" />
              <span>Chụp ảnh QR</span>
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-3 text-[13px] font-medium text-white hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              <ImagePlus className="h-4 w-4 text-[#D0A95C]" />
              <span>Ảnh từ thư viện</span>
            </button>
          </div>
        )}

        {!pending && !blocked ? (
          <p aria-live="polite" className="mt-3 text-[12.5px] text-zinc-400">
            {status === "scanning"
              ? t("bc.mobile.auth.scanScanning")
              : t("bc.mobile.auth.scanStarting")}
          </p>
        ) : null}

        {error && !pending ? (
          <p
            role="alert"
            aria-live="polite"
            className="mt-4 text-[14px]"
            style={{ color: "#ffd9d4" }}
          >
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
