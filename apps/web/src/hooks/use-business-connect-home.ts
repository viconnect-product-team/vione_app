// BC-Mobile-1A — Executive Home composition hook.
//
// Thin client-safe aggregation over three LIVE_REUSABLE contracts (verified in
// docs/business-connect/mobile/BC_MOBILE_1A_HOME_DATA_CONTRACT.md):
//   1. Platform identity        — getCurrentUserFn
//   2. Work Hub overview        — getWorkHubOverviewFn (BC-8.0 read-model)
//   3. Notification unread count — NotificationOrchestrationSDK.getUnreadCount
//
// Rules honored here: no new backend, no service role, no RLS bypass, no
// .server imports, no duplicated business logic, no mock fallback, no
// relationship-memory / private-note access. The query key is scoped by the
// authenticated viewer id so an account switch can never show a stale
// cross-account Home.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentUserFn } from "@/lib/identity/platform-identity.functions";
import { getWorkHubOverviewFn } from "@/lib/business-connect/work-hub/functions";
import { NotificationOrchestrationSDK } from "@/lib/business-connect/notification-orchestration/sdk";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import type {
  WorkHubCategory,
  WorkHubItemDTO,
  WorkHubOverviewDTO,
  WorkHubUrgency,
} from "@/lib/business-connect/work-hub/types";

// ── Normalized Home shape (intentionally small) ─────────────────────────────

/** Semantic presentation kinds — never raw backend records. */
export type BcMobileTodayKind =
  | "meeting"
  | "follow_up"
  | "connection"
  | "introduction"
  | "relationship"
  | "calendar";

export type BcMobileTodayItem = {
  id: string;
  kind: BcMobileTodayKind;
  category: WorkHubCategory;
  urgency: WorkHubUrgency;
  /** i18n keys resolved at render time via hasTKey/t — never raw text. */
  titleKey: string;
  descriptionKey: string | null;
  counterpartDisplayName: string | null;
  startsAt: string | null;
  dueAt: string | null;
  action: {
    labelKey: string;
    targetRoute: string | null;
    targetParams: Record<string, string> | null;
    targetSearch: Record<string, string | number | boolean> | null;
    canRoute: boolean;
  };
};

export type BcMobileHomeIdentity = {
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
};

export type BcMobileHomeData = {
  identity: BcMobileHomeIdentity;
  /**
   * `items` = lát cắt mặc định (tối đa 3, thứ tự ưu tiên máy chủ — hợp đồng cũ).
   * `pool`  = tập ứng viên rộng hơn cùng thứ tự, dùng khi người dùng tuỳ chỉnh
   *           thẻ HÔM NAY (lọc theo loại / đổi cách sắp xếp / tăng số mục).
   */
  today:
    | { status: "ok"; items: BcMobileTodayItem[]; pool: BcMobileTodayItem[] }
    | { status: "error"; items: BcMobileTodayItem[]; pool: BcMobileTodayItem[] };
  /** null = unread state unavailable → bell renders WITHOUT a badge. */
  unreadNotificationCount: number | null;
};

export const BC_MOBILE_HOME_MAX_TODAY_ITEMS = 3;

/** Trần tập ứng viên cho thẻ HÔM NAY khi người dùng tuỳ chỉnh hiển thị. */
export const BC_MOBILE_HOME_TODAY_POOL_SIZE = 12;

// ── Query keys (identity-scoped — cache isolation contract) ──────────────────

export const bcMobileHomeKeys = {
  root: ["bc-mobile", "home"] as const,
  /** Scoped by the authenticated viewer id: account switch ⇒ new key ⇒ no cross-account cache. */
  home: (viewerUserId: string) => [...bcMobileHomeKeys.root, viewerUserId] as const,
};

// ── Today selection (deterministic, server-derived order only) ───────────────

/**
 * Frozen Work Hub category precedence (work-hub/types.ts §34). Primary
 * categories always eligible; waiting/recent only fill remaining slots — a
 * quiet Home shows recent activity only when nothing more pressing exists.
 */
const PRIMARY_CATEGORIES: readonly WorkHubCategory[] = [
  "overdue",
  "needs_action",
  "due_soon",
  "upcoming",
];
const SECONDARY_CATEGORIES: readonly WorkHubCategory[] = ["waiting", "recent"];

function toTodayKind(item: WorkHubItemDTO): BcMobileTodayKind {
  const k = item.itemKind;
  if (k.startsWith("meeting_follow_up")) return "follow_up";
  if (k.startsWith("meeting_")) return "meeting";
  if (k.startsWith("connection_")) return "connection";
  if (k.startsWith("introduction_")) return "introduction";
  if (k === "calendar_sync_action_required") return "calendar";
  return "relationship";
}

function toTodayItem(item: WorkHubItemDTO): BcMobileTodayItem {
  return {
    id: item.id,
    kind: toTodayKind(item),
    category: item.category,
    urgency: item.urgency,
    titleKey: item.titleKey,
    descriptionKey: item.descriptionKey,
    counterpartDisplayName: item.safeDisplayData.counterpartDisplayName ?? null,
    startsAt: item.startsAt,
    dueAt: item.dueAt,
    action: {
      labelKey: item.action.labelKey,
      targetRoute: item.action.targetRoute,
      targetParams: item.action.targetParams,
      targetSearch: item.action.targetSearch,
      canRoute: item.viewerPermissions.canRoute,
    },
  };
}

/**
 * Selects at most `max` Today items from a live Work Hub overview.
 * Order: frozen category precedence, then server order within each preview
 * slice; cross-source duplicates removed via the server-computed dedupeKey.
 * Returns [] on a genuinely quiet day — never fabricates items.
 */
export function selectTodayItems(
  overview: WorkHubOverviewDTO,
  max: number = BC_MOBILE_HOME_MAX_TODAY_ITEMS,
): BcMobileTodayItem[] {
  const seen = new Set<string>();
  const out: BcMobileTodayItem[] = [];
  const collect = (categories: readonly WorkHubCategory[]) => {
    for (const category of categories) {
      for (const item of overview.previews[category] ?? []) {
        if (out.length >= max) return;
        if (seen.has(item.dedupeKey)) continue;
        seen.add(item.dedupeKey);
        out.push(toTodayItem(item));
      }
    }
  };
  collect(PRIMARY_CATEGORIES);
  collect(SECONDARY_CATEGORIES);
  return out;
}

// ── Greeting daypart (simple, localized — no over-engineering) ───────────────

export type BcMobileDaypart = "morning" | "afternoon" | "evening";

export function getGreetingDaypart(date: Date = new Date()): BcMobileDaypart {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

// ── Composition hook ─────────────────────────────────────────────────────────

export function useBusinessConnectHome() {
  const viewerId = useViewerUserId();
  const getIdentity = useServerFn(getCurrentUserFn);
  const getOverview = useServerFn(getWorkHubOverviewFn);
  const getUnreadCount = useServerFn(NotificationOrchestrationSDK.getUnreadCount);

  return useQuery<BcMobileHomeData>({
    queryKey: bcMobileHomeKeys.home(viewerId ?? "viewer-pending"),
    enabled: viewerId !== null,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      // Identity is the core source: its failure is the Home-level retry state.
      const identity = await getIdentity();
      // Secondary sources degrade independently — a failure in one must not
      // destroy the rest of Home, and never substitutes mock data.
      const [overview, unread] = await Promise.allSettled([getOverview(), getUnreadCount({})]);
      return {
        identity: {
          displayName: identity.profile?.displayName ?? null,
          avatarUrl: identity.profile?.avatarUrl ?? null,
          email: identity.email,
        },
        today: (() => {
          if (overview.status !== "fulfilled") {
            return { status: "error" as const, items: [], pool: [] };
          }
          const pool = selectTodayItems(overview.value, BC_MOBILE_HOME_TODAY_POOL_SIZE);
          return {
            status: "ok" as const,
            items: pool.slice(0, BC_MOBILE_HOME_MAX_TODAY_ITEMS),
            pool,
          };
        })(),
        unreadNotificationCount: unread.status === "fulfilled" ? unread.value.count : null,
      };
    },
  });
}
