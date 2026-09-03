import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

type Variant = "default" | "dropdown" | "overlay" | "inline";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const opts: { code: Lang; flag: string; label: string; full: string }[] = [
    { code: "vi", flag: "🇻🇳", label: "VI", full: "Tiếng Việt" },
    { code: "en", flag: "🇬🇧", label: "EN", full: "English" },
    { code: "my", flag: "🇲🇲", label: "MY", full: "မြန်မာ" },
    { code: "km", flag: "🇰🇭", label: "KM", full: "ខ្មែរ" },
    { code: "lo", flag: "🇱🇦", label: "LO", full: "ລາວ" },
  ];

  const current = opts.find((o) => o.code === lang) ?? opts[0];

  // If explicit "inline" is requested (e.g. in some footer or wide desktop context)
  if (variant === "inline") {
    const baseBtn =
      "relative inline-flex h-7 min-w-[36px] items-center justify-center gap-1 rounded-md px-2 text-xs transition-colors";
    return (
      <div role="group" aria-label="Language" className={`inline-flex items-center rounded-lg bg-card p-0.5 gap-0.5 border border-border ${className}`}>
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
              className={`${baseBtn} ${
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span aria-hidden className="text-sm leading-none">
                {o.flag}
              </span>
              <span className={`tracking-wide ${showFullLabel ? "sm:hidden" : ""}`}>{o.label}</span>
              {showFullLabel && <span className="hidden tracking-wide sm:inline">{o.full}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // Default compact dropdown: space-efficient (~55px) and works smoothly on mobile/tablet/desktop
  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.full}`}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1 px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="uppercase tracking-wider text-[11px] font-bold">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
      </button>

      {open && (
        <div
          role="listbox"
          className="vba-pop-in absolute right-0 z-[100] mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {opts.map((o) => {
            const active = lang === o.code;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => {
                  setLang(o.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-base leading-none">{o.flag}</span>
                <span className="flex-1 text-left">{o.full}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

