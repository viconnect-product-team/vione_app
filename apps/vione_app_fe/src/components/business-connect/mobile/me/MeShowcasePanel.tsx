// BC-Mobile — panel full-width dùng chung cho "Lĩnh vực kinh doanh & sản phẩm"
// và "Khách hàng & Dấu ấn".
//
// Không có dữ liệu = không bịa dữ liệu: panel chỉ hiển thị gợi ý bổ sung cho
// CHỦ SỞ HỮU (owner view), không bao giờ render logo/lĩnh vực mẫu.

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export type ShowcaseRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  icon?: LucideIcon;
  onOpen?: () => void;
};

export type ShowcaseLogo = { id: string; name: string; logoUrl: string };

export function MeShowcasePanel({
  id,
  icon: TitleIcon,
  title,
  emptyLabel,
  rows = [],
  logos = [],
  extraCount = 0,
  metrics = [],
  onViewAll,
  onAdd,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  emptyLabel: string;
  rows?: ShowcaseRow[];
  logos?: ShowcaseLogo[];
  extraCount?: number;
  metrics?: { id: string; value: string; label: string }[];
  onViewAll?: () => void;
  onAdd: () => void;
}) {
  const t = useT();
  const hasContent = rows.length > 0 || logos.length > 0 || metrics.length > 0;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="rounded-[22px] border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-5 shadow-[var(--bc-mobile-shadow-v)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`${id}-title`}
          className="flex min-w-0 items-center gap-2 text-[15px] font-semibold tracking-tight text-[var(--bc-mobile-text)]"
        >
          <TitleIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[var(--bc-mobile-accent)]"
            strokeWidth={1.8}
          />
          <span className="min-w-0 break-words">{title}</span>
        </h2>
        {hasContent && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex min-h-11 shrink-0 items-center gap-0.5 text-[12.5px] font-medium text-[var(--bc-mobile-text-2)] transition-colors hover:text-[var(--bc-mobile-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] motion-reduce:transition-none"
          >
            {t("bc.mobile.me.viewAll")}
            <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          </button>
        )}
      </div>

      {!hasContent ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 flex min-h-11 w-full items-center justify-between rounded-2xl bg-[var(--bc-mobile-surface-2)] px-4 text-[13.5px] font-medium text-[var(--bc-mobile-text-2)] transition-colors hover:bg-[var(--bc-mobile-border)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] motion-reduce:transition-none"
        >
          {emptyLabel}
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </button>
      ) : (
        <>
          {rows.length > 0 && (
            <ul className="mt-2 divide-y divide-[var(--bc-mobile-border)]/60">
              {rows.map((row) => {
                const RowIcon = row.icon;
                const content = (
                  <>
                    {RowIcon && (
                      <RowIcon
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-[var(--bc-mobile-accent)]"
                        strokeWidth={1.7}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[14px] font-medium text-[var(--bc-mobile-text)]">
                        {row.title}
                      </span>
                      {row.subtitle && (
                        <span className="mt-0.5 block line-clamp-2 break-words text-[12.5px] leading-snug text-[var(--bc-mobile-muted)]">
                          {row.subtitle}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
                      strokeWidth={1.8}
                    />
                  </>
                );
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={row.onOpen}
                      className="flex min-h-[64px] w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[var(--bc-mobile-surface-2)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] motion-reduce:transition-none"
                    >
                      {content}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {logos.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {logos.map((logo) => (
                <li
                  key={logo.id}
                  className="grid h-16 place-items-center rounded-xl bg-[var(--bc-mobile-surface-2)] p-2"
                >
                  <img
                    src={logo.logoUrl}
                    alt={logo.name}
                    loading="lazy"
                    className="max-h-10 max-w-full object-contain"
                  />
                </li>
              ))}
              {extraCount > 0 && (
                <li className="grid h-16 place-items-center rounded-xl bg-[var(--bc-mobile-surface-2)] p-2 text-center text-[12px] font-semibold text-[var(--bc-mobile-text-2)]">
                  +{extraCount}
                </li>
              )}
            </ul>
          )}


          {metrics.length > 0 && (
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {metrics.map((m) => (
                <div key={m.id} className="min-w-0 text-center">
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="block break-words text-[18px] font-semibold text-[var(--bc-mobile-accent)]">
                      {m.value}
                    </span>
                    <span className="mt-0.5 block break-words text-[11.5px] leading-snug text-[var(--bc-mobile-muted)]">
                      {m.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </section>
  );
}
