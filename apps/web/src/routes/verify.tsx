import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Hash,
  CalendarClock,
  Building2,
  ArrowLeft,
  ShieldQuestion,
} from "lucide-react";
import { verifyMemberPassFn, type VerifyResult } from "@/lib/member-identity.functions";

const appIcon = "/app-icon.png";

type Search = { code?: string; t?: string };

export const Route = createFileRoute("/verify")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof s.code === "string") out.code = s.code;
    if (typeof s.t === "string") out.t = s.t;
    return out;
  },
  loaderDeps: ({ search }) => ({ code: search.code, t: search.t }),
  loader: async ({ deps }) =>
    deps.code || deps.t ? verifyMemberPassFn({ data: { code: deps.code, token: deps.t } }) : null,
  head: () => ({
    meta: [
      { title: "Xác thực hội viên — Verify Member" },
      {
        name: "description",
        content: "Quét mã QR để xác thực tư cách hội viên, trạng thái và hiệu lực.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyScreen,
  errorComponent: ({ error }) => (
    <Shell>
      <div className="text-center text-[var(--vba-text-muted)]">{error.message}</div>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="vba-app min-h-[100dvh] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center gap-2.5">
          <img src={appIcon} alt="" className="h-9 w-9 rounded-lg" width={36} height={36} />
          <div className="leading-tight">
            <div className="text-[13px] font-bold vba-gold-text">Xác thực hội viên</div>
            <div className="text-[10px] font-semibold text-[var(--vba-text-muted)]">
              MEMBER VERIFICATION
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function VerifyScreen() {
  const result = Route.useLoaderData() as VerifyResult | null;
  const { code, t } = Route.useSearch();

  if (!code && !t) {
    return (
      <Shell>
        <div className="vba-card flex flex-col items-center gap-3 p-8 text-center">
          <ShieldQuestion className="h-10 w-10 text-[var(--vba-gold)]" />
          <div className="text-[15px] font-bold text-[var(--vba-text)]">Chưa có mã để xác thực</div>
          <p className="text-[13px] text-[var(--vba-text-muted)]">
            Quét mã QR trên thẻ hội viên để bắt đầu xác thực.
          </p>
        </div>
      </Shell>
    );
  }

  if (!result) {
    return (
      <Shell>
        <div className="vba-card flex flex-col items-center gap-3 p-8 text-center">
          <ShieldAlert className="h-10 w-10 text-[var(--vba-danger)]" />
          <div className="text-[15px] font-bold text-[var(--vba-text)]">Không xác thực được</div>
        </div>
      </Shell>
    );
  }

  const ok = result.verified;
  const bannerColor = ok ? "var(--vba-success, #16a34a)" : "var(--vba-danger)";

  return (
    <Shell>
      <div className="vba-card overflow-hidden">
        {/* Verdict banner */}
        <div className="flex items-center gap-3 px-5 py-4">
          {ok ? (
            <ShieldCheck className="h-8 w-8 shrink-0" style={{ color: bannerColor }} />
          ) : (
            <ShieldAlert className="h-8 w-8 shrink-0" style={{ color: bannerColor }} />
          )}
          <div>
            <div className="text-[15px] font-bold" style={{ color: bannerColor }}>
              {ok ? "Hội viên hợp lệ" : "Không hợp lệ"}
            </div>
            <div className="text-[12px] text-[var(--vba-text-muted)]">
              {ok ? "Thẻ đang hoạt động" : (result.reason ?? "Thẻ không hợp lệ")}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-[var(--vba-border-soft)] p-5">
          <Row icon={BadgeCheck} label="Hội viên" value={result.memberName || "—"} />
          <Row icon={Building2} label="Tổ chức" value={result.associationName || "—"} />
          <Row icon={Hash} label="Mã hội viên" value={result.memberCode || "—"} accent />
          <Row icon={BadgeCheck} label="Hạng hội viên" value={result.membershipLevel || "—"} />
          <Row
            icon={CalendarClock}
            label="Hiệu lực đến"
            value={result.expiresAt ? new Date(result.expiresAt).toLocaleDateString("vi-VN") : "—"}
          />
        </div>
      </div>

      <Link
        to="/"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--vba-border-soft)] py-3 text-[13px] font-semibold text-[var(--vba-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Về trang chủ
      </Link>
    </Shell>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--vba-gold-soft)] text-[var(--vba-gold)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-[var(--vba-text-dim)]">{label}</div>
        <div
          className={`truncate text-[14px] font-semibold ${accent ? "text-[var(--vba-gold)]" : "text-[var(--vba-text)]"}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
