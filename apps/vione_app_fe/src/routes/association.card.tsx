import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  ReceiptText,
  CalendarPlus,
  UserPen,
  BadgeCheck,
  QrCode,
  IdCard,
  Nfc,
  X,
  Pencil,
  ImagePlus,
  Trash2,
  Wallet,
  ShieldCheck,
  Palette,
  Check,
  CloudOff,
  Handshake,
  BookOpen,
  TrendingUp,
  Gift,
  Award,
  Sparkles,
  Tag,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Copy,
  MessageSquare,
  ExternalLink,
  Crown,
  Facebook,
  Linkedin,
  Camera,
} from "lucide-react";
import heroImg from "@/assets/vba-hero.jpg";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { QrCanvas } from "@/components/member/QrCanvas";
import { Ceo1983BusinessCardVisit } from "@/components/member/Ceo1983BusinessCardVisit";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  type MyMember,
  getMyBenefits,
  type MemberBenefit,
  getActiveAssociationId,
  getMyAssociationBrand,
  type MyAssociationBrand,
} from "@/lib/member-app.functions";
import { getCardSettings, saveCardSettings, type CardSettings } from "@/lib/card.functions";
import { useT, useLang } from "@/lib/i18n";
import {
  resolveTheme,
  resolveState,
  STATE_STYLES,
  CARD_THEME_LIST,
  type CardTheme,
} from "@/lib/card-themes";
import { buildMembershipPass } from "@/lib/membership-pass";
import { walletCapabilities, walletAddUrl } from "@/lib/wallet-provider";
import { getMyIdentityPassFn, type MyIdentityPass } from "@/lib/member-identity.functions";
import { resolveMediaUrl } from "@/lib/api-client";
const appIcon = "/ceo1983-logo.png";
const THEME_KEY = "vba-card-theme";

export const Route = createFileRoute("/association/card")({
  component: CardScreen,
});

type Display = {
  name: string;
  company: string;
  photo: string | null;
  showName: boolean;
  showCompany: boolean;
  showPhoto: boolean;
};

function resolveDisplay(
  member: MyMember | null,
  s: CardSettings | null,
  customProfile?: any,
  customAvatar?: string | null,
  currentUser?: any,
): Display {
  const isGeneric = !member?.name || member.name === "Thành viên mới" || member.name === "Hội viên VIONE" || member.name === "Hội viên CLB CEO 1983";
  const authUserName = currentUser?.name || currentUser?.user_metadata?.full_name;
  const isCustomForUser = customProfile?.userId && currentUser?.id && customProfile.userId === currentUser.id;

  const rawName = (!isGeneric && member?.name)
    ? member.name
    : ((isCustomForUser ? customProfile?.name?.trim() : null) || authUserName || s?.displayName?.trim() || member?.name || "");
  const cleanName = rawName || "Hội viên CLB CEO 1983";

  const rawCompany =
    (member as any)?.companyName ||
    (member as any)?.company ||
    (isCustomForUser ? customProfile?.company?.trim() : null) ||
    s?.displayCompany?.trim();
  const isOldSeed = rawCompany && rawCompany.includes("ViOne Platform");
  const cleanCompany = !rawCompany || isOldSeed ? "CLB Doanh Nhân CEO 1983" : rawCompany;

  return {
    name: cleanName.trim() || "Hội viên CLB CEO 1983",
    company: cleanCompany.trim(),
    photo:
      (member?.avatar ? resolveMediaUrl(member.avatar) || member.avatar : null) ||
      (currentUser as any)?.avatar_url ||
      (isCustomForUser ? customAvatar || customProfile?.avatar : null) ||
      s?.photoUrl ||
      null,
    showName: s?.showName ?? true,
    showCompany: s?.showCompany ?? true,
    showPhoto: s?.showPhoto ?? true,
  };
}

/** vCard text encoded into QR/NFC so it auto-reflects the chosen display info. */
function buildVCard(member: MyMember | null, d: Display): string {
  if (!member) return "";
  const url = typeof window !== "undefined" ? `${window.location.origin}/card/${member.code}` : "";
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (d.showName && d.name) lines.push(`FN:${d.name}`);
  if (d.showCompany && d.company) lines.push(`ORG:${d.company}`);
  if (member.email) lines.push(`EMAIL:${member.email}`);
  if (member.phone) lines.push(`TEL:${member.phone}`);
  if (url) lines.push(`URL:${url}`);
  lines.push(`NOTE:Mã hội viên ${member.code}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

/** Downscale an image file to a small JPEG data URL (max 256px). */
function fileToThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được ảnh"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Ảnh không hợp lệ"));
      img.onload = () => {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Không xử lý được ảnh"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function resolveBenefitIcon(b: MemberBenefit, index: number) {
  const text = `${b.titleVi || ""} ${b.titleEn || ""} ${b.descVi || ""}`.toLowerCase();
  if (text.includes("kết nối") || text.includes("network") || text.includes("giao thương"))
    return Handshake;
  if (
    text.includes("đào tạo") ||
    text.includes("học") ||
    text.includes("training") ||
    text.includes("hội thảo")
  )
    return BookOpen;
  if (
    text.includes("xúc tiến") ||
    text.includes("đầu tư") ||
    text.includes("tăng trưởng") ||
    text.includes("kinh doanh")
  )
    return TrendingUp;
  if (
    text.includes("ưu đãi") ||
    text.includes("giảm") ||
    text.includes("quà") ||
    text.includes("voucher")
  )
    return Gift;
  if (text.includes("thương hiệu") || text.includes("truyền thông") || text.includes("vinh danh"))
    return Award;
  if (text.includes("pháp lý") || text.includes("bảo vệ") || text.includes("tư vấn"))
    return ShieldCheck;
  const fallbackIcons = [Handshake, Gift, TrendingUp, Award, BookOpen, ShieldCheck, Sparkles];
  return fallbackIcons[index % fallbackIcons.length] || Sparkles;
}

function CardScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useAuth();
  const fetchMember = useServerFn(getMyMember);
  const fetchSettings = useServerFn(getCardSettings);
  const fetchBenefits = useServerFn(getMyBenefits);
  const fetchAssocId = useServerFn(getActiveAssociationId);
  const fetchBrand = useServerFn(getMyAssociationBrand);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const { data: brand } = useServerData<MyAssociationBrand | null>(() => fetchBrand(), null);
  const fetchIdentity = useServerFn(getMyIdentityPassFn);
  const { data: identity } = useServerData<MyIdentityPass | null>(() => fetchIdentity(), null);
  const { data: benefits, reload: reloadBenefits } = useServerData<MemberBenefit[]>(
    () => fetchBenefits(),
    [],
  );
  const { data: activeAssocId } = useServerData<string | null>(() => fetchAssocId(), null);

  // Auto-refresh benefits when the active association changes, or when an admin
  // updates the benefits list — but only when the update targets the association
  // currently active for me (events carry an associationId in their detail).
  useEffect(() => {
    const onBenefitsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ associationId?: string | null }>).detail;
      const targetId = detail?.associationId ?? null;
      // No key on the event → reload to stay safe; otherwise match my active one.
      if (!targetId || !activeAssocId || targetId === activeAssocId) reloadBenefits();
    };
    const onAssocChange = () => reloadBenefits();
    window.addEventListener("association-changed", onAssocChange);
    window.addEventListener("benefits-updated", onBenefitsUpdated);
    return () => {
      window.removeEventListener("association-changed", onAssocChange);
      window.removeEventListener("benefits-updated", onBenefitsUpdated);
    };
  }, [reloadBenefits, activeAssocId]);

  // Refetch benefits when the PWA returns to the foreground so data stays fresh.
  useEffect(() => {
    const onForeground = () => {
      if (document.visibilityState === "visible") reloadBenefits();
    };
    document.addEventListener("visibilitychange", onForeground);
    window.addEventListener("focus", onForeground);
    return () => {
      document.removeEventListener("visibilitychange", onForeground);
      window.removeEventListener("focus", onForeground);
    };
  }, [reloadBenefits]);

  // Offline support: keep the latest fetched benefits in localStorage per
  // association, and re-sync as soon as the network comes back online.
  const cacheKey = `member-benefits:${activeAssocId ?? "default"}`;
  const [cachedBenefits, setCachedBenefits] = useState<MemberBenefit[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) setCachedBenefits(JSON.parse(raw));
    } catch {
      /* ignore corrupt cache */
    }
  }, [cacheKey]);

  useEffect(() => {
    if (benefits && benefits.length > 0) {
      setCachedBenefits(benefits);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(benefits));
      } catch {
        /* ignore quota errors */
      }
    }
  }, [benefits, cacheKey]);

  useEffect(() => {
    const onOnline = () => reloadBenefits();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [reloadBenefits]);

  // Show live data when available, otherwise fall back to the cached copy.
  const displayBenefits = benefits && benefits.length > 0 ? benefits : cachedBenefits;
  const { data: settings, reload: reloadSettings } = useServerData<CardSettings | null>(
    () => fetchSettings(),
    null,
  );

  const [qrOpen, setQrOpen] = useState(false);
  const [cardDisplayType, setCardDisplayType] = useState<"business_card" | "membership_card">("business_card");
  const [editOpen, setEditOpen] = useState(false);
  const [memberQrModalOpen, setMemberQrModalOpen] = useState(false);
  const [nfcBusy, setNfcBusy] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persisted per-user theme preference (client-only).
  useEffect(() => {
    try {
      setThemeId(localStorage.getItem(THEME_KEY));
    } catch {
      /* ignore */
    }
  }, []);
  function pickTheme(id: string) {
    setThemeId(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      /* ignore */
    }
    setThemeOpen(false);
  }

  // Offline awareness + last successful data sync timestamp.
  useEffect(() => {
    if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    if (member) setLastSync(Date.now());
  }, [member]);

  const [customProfile, setCustomProfile] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
    } catch {
      return null;
    }
  });
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vba_member_avatar_photo");
  });
  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vba_member_cover_photo");
  });

  useEffect(() => {
    if (!coverPhoto && (member?.coverUrl || (member as any)?.cover_url)) {
      setCoverPhoto(member?.coverUrl || (member as any)?.cover_url);
    }
  }, [member?.coverUrl, (member as any)?.cover_url]);

  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        setCustomProfile(JSON.parse(localStorage.getItem("vba_custom_profile") || "null"));
        setCustomAvatar(localStorage.getItem("vba_member_avatar_photo"));
      } catch {}
    };
    const handleCoverUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setCoverPhoto(detailUrl);
        } else {
          setCoverPhoto(localStorage.getItem("vba_member_cover_photo"));
        }
      } catch {}
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!member?.code) return;
    navigator.clipboard.writeText(member.code);
    setCopiedCode(true);
    toast.success(lang === "en" ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const d = resolveDisplay(member, settings, customProfile, customAvatar, user);
  const vcard = buildVCard(member, d);
  const originForQr = typeof window !== "undefined" ? window.location.origin : "";
  // Prefer the server-signed, short-lived QR token. Fall back to the code-based
  // verify URL (still resolved server-side by verifyMemberPassFn), then vCard.
  const qrValue = identity?.qrToken
    ? `${originForQr}/verify?t=${encodeURIComponent(identity.qrToken)}`
    : member
      ? `${originForQr}/verify?code=${encodeURIComponent(member.code)}`
      : vcard;

  const theme: CardTheme = resolveTheme(themeId, brand?.brandPrimary ?? null);
  const state = resolveState(member?.status, member?.validUntil ?? null);
  const stateStyle = STATE_STYLES[state];
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pass = member
    ? buildMembershipPass({
        memberCode: member.code,
        memberName: d.name || member.name,
        organization: d.company || member.title,
        associationName: brand?.name ?? null,
        associationLogoUrl: brand?.logoUrl ?? null,
        membershipLevel: member.type === "company" ? "Doanh nghiệp" : "Cá nhân",
        state,
        issuedAt: member.joinedAt,
        expiresAt: member.validUntil,
        themeId: theme.id,
        brandPrimary: brand?.brandPrimary ?? null,
        origin,
        photoUrl: d.photo,
      })
    : null;
  const wallets = walletCapabilities();

  const actions = [
    { label: t("m.card.actionBenefits"), icon: Heart, to: "/association/perks" as const },
    { label: t("m.card.actionHistory"), icon: ReceiptText, to: "/association/history" as const },
    { label: t("m.card.actionRenew"), icon: CalendarPlus, to: "/association/renew" as const },
  ];

  async function shareNfc() {
    if (!member) return;
    if (typeof window === "undefined") {
      toast.error(t("m.card.nfcNotSupported"));
      return;
    }
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      Boolean(
        (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor,
      );
    if (!window.isSecureContext && !isLocal) {
      toast.error("Ghi NFC yêu cầu kết nối HTTPS bảo mật hoặc ứng dụng di động ViOne.");
      return;
    }
    const NDEFReader = (window as any).NDEFReader;
    if (!NDEFReader || typeof NDEFReader !== "function") {
      toast.error("Trình duyệt chưa hỗ trợ Web NFC. Vui lòng mở bằng Google Chrome trên Android.");
      return;
    }
    try {
      setNfcBusy(true);
      toast.info("Đang chờ chạm thẻ... Hãy áp thẻ NFC vào giữa mặt lưng điện thoại.");

      const ndef = new NDEFReader();
      await ndef.write({
        records: [
          { recordType: "url", data: `${window.location.origin}/card/${member.code}` },
          { recordType: "text", data: vcard },
        ],
      });
      toast.success(t("m.card.nfcWriteSuccess"));
    } catch (e: any) {
      if (e?.name === "NotAllowedError" || e?.message?.includes("not allowed")) {
        toast.error("Quyền ghi NFC bị từ chối trong trình duyệt.");
      } else {
        toast.error(
          e instanceof Error
            ? t("m.card.nfcWriteError", { msg: e.message })
            : t("m.card.nfcWriteErrorGeneric"),
        );
      }
    } finally {
      setNfcBusy(false);
    }
  }

  const [copiedLink, setCopiedLink] = useState(false);
  const handleShareProfile = async () => {
    if (!member) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/card/${member.code}` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ Hội viên CEO 1983 - ${d.name || member.name}`,
          text: `Danh thiếp & Hồ sơ Doanh nhân ${d.name || member.name} - ${d.company || member.title}`,
          url,
        });
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết danh thiếp & hồ sơ!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="vba-animate">
      <MemberHeader title={t("m.card.headerTitle")} back />

      <div className="px-4 pt-4">
        {/* Đã gỡ bỏ nút Thẻ của tôi & Quét QR kết nối theo yêu cầu */}

        {/* Card Type Switcher: Card Visit CEO 1983 vs Thẻ VIP Kim Loại */}
        <div className="mx-auto mb-4 flex max-w-md items-center justify-center p-1 rounded-xl bg-slate-100 dark:bg-[#14223E] border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCardDisplayType("business_card")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              cardDisplayType === "business_card"
                ? "bg-[#19194D] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-[#19194D]"
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Card Visit CEO 1983</span>
          </button>
          <button
            type="button"
            onClick={() => setCardDisplayType("membership_card")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              cardDisplayType === "membership_card"
                ? "bg-[#2E3192] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-[#2E3192]"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Thẻ VIP Kim Loại</span>
          </button>
        </div>

        {cardDisplayType === "business_card" ? (
          <div className="mb-4">
            <Ceo1983BusinessCardVisit
              name={d.name || "NGUYỄN VĂN A"}
              title={customProfile?.title || (member as any)?.position || (member as any)?.title || "Director"}
              phone={customProfile?.phone || member?.phone || "036xxxxxxx"}
              email={customProfile?.email || member?.email || "username@gmail.com"}
              company={d.company || "CÂU LẠC BỘ CEO1983"}
              website="https://ceo1983club.com"
              clubEmail="info@ceo1983club.com"
              cardCode={member?.code || "CEO1983-001"}
              qrValue={member?.code ? `${origin}/card/${member.code}` : "https://ceo1983club.com"}
              avatarUrl={d.photo}
              showActions={true}
            />
          </div>
        ) : (
          <>
            {/* Membership card */}
            <div
              data-dark-card="true"
              className="vba-member-card relative mx-auto max-w-md overflow-hidden rounded-2xl border p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] text-white"
              style={{ background: theme.surface, borderColor: theme.border }}
            >
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
                style={{ background: theme.accentSoft }}
              />
              {theme.shine && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.14) 48%,transparent 62%)",
                    backgroundSize: "250% 250%",
                    animation: "vba-shine 5s ease-in-out infinite",
                  }}
                />
              )}

              <button
                onClick={() => setThemeOpen((v) => !v)}
                className="absolute right-12 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/90 hover:text-white backdrop-blur transition cursor-pointer"
                aria-label={lang === "en" ? "Change card theme" : "Đổi giao diện thẻ"}
              >
                <Palette className="h-4 w-4" />
              </button>
              <button
                onClick={() => member && setEditOpen(true)}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/90 hover:text-white backdrop-blur transition cursor-pointer"
                aria-label={t("m.card.editAriaLabel")}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 backdrop-blur-xs">
                    <img
                      src="/ceo1983-emblem-8.png"
                      alt="Biểu tượng số 8 CEO 1983"
                      className="h-full w-auto object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.3)]"
                      width={36}
                      height={44}
                    />
                  </div>
                  <div className="leading-tight min-w-0 flex-1">
                    <div
                      data-card-white
                      className="break-words text-[12px] font-black tracking-wide drop-shadow-sm text-white leading-tight"
                      style={{ color: "#FFFFFF" }}
                    >
                      {brand?.name || "CLB DOANH NHÂN CEO 1983"}
                    </div>
                    <div
                      data-card-white
                      className="break-words text-[9px] font-semibold drop-shadow-xs text-white/80 leading-tight mt-0.5"
                      style={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      {brand?.tagline || "NÂNG TẦM GIÁ TRỊ • TIÊN PHONG KẾT NỐI"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5">
                <div
                  className="text-[17px] font-black tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 35%, #94A3B8 50%, #FFFFFF 70%, #CBD5E1 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))",
                  }}
                >
                  {t("m.card.cardLabel")}
                </div>
                <div
                  data-card-white
                  className="text-[10px] font-semibold tracking-[0.2em] text-white/70"
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  MEMBER CARD
                </div>
              </div>

              <div className="relative mt-5 flex items-center gap-3">
                {d.showPhoto &&
                  (d.photo ? (
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="h-12 w-12 rounded-full border border-white/20 object-cover shadow-sm shrink-0"
                    />
                  ) : (
                    <span
                      data-card-white
                      className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-[14px] font-bold text-white border border-white/20 shadow-sm shrink-0"
                      style={{ color: "#FFFFFF" }}
                    >
                      {initials(d.name)}
                    </span>
                  ))}
                <div className="min-w-0 flex-1">
                  {d.showName && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="break-words text-[17px] font-black tracking-wide leading-snug"
                        style={{
                          background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 35%, #94A3B8 50%, #FFFFFF 70%, #CBD5E1 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))",
                        }}
                      >
                        {d.name || "..."}
                      </span>
                      {member?.status && (
                        <span
                          data-card-white
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                          style={{
                            background: stateStyle.bg,
                            color: stateStyle.color,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          {lang === "en" ? stateStyle.labelEn : stateStyle.labelVi}
                        </span>
                      )}
                    </div>
                  )}
                  {d.showCompany && (
                    <div
                      data-card-white
                      className="break-words text-[12px] font-medium text-white/90 drop-shadow-xs leading-snug mt-0.5"
                      style={{ color: "rgba(255, 255, 255, 0.95)" }}
                    >
                      {d.company || "CLB Doanh Nhân CEO 1983"}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative mt-4 flex justify-between border-t border-white/15 pt-3">
                <div>
                  <div
                    data-card-white
                    className="text-[10px] font-medium text-white/60"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {t("m.card.memberId")}
                  </div>
                  <div
                    data-card-white
                    className="text-[13px] font-bold tracking-wider text-white"
                    style={{ color: "#FFFFFF" }}
                  >
                    {member?.code}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    data-card-white
                    className="text-[10px] font-medium text-white/60"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {t("m.card.validUntil")}
                  </div>
                  <div
                    data-card-white
                    className="text-[13px] font-bold tracking-wider text-white"
                    style={{ color: "#FFFFFF" }}
                  >
                    {member?.validUntil ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme picker */}
            {themeOpen && (
              <div className="mt-3 rounded-2xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] p-3">
                <div className="mb-2 text-[12px] font-semibold text-[var(--vba-text-muted)]">
                  {lang === "en" ? "Card theme" : "Giao diện thẻ"}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {CARD_THEME_LIST.map((th) => {
                    const selected = th.id === theme.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => pickTheme(th.id)}
                        className="relative h-14 overflow-hidden rounded-xl border text-left cursor-pointer"
                        style={{
                          background: th.surface,
                          borderColor: selected ? th.accent : "transparent",
                        }}
                        aria-label={th.label}
                      >
                        <span
                          className="absolute bottom-1 left-1.5 text-[9px] font-semibold"
                          style={{ color: th.text }}
                        >
                          {th.label}
                        </span>
                        {selected && (
                          <span
                            className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full"
                            style={{ background: th.accent }}
                          >
                            <Check className="h-3 w-3 text-foreground" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Offline / last sync indicator */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--vba-text-dim)]">
          {online ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#2E3192] dark:bg-blue-400" />
              {lang === "en" ? "Synced" : "Đã đồng bộ"}
              {lastSync ? ` · ${new Date(lastSync).toLocaleTimeString()}` : ""}
            </>
          ) : (
            <>
              <CloudOff className="h-3.5 w-3.5" />
              {lang === "en"
                ? "Offline — showing cached card"
                : "Ngoại tuyến — hiển thị thẻ đã lưu"}
            </>
          )}
        </div>

        {/* ── HỒ SƠ HỘI VIÊN CEO 1983 EXECUTIVE (ĐẶT NGAY DƯỚI THẺ HỘI VIÊN, QR TRÊN ẢNH BÌA) ── */}
        {member && (
          <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-md overflow-hidden transition hover:border-amber-500/50">
            {/* Ảnh bìa to rộng (Cover Banner) kèm Mã QR hiện trực tiếp trên ảnh bìa */}
            <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gradient-to-r from-[#19194D] via-[#003B95] to-[#0f4c9c]">
              <img
                src={coverPhoto || heroImg}
                alt="Cover Banner"
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/65" />

              {/* VIP badge on cover banner (bỏ QR ở ảnh bìa theo yêu cầu) */}
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-xs">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  VIP GOLD
                </span>
              </div>
            </div>

            {/* Thân thẻ với Avatar dập viền trắng đè lên ảnh bìa */}
            <div className="px-4 pb-4 pt-0 relative">
              <div className="flex items-end justify-between -mt-9 mb-2.5">
                {/* Avatar tròn to dập viền trắng nổi bật có chấm xanh online */}
                <div className="relative">
                  {d.photo ? (
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="h-18 w-18 shrink-0 rounded-full object-cover ring-3 ring-white dark:ring-[#0F172A] shadow-md bg-slate-100 dark:bg-slate-800"
                    />
                  ) : (
                    <span className="grid h-18 w-18 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-[#003B95] to-[#19194D] text-[20px] font-black text-white ring-3 ring-white dark:ring-[#0F172A] shadow-md">
                      {initials(d.name)}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
                </div>

                {/* Mã hội viên */}
                {member.code && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-amber-400 cursor-pointer transition shadow-xs"
                    title={lang === "en" ? "Copy Member Code" : "Sao chép mã hội viên"}
                  >
                    <span>{member.code}</span>
                    {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                  </button>
                )}
              </div>

              {/* Thông tin hội viên & doanh nghiệp */}
              <div className="space-y-0.5 mb-3">
                <div className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {d.company}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[17px] font-black text-slate-900 dark:text-white">
                    {d.name}
                  </span>
                  <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-[#0284c7] dark:text-sky-400" />
                </div>
                <div className="truncate text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  {customProfile?.title || member.title || (lang === "en" ? "Official Member" : "Ban Quản Trị")}
                </div>
              </div>

              {/* Business Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] rounded-xl bg-slate-50 dark:bg-slate-850/60 p-3 border border-slate-100 dark:border-slate-800 mb-3">
                {(customProfile?.phone || member.phone) && (
                  <a
                    href={`tel:${customProfile?.phone || member.phone}`}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-blue-400 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                    <span className="truncate"><strong>Hotline:</strong> {customProfile?.phone || member.phone}</span>
                  </a>
                )}
                {(customProfile?.email || member.email) && (
                  <a
                    href={`mailto:${customProfile?.email || member.email}`}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-blue-400 transition"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                    <span className="truncate"><strong>Email:</strong> {customProfile?.email || member.email}</span>
                  </a>
                )}
                {(customProfile?.industry || member.industry) && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Tag className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                    <span className="truncate"><strong>Lĩnh vực:</strong> {customProfile?.industry || member.industry}</span>
                  </div>
                )}
                {(customProfile?.address || member.address) && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 sm:col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="truncate"><strong>Địa chỉ:</strong> {customProfile?.address || member.address}</span>
                  </div>
                )}
                {(customProfile?.website || member.website) && (
                  <a
                    href={(customProfile?.website || member.website).startsWith("http") ? (customProfile?.website || member.website) : `https://${customProfile?.website || member.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#003B95] dark:hover:text-blue-400 transition sm:col-span-2"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                    <span className="truncate"><strong>Website:</strong> {customProfile?.website || member.website}</span>
                    <ExternalLink className="h-3 w-3 opacity-60 ml-auto" />
                  </a>
                )}
              </div>

              {/* Social Media Links: Facebook, Zalo, LinkedIn, Web */}
              <div className="flex items-center gap-2 py-2 mb-3 border-y border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Liên kết:</span>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] font-semibold text-[11px] hover:bg-blue-100 transition"
                  title="Facebook cá nhân/doanh nghiệp"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://zalo.me/${(customProfile?.phone || member.phone || "0901000002").replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#0068FF] font-bold text-[11px] hover:bg-sky-100 transition"
                  title="Chat Zalo"
                >
                  <span>Zalo</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0A66C2] font-semibold text-[11px] hover:bg-blue-100 transition"
                  title="LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>

              {/* Direct Profile Actions: Nhắn tin & Chia sẻ hồ sơ (bỏ Mã QR ở profile) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link
                  to="/association/messages"
                  search={{ peerCode: member.code }}
                  style={{ color: "#ffffff" }}
                  className="flex items-center justify-center gap-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[11.5px] font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Nhắn tin</span>
                </Link>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="flex items-center justify-center gap-1 rounded-xl border border-[#003B95]/25 bg-blue-50/60 dark:bg-slate-800/80 hover:bg-blue-100/60 py-2.5 text-[11.5px] font-bold text-[#003B95] dark:text-blue-400 transition active:scale-95 cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Đã chép" : "Chia sẻ hồ sơ"}</span>
                </button>
              </div>

              {/* TIỆN ÍCH THẺ SỐ & XÁC THỰC: NFC, GOOGLE/APPLE WALLETS, XÁC THỰC CÔNG KHAI */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Tiện ích Thẻ số & Ví di động</span>
                  <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Đã xác thực
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Chạm NFC */}
                  <button
                    onClick={shareNfc}
                    disabled={!member || nfcBusy}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#003B95]/30 bg-blue-50/50 dark:bg-slate-800/80 py-2.5 text-[12px] font-bold text-[#003B95] dark:text-blue-300 shadow-xs hover:bg-blue-100/60 transition cursor-pointer"
                  >
                    <Nfc className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                    <span>{nfcBusy ? "Đang ghi..." : "Chạm thẻ NFC"}</span>
                  </button>

                  {/* Trang xác thực công khai */}
                  {pass && (
                    <a
                      href={pass.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40 py-2.5 text-[12px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100/60 transition cursor-pointer text-center"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">Xác thực công khai</span>
                    </a>
                  )}
                </div>

                {/* Ví Apple Wallet & Google Wallet */}
                <div className="grid grid-cols-2 gap-2">
                  {wallets.map((w) => {
                    const serverAvailable =
                      w.id === "apple"
                        ? Boolean(identity?.walletAppleAvailable)
                        : Boolean(identity?.walletGoogleAvailable);
                    const url = serverAvailable && pass ? walletAddUrl(w.id, pass) : null;
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          if (url) window.open(url, "_blank");
                          else
                            toast.info(
                              lang === "en"
                                ? `${w.label} is not configured on the server`
                                : `${w.label} chưa được cấu hình trên máy chủ`,
                            );
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 py-2 text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:border-[#003B95]/40 transition cursor-pointer"
                      >
                        <Wallet className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                        <span>{w.label}</span>
                        {!serverAvailable && (
                          <span className="text-[9.5px] text-slate-400">(tắt)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions - 3 nút chuẩn CEO (Bỏ nút cập nhật bị thừa) */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {actions.map((a: any) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.to} className="flex flex-col items-center gap-2 group">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#2E3192]/15 text-[#2E3192] dark:text-blue-400 shadow-xs transition-transform group-hover:scale-105 group-hover:border-[#2E3192]/50">
                  <Icon className="h-6 w-6 stroke-[2]" />
                </span>
                <span className="text-center text-[10.5px] font-semibold leading-tight text-slate-700 dark:text-slate-300 group-hover:text-[#2E3192]">
                  {a.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Full-screen QR modal - rendered via Portal directly into document.body to ensure 100% viewport centering */}
      {qrOpen && member && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          style={{ minHeight: "100dvh" }}
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative mx-auto w-full max-w-[320px] rounded-3xl border border-slate-700/60 bg-slate-900/95 p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrOpen(false)}
              className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-300 hover:text-white transition"
              aria-label={t("m.card.closeAriaLabel")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 text-[13px] font-bold text-blue-400">
              {t("m.card.qrScanPrompt")}
            </div>
            <div className="mx-auto w-fit rounded-2xl bg-white p-3.5 shadow-lg">
              <QrCanvas value={qrValue} size={220} />
            </div>
            {d.showName && (
              <div className="mt-4 text-[15px] font-bold text-white">{d.name}</div>
            )}
            <div className="text-[13px] font-semibold text-blue-400">{member.code}</div>
            {identity?.hasPass && (
              <div className="mt-3 space-y-1 border-t border-slate-700/60 pt-3 text-[11px] text-slate-300">
                <div>
                  Serial:{" "}
                  <span className="font-semibold text-white">{identity.serial}</span>
                </div>
                <div>
                  {lang === "en" ? "Status" : "Trạng thái"}:{" "}
                  <span className="font-semibold text-emerald-400">
                    {identity.effectiveStatus}
                  </span>
                  {" · v"}
                  {identity.cardVersion}
                </div>
                {identity.expiresAt && (
                  <div>
                    {lang === "en" ? "Valid until" : "Hiệu lực đến"}:{" "}
                    <span className="font-semibold text-white">
                      {new Date(identity.expiresAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {identity.qrToken && (
                  <div className="text-[10px] text-slate-400">
                    {lang === "en"
                      ? "Signed QR · refreshes each open"
                      : "QR ký số · làm mới mỗi lần mở"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Edit display modal */}
      {editOpen && member && (
        <EditCardModal
          member={member}
          current={d}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            reloadSettings();
          }}
        />
      )}

      {/* ── MODAL MÃ QR HỘI VIÊN & QUÉT QR (DUAL TAB) ── */}
      <AssociationMemberQrModal
        open={memberQrModalOpen}
        onClose={() => setMemberQrModalOpen(false)}
        memberCode={member?.code || "M1983-002"}
        memberName={d.name || "Hội viên CEO 1983"}
        memberTitle={customProfile?.title || member?.title || "Ban Quản Trị"}
        memberCompany={d.company || "CLB Doanh Nhân CEO 1983"}
        memberAvatar={d.photo || null}
      />
    </div>
  );
}

function EditCardModal({
  member,
  current,
  onClose,
  onSaved,
}: {
  member: MyMember;
  current: Display;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const save = useServerFn(saveCardSettings);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(current.name);
  const [company, setCompany] = useState(current.company);
  const [photo, setPhoto] = useState<string | null>(current.photo);
  const [showName, setShowName] = useState(current.showName);
  const [showCompany, setShowCompany] = useState(current.showCompany);
  const [showPhoto, setShowPhoto] = useState(current.showPhoto);
  const [busy, setBusy] = useState(false);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const thumb = await fileToThumbnail(file);
      setPhoto(thumb);
      setShowPhoto(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("m.card.photoLoadError"));
    }
  }

  async function submit() {
    setBusy(true);
    try {
      await save({
        data: {
          displayName: name.trim() || null,
          displayCompany: company.trim() || null,
          photoUrl: photo,
          showName,
          showCompany,
          showPhoto,
        },
      });
      toast.success(t("m.card.saveSuccess"));
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("m.card.saveError"));
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-xl border border-amber-400/60 dark:border-amber-700 bg-white dark:bg-slate-800 px-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-[var(--vba-border)] bg-[var(--vba-surface)] p-5 sm:rounded-3xl max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[var(--vba-surface-2)] text-[var(--vba-text-muted)]"
          aria-label={t("m.card.closeAriaLabel")}
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-4 text-[15px] font-bold text-[var(--vba-text)]">
          {t("m.card.editTitle")}
        </h2>

        {/* Photo */}
        <div className="mb-4 flex items-center gap-3">
          {photo ? (
            <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 dark:bg-[#2E3192]/15 text-[16px] font-bold text-[#2E3192] dark:text-blue-400 border border-[#2E3192]/20">
              {initials(name || member.name)}
            </span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] px-3 py-2 text-[12px] font-semibold text-[var(--vba-text)] hover:border-[#2E3192]/50"
            >
              <ImagePlus className="h-4 w-4 text-[#2E3192] dark:text-blue-400" /> {t("m.card.pickPhoto")}
            </button>
            {photo && (
              <button
                onClick={() => setPhoto(null)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] px-3 py-2 text-[12px] font-semibold text-[var(--vba-danger)]"
              >
                <Trash2 className="h-4 w-4" /> {t("m.card.deletePhoto")}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickPhoto}
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[var(--vba-text-muted)]">
              {t("m.card.displayName")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={member.name}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[var(--vba-text-muted)]">
              {t("m.card.displayCompany")}
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={member.title}
              className={inputCls}
            />
          </div>
        </div>

        {/* Visibility toggles */}
        <div className="mt-4 space-y-1">
          <Toggle label={t("m.card.showName")} checked={showName} onChange={setShowName} />
          <Toggle label={t("m.card.showCompany")} checked={showCompany} onChange={setShowCompany} />
          <Toggle label={t("m.card.showPhoto")} checked={showPhoto} onChange={setShowPhoto} />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--vba-border-soft)] py-2.5 text-[14px] font-semibold text-[var(--vba-text)]"
          >
            {t("m.card.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={busy}
            style={{ color: "#ffffff" }}
            className="flex-1 rounded-xl bg-[#2E3192] hover:bg-[#19194D] py-2.5 text-[14px] font-bold text-white shadow-md shadow-[#2E3192]/25 disabled:opacity-60 transition cursor-pointer"
          >
            {busy ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg px-1 py-2"
    >
      <span className="text-[13px] text-[var(--vba-text)]">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-[#2E3192]" : "bg-[var(--vba-surface-2)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
