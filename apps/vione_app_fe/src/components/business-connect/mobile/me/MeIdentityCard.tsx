// BC-Mobile — "Tôi" Digital Identity hero (presentation only).
//
// Executive Minimal Luxury: name · title · company · một câu định vị · chân
// dung lớn · hai CTA chính (QR / NFC) · lối vào hồ sơ. KHÔNG hiển thị toàn bộ
// thông tin liên hệ ở đây — các kênh liên hệ nằm ở panel "Liên hệ nhanh".
// Mọi trường đều lấy từ BusinessIdentity DTO đã tải; thiếu thì không render.

import { useEffect, useState } from "react";
import { ChevronRight, Nfc, QrCode } from "lucide-react";
import { useT } from "@/lib/i18n";
import { NEST_API_URL } from "@/lib/api-client";
import type { BusinessIdentity } from "@/lib/business-connect/mobile/identity.types";

function initialsOf(name: string | null, emailFallback: string | null): string {
  const source = (name ?? "").trim() || (emailFallback ?? "");
  const parts = source.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return "…";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MeIdentityCard({
  identity,
  email,
  onQr,
  onNfc,
  onViewProfile,
  busy,
}: {
  identity: BusinessIdentity | null;
  email: string | null;
  onQr: () => void;
  onNfc: () => void;
  onViewProfile: () => void;
  busy?: boolean;
}) {
  const t = useT();
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), [identity?.avatarUrl]);
  const displayName = identity?.displayName?.trim() || email || t("bc.mobile.me.emptyName");
  const positioning = identity?.headline?.trim() || null;

  return (
    <section
      aria-labelledby="me-identity-card-title"
      className="relative overflow-hidden rounded-2xl border border-[#D8B282]/20 bg-[linear-gradient(150deg,rgba(20,32,50,0.3)_0%,rgba(12,21,34,0.15)_50%,rgba(6,13,22,0.3)_100%)] backdrop-blur-md p-5 transition-all hover:border-[#D8B282]/40"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 right-4 select-none font-serif text-[80px] font-semibold leading-none text-[#D8B282]/10"
      >
        V
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] bg-clip-text text-transparent bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)]">
          {t("bc.mobile.me.showcase.badge")}
        </p>
        <p className="text-right text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] bg-clip-text text-transparent bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)]">
          ViOne
          <span className="block text-[8.5px] tracking-[0.24em] text-[#D4C3A3]">
            BUSINESS CONNECT
          </span>
        </p>
      </div>

      <div className="relative mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1
            id="me-identity-card-title"
            className="break-words text-[23px] font-semibold leading-tight tracking-tight text-white"
          >
            {displayName}
          </h1>
          {identity?.jobTitle && (
            <p className="mt-1 break-words text-[15px] font-semibold bg-clip-text text-transparent bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)]">
              {identity.jobTitle}
            </p>
          )}
          {identity?.companyName && (
            <p className="mt-0.5 break-words text-[14.5px] text-[#D4C3A3]">
              {identity.companyName}
            </p>
          )}
          {positioning && (
            <p className="mt-3 line-clamp-3 break-words text-[13.5px] leading-relaxed text-[#D4C3A3]">
              {positioning}
            </p>
          )}
        </div>
        {identity?.avatarUrl && !avatarFailed ? (
          <img
            src={
              identity.avatarUrl.startsWith("/upload/")
                ? `${NEST_API_URL}/api${identity.avatarUrl}`
                : identity.avatarUrl.startsWith("/uploads/")
                ? `${NEST_API_URL}${identity.avatarUrl}`
                : identity.avatarUrl
            }
            alt=""
            onError={() => setAvatarFailed(true)}
            className="aspect-[4/5] w-[40%] max-w-[164px] shrink-0 rounded-2xl object-cover ring-1 ring-[#D8B282]/30"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid aspect-[4/5] w-[40%] max-w-[164px] shrink-0 place-items-center rounded-2xl bg-[#08101b] text-[30px] font-semibold text-[#D8B282] ring-1 ring-[#D8B282]/30"
          >
            {initialsOf(identity?.displayName ?? null, email)}
          </div>
        )}

      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onQr}
          disabled={!identity || busy}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#D8B282]/30 bg-white/[0.03] px-4 text-[13.5px] font-semibold text-[#D8B282] transition-colors hover:bg-[#D8B282]/10 hover:border-[#D8B282]/50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B282] motion-reduce:transition-none"
        >
          <QrCode aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.me.myQr")}
        </button>
        <button
          type="button"
          onClick={onNfc}
          disabled={!identity || busy}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#D8B282]/30 bg-white/[0.03] px-4 text-[13.5px] font-semibold text-[#D8B282] transition-colors hover:bg-[#D8B282]/10 hover:border-[#D8B282]/50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B282] motion-reduce:transition-none"
        >
          <Nfc aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          {t("bc.mobile.me.nfcTapCta")}
        </button>
      </div>

      <button
        type="button"
        onClick={onViewProfile}
        className="relative mt-2 ml-auto flex min-h-11 items-center gap-1 rounded-full px-3 text-[13.5px] font-medium text-[#D4C3A3] transition-colors hover:text-[#D8B282] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B282] motion-reduce:transition-none"
      >
        {t("bc.mobile.me.viewProfile")}
        <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </section>
  );
}
