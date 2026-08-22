import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { getPublicCard, type PublicCard } from "@/lib/card.functions";

const appIcon = "/app-icon.png";

export const Route = createFileRoute("/card/$code")({
  loader: ({ params }) => getPublicCard({ data: { code: params.code } }),
  head: () => ({
    meta: [
      { title: "Thẻ hội viên — Hiệp hội Doanh nghiệp Việt Nam" },
      {
        name: "description",
        content: "Xác thực và xem thông tin thẻ hội viên doanh nghiệp/cá nhân qua mã QR.",
      },
    ],
  }),
  component: PublicCard,
  errorComponent: ({ error }) => (
    <div className="vba-app flex min-h-[100dvh] items-center justify-center p-6 text-center text-[var(--vba-text-muted)]">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="vba-app flex min-h-[100dvh] items-center justify-center p-6 text-center text-[var(--vba-text-muted)]">
      Không tìm thấy thẻ hội viên.
    </div>
  ),
});

type Lang = "vi" | "en";

const T = {
  verified: { vi: "Đã xác thực", en: "Verified" },
  memberCard: { vi: "THẺ HỘI VIÊN", en: "MEMBER CARD" },
  company: { vi: "Doanh nghiệp", en: "Company" },
  individual: { vi: "Cá nhân", en: "Individual" },
  info: { vi: "Thông tin hội viên", en: "Member information" },
  code: { vi: "Mã hội viên", en: "Member code" },
  status: { vi: "Trạng thái", en: "Status" },
  validUntil: { vi: "Hiệu lực đến", en: "Valid until" },
  joined: { vi: "Tham gia từ", en: "Member since" },
  title: { vi: "Chức vụ", en: "Position" },
  email: { vi: "Email", en: "Email" },
  phone: { vi: "Điện thoại", en: "Phone" },
  tax: { vi: "Mã số thuế", en: "Tax code" },
  industry: { vi: "Ngành nghề", en: "Industry" },
  region: { vi: "Khu vực", en: "Region" },
  address: { vi: "Địa chỉ", en: "Address" },
  website: { vi: "Website", en: "Website" },
  back: { vi: "Về trang chủ", en: "Back to home" },
  authentic: {
    vi: "Thẻ hội viên hợp lệ, được xác thực bởi Hiệp hội.",
    en: "Valid member card, authenticated by the Association.",
  },
  noName: { vi: "Hội viên", en: "Member" },
  noCompany: { vi: "Chưa cập nhật", en: "Not provided" },
  noValue: { vi: "—", en: "—" },
} as const;

function PublicCard() {
  const { code } = Route.useParams();
  const member = Route.useLoaderData() as PublicCard;
  const [lang, setLang] = useState<Lang>("vi");
  const t = (k: keyof typeof T) => T[k][lang];

  const isCompany = member.type === "company";

  const safeName = member.name?.trim() || t("noName");
  const safeCompany = member.company?.trim() || t("noCompany");
  const primaryName = isCompany ? safeCompany : safeName;
  const secondaryName = isCompany ? safeName : safeCompany;
  const initials =
    primaryName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const rows: { icon: typeof Mail; label: string; value?: string | null }[] = isCompany
    ? [
        { icon: Hash, label: t("tax"), value: member.taxCode },
        { icon: Building2, label: t("industry"), value: member.industry },
        { icon: MapPin, label: t("region"), value: member.region },
        { icon: MapPin, label: t("address"), value: member.address },
        { icon: Globe, label: t("website"), value: member.website },
        { icon: Phone, label: t("phone"), value: member.phone },
        { icon: Mail, label: t("email"), value: member.email },
      ]
    : [
        { icon: User, label: t("title"), value: member.title },
        { icon: Building2, label: t("industry"), value: member.industry },
        { icon: MapPin, label: t("region"), value: member.region },
        { icon: Phone, label: t("phone"), value: member.phone },
        { icon: Mail, label: t("email"), value: member.email },
      ];

  return (
    <div className="vba-app min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4 pb-10">
        {/* Top bar: back + language */}
        <header className="flex items-center justify-between py-4">
          <Link
            to="/m"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--vba-gold)] transition hover:bg-card/5"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>

          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-full border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] p-0.5 text-[11px] font-semibold"
          >
            {(["vi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`inline-flex h-7 min-w-[44px] items-center justify-center gap-1 rounded-full px-2.5 transition ${
                  lang === l
                    ? "vba-gold-grad text-primary-foreground"
                    : "text-[var(--vba-text-muted)] hover:text-[var(--vba-text)]"
                }`}
              >
                {l === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </header>

        {/* Membership card */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--vba-border)] bg-gradient-to-br from-primary via-primary to-primary-glow p-5 shadow-[var(--shadow-glow)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--vba-gold-soft)] blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={appIcon}
                alt="ViOne"
                className="h-10 w-10 rounded-lg"
                width={40}
                height={40}
              />
              <div className="leading-tight">
                <div className="text-[11px] font-bold vba-gold-text">HIỆP HỘI DOANH NGHIỆP</div>
                <div className="text-[9px] font-semibold text-[var(--vba-text-muted)]">
                  VIỆT NAM
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-card p-1.5">
              <QrCanvas value={`VBA-MEMBER:${code}`} size={64} />
            </div>
          </div>

          <div className="relative mt-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--vba-gold-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--vba-gold)]">
              {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isCompany ? t("company") : t("individual")}
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-[var(--vba-text-muted)]">
              {t("memberCard")}
            </span>
          </div>

          <div className="relative mt-3 flex items-center gap-3">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={primaryName}
                className="h-12 w-12 shrink-0 rounded-full border border-[var(--vba-border-soft)] object-cover"
                width={48}
                height={48}
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--vba-border-soft)] bg-[var(--vba-gold-soft)] text-[15px] font-bold text-[var(--vba-gold)]">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[19px] font-extrabold text-[var(--vba-text)]">
                  {primaryName}
                </span>
                {member.verified ? (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--vba-gold)]" />
                ) : null}
              </div>
              <div className="text-[12px] text-[var(--vba-text-muted)]">{secondaryName}</div>
            </div>
          </div>

          <div className="relative mt-4 flex justify-between border-t border-[var(--vba-border-soft)] pt-3">
            <div>
              <div className="text-[10px] text-[var(--vba-text-dim)]">{t("code")}</div>
              <div className="text-[13px] font-semibold text-[var(--vba-gold)]">{code}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--vba-text-dim)]">{t("validUntil")}</div>
              <div className="text-[13px] font-semibold text-[var(--vba-gold)]">
                {member.validUntil ?? t("noValue")}
              </div>
            </div>
          </div>
        </div>

        {/* Verified note */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] px-3 py-2.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--vba-gold)]" />
          <p className="text-[12px] leading-snug text-[var(--vba-text-muted)]">{t("authentic")}</p>
        </div>

        {/* Details */}
        <div className="mt-4 vba-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[var(--vba-text)]">
            {isCompany ? (
              <Building2 className="h-4 w-4 text-[var(--vba-gold)]" />
            ) : (
              <User className="h-4 w-4 text-[var(--vba-gold)]" />
            )}
            {t("info")}
          </h2>

          <dl className="divide-y divide-[var(--vba-border-soft)]">
            <Row
              icon={ShieldCheck}
              label={t("status")}
              value={member.status?.trim() || t("noValue")}
            />
            <Row icon={CalendarClock} label={t("joined")} value={member.joinedAt ?? "—"} />
            {rows
              .filter((r) => r.value)
              .map((r) => (
                <Row key={r.label} icon={r.icon} label={r.label} value={r.value!} />
              ))}
          </dl>
        </div>

        <Link
          to="/m"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl vba-gold-grad py-3 text-[13px] font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-[var(--vba-gold)]" />
      <dt className="w-28 shrink-0 text-[12px] text-[var(--vba-text-dim)]">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-right text-[13px] font-medium text-[var(--vba-text)]">
        {value}
      </dd>
    </div>
  );
}
