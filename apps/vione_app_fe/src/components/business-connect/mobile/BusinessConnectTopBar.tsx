// BC-Mobile-0B — minimal top-bar primitive for the BC mobile shell.
// Supports: optional title, optional back control, optional left slot
// (e.g. avatar), optional right action. Notifications are NOT hardcoded —
// each page composes its own right slot (Home specializes in BC-Mobile-1).

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export function BusinessConnectTopBar({
  title,
  back,
  onBack,
  left,
  right,
}: {
  title?: string;
  back?: boolean;
  onBack?: () => void;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const t = useT();
  // An empty bar (no title, back, or slots) would render as a blank band above
  // the page — keep only the safe-area inset in that case.
  const empty = !title && !back && !left && !right;
  if (empty) {
    return <div aria-hidden="true" style={{ paddingTop: "var(--bc-mobile-safe-top-compact)" }} />;
  }
  return (
    <header
      className="sticky top-0 z-20 border-b border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)]/90 backdrop-blur-md"
      style={{ paddingTop: "var(--bc-mobile-safe-top-compact)" }}
    >
      <div style={{ height: "var(--bc-mobile-header-h)" }} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[var(--bc-mobile-header-gap)] px-2">
        <div className="flex min-w-11 items-center justify-start pl-1">
          {back ? (
            <button
              type="button"
              onClick={onBack ?? (() => window.history.back())}
              aria-label={t("bc.mobile.topbar.back")}
              className="grid h-[var(--bc-mobile-header-action)] w-[var(--bc-mobile-header-action)] place-items-center rounded-full text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)]"
            >
              <ChevronLeft style={{ height: "var(--bc-mobile-header-icon)", width: "var(--bc-mobile-header-icon)" }} />
            </button>
          ) : (
            left
          )}
        </div>
        {title ? (
          <h1 className="truncate text-center text-[16px] font-semibold tracking-tight text-[var(--bc-mobile-text)]">
            {title}
          </h1>
        ) : (
          <span />
        )}
        <div className="flex min-w-11 items-center justify-end pr-1" style={{ paddingRight: "calc(0.25rem + var(--bc-mobile-safe-right))" }}>{right}</div>
      </div>
    </header>
  );
}
