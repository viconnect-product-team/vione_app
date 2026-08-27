// BC-Mobile-5A — /connect-app/me: the private identity command center.
// Sections: Identity Hero · My Digital Card · Share · Privacy · Account.
// All identity mutations derive the actor server-side; the client only ever
// holds owner DTOs (MyIdentityPayload) or the recipient projection.

import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  ChevronRight,
  Eye,
  LayoutList,
  Loader2,
  QrCode,
  Lock,
  Nfc,
  LogOut,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import { MeHeader } from "@/components/business-connect/mobile/me/MeHeader";
import { MeSheet } from "@/components/business-connect/mobile/me/MeSheet";
import { MeIdentityCard } from "@/components/business-connect/mobile/me/MeIdentityCard";
import { MeQuickContact } from "@/components/business-connect/mobile/me/MeQuickContact";
import { MeAboutPanel } from "@/components/business-connect/mobile/me/MeAboutPanel";
import { MeShowcasePanel } from "@/components/business-connect/mobile/me/MeShowcasePanel";
import { useMyIdentityShowcase } from "@/hooks/use-my-identity-showcase";
import { IdentityPrivacySheet } from "@/components/business-connect/mobile/me/IdentityPrivacySheet";
import {
  IdentityQrSheet,
  identityShareUrl,
} from "@/components/business-connect/mobile/me/IdentityQrSheet";
import { NfcSheet } from "@/components/business-connect/mobile/me/NfcSheet";
import { NfcActionSheet } from "@/components/business-connect/mobile/me/NfcActionSheet";

import { TapToConnectSheet } from "@/components/business-connect/mobile/TapToConnectSheet";
import { DigitalBusinessCard } from "@/components/business-connect/mobile/me/DigitalBusinessCard";
import {
  bcIdentityGetMineFn,
  bcIdentityGetOrCreateShareLinkFn,
  bcIdentityRotateShareLinkFn,
} from "@/lib/business-connect/mobile/identity.functions";
import { bcIdentityNfcTagRegisterFn } from "@/lib/business-connect/mobile/nfc-tags.functions";
import {
  resolveIdentityVisibility,
  toPublicIdentityCard,
} from "@/lib/business-connect/mobile/identity.projection";
import { reportIdentityMetric } from "@/lib/business-connect/mobile/identity.telemetry";
import type {
  IdentityShareLinkInfo,
  MyIdentityPayload,
} from "@/lib/business-connect/mobile/identity.types";

export const Route = createFileRoute("/connect-app/me/")({
  head: () => ({
    meta: [
      { title: "Tôi — Business Connect" },
      {
        name: "description",
        content: "Danh tính số và danh thiếp điện tử của bạn trên Business Connect.",
      },
      { property: "og:title", content: "Tôi — Business Connect" },
      {
        property: "og:description",
        content: "Danh tính số và danh thiếp điện tử của bạn trên Business Connect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectAppMePage,
});

type OpenSheet =
  | "sign-out"
  | "privacy"
  | "preview"
  | "qr"
  | "nfc"
  | "nfc-choose"
  | "tap-connect"
  | null;

const rowClass =
  "flex min-h-[52px] w-full min-w-0 items-center justify-between gap-3 rounded-2xl px-4 text-left text-[14.5px] font-medium text-[var(--bc-mobile-text)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none";

/** Circular owner action used in the Me quick-action row. */
function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  busy,
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="flex flex-col items-center gap-1.5 rounded-2xl py-2 text-[11.5px] font-medium text-[var(--bc-mobile-muted)] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] text-[var(--bc-mobile-text)] shadow-[var(--bc-mobile-shadow-v)]">
        {busy ? (
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin motion-reduce:animate-none"
            strokeWidth={1.8}
          />
        ) : (
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
        )}
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
}

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-5 shadow-[var(--bc-mobile-shadow-v)]">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--bc-mobile-text)]">
        {title}
      </h2>
      {desc && (
        <p className="mt-1 text-[12.5px] leading-snug text-[var(--bc-mobile-muted)]">{desc}</p>
      )}
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-1">{children}</div>
    </section>
  );
}

function ConnectAppMePage() {
  const t = useT();
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getMine = useServerFn(bcIdentityGetMineFn);
  const getOrCreateLink = useServerFn(bcIdentityGetOrCreateShareLinkFn);
  const rotateLink = useServerFn(bcIdentityRotateShareLinkFn);
  const registerNfcTag = useServerFn(bcIdentityNfcTagRegisterFn);

  const [payload, setPayload] = useState<MyIdentityPayload | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [shareLink, setShareLink] = useState<IdentityShareLinkInfo | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const result = await getMine();
      setPayload(result);
    } catch {
      setLoadFailed(true);
    }
  }, [getMine]);

  useEffect(() => {
    void load();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [load]);

  /** Đăng xuất: xoá cache riêng tư + phiên, rồi thay thế lịch sử về màn đăng nhập. */
  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOutSession(queryClient);
      await navigate({
        to: "/auth",
        search: { m: "1" as const, redirect: "/connect-app" },
        replace: true,
      });
    } catch {
      setSignOutFailed(true);
      setSigningOut(false);
    }
  }

  const identity = payload?.identity ?? null;
  const visibility = resolveIdentityVisibility(payload?.visibility);

  // Lĩnh vực kinh doanh & khách hàng: lấy theo tài khoản đang đăng nhập.
  const showcaseQuery = useMyIdentityShowcase();
  const businessAreaRows = (showcaseQuery.data?.businessAreas ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    onOpen: () => void navigate({ to: "/connect-app/me/edit" }),
  }));
  const clientItems = showcaseQuery.data?.clients ?? [];
  const clientLogoItems = clientItems.filter((item) => !!item.logoUrl);
  // Lưới 4 cột: hiện tối đa 4 logo, phần còn lại quy về "+N" tính trên số khách hàng thật.
  const clientLogos = (clientLogoItems.length > 4 ? clientLogoItems.slice(0, 3) : clientLogoItems)
    .map((item) => ({ id: item.id, name: item.title, logoUrl: item.logoUrl as string }));
  const clientExtraCount = Math.max(0, clientItems.length - clientLogos.length);

  const aboutMetrics = (showcaseQuery.data?.metrics ?? []).map((item) => ({
    id: item.id,
    value: item.title,
    label: item.subtitle ?? "",
  }));
  const aboutInterests = (showcaseQuery.data?.interests ?? []).map((item) => ({
    id: item.id,
    label: item.title,
  }));
  // Chỉ số dấu ấn đã hiển thị ở "Về tôi" — không lặp lại ở panel khách hàng.

  const clientRows = clientItems
    .filter((item) => !item.logoUrl)
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      onOpen: () => void navigate({ to: "/connect-app/me/edit" }),
    }));


  /** Ensure the share link exists (first open materializes it server-side). */
  const ensureShareLink = useCallback(async (): Promise<IdentityShareLinkInfo | null> => {
    let current: IdentityShareLinkInfo | null = null;
    setShareLink((prev) => {
      current = prev;
      return prev;
    });
    if (current) return current;
    setShareBusy(true);
    try {
      const link = await getOrCreateLink();
      setShareLink(link);
      return link;
    } catch {
      return null;
    } finally {
      setShareBusy(false);
    }
  }, [getOrCreateLink]);

  /**
   * Live QR: materialize the share link as soon as an identity exists so the
   * "Mã QR của tôi" panel always renders a scannable code without a tap.
   */
  useEffect(() => {
    if (!identity) return;
    void ensureShareLink();
  }, [identity, ensureShareLink]);

  async function handleOpenQr() {
    reportIdentityMetric("IDENTITY_QR_VIEWED");
    const link = await ensureShareLink();
    if (link) setSheet("qr");
  }

  /**
   * Contextual NFC entry: ask what the tap means, then route to the canonical
   * flow (read someone's tag → connect, or write my own tag → share).
   */
  function handleOpenNfcChooser() {
    setSheet("nfc-choose");
  }

  /** BC-Mobile-5B — NFC sheet needs the current share link materialized. */
  async function handleOpenNfc() {
    const link = await ensureShareLink();
    if (link) setSheet("nfc");
  }

  async function handleShareLink() {
    const link = await ensureShareLink();
    if (!link) return;
    reportIdentityMetric("IDENTITY_LINK_SHARED");
    const url = identityShareUrl(link.token);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Cancelled — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard denied — the QR sheet still exposes the URL.
    }
  }

  async function handleRotate() {
    if (rotating) return;
    setRotating(true);
    try {
      const link = await rotateLink();
      reportIdentityMetric("IDENTITY_LINK_ROTATED");
      setShareLink(link);
    } catch {
      // Rotation failed — the sheet keeps the previous token, nothing leaks.
    } finally {
      setRotating(false);
    }
  }

  function handleSaved(next: MyIdentityPayload) {
    setPayload(next);
  }

  return (
    <MobilePage>
      <MeHeader
        avatarUrl={identity?.avatarUrl ?? null}
        displayName={identity?.displayName ?? null}
        email={email}
        verified={Boolean(identity)}
      />
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 pt-4">
        {loadFailed ? (
          <section className="rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-6 text-center shadow-[var(--bc-mobile-shadow-v)]">
            <p role="alert" className="text-[14px] text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.me.loadError")}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 min-h-11 rounded-full bg-[var(--bc-mobile-text)] px-6 text-[14px] font-semibold text-[var(--bc-mobile-surface)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
            >
              {t("bc.mobile.me.retry")}
            </button>
          </section>
        ) : !payload ? (
          <section
            aria-busy="true"
            aria-label={t("bc.mobile.me.identity.title")}
            className="flex justify-center rounded-3xl border border-[var(--bc-mobile-border)] bg-[var(--bc-mobile-surface)] p-10 shadow-[var(--bc-mobile-shadow-v)]"
          >
            <Loader2
              aria-hidden="true"
              className="h-6 w-6 animate-spin text-[var(--bc-mobile-muted)] motion-reduce:animate-none"
              strokeWidth={1.8}
            />
          </section>
        ) : (
          <>
            {/* 1 — Digital Identity: hero duy nhất, QR/NFC là 2 CTA chính. */}
            <MeIdentityCard
              identity={identity}
              email={email}
              busy={shareBusy}
              onQr={() => void handleOpenQr()}
              onNfc={handleOpenNfcChooser}
              onViewProfile={() => void navigate({ to: "/connect-app/me/edit" })}
            />

            {/* 2 — Liên hệ nhanh: chỉ kênh đã cấu hình, href an toàn. */}
            <MeQuickContact identity={identity} />

            {/* Hành động phụ — không lặp lại QR/NFC. */}
            <nav aria-label={t("bc.mobile.me.shareSection.title")} className="grid grid-cols-4">
              <QuickAction
                icon={Share2}
                label={t("bc.mobile.me.shareLink")}
                busy={shareBusy}
                disabled={!identity}
                onClick={() => void handleShareLink()}
              />
              <QuickAction
                icon={QrCode}
                label={t("bc.mobile.me.myQr")}
                busy={shareBusy}
                disabled={!identity}
                onClick={() => void handleOpenQr()}
              />
              <QuickAction
                icon={Nfc}
                label={t("bc.mobile.me.actions.nfcCard")}
                disabled={!identity}
                onClick={handleOpenNfcChooser}
              />
              <QuickAction
                icon={Eye}
                label={t("bc.mobile.me.preview")}
                disabled={!identity}
                onClick={() => {
                  reportIdentityMetric("IDENTITY_CARD_PREVIEWED");
                  setSheet("preview");
                }}
              />
            </nav>

            {/* 3 — Về tôi: một panel duy nhất. */}
            <MeAboutPanel
              bio={identity?.bio ?? null}
              metrics={aboutMetrics}
              interests={aboutInterests}
              onEdit={() => void navigate({ to: "/connect-app/me/edit" })}
            />

            {/* 4 — Lĩnh vực kinh doanh & sản phẩm (dữ liệu thật của tài khoản). */}
            <MeShowcasePanel
              id="me-business-areas"
              icon={Briefcase}
              title={t("bc.mobile.me.business.title")}
              emptyLabel={t("bc.mobile.me.business.empty")}
              rows={businessAreaRows}
              onViewAll={() => void navigate({ to: "/connect-app/me/edit" })}
              onAdd={() => void navigate({ to: "/connect-app/me/edit" })}
            />

            {/* 5 — Khách hàng & Dấu ấn (logo thật của tài khoản). */}
            <MeShowcasePanel
              id="me-clients"
              icon={Trophy}
              title={t("bc.mobile.me.clients.title")}
              emptyLabel={t("bc.mobile.me.clients.empty")}
              rows={clientRows}
              logos={clientLogos}
              extraCount={clientExtraCount}
              onViewAll={() => void navigate({ to: "/connect-app/me/edit" })}

              onAdd={() => void navigate({ to: "/connect-app/me/edit" })}
            />


            <SectionCard title={t("bc.mobile.me.shareSection.title")}>
              <button
                type="button"
                onClick={() => setSheet("tap-connect")}
                aria-label={t("bc.mobile.tapConnect.rowTitle")}
                className={rowClass}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Nfc
                    aria-hidden="true"
                    className="h-4.5 w-4.5 shrink-0 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                  <span className="min-w-0">
                    <span className="block">{t("bc.mobile.tapConnect.rowTitle")}</span>
                    <span className="block truncate text-[12px] font-normal text-[var(--bc-mobile-muted)]">
                      {t("bc.mobile.tapConnect.rowSubtitle")}
                    </span>
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </button>
              <Link
                to="/connect-app/nfc-tags"
                aria-label={t("bc.mobile.me.nfc.tags.rowTitle")}
                className={rowClass}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <LayoutList
                    aria-hidden="true"
                    className="h-4.5 w-4.5 shrink-0 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                  <span className="min-w-0">
                    <span className="block">{t("bc.mobile.me.nfc.tags.rowTitle")}</span>
                    <span className="block truncate text-[12px] font-normal text-[var(--bc-mobile-muted)]">
                      {t("bc.mobile.me.nfc.tags.rowSubtitle")}
                    </span>
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
            </SectionCard>

            <SectionCard
              title={t("bc.mobile.me.privacySection.title")}
              desc={t("bc.mobile.me.privacySection.desc")}
            >
              <button
                type="button"
                onClick={() => setSheet("privacy")}
                disabled={!identity}
                className={rowClass}
              >
                <span className="flex items-center gap-3">
                  <Lock
                    aria-hidden="true"
                    className="h-4.5 w-4.5 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                  {t("bc.mobile.me.manage")}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </button>
            </SectionCard>

            {/* 6C — V personalization settings (explicit, transparent). */}
            <SectionCard title={t("bc.mobile.me.intelSettings")}>
              <Link to="/connect-app/me/intel-settings" className={rowClass}>
                <span className="flex items-center gap-3">
                  <Sparkles
                    aria-hidden="true"
                    className="h-4.5 w-4.5 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                  {t("bc.mobile.me.intelSettings")}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
            </SectionCard>

            {/* Language — instant UI switch, persisted by the root provider. */}
            <SectionCard title={t("bc.mobile.me.language.title")}>
              <div
                role="group"
                aria-label={t("bc.mobile.me.language.title")}
                className="grid grid-cols-2 gap-2 py-1"
              >
                {(["vi", "en", "lo", "km", "my"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`rounded-2xl border px-3 py-2.5 text-[13px] font-semibold transition text-center ${
                      lang === code
                        ? "border-[#ea9a41] bg-[#ea9a4112] text-[#ffb971]"
                        : "border-[var(--bc-mobile-border)] text-[var(--bc-mobile-muted)]"
                    }`}
                  >
                    {code === "vi" ? "Tiếng Việt" :
                     code === "en" ? "Tiếng Anh" :
                     code === "lo" ? "Tiếng Lào" :
                     code === "km" ? "Tiếng Campuchia" :
                     "Tiếng Myanmar"}
                  </button>
                ))}
              </div>
              <p className="mt-2 pb-1 text-[12px] leading-relaxed text-[var(--bc-mobile-muted)]">
                {t("bc.mobile.me.language.hint")}
              </p>
            </SectionCard>

            <SectionCard title={t("bc.mobile.me.accountSection.title")}>
              <Link to="/account-settings" className={rowClass}>
                <span className="flex items-center gap-3">{t("bc.mobile.me.accountSecurity")}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
              <Link to="/connect-app/me/cards" className={rowClass}>
                <span className="flex items-center gap-3">{t("bc.mobile.me.cards.entry")}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
              <Link to="/connect-app/me/sessions" className={rowClass}>
                <span className="flex items-center gap-3">{t("bc.mobile.me.sessions.entry")}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </Link>
              <button type="button" onClick={() => setSheet("sign-out")} className={rowClass}>
                <span className="flex items-center gap-3">
                  <LogOut
                    aria-hidden="true"
                    className="h-4.5 w-4.5 text-[var(--bc-mobile-muted)]"
                    strokeWidth={1.8}
                  />
                  {t("bc.mobile.me.signOut")}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--bc-mobile-muted)]"
                  strokeWidth={1.8}
                />
              </button>
            </SectionCard>
          </>
        )}
      </div>

      {sheet === "sign-out" && (
        <MeSheet
          title={t("bc.mobile.me.signOut.confirmTitle")}
          subtitle={t("bc.mobile.me.signOut.confirmSubtitle")}
          busy={signingOut}
          onClose={() => setSheet(null)}
          footer={
            <>
              {signOutFailed && (
                <p role="alert" className="text-center text-[12.5px] text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.me.signOut.error")}
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--bc-mobile-text)] px-6 text-[15px] font-semibold text-[var(--bc-mobile-surface)] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
              >
                {signingOut && (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    strokeWidth={1.8}
                  />
                )}
                {signingOut ? t("bc.mobile.me.signOut.pending") : t("bc.mobile.me.signOut.confirm")}
              </button>
              <button
                type="button"
                onClick={() => setSheet(null)}
                disabled={signingOut}
                className="min-h-11 w-full rounded-full text-[14px] font-medium text-[var(--bc-mobile-muted)] transition-colors hover:bg-[var(--bc-mobile-surface-2)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bc-mobile-navy)] motion-reduce:transition-none"
              >
                {t("bc.mobile.me.cancel")}
              </button>
            </>
          }
        >
          <p className="text-[13.5px] leading-relaxed text-[var(--bc-mobile-muted)]">
            {email ?? ""}
          </p>
        </MeSheet>
      )}
      {sheet === "privacy" && (
        <IdentityPrivacySheet
          visibility={visibility}
          onSaved={handleSaved}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "preview" && identity && (
        <MeSheet
          title={t("bc.mobile.me.previewTitle")}
          subtitle={t("bc.mobile.me.previewSubtitle")}
          onClose={() => setSheet(null)}
        >
          <div className="pb-1">
            <DigitalBusinessCard
              card={toPublicIdentityCard(identity, visibility)}
              publicUrl={shareLink ? identityShareUrl(shareLink.token) : null}
            />
          </div>
        </MeSheet>
      )}
      {sheet === "nfc-choose" && (
        <NfcActionSheet
          onConnect={() => setSheet("tap-connect")}
          onShare={() => void handleOpenNfc()}
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "qr" && shareLink && (
        <IdentityQrSheet
          shareLink={shareLink}
          rotating={rotating}
          onRotate={() => void handleRotate()}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "tap-connect" && <TapToConnectSheet onClose={() => setSheet(null)} />}
      {sheet === "nfc" && shareLink && (
        <NfcSheet
          shareLink={shareLink}
          onClose={() => setSheet(null)}
          registerTag={() => registerNfcTag({ data: { shareToken: shareLink.token } })}
        />
      )}
    </MobilePage>
  );
}
