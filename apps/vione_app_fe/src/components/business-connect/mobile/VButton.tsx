// BC-Mobile-0B — V button: the visual signature of Business Connect.
// Center action trigger in the bottom nav. It NEVER navigates; it opens
// the VActionSheet. Champagne accent, restrained, ≥52×52 touch target.

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { VIconMark } from "./VIconMark";

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
        "transition-[transform,filter,box-shadow] duration-150 ease-out",
        "hover:brightness-105",
        "active:scale-[0.95] active:brightness-95",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 disabled:hover:brightness-100",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
      style={{
        // Champagne brand gradient: #AB6D3C → #FDE6B4
        background:
          "linear-gradient(135deg, #AB6D3C 0%, #D7A568 52%, #FDE6B4 100%)",
        boxShadow:
          "0 12px 30px -10px rgba(171, 109, 60, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Vòng viền champagne giúp nút tách khỏi thanh navigation */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[5px] rounded-full border-[2.5px] border-[#AB6D3C] bg-[var(--bc-mobile-surface)] transition-opacity duration-150 group-disabled:opacity-40 motion-reduce:transition-none"
        style={{ zIndex: -1 }}
      />

      {/* Quầng sáng champagne xung quanh nút */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[18px] rounded-full opacity-70 blur-[14px] transition-opacity duration-150 group-hover:opacity-90 group-active:opacity-60 group-disabled:opacity-30 motion-reduce:transition-none"
        style={{
          zIndex: -2,
          background:
            "radial-gradient(circle, rgba(171, 109, 60, 0.32) 0%, rgba(253, 230, 180, 0.12) 40%, transparent 70%)",
        }}
      />

      <VIconMark size={44} />
    </button>
  );
}