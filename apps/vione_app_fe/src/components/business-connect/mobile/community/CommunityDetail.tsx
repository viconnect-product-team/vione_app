// BC-Mobile-7A — Community Detail ("CỘNG ĐỒNG NÀY LÀ GÌ?").
// BC-Mobile-7B: previews now point at the native community events /
// opportunities surfaces (max 2 rows each), backed by canonical data only.
// No CRUD, no settings, no fake social metrics, no feed.

import { Link } from "@tanstack/react-router";
import { ChevronRight, RefreshCw, Users } from "lucide-react";
import { useFmt, useT } from "@/lib/i18n";
import { useCommunityDetail, useCommunityMembers } from "@/hooks/use-community";
import { useCommunityActivityPreview } from "@/hooks/use-community-activity";
import { eventDateParts } from "@/lib/business-connect/mobile/community-activity.service";
import { BusinessConnectTopBar } from "../BusinessConnectTopBar";
import { CommunityInviteButton } from "./CommunityInviteSheet";
import { CommunityAvatar, CommunityError, CommunityListSkeleton } from "./CommunityHome";
import { monthLabel } from "./CommunityEvents";
import { daysLeftLabel, opportunityCategoryLabel } from "./CommunityOpportunities";

export function CommunityDetail({ communityId }: { communityId: string }) {
  const t = useT();
  const fmt = useFmt();
  const { detail, unavailable, initialLoading, error: coreError, retry } = useCommunityDetail(communityId);
  const activity = useCommunityActivityPreview(communityId);

  return (
    <>
      <BusinessConnectTopBar back title={t("bc.mobile.nav.community")} />
      <main id="bc-mobile-community-detail" className="contents">
        {initialLoading ? (
          <div className="mt-4">
            <CommunityListSkeleton />
          </div>
        ) : coreError ? (
          <CommunityError onRetry={retry} />
        ) : unavailable || !detail ? (
          <section className="mt-14">
            <p className="max-w-[34ch] text-[15px] leading-relaxed text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.community.unavailable")}
            </p>
          </section>
        ) : (
          <>
            <section className="mt-5 flex items-start gap-4">
              <CommunityAvatar name={detail.community.name} logoUrl={detail.community.logoUrl} />
              <div className="min-w-0 flex-1">
                <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-[var(--bc-mobile-text)]">
                  {detail.community.name}
                </h1>
                {detail.community.shortDescription ? (
                  <p className="mt-1 text-[14px] text-[var(--bc-mobile-muted)]">
                    {detail.community.shortDescription}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3 py-1 text-[12px] font-medium text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.community.yourRole")}:{" "}
                {detail.community.viewerRole === "admin"
                  ? t("bc.mobile.community.role.admin")
                  : t("bc.mobile.community.role.member")}
              </span>
              {detail.community.memberCount !== null ? (
                <span className="rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3 py-1 text-[12px] font-medium text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.community.memberCount", { count: detail.community.memberCount })}
                </span>
              ) : null}
            </section>

            {detail.community.description ? (
              <section className="mt-5">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.community.about")}
                </h2>
                <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-[var(--bc-mobile-text)]">
                  {detail.community.description}
                </p>
              </section>
            ) : null}

            <section className="mt-5 grid grid-cols-3 gap-2">
              <StatTile
                value={detail.community.memberCount}
                label={t("bc.mobile.community.stat.members")}
              />
              <StatTile
                value={detail.upcomingEvents.length}
                label={t("bc.mobile.community.stat.events")}
              />
              <StatTile
                value={detail.openOpportunityCount}
                label={t("bc.mobile.community.stat.opportunities")}
              />
            </section>

            <section className="mt-5">
              <CommunityInviteButton
                communityId={communityId}
                communityName={detail.community.name}
              />
            </section>

            <MembersPreview communityId={communityId} />




            <ActivityPreviews
              communityId={communityId}
              preview={activity.preview}
              initialLoading={activity.initialLoading}
              coreError={activity.coreError}
              retry={activity.retry}
            />
          </>
        )}
      </main>
    </>
  );
}

// ── BC-Mobile-7B — bounded native previews (max 2 events + 2 opportunities).
// Sections degrade independently: a preview failure never blocks the
// identity/member sections above; each has its own quiet error + retry.

function ActivityPreviews({
  communityId,
  preview,
  initialLoading,
  coreError,
  retry,
}: {
  communityId: string;
  preview: ReturnType<typeof useCommunityActivityPreview>["preview"];
  initialLoading: boolean;
  coreError: boolean;
  retry: () => void;
}) {
  const t = useT();
  const fmt = useFmt();

  if (initialLoading) {
    return (
      <div aria-hidden="true" className="mt-7 space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-9 animate-pulse rounded-xl bg-[var(--bc-mobile-surface-2)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coreError) {
    return (
      <section className="mt-7" role="alert">
        <p className="text-[14px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.error.title")}
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-[var(--bc-mobile-navy)] transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.community.retry")}
        </button>
      </section>
    );
  }

  const events = preview?.nextEvents ?? [];
  const opportunities = preview?.openOpportunities ?? [];

  return (
    <>
      <section className="mt-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.events.title")}
        </h2>
        {events.length === 0 ? (
          <p className="mt-2 text-[14px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.community.upcoming.empty")}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--bc-mobile-border)]">
            {events.map((e: any) => {
              const parts = eventDateParts(e.startAt);
              return (
                <li key={e.eventRef}>
                  <Link
                    to="/connect-app/community/$communityId/events/$eventRef"
                    params={{ communityId, eventRef: e.eventRef }}
                    aria-label={`${t("bc.mobile.community.events.openEvent")}: ${e.title}`}
                    className="flex min-h-[56px] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-9 shrink-0 flex-col items-center justify-center rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]"
                    >
                      <span className="text-[13px] font-semibold leading-none text-[var(--bc-mobile-text)]">
                        {parts?.day ?? "--"}
                      </span>
                      <span className="mt-0.5 text-[9px] font-medium uppercase text-[var(--bc-mobile-muted)]">
                        {parts ? monthLabel(fmt.locale, parts.month) : ""}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-[var(--bc-mobile-text)]">
                        {e.title}
                      </span>
                      {e.locationLabel ? (
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--bc-mobile-muted)]">
                          {e.locationLabel}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
                      strokeWidth={1.8}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          to="/connect-app/community/$communityId/events"
          params={{ communityId }}
          className="mt-1 inline-flex min-h-[44px] items-center text-[13px] font-medium text-[var(--bc-mobile-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
        >
          {t("bc.mobile.community.events.viewAll")}
        </Link>
      </section>

      <section className="mt-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.news.title")}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.news.subtitle")}
        </p>
        <Link
          to="/connect-app/community/$communityId/news"
          params={{ communityId }}
          className="mt-1 inline-flex min-h-[44px] items-center text-[13px] font-medium text-[var(--bc-mobile-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
        >
          {t("bc.mobile.community.news.open")}
        </Link>
      </section>



      <section className="mt-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.opportunities.title")}
        </h2>
        {opportunities.length === 0 ? (
          <p className="mt-2 text-[14px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.community.opportunities.empty")}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--bc-mobile-border)]">
            {opportunities.map((o) => {
              const meta = [opportunityCategoryLabel(o.categoryKey, t), o.organizationLabel]
                .filter(Boolean)
                .join(" · ");
              const deadline = daysLeftLabel(o.daysLeft, t);
              return (
                <li key={o.opportunityRef}>
                  <Link
                    to="/connect-app/community/$communityId/opportunities/$opportunityRef"
                    params={{ communityId, opportunityRef: o.opportunityRef }}
                    aria-label={`${t("bc.mobile.community.opportunities.openOpportunity")}: ${o.title}`}
                    className="flex min-h-[56px] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-[var(--bc-mobile-text)]">
                        {o.title}
                      </span>
                      {meta ? (
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--bc-mobile-muted)]">
                          {meta}
                          {deadline ? ` · ${deadline}` : ""}
                        </span>
                      ) : deadline ? (
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--bc-mobile-muted)]">
                          {deadline}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
                      strokeWidth={1.8}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          to="/connect-app/community/$communityId/opportunities"
          params={{ communityId }}
          className="mt-1 inline-flex min-h-[44px] items-center text-[13px] font-medium text-[var(--bc-mobile-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
        >
          {t("bc.mobile.community.opportunities.viewAll")}
        </Link>
      </section>
    </>
  );
}

// ── Quick stats + bounded member preview (max 4 rows, read-only).

function StatTile({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-3 py-3 text-center">
      <div className="text-[18px] font-semibold leading-none text-[var(--bc-mobile-text)]">
        {value ?? "—"}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-[var(--bc-mobile-muted)]">{label}</div>
    </div>
  );
}

function MembersPreview({ communityId }: { communityId: string }) {
  const t = useT();
  const { members, initialLoading } = useCommunityMembers(communityId, "");
  const rows = members.slice(0, 4);

  return (
    <section className="mt-7">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--bc-mobile-muted)]">
        {t("bc.mobile.community.members")}
      </h2>
      {initialLoading ? (
        <div aria-hidden="true" className="mt-2 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
              <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-[var(--bc-mobile-surface-2)]" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-[14px] text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.community.members.empty")}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-[var(--bc-mobile-border)]">
          {rows.map((m) => {
            const meta = [m.jobTitle, m.companyName].filter(Boolean).join(" · ");
            return (
              <li key={m.memberRef}>
                <Link
                  to="/connect-app/community/$communityId/members/$memberRef"
                  params={{ communityId, memberRef: m.memberRef }}
                  aria-label={`${t("bc.mobile.community.openMember")}: ${m.displayName}`}
                  className="flex min-h-[56px] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] text-[13px] font-semibold text-[var(--bc-mobile-muted)]"
                  >
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      m.displayName.trim().charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[var(--bc-mobile-text)]">
                      {m.displayName}
                      {m.isSelf ? ` · ${t("bc.mobile.community.thisIsYou")}` : ""}
                    </span>
                    {meta ? (
                      <span className="mt-0.5 block truncate text-[12px] text-[var(--bc-mobile-muted)]">
                        {meta}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        to="/connect-app/community/$communityId/members"
        params={{ communityId }}
        className="mt-1 inline-flex min-h-[44px] items-center gap-2 text-[13px] font-medium text-[var(--bc-mobile-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
      >
        <Users aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
        {t("bc.mobile.community.members.viewAll")}
      </Link>
    </section>
  );
}
