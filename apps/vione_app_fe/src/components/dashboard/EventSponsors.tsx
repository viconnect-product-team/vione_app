import { Handshake } from "lucide-react";
import { EmptyState } from "@/components/dashboard/StateKit";
import { useT } from "@/lib/i18n";

/**
 * Sponsors / partners section for the event detail page.
 *
 * The events data source exposes no sponsor/partner linkage, so sponsor
 * names, logos, tiers and descriptions are never fabricated. Until such data
 * becomes available on the event, wire it in here and render premium sponsor
 * cards. Purely presentational; no backend calls.
 */
export function EventSponsors() {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
          <Handshake className="h-4 w-4 text-primary" aria-hidden="true" /> {t("esponsor.title")}
        </h2>
      </div>
      <EmptyState
        icon={<Handshake className="h-6 w-6" aria-hidden="true" />}
        title={t("esponsor.emptyTitle")}
        description={t("esponsor.emptyDesc")}
      />
    </section>
  );
}
