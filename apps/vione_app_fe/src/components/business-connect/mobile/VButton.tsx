// BC-Mobile-0B — V button: the visual signature of Business Connect.
// Center action trigger in the bottom nav. It NEVER navigates; it opens
// the VActionSheet. Champagne accent, restrained, ≥52×52 touch target.

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function VButton({
  onClick,
  disabled,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={t("bc.mobile.v.open")}
      aria-disabled={disabled ?? undefined}
      className={cn(
        "group relative grid h-[72px] w-[72px] min-h-[52px] min-w-[52px] place-items-center rounded-full",
        "transition-[transform,filter] duration-150 ease-out",
        "hover:brightness-110",
        "active:scale-[0.95] active:brightness-90",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 disabled:hover:brightness-100",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #f2b45a 0%, #e09d43 35%, #c17a2e 70%, #a86624 100%)",
        boxShadow:
          "0 12px 30px -10px color-mix(in oklab, #a86624 75%, transparent), inset 0 1px 1px rgba(255,255,255,0.25)",
      }}
    >
      {/* Vòng viền vàng đậm tách nút V khỏi thanh nav */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[5px] rounded-full border-[2.5px] border-[#e9a943] bg-[var(--bc-mobile-surface)] transition-opacity duration-150 group-disabled:opacity-40 motion-reduce:transition-none"
        style={{ zIndex: -1 }}
      />
      {/* Quầng sáng vàng đậm nổi bật quanh nút */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[18px] rounded-full opacity-90 blur-[14px] transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-70 group-disabled:opacity-30 motion-reduce:transition-none"
        style={{
          zIndex: -2,
          background:
            "radial-gradient(circle, color-mix(in oklab, #e9a943 50%, transparent) 0%, transparent 60%)",
        }}
      />
      <span
        aria-hidden="true"
        className="font-serif text-[32px] font-semibold leading-none tracking-tight text-[#101722] transition-transform duration-150 ease-out group-active:scale-95 motion-reduce:transition-none"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        V
      </span>
    </button>
  );
}
