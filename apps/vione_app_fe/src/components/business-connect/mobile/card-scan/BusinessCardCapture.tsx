// BC-Mobile-4A — capture screen. Executive Minimal Luxury: a gold-cornered
// viewfinder, three truthful capture tips, and two 48px actions. Camera
// permission is requested only after the user taps "Chụp ảnh" (the hidden
// input carries capture="environment").

import { Camera, ImagePlus, Sun, Crop, ScanLine, ShieldCheck, Zap } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Gold corner bracket — purely decorative alignment affordance. */
function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-7 w-7 border-[var(--bc-mobile-accent)] ${className}`}
    />
  );
}

export function BusinessCardCapture({
  onCamera,
  onLibrary,
  error,
  autoCapture,
  onAutoCaptureChange,
}: {
  onCamera: () => void;
  onLibrary: () => void;
  /** Auto-shutter preference (live viewfinder fires on a steady, sharp card). */
  autoCapture: boolean;
  onAutoCaptureChange: (next: boolean) => void;
  /** Already-translated, human-readable validation error (announced by parent). */
  error?: string | null;
}) {
  const t = useT();
  const tips = [
    { icon: Sun, label: t("bc.mobile.cardScan.tip.light") },
    { icon: Crop, label: t("bc.mobile.cardScan.tip.flat") },
    { icon: ScanLine, label: t("bc.mobile.cardScan.tip.sharp") },
  ];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
        <p className="mt-1 text-center text-[15px] font-medium text-[var(--bc-mobile-text)]">
          {t("bc.mobile.cardScan.guide")}
        </p>
        <p className="mt-1 text-center text-[13px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.cardScan.lead")}
        </p>

        <div
          role="img"
          aria-label={t("bc.mobile.cardScan.frameLabel")}
          className="relative mx-auto mt-6 aspect-[1.586/1] w-full max-w-[340px] rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]"
        >
          <Corner className="left-2.5 top-2.5 rounded-tl-xl border-l-2 border-t-2" />
          <Corner className="right-2.5 top-2.5 rounded-tr-xl border-r-2 border-t-2" />
          <Corner className="bottom-2.5 left-2.5 rounded-bl-xl border-b-2 border-l-2" />
          <Corner className="bottom-2.5 right-2.5 rounded-br-xl border-b-2 border-r-2" />
          <span
            aria-hidden
            className="absolute inset-x-8 top-1/2 h-px bg-[linear-gradient(90deg,transparent,var(--bc-mobile-accent),transparent)] opacity-45"
          />
          {/* Điểm nhấn chữ V cách điệu trong khung chụp */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <span
              className="text-[72px] font-black italic leading-none text-transparent"
              style={{
                WebkitTextStroke: "1.5px var(--bc-mobile-accent-strong)",
                filter:
                  "drop-shadow(0 0 14px color-mix(in oklab, var(--bc-mobile-accent) 35%, transparent))",
              }}
            >
              V
            </span>
          </span>
        </div>

        <ul className="mx-auto mt-5 grid w-full max-w-[340px] grid-cols-3 gap-2">
          {tips.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--bc-mobile-border-subtle)] bg-[var(--bc-mobile-surface)] px-2 py-3 text-center"
            >
              <Icon
                className="h-4 w-4 text-[var(--bc-mobile-accent)]"
                strokeWidth={1.8}
                aria-hidden
              />
              <span className="text-[11px] leading-tight text-[var(--bc-mobile-muted)]">
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-4 flex w-full max-w-[340px] items-center gap-3 rounded-xl border border-[var(--bc-mobile-border-subtle)] bg-[var(--bc-mobile-surface)] px-3 py-3">
          <Zap
            className={`h-4 w-4 ${autoCapture ? "text-[var(--bc-mobile-accent)]" : "text-[var(--bc-mobile-muted)]"}`}
            strokeWidth={1.8}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-[var(--bc-mobile-text)]">
              {t("bc.mobile.cardScan.auto.toggle")}
            </span>
            <span className="block text-[11px] leading-tight text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.cardScan.auto.toggleHint")}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoCapture}
            aria-label={t("bc.mobile.cardScan.auto.toggle")}
            onClick={() => onAutoCaptureChange(!autoCapture)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${
              autoCapture
                ? "bg-[var(--bc-mobile-accent)]"
                : "bg-[var(--bc-mobile-surface-2)] border border-[var(--bc-mobile-border)]"
            }`}
          >
            <span
              aria-hidden
              className={`absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-white transition-[left] motion-reduce:transition-none ${
                autoCapture ? "left-[26px]" : "left-1"
              }`}
              style={{ height: 18, width: 18 }}
            />
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-[13px] font-medium text-[var(--bc-mobile-danger)]"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-6 pt-8"
        style={{
          paddingBottom: "calc(var(--bc-mobile-nav-h) + var(--bc-mobile-safe-bottom) + 20px)",
          background:
            "linear-gradient(to top, var(--bc-mobile-bg) 0%, var(--bc-mobile-bg) 78%, transparent 100%)",
        }}
      >
        <div className="mx-auto grid w-full max-w-[340px] gap-4">
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[var(--bc-mobile-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
            {t("bc.mobile.cardScan.privacy")}
          </p>
          <button
            type="button"
            onClick={onCamera}
            className="bc-cta-gold mx-auto flex h-14 min-h-12 min-w-[260px] items-center justify-center gap-2 rounded-full px-12 text-[16px] font-semibold active:scale-[0.98]"
            style={{ touchAction: "manipulation" }}
          >
            <Camera className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            {t("bc.mobile.cardScan.takePhoto")}
          </button>
          <button
            type="button"
            onClick={onLibrary}
            className="mx-auto flex h-12 min-h-12 min-w-[260px] items-center justify-center gap-2 rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-12 text-[15px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] motion-reduce:transition-none active:scale-[0.98]"
            style={{ touchAction: "manipulation" }}
          >
            <ImagePlus className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            {t("bc.mobile.cardScan.choosePhoto")}
          </button>
        </div>
      </div>
    </div>
  );
}
