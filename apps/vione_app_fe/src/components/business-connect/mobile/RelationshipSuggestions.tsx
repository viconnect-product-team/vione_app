// BC-Mobile-6A — Home "V · Gợi ý hôm nay" section.
//
// Calm Executive Minimal: hairline rows, no cards, no scores. At most
// MAX_HOME_RECOMMENDATIONS rows, each with ONE reason. Tapping a row opens
// Person Detail; the quiet ✕ dismisses (snooze). Own query — Home never
// blocks on intelligence; errors collapse to a quiet inline retry.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLang, useT } from "@/lib/i18n";
import { MilestoneIcon } from "./NavIcons";
import {
  useDismissRelationshipRecommendation,
  useTodayRelationshipRecommendations,
} from "@/hooks/use-relationship-intelligence";
import { recordIntelInteraction } from "@/hooks/use-relationship-personalization";
import { bcIdentityGetMineFn } from "@/lib/business-connect/mobile/identity.functions";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { trackRelationshipIntel } from "@/lib/business-connect/mobile/relationship-intelligence.telemetry";
import type { RelationshipRecommendation } from "@/lib/business-connect/mobile/relationship-intelligence.types";

function initialsOf(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "…";
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]";

function SuggestionRow({
  rec,
  onDismiss,
  dismissPending,
}: {
  rec: RelationshipRecommendation;
  onDismiss: () => void;
  dismissPending: boolean;
}) {
  const t = useT();
  const [hidden, setHidden] = useState(false);
  const name = rec.person.displayName?.trim() || "—";
  const meta = [rec.person.industryLabel, rec.person.areaLabel].filter(Boolean).join(" · ");

  if (hidden) return null;

  return (
    <li className="relative min-w-0 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3">
      <button
        type="button"
        aria-label={t("bc.mobile.intel.dismiss")}
        disabled={dismissPending}
        onClick={onDismiss}
        className={`absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] disabled:opacity-50 ${FOCUS}`}
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>

      {/* Avatar + tên + meta */}
      <Link
        to="/connect-app/network/$personId"
        params={{ personId: rec.person.personId }}
        aria-label={t("bc.mobile.intel.open", { name })}
        onClick={() => {
          trackRelationshipIntel("RELATIONSHIP_RECOMMENDATION_OPENED", { surface: "home" });
          recordIntelInteraction("recommendation_opened", "reconnect");
        }}
        className={`block rounded-xl ${FOCUS}`}
      >
        <span className="flex items-center gap-2.5">
          {rec.person.avatarUrl ? (
            <img
              src={rec.person.avatarUrl}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[13px] font-semibold text-[var(--bc-mobile-muted)]"
            >
              {initialsOf(rec.person.displayName)}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-[var(--bc-mobile-text)]">
              {name}
            </span>
            {meta ? (
              <span className="mt-0.5 block truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
                {meta}
              </span>
            ) : null}
          </span>
        </span>

        {/* Mốc thời gian */}
        <span className="mt-2 flex items-center gap-1 text-[12px] text-[var(--bc-mobile-muted)]">
          <MilestoneIcon className="h-2.5 w-2.5 shrink-0 text-[var(--bc-mobile-muted)]" />
          {t("bc.mobile.intel.reason.lastInteraction", { days: rec.reason.days })}
        </span>
      </Link>

      {/* CTA buttons */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        <Link
          to="/connect-app/network/$personId"
          params={{ personId: rec.person.personId }}
          className={`flex min-h-[36px] items-center justify-center rounded-full border border-[var(--bc-mobile-border-gold)] px-3 text-[13px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[color-mix(in_oklab,var(--bc-mobile-accent)_10%,transparent)] ${FOCUS}`}
        >
          {t("bc.mobile.intel.card.message")}
        </Link>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className={`flex min-h-[36px] items-center justify-center rounded-full border border-[var(--bc-mobile-border)] px-3 text-[13px] font-medium text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] ${FOCUS}`}
        >
          Ẩn hồ sơ
        </button>
      </div>
    </li>
  );
}

function normalizeArea(value: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(tp\.?|thanh pho|tinh|city)\s+/i, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

type DistanceFilter = "all" | "near" | "far";

const CHIP_BASE =
  "inline-flex min-h-[36px] items-center rounded-full border px-3 text-[13px] font-medium transition-colors";

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${CHIP_BASE} ${FOCUS} ${
        active
          ? "border-transparent text-[#2c1600] font-semibold"
          : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)] hover:text-[var(--bc-mobile-text)]"
      }`}
      style={active ? { background: "linear-gradient(270deg, #ab6d3c 0%, #fde6b4 100%)" } : undefined}
    >
      {label}
    </button>
  );
}

export function RelationshipSuggestions() {
  const t = useT();
  const { lang } = useLang();
  const { recommendations, initialLoading, error, retry } =
    useTodayRelationshipRecommendations(lang);
  const dismiss = useDismissRelationshipRecommendation();

  // Viewer area (own identity city) — powers the truthful "near me" filter.
  const viewerUserId = useViewerUserId();
  const getMine = useServerFn(bcIdentityGetMineFn);
  const identity = useQuery({
    queryKey: ["bc-mobile", "intel", "viewer-area", viewerUserId ?? "anon"],
    enabled: Boolean(viewerUserId),
    staleTime: 300_000,
    queryFn: async () => {
      const payload = await getMine();
      return payload?.identity ?? null;
    },
  });
  const viewerArea = normalizeArea(identity.data?.city ?? null);

  const [industry, setIndustry] = useState<string>("all");
  const [distance, setDistance] = useState<DistanceFilter>("all");

  const industries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const rec of recommendations) {
      const label = rec.person.industryLabel?.trim();
      if (label) seen.set(label.toLowerCase(), label);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, lang));
  }, [recommendations, lang]);

  const filtered = useMemo(
    () =>
      recommendations.filter((rec) => {
        if (industry !== "all") {
          if ((rec.person.industryLabel ?? "").toLowerCase() !== industry) return false;
        }
        if (distance !== "all") {
          if (!viewerArea) return true;
          const area = normalizeArea(rec.person.areaLabel);
          if (!area) return false;
          const near = area === viewerArea;
          if (distance === "near" && !near) return false;
          if (distance === "far" && near) return false;
        }
        return true;
      }),
    [recommendations, industry, distance, viewerArea],
  );

  const showFilters = recommendations.length > 0 && (industries.length > 0 || Boolean(viewerArea));

  useEffect(() => {
    if (recommendations.length > 0) {
      trackRelationshipIntel("RELATIONSHIP_RECOMMENDATION_RENDERED", {
        surface: "home",
        count: recommendations.length,
      });
    }
  }, [recommendations.length]);

  const onDismiss = (rec: RelationshipRecommendation) => {
    // 6C: coarse behavioral signal; the 6A snooze mutation stays authoritative.
    recordIntelInteraction("recommendation_dismissed", "reconnect");
    dismiss.mutate(
      { personId: rec.person.personId, type: "reconnect" },
      {
        onSuccess: () => toast.success(t("bc.mobile.intel.dismiss.done")),
        onError: () => toast.error(t("bc.mobile.intel.error")),
      },
    );
  };

  if (error) {
    return (
      <section aria-labelledby="bc-rel-intel-title" className="mt-6">
        <h2
          id="bc-rel-intel-title"
          className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]"
        >
          {t("bc.mobile.intel.home.title")}
        </h2>
        <div role="alert" className="mt-2 flex items-center gap-3">
          <p className="text-[13px] text-[var(--bc-mobile-muted)]">{t("bc.mobile.intel.error")}</p>
          <button
            type="button"
            onClick={retry}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${FOCUS}`}
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            {t("bc.mobile.intel.retry")}
          </button>
        </div>
      </section>
    );
  }

  if (initialLoading) {
    return (
      <section
        aria-labelledby="bc-rel-intel-title"
        aria-busy="true"
        className="mt-6"
        role="status"
        aria-label={t("bc.mobile.intel.loading")}
      >
        <h2
          id="bc-rel-intel-title"
          className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]"
        >
          {t("bc.mobile.intel.home.title")}
        </h2>
        <div className="mt-1 divide-y divide-[var(--bc-mobile-border)]">
          {[0, 1].map((i) => (
            <div key={i} className="flex min-h-[64px] items-center gap-3 py-2.5">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none" />
              <div className="flex-1">
                <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none" />
                <div className="mt-1.5 h-3 w-3/5 animate-pulse rounded bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const header = (
    <div className="flex items-center justify-between gap-3">
      <h2
        id="bc-rel-intel-title"
        className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]"
      >
        {t("bc.mobile.intel.home.title")}
      </h2>
      <Link
        to="/connect-app/network"
        className={`inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg px-1.5 text-[13px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${FOCUS}`}
      >
        {t("bc.mobile.intel.home.viewAll")}
        <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      </Link>
    </div>
  );

  if (recommendations.length === 0) {
    return (
      <section aria-labelledby="bc-rel-intel-title" className="mt-6">
        {header}
        <p className="mt-2 text-[13px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.intel.home.empty")}
        </p>
        <Link
          to="/connect-app/network"
          className={`mt-3 inline-flex min-h-[44px] items-center rounded-full border border-[var(--bc-mobile-border-gold)] px-4 text-[13px] font-medium text-[var(--bc-mobile-accent)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${FOCUS}`}
        >
          {t("bc.mobile.intel.home.empty.cta")}
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="bc-rel-intel-title" className="mt-6">
      {header}
      {showFilters ? (
        <div role="group" aria-label={t("bc.mobile.intel.filter.label")} className="mt-2 space-y-2">
          {industries.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <span className="shrink-0 text-[12px] uppercase tracking-wide text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.intel.filter.industry")}
              </span>
              <FilterChip
                active={industry === "all"}
                label={t("bc.mobile.intel.filter.industry.all")}
                onClick={() => setIndustry("all")}
              />
              {industries.map((label) => (
                <FilterChip
                  key={label}
                  active={industry === label.toLowerCase()}
                  label={label}
                  onClick={() => setIndustry(label.toLowerCase())}
                />
              ))}
            </div>
          ) : null}
          {viewerArea ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <span className="shrink-0 text-[12px] uppercase tracking-wide text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.intel.filter.distance")}
              </span>
              {(["all", "near", "far"] as const).map((value) => (
                <FilterChip
                  key={value}
                  active={distance === value}
                  label={t(
                    value === "all"
                      ? "bc.mobile.intel.filter.distance.all"
                      : value === "near"
                        ? "bc.mobile.intel.filter.distance.near"
                        : "bc.mobile.intel.filter.distance.far",
                  )}
                  onClick={() => setDistance(value)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <div className="mt-3 flex items-center gap-3">
          <p className="text-[13px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.intel.filter.empty")}
          </p>
          <button
            type="button"
            onClick={() => {
              setIndustry("all");
              setDistance("all");
            }}
            className={`inline-flex min-h-[44px] items-center rounded-lg px-2 text-[13px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] ${FOCUS}`}
          >
            {t("bc.mobile.intel.filter.reset")}
          </button>
        </div>
      ) : null}
      <ul aria-label={t("bc.mobile.intel.list.label")} className="mt-3 grid grid-cols-2 gap-3">
        {filtered.map((rec) => (
          <SuggestionRow
            key={rec.id}
            rec={rec}
            dismissPending={dismiss.isPending}
            onDismiss={() => onDismiss(rec)}
          />
        ))}
      </ul>
    </section>
  );
}
