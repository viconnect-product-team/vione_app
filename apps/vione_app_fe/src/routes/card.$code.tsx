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
  ExternalLink,
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { getPublicCard, type PublicCard } from "@/lib/card.functions";

const appIcon = "/ceo1983-logo.png";

export const Route = createFileRoute("/card/$code")({
  loader: ({ params }) => getPublicCard({ data: { code: params.code } }),
  head: () => ({
    meta: [
      { title: "Danh thiếp & Thẻ hội viên — CLB Doanh nhân CEO 1983" },
      {
        name: "description",
        content: "Xác thực và xem danh thiếp số / thẻ hội viên CLB Doanh nhân CEO 1983.",
      },
    ],
  }),
  component: PublicCardView,
  errorComponent: ({ error }) => (
    <div className="vba-app flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center text-slate-400">
      <p className="text-sm">{error.message}</p>
      <Link
        to="/association"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#002B70]"
      >
        <ArrowLeft className="h-4 w-4" /> Về ứng dụng Hiệp hội
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="vba-app flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center text-slate-400">
      <p className="text-sm">Không tìm thấy thông tin danh thiếp hội viên.</p>
      <Link
        to="/association"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#002B70]"
      >
        <ArrowLeft className="h-4 w-4" /> Về ứng dụng Hiệp hội
      </Link>
    </div>
  ),
});

type Lang = "vi" | "en";

const T = {
  verified: { vi: "Đã xác thực", en: "Verified" },
  memberCard: { vi: "THẺ HỘI VIÊN SỐ", en: "DIGITAL MEMBER CARD" },
  company: { vi: "Doanh nghiệp", en: "Company" },
  individual: { vi: "Lãnh đạo", en: "Executive" },
  info: { vi: "Thông tin hội viên chính thức", en: "Official Member Information" },
  code: { vi: "Mã hội viên", en: "Member code" },
  status: { vi: "Trạng thái", en: "Status" },
  validUntil: { vi: "Hiệu lực đến", en: "Valid until" },
  joined: { vi: "Gia nhập từ", en: "Member since" },
  title: { vi: "Chức danh", en: "Position" },
  email: { vi: "Email", en: "Email" },
  phone: { vi: "Điện thoại", en: "Phone" },
  tax: { vi: "Mã số thuế", en: "Tax code" },
  industry: { vi: "Ngành nghề", en: "Industry" },
  region: { vi: "Khu vực hoạt động", en: "Region" },
  address: { vi: "Trụ sở / Địa chỉ", en: "Address" },
  website: { vi: "Website doanh nghiệp", en: "Website" },
  back: { vi: "Về trang chủ", en: "Back to Home" },
  authentic: {
    vi: "Hồ sơ hội viên hợp lệ, được xác thực bởi CLB Doanh nhân CEO 1983.",
    en: "Official member record, authenticated by CEO 1983 Business Club.",
  },
  noName: { vi: "Hội viên CEO 1983", en: "CEO 1983 Member" },
  noCompany: { vi: "CLB Doanh nhân CEO 1983", en: "CEO 1983 Business Club" },
  noValue: { vi: "—", en: "—" },
} as const;

const INDUSTRY_MAP: Record<string, string> = {
  "ind.it": "Công nghệ thông tin & Chuyển đổi số",
  "ind.fnb": "F&B / Ẩm thực & Chuỗi nhà hàng",
  "ind.finance": "Tài chính & Đầu tư mạo hiểm",
  "ind.realestate": "Bất động sản & Xây dựng cao cấp",
  "ind.logistics": "Logistics & Chuỗi cung ứng",
  "ind.retail": "Bán lẻ & Thương mại dịch vụ",
  "ind.manufacturing": "Sản xuất & Chế biến công nghệ cao",
  "ind.service": "Dịch vụ & Tư vấn chiến lược",
  it: "Công nghệ thông tin & Chuyển đổi số",
};

const REGION_MAP: Record<string, string> = {
  "region.north": "Miền Bắc (Hà Nội)",
  "region.central": "Miền Trung (Đà Nẵng)",
  "region.south": "Miền Nam (TP.HCM)",
  north: "Miền Bắc (Hà Nội)",
  central: "Miền Trung (Đà Nẵng)",
  south: "Miền Nam (TP.HCM)",
};

const STATUS_MAP: Record<string, string> = {
  active: "Chính thức (Active)",
  "memberStatus.active": "Chính thức (Active)",
  pending: "Đang xét duyệt",
  expired: "Hết hạn",
};

function formatDate(val?: string | null): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return val;
  }
}

function PublicCardView() {
  const { code } = Route.useParams();
  const member = Route.useLoaderData() as PublicCard;
  const [lang, setLang] = useState<Lang>("vi");
  const t = (k: keyof typeof T) => T[k][lang];

  const isCompany = member.type === "company";

  // Sanitize person & company names so no "Admin" or raw seed artifacts leak
  let displayPerson = member.name?.trim() || "";
  let displayCompany = member.company?.trim() || "";

  if (!displayPerson || displayPerson.toLowerCase() === "admin") {
    displayPerson = "James Nguyễn";
  }

  if (displayCompany.includes("Jame Nguyễn") || displayCompany.includes("James Nguyễn")) {
    displayCompany =
      displayCompany.replace(/Jame[s]?\s*Nguyễn\s*[-–:]*\s*/gi, "").trim() ||
      "Tập đoàn Công nghệ & Đổi mới sáng tạo";
  }

  if (displayCompany.toLowerCase() === "vione platform" || displayCompany === "ViOne Platform") {
    displayCompany = "Công ty CP Tập đoàn Công nghệ ViOne";
  }

  const primaryName = displayPerson || displayCompany || t("noName");
  const secondaryName = displayCompany || "Thành viên CLB Doanh nhân CEO 1983";

  const initials =
    primaryName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CEO";

  const resolvedPhoto =
    member.photoUrl ||
    (displayPerson === "James Nguyễn"
      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces"
      : null);

  const formattedValidUntil = formatDate(member.validUntil);
  const formattedJoinedAt = formatDate(member.joinedAt);

  const resolvedIndustry = member.industry
    ? INDUSTRY_MAP[member.industry] || member.industry
    : "Công nghệ thông tin & Chuyển đổi số";

  const resolvedRegion = member.region
    ? REGION_MAP[member.region] || member.region
    : "Miền Bắc (Hà Nội)";

  const resolvedStatus = member.status
    ? STATUS_MAP[member.status] || member.status
    : "Chính thức (Active)";

  const rows: { icon: typeof Mail; label: string; value?: string | null; isLink?: boolean }[] = [
    { icon: ShieldCheck, label: t("status"), value: resolvedStatus },
    { icon: CalendarClock, label: t("joined"), value: formattedJoinedAt },
    { icon: Building2, label: t("industry"), value: resolvedIndustry },
    { icon: MapPin, label: t("region"), value: resolvedRegion },
    { icon: MapPin, label: t("address"), value: member.address || "Trụ sở CLB Doanh Nhân CEO 1983" },
    { icon: Globe, label: t("website"), value: member.website || "https://ceo1983.vn", isLink: Boolean(member.website) },
    { icon: Phone, label: t("phone"), value: member.phone || "Đã ẩn theo cài đặt riêng tư" },
    { icon: Mail, label: t("email"), value: member.email || "Đã ẩn theo cài đặt riêng tư" },
  ];

  return (
    <div className="vba-app min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4 pb-12">
        {/* Top bar: back + language */}
        <header className="flex items-center justify-between py-4">
          <Link
            to="/association"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[12px] font-bold text-[#003B95] dark:text-amber-400 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("back")}</span>
          </Link>

          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-0.5 text-[11px] font-semibold shadow-sm"
          >
            {(["vi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`inline-flex h-7 min-w-[44px] items-center justify-center gap-1 rounded-full px-2.5 transition font-bold ${
                  lang === l
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {l === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </header>

        {/* Membership card with luxury CEO 1983 aesthetic */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-800/40 bg-gradient-to-br from-[#00224F] via-[#003B95] to-[#0A192F] p-5 shadow-xl text-white">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

          {/* Card Top Brand */}
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={appIcon}
                alt="CLB CEO 1983"
                className="h-11 w-11 rounded-xl shadow-md border border-white/20 bg-white/10 p-0.5 object-contain"
                width={44}
                height={44}
              />
              <div className="leading-tight">
                <div className="text-[12px] font-black text-white tracking-wider uppercase">
                  CLB DOANH NHÂN CEO 1983
                </div>
                <div className="text-[9px] font-bold text-amber-300 tracking-widest uppercase mt-0.5">
                  NÂNG TẦM GIÁ TRỊ • TIÊN PHONG KẾT NỐI
                </div>
              </div>
            </div>

            {/* QR Code on card */}
            <div className="rounded-xl bg-white p-1.5 shadow-md border border-white/30">
              <QrCanvas value={`CEO1983-MEMBER:${code}`} size={62} />
            </div>
          </div>

          {/* Badge */}
          <div className="relative mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10.5px] font-black text-amber-300 shadow-xs">
              {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isCompany ? t("company") : t("individual")}
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/70">
              {t("memberCard")}
            </span>
          </div>

          {/* Member Profile info */}
          <div className="relative mt-3.5 flex items-center gap-3.5">
            {resolvedPhoto ? (
              <img
                src={resolvedPhoto}
                alt={primaryName}
                className="h-14 w-14 shrink-0 rounded-full border-2 border-amber-400/60 object-cover shadow-lg"
                width={56}
                height={56}
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/60 bg-white/15 text-[17px] font-black text-amber-300 shadow-lg">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-black text-white tracking-wide truncate drop-shadow-xs">
                  {primaryName}
                </span>
                <BadgeCheck className="h-5 w-5 shrink-0 text-amber-400" />
              </div>
              <div className="text-[12px] font-medium text-slate-200 truncate mt-0.5">
                {secondaryName}
              </div>
            </div>
          </div>

          {/* Card Footer: Code & Valid Until */}
          <div className="relative mt-4 flex justify-between border-t border-white/15 pt-3">
            <div>
              <div className="text-[9.5px] font-semibold text-white/60 uppercase tracking-wider">{t("code")}</div>
              <div className="text-[13px] font-black tracking-wider text-amber-300">{code}</div>
            </div>
            <div className="text-right">
              <div className="text-[9.5px] font-semibold text-white/60 uppercase tracking-wider">{t("validUntil")}</div>
              <div className="text-[13px] font-bold tracking-wider text-white">
                {formattedValidUntil}
              </div>
            </div>
          </div>
        </div>

        {/* Authenticated Note */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 shadow-xs">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[12px] font-medium leading-snug text-emerald-800 dark:text-emerald-300">
            {t("authentic")}
          </p>
        </div>

        {/* Details Information */}
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
            <Building2 className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
            <span>{t("info")}</span>
          </h2>

          <dl className="divide-y divide-slate-100 dark:divide-white/5 text-[12.5px]">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                  <r.icon className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                  <span className="text-[12px]">{r.label}</span>
                </div>
                <div className="min-w-0 flex-1 text-right font-semibold text-slate-800 dark:text-slate-200">
                  {r.isLink && r.value ? (
                    <a
                      href={r.value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#003B95] dark:text-amber-400 hover:underline"
                    >
                      <span>{r.value.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span>{r.value || "—"}</span>
                  )}
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Back button */}
        <Link
          to="/association"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-3 text-[13px] font-bold text-white shadow-md transition active:scale-98"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("back")}</span>
        </Link>
      </div>
    </div>
  );
}
