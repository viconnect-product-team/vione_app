import { useLang, type Lang } from "@/lib/i18n";

type Variant = "default" | "overlay";

export function LangSwitcher({
  variant = "default",
  className = "",
  showFullLabel = false,
}: {
  variant?: Variant;
  className?: string;
  /** Show the full language name ("Tiếng Việt" / "English") on wider screens. */
  showFullLabel?: boolean;
}) {
  const { lang, setLang } = useLang();
  const isOverlay = variant === "overlay";

  const wrap = isOverlay
    ? "inline-flex items-center rounded-lg bg-foreground/40 p-0.5 text-[11px] font-semibold backdrop-blur-md gap-0.5"
    : "inline-flex items-center rounded-lg bg-card p-0.5 text-xs font-semibold gap-0.5";

  const baseBtn =
    "relative inline-flex h-7 min-w-[40px] items-center justify-center gap-1 rounded-md px-2.5 transition-colors";

  const activeCls = isOverlay
    ? "bg-card text-[oklch(0.18_0.04_265)] shadow-sm"
    : "bg-primary text-primary-foreground shadow-sm";

  const idleCls = isOverlay
    ? "text-primary-foreground/70 hover:text-primary-foreground"
    : "text-muted-foreground hover:text-foreground";

  const opts: { code: Lang; flag: string; label: string; full: string }[] = [
    { code: "vi", flag: "🇻🇳", label: "VI", full: "Tiếng Việt" },
    { code: "en", flag: "🇬🇧", label: "EN", full: "English" },
    { code: "my", flag: "🇲🇲", label: "MY", full: "မြန်မာ" },
    { code: "km", flag: "🇰🇭", label: "KM", full: "ខ្មែរ" },
    { code: "lo", flag: "🇱🇦", label: "LO", full: "ລາວ" },
  ];


  return (
    <div role="group" aria-label="Language" className={`${wrap} ${className}`}>
      {opts.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-pressed={active}
            aria-label={o.full}
            title={o.full}
            className={`${baseBtn} ${active ? activeCls : idleCls}`}
          >
            <span aria-hidden className="text-sm leading-none">
              {o.flag}
            </span>
            <span className={`tracking-wide ${showFullLabel ? "sm:hidden" : ""}`}>{o.label}</span>
            {showFullLabel ? (
              <span className="hidden tracking-wide sm:inline">{o.full}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
