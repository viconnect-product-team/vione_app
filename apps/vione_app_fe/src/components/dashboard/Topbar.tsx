import { HelpCircle, Menu, Search } from "lucide-react";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";
import { AssociationSwitcher } from "@/components/dashboard/AssociationSwitcher";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { TopbarBreadcrumb } from "@/components/dashboard/TopbarBreadcrumb";
import { useCommandPalette } from "@/components/dashboard/CommandPalette";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const t = useT();
  const { setOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:h-[72px] sm:gap-3 sm:px-4 lg:px-8">
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <TopbarBreadcrumb />

      {/* Quick search — opens the ⌘K command palette */}
      <div className="hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-10 w-full items-center gap-3 rounded-full border border-border bg-secondary pl-3.5 pr-2 text-left text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          aria-label={t("cmd.open")}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{t("top.search")}</span>
          <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {/* Mobile: icon trigger for the palette */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label={t("cmd.open")}
        >
          <Search className="h-5 w-5" />
        </button>

        <AssociationSwitcher />
        <LangSwitcher />

        <ThemeSwitcher />

        <NotificationCenter />

        <button className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Profile */}
        <ProfileMenu />
      </div>
    </header>
  );
}
