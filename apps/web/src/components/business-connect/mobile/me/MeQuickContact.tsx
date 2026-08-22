// BC-Mobile — "Liên hệ nhanh" (owner view), thuần trình bày.
// Danh sách kênh do quick-contact.ts dựng: chỉ kênh đã cấu hình, href an toàn
// (javascript:/data:/file: bị chặn ngay từ builder).

import { useT } from "@/lib/i18n";
import { buildQuickContactChannels } from "@/lib/business-connect/mobile/quick-contact";
import type { BusinessIdentity } from "@/lib/business-connect/mobile/identity.types";

export function MeQuickContact({ identity }: { identity: BusinessIdentity | null }) {
  const t = useT();
  const channels = buildQuickContactChannels(identity);
  if (channels.length === 0) return null;

  return (
    <section
      aria-labelledby="me-quick-contact-title"
      className="min-w-0 overflow-hidden rounded-[22px] border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] px-4 py-4 shadow-[var(--bc-mobile-shadow-v)]"
    >
      <h2
        id="me-quick-contact-title"
        className="text-[13px] font-semibold tracking-tight text-[var(--bc-mobile-text-2)]"
      >
        {t("bc.mobile.me.contact.title")}
      </h2>
      <ul
        className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-testid="me-quick-contact-scroller"
      >
        {channels.map((c) => {
          const Icon = c.icon;
          const label = t(c.labelKey);
          return (
            <li key={c.key} className="snap-start">
              <a
                href={c.href}
                aria-label={label}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex min-h-[72px] w-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-[11.5px] font-medium text-[var(--bc-mobile-text-2)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-accent)] motion-reduce:transition-none"
              >
                <Icon
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--bc-mobile-accent)]"
                  strokeWidth={1.7}
                />
                <span className="w-full truncate text-center">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
