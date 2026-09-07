// Pre-auth business-card QR scanner sheet shown from the sign-in screen.
// Camera starts only while the sheet is open; the stream stops on close.

import { useEffect, useState } from "react";
import { Loader2, QrCode, X, Zap, ZapOff } from "lucide-react";
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

  const { videoRef, status } = useQrScanner({
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
        className="relative w-full max-w-md rounded-t-3xl px-6 pb-8 pt-5"
        style={{ background: "#050c15", color: "#f5f7fa" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">
            {pending ? t("bc.mobile.auth.scanReviewTitle") : t("bc.mobile.auth.scanTitle")}
          </h2>
          <div className="flex items-center gap-1">
            {pending ? null : (
              <button
                type="button"
                onClick={() => setTorch((v) => !v)}
                aria-pressed={torch}
                aria-label={t("bc.mobile.auth.scanTorch")}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ color: "#f2b45a" }}
              >
                {torch ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("bc.mobile.auth.scanClose")}
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-[14px]" style={{ color: "#a9b6c4" }}>
          {pending ? t("bc.mobile.auth.scanReviewHint") : t("bc.mobile.auth.scanHint")}
        </p>

        {pending ? (
          <div className="mt-4">
            <dl className="rounded-2xl px-4 py-2" style={{ background: "#0a1c2e" }}>
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
                  className="flex items-start justify-between gap-4 border-b py-3 last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <dt className="text-[13px]" style={{ color: "#a9b6c4" }}>
                    {t(key as Parameters<typeof t>[0])}
                  </dt>
                  <dd
                    className="text-right text-[14px] font-medium"
                    style={{ color: value ? "#f5f7fa" : "#6f8296" }}
                  >
                    {(value as string | undefined) ?? t("bc.mobile.auth.scanFieldEmpty")}
                  </dd>
                </div>
              ))}
            </dl>

            {pending.kind === "link" ? (
              <p className="mt-3 text-[13px]" style={{ color: "#a9b6c4" }}>
                {t("bc.mobile.auth.scanReviewLink")}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onResult(pending)}
                className="h-12 w-full rounded-full text-[15px] font-semibold"
                style={{ background: "#f2b45a", color: "#050c15" }}
              >
                {pending.kind === "link"
                  ? t("bc.mobile.auth.scanConfirmOpen")
                  : t("bc.mobile.auth.scanConfirmFill")}
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="h-12 w-full rounded-full border text-[15px] font-medium"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: "#f5f7fa" }}
              >
                {t("bc.mobile.auth.scanRescan")}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl"
            style={{ background: "#0a1c2e" }}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <QrCode className="h-8 w-8" aria-hidden="true" />
                <p role="alert" className="text-[14px] leading-relaxed">
                  {blocked}
                </p>
              </div>
            ) : status !== "scanning" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-8 rounded-xl border-2"
                style={{ borderColor: "#f2b45a" }}
              />
            )}
          </div>
        )}

        {!pending && !blocked ? (
          <p aria-live="polite" className="mt-3 text-[13px]" style={{ color: "#a9b6c4" }}>
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
