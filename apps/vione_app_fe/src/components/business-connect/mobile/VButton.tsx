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
        "group relative grid h-[58px] w-[58px] min-h-[52px] min-w-[52px] place-items-center rounded-full",
        "border border-[#D8B282]/40 transition-all duration-200 ease-out",
        "hover:brightness-110 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        background: "var(--bc-mobile-accent-grad)",
      }}
    >
      <VIconMark size={36} />
    </button>
  );
}