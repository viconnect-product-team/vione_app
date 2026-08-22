// Danh thiếp đã lưu / đã quét — /connect-app/me/cards
// Xem, chỉnh nhãn, ghi chú và xoá hồ sơ. Không có backend song song: đọc/ghi
// đi qua contract sẵn có (SavedCardSDK, GuestContactSDK) và RLS theo chủ sở hữu.

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IdCard, Loader2, ScanLine } from "lucide-react";
import { useT } from "@/lib/i18n";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import { BusinessConnectTopBar } from "@/components/business-connect/mobile/BusinessConnectTopBar";
import { CardVaultManageSheet } from "@/components/business-connect/mobile/me/CardVaultManageSheet";
import {
  useCardVault,
  useCardVaultMutations,
  type CardVaultItem,
  type CardVaultKind,
} from "@/hooks/use-card-vault";

export const Route = createFileRoute("/connect-app/me/cards")({
  head: () => ({
    meta: [
      { title: "Danh thiếp đã lưu — Business Connect" },
      {
        name: "description",
        content: "Quản lý danh thiếp số đã lưu và danh thiếp giấy đã quét: nhãn, ghi chú, xoá.",
      },
      { property: "og:title", content: "Danh thiếp đã lưu — Business Connect" },
      {
        property: "og:description",
        content: "Quản lý danh thiếp số đã lưu và danh thiếp giấy đã quét: nhãn, ghi chú, xoá.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CardVaultPage,
});

function CardVaultPage() {
  const t = useT();
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<CardVaultKind | "all">("all");
  const [active, setActive] = useState<CardVaultItem | null>(null);
  const [failed, setFailed] = useState<"save" | "delete" | null>(null);

  const { items, viewerKey, isLoading, isError, refetch } = useCardVault(term, kind);
  const { save, remove } = useCardVaultMutations(viewerKey);
  const busy = save.isPending || remove.isPending;

  const filters: Array<{ value: CardVaultKind | "all"; label: string }> = [
    { value: "all", label: t("bc.mobile.me.cards.filter.all") },
    { value: "saved_card", label: t("bc.mobile.me.cards.filter.saved") },
    { value: "scanned", label: t("bc.mobile.me.cards.filter.scanned") },
  ];

  async function handleSave(labels: string[], note: string | null) {
    if (!active) return;
    setFailed(null);
    try {
      await save.mutateAsync({ item: active, labels, note });
      setActive(null);
    } catch {
      setFailed("save");
    }
  }

  async function handleDelete() {
    if (!active) return;
    setFailed(null);
    try {
      await remove.mutateAsync(active);
      setActive(null);
    } catch {
      setFailed("delete");
    }
  }

  return (
    <MobilePage>
      <BusinessConnectTopBar title={t("bc.mobile.me.cards.pageTitle")} back />
      <div className="grid gap-4 pt-6">
        <p className="text-[12.5px] leading-snug text-[var(--bc-mobile-muted)]">
          {t("bc.mobile.me.cards.pageDesc")}
        </p>

        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("bc.mobile.me.cards.search")}
          aria-label={t("bc.mobile.me.cards.search")}
          className="min-h-11 w-full rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)] px-4 text-[14px] text-[var(--bc-mobile-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)]"
        />

        <div role="tablist" aria-label={t("bc.mobile.me.cards.pageTitle")} className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={kind === f.value}
              onClick={() => setKind(f.value)}
              className={`min-h-9 flex-1 rounded-full border px-3 text-[13px] font-medium transition-colors ${
                kind === f.value
                  ? "border-transparent bg-[var(--bc-mobile-text)] text-[var(--bc-mobile-surface)]"
                  : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {failed && (
          <p role="alert" className="text-[13px] text-[var(--destructive)]">
            {failed === "save"
              ? t("bc.mobile.me.cards.saveError")
              : t("bc.mobile.me.cards.deleteError")}
          </p>
        )}

        {isError ? (
          <section className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-6 text-center">
            <p role="alert" className="text-[14px] text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.me.loadError")}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 min-h-11 rounded-full bg-[var(--bc-mobile-text)] px-6 text-[14px] font-semibold text-[var(--bc-mobile-surface)]"
            >
              {t("bc.mobile.me.retry")}
            </button>
          </section>
        ) : isLoading ? (
          <section
            aria-busy="true"
            aria-label={t("bc.mobile.me.cards.pageTitle")}
            className="flex justify-center rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-10"
          >
            <Loader2
              aria-hidden="true"
              className="h-6 w-6 animate-spin text-[var(--bc-mobile-muted)] motion-reduce:animate-none"
              strokeWidth={1.8}
            />
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-8 text-center text-[14px] text-[var(--bc-mobile-muted)]">
            {term.trim() ? t("bc.mobile.me.cards.emptySearch") : t("bc.mobile.me.cards.empty")}
          </section>
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    setFailed(null);
                    setActive(item);
                  }}
                  aria-label={`${t("bc.mobile.me.cards.manage")} — ${item.displayName ?? t("bc.mobile.me.cards.unknownName")}`}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-3.5 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface-2)]">
                    {item.kind === "saved_card" ? (
                      <IdCard
                        aria-hidden="true"
                        className="h-4.5 w-4.5 text-[var(--bc-mobile-muted)]"
                        strokeWidth={1.8}
                      />
                    ) : (
                      <ScanLine
                        aria-hidden="true"
                        className="h-4.5 w-4.5 text-[var(--bc-mobile-muted)]"
                        strokeWidth={1.8}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-[var(--bc-mobile-text)]">
                      {item.displayName ?? t("bc.mobile.me.cards.unknownName")}
                    </span>
                    <span className="block truncate text-[12.5px] text-[var(--bc-mobile-muted)]">
                      {[item.title, item.companyName].filter(Boolean).join(" · ") ||
                        (item.kind === "saved_card"
                          ? t("bc.mobile.me.cards.kind.saved")
                          : t("bc.mobile.me.cards.kind.scanned"))}
                    </span>
                    {item.labels.length > 0 && (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {item.labels.slice(0, 3).map((l) => (
                          <span
                            key={l}
                            className="rounded-full border border-[var(--bc-mobile-border)] px-2 py-0.5 text-[11px] text-[var(--bc-mobile-muted)]"
                          >
                            {l}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active && (
        <CardVaultManageSheet
          item={active}
          busy={busy}
          onClose={() => setActive(null)}
          onSave={(labels, note) => void handleSave(labels, note)}
          onDelete={() => void handleDelete()}
        />
      )}
    </MobilePage>
  );
}
