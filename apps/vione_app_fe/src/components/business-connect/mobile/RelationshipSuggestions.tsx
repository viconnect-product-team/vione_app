// BC-Mobile-6A — Home "V · Gợi ý hôm nay" section.
//
// Calm Executive Minimal: hairline rows, no cards, no scores. At most
// MAX_HOME_RECOMMENDATIONS rows, each with ONE reason. Tapping a row opens
// Person Detail; the quiet ✕ dismisses (snooze). Own query — Home never
// blocks on intelligence; errors collapse to a quiet inline retry.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, RefreshCw, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLang, useT } from "@/lib/i18n";
import { MilestoneIcon } from "./NavIcons";
import {
  useDismissRelationshipRecommendation,
  useTodayRelationshipRecommendations,
} from "@/hooks/use-relationship-intelligence";
import { recordIntelInteraction } from "@/hooks/use-relationship-personalization";
import { fetchNestApi } from "@/lib/api-client";
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
          {/* Avatar — luôn hiện: ảnh thật hoặc chữ cái */}
          {rec.person.avatarUrl ? (
            <img
              src={rec.person.avatarUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                // Fallback về initials khi ảnh lỗi
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = "flex";
              }}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span
            aria-hidden="true"
            style={{ display: rec.person.avatarUrl ? "none" : "flex" }}
            className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bc-mobile-surface-2)] text-[13px] font-semibold text-[var(--bc-mobile-muted)]"
          >
            {initialsOf(rec.person.displayName)}
          </span>
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

        {/* AI Gợi ý hoặc Mốc thời gian */}
        {rec.aiSuggestion ? (
          <span className="mt-2 flex items-start gap-1.5 text-[12px] text-[var(--bc-mobile-accent)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--bc-mobile-accent)]" />
            <span className="leading-snug line-clamp-2">{rec.aiSuggestion}</span>
          </span>
        ) : (
          <span className="mt-2 flex items-center gap-1 text-[12px] text-[var(--bc-mobile-muted)]">
            <MilestoneIcon className="h-2.5 w-2.5 shrink-0 text-[var(--bc-mobile-muted)]" />
            {rec.reason.days > 0
              ? t("bc.mobile.intel.reason.lastInteraction", { days: rec.reason.days })
              : "Gợi ý kết nối mới phù hợp ngành nghề & đối tác"}
          </span>
        )}
      </Link>

      {/* CTA buttons — bằng nhau, dùng grid */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <Link
          to="/connect-app/network/$personId"
          params={{ personId: rec.person.personId }}
          className={`flex h-9 items-center justify-center rounded-full px-2 text-[12.5px] font-semibold text-[#1b1206] shadow-sm transition-all hover:brightness-105 active:scale-[0.98] ${FOCUS}`}
          style={{
            background: "linear-gradient(135deg, #AB6D3C 0%, #FDE6B4 100%)",
            boxShadow: "0 -1px 0 0 #f6e6c4 inset, 0 4px 12px -2px rgba(201, 163, 91, 0.4)",
          }}
        >
          {t("bc.mobile.intel.card.message")}
        </Link>
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            onDismiss();
          }}
          className={`flex h-9 items-center justify-center rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]/50 px-2 text-[12.5px] font-medium text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] hover:text-[var(--bc-mobile-text)] active:scale-[0.98] ${FOCUS}`}
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
  "inline-flex h-7 items-center justify-center rounded-full border px-3 text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap";

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
          ? "border-[#DFB260]/60 bg-[#DFB260]/20 text-[#DFB260] font-semibold shadow-[0_2px_8px_rgba(223,178,96,0.15)]"
          : "border-[#ea9a4126] bg-[#0c1522] text-[#D4C3A3] hover:border-[#DFB260]/40 hover:text-[#f5f7fa]"
      }`}
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
  // Uses fetchNestApi directly (bypass requireSupabaseAuth middleware).
  const viewerUserId = useViewerUserId();
  const identity = useQuery({
    queryKey: ["bc-mobile", "intel", "viewer-area", viewerUserId ?? "anon"],
    enabled: Boolean(viewerUserId),
    staleTime: 300_000,
    queryFn: async () => {
      try {
        const payload = await fetchNestApi<any>("/connect-app/me/identity");
        return payload?.identity ?? null;
      } catch {
        return null;
      }
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
        className="text-xs font-semibold uppercase tracking-wide text-[#D4C3A3]"
      >
        {t("bc.mobile.intel.home.title")}
      </h2>
      <Link
        to="/connect-app/network"
        className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[#DFB260] bg-[#DFB260]/10 border border-[#DFB260]/20 hover:bg-[#DFB260]/20 hover:border-[#DFB260]/40 transition-all cursor-pointer shrink-0"
      >
        {t("bc.mobile.intel.home.viewAll")}
        <ChevronRight aria-hidden="true" className="h-3 w-3 text-[#DFB260]" strokeWidth={2} />
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
        <div role="group" aria-label={t("bc.mobile.intel.filter.label")} className="mt-2.5 space-y-2">
          {industries.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 min-w-[78px] text-[10.5px] font-semibold uppercase tracking-wider text-[#D4C3A3]/70">
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
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 min-w-[78px] text-[10.5px] font-semibold uppercase tracking-wider text-[#D4C3A3]/70">
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
