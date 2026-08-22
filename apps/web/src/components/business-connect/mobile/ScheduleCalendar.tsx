// Xem lịch — /connect-app/calendar
//
// Lịch làm việc của người dùng dựng từ đúng nguồn dữ liệu chuẩn đang có
// (Work Hub qua useBusinessConnectHome). Không tạo backend lịch song song,
// không dữ liệu giả: ngày trống hiển thị đúng trạng thái trống.

import { useMemo, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useFmt, useT } from "@/lib/i18n";
import { useBusinessConnectHome, type BcMobileTodayItem } from "@/hooks/use-business-connect-home";
import { TodayItem } from "./TodayItem";

type Filter = "all" | "meeting" | "follow_up" | "other";

const FILTERS: { id: Filter; labelKey: Parameters<ReturnType<typeof useT>>[0] }[] = [
  { id: "all", labelKey: "bc.mobile.calendar.filter.all" },
  { id: "meeting", labelKey: "bc.mobile.calendar.filter.meeting" },
  { id: "follow_up", labelKey: "bc.mobile.calendar.filter.followUp" },
  { id: "other", labelKey: "bc.mobile.calendar.filter.other" },
];

function itemDate(item: BcMobileTodayItem): Date | null {
  const raw = item.startsAt ?? item.dueAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function matchesFilter(item: BcMobileTodayItem, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "meeting") return item.kind === "meeting";
  if (filter === "follow_up") return item.kind === "follow_up";
  return item.kind !== "meeting" && item.kind !== "follow_up";
}

export function ScheduleCalendar() {
  const t = useT();
  const fmt = useFmt();
  const home = useBusinessConnectHome();
  const [filter, setFilter] = useState<Filter>("all");

  const pool = home.data?.today.pool ?? [];
  const dataError = home.data?.today.status === "error";

  const { groups, undated } = useMemo(() => {
    const filtered = pool.filter((i) => matchesFilter(i, filter));
    const map = new Map<string, { date: Date; items: BcMobileTodayItem[] }>();
    const noDate: BcMobileTodayItem[] = [];
    for (const item of filtered) {
      const d = itemDate(item);
      if (!d) {
        noDate.push(item);
        continue;
      }
      const key = dayKey(d);
      const bucket = map.get(key);
      if (bucket) bucket.items.push(item);
      else map.set(key, { date: d, items: [item] });
    }
    const sorted = [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const g of sorted) {
      g.items.sort((a, b) => {
        const da = itemDate(a)?.getTime() ?? 0;
        const db = itemDate(b)?.getTime() ?? 0;
        return da - db;
      });
    }
    return { groups: sorted, undated: noDate };
  }, [pool, filter]);

  const total = groups.reduce((n, g) => n + g.items.length, 0) + undated.length;

  function dayLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dayKey(date) === dayKey(today)) return t("bc.mobile.calendar.day.today");
    if (dayKey(date) === dayKey(tomorrow)) return t("bc.mobile.calendar.day.tomorrow");
    return date.toLocaleDateString(fmt.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  return (
    <div className="pt-5">
      <section className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--bc-mobile-border-gold)] text-[var(--bc-mobile-accent)]"
        >
          <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-semibold leading-tight text-[var(--bc-mobile-text)]">
            {t("bc.mobile.calendar.title")}
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.calendar.subtitle")}
          </p>
        </div>
      </section>

      <div
        role="tablist"
        aria-label={t("bc.mobile.calendar.filter.label")}
        className="mt-4 flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`min-h-[38px] rounded-full border px-3.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] ${
                active
                  ? "border-[var(--bc-mobile-border-gold)] bg-[var(--bc-mobile-surface-2)] text-[var(--bc-mobile-accent)]"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)]"
              }`}
            >
              {t(f.labelKey)}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-3 text-[12px] text-[var(--bc-mobile-muted)]">
        {home.isPending
          ? t("bc.mobile.calendar.loading")
          : t("bc.mobile.calendar.count", { count: total })}
      </p>

      {home.isError || dataError ? (
        <section role="alert" className="mt-6 text-center">
          <p className="text-[13.5px] text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.calendar.error")}
          </p>
          <button
            type="button"
            onClick={() => void home.refetch()}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--bc-mobile-border-gold)] px-4 text-[13px] font-medium text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)]"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            {t("bc.mobile.calendar.retry")}
          </button>
        </section>
      ) : home.isPending ? (
        <div role="status" aria-busy="true" className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-[var(--bc-mobile-surface-2)] motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <section className="mt-8 rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-6 text-center">
          <p className="text-[14px] font-medium text-[var(--bc-mobile-text)]">
            {t("bc.mobile.calendar.empty.title")}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--bc-mobile-muted)]">
            {t("bc.mobile.calendar.empty.body")}
          </p>
        </section>
      ) : (
        <div className="mt-5 space-y-7">
          {groups.map((g) => (
            <section key={dayKey(g.date)}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]">
                {dayLabel(g.date)}
              </h2>
              <ul className="mt-3 space-y-5 border-l border-[var(--bc-mobile-border-gold)] pl-4">
                {g.items.map((item) => (
                  <TodayItem key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}

          {undated.length > 0 ? (
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.calendar.undated")}
              </h2>
              <ul className="mt-3 space-y-5 border-l border-[var(--bc-mobile-border)] pl-4">
                {undated.map((item) => (
                  <TodayItem key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
