import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ReceiptText,
  CalendarDays,
  Activity,
  CheckCircle2,
  Clock,
  Handshake,
  User,
  Building2,
  Briefcase,
  MessageSquare,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyHistory, type MyHistory } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/association/history")({
  component: HistoryScreen,
});

const EMPTY: MyHistory = { activities: [], payments: [], events: [] };

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type Tab = "connections" | "payments" | "events" | "activity";

function HistoryScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchHistory = useServerFn(getMyHistory);
  const { data, loading } = useServerData<MyHistory>(() => fetchHistory(), EMPTY);
  const [tab, setTab] = useState<Tab>("connections");

  const [connectionList, setConnectionList] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_sent_connection_requests");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleConn = () => {
      try {
        const stored = localStorage.getItem("vba_sent_connection_requests");
        if (stored) setConnectionList(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener("vba.connection.changed", handleConn);
    window.addEventListener("storage", handleConn);
    return () => {
      window.removeEventListener("vba.connection.changed", handleConn);
      window.removeEventListener("storage", handleConn);
    };
  }, []);

  const handleCancelRequest = (id: string, targetName: string) => {
    try {
      const updated = connectionList.filter((c) => c.id !== id);
      setConnectionList(updated);
      localStorage.setItem("vba_sent_connection_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("vba.connection.changed"));
      toast.success(`Đã hủy yêu cầu kết nối tới ${targetName}`);
    } catch {}
  };

  const tabs: { key: Tab; label: string; icon: typeof ReceiptText; count: number }[] = [
    {
      key: "connections",
      label: "Kết nối",
      icon: Handshake as any,
      count: connectionList.length,
    },
    {
      key: "payments",
      label: t("m.history.tabPayments"),
      icon: ReceiptText,
      count: data.payments.length,
    },
    {
      key: "events",
      label: t("m.history.tabEvents"),
      icon: CalendarDays,
      count: data.events.length,
    },
    {
      key: "activity",
      label: t("m.history.tabActivity"),
      icon: Activity,
      count: data.activities.length,
    },
  ];

  const payStatusLabel = (s: string) =>
    s === "paid"
      ? t("m.history.payPaid")
      : s === "refunded"
        ? t("m.history.payRefunded")
        : t("m.history.payPending");

  return (
    <div className="vba-animate pb-20">
      <MemberHeader title={t("m.history.title")} subtitle={t("m.history.subtitle")} back />

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition outline-none focus:outline-none cursor-pointer ${
                active
                  ? "border-[#003B95] bg-[#003B95] text-white shadow-xs font-bold"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tb.label}</span>
              <span className="text-[10.5px] opacity-80">({tb.count})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5 px-4">
        {tab === "connections" ? (
          connectionList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131a26] p-8 text-center space-y-3 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 mx-auto">
                <Handshake className="h-6 w-6" />
              </div>
              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Chưa có lịch sử kết nối nào
              </h4>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Khi bạn gửi lời mời hẹn gặp & giao thương tới các hội viên, lịch sử chi tiết sẽ được ghi nhận tại đây.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/association/members" })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-4 py-2 text-[12px] font-bold transition shadow-md active:scale-95 cursor-pointer"
              >
                <span>Khám phá danh bạ hội viên</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            connectionList.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs space-y-2.5 transition hover:border-amber-500/50"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {item.targetAvatar ? (
                      <img
                        src={resolveMediaUrl(item.targetAvatar) || item.targetAvatar}
                        alt={item.targetName}
                        className="h-11 w-11 rounded-xl object-cover ring-2 ring-amber-500/30"
                        onError={(e) => {
                          e.currentTarget.src = "/ceo1983-emblem-8.png";
                        }}
                      />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#003B95] to-[#00224F] text-amber-300 font-bold text-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                          {item.targetName || "Hội viên CEO 1983"}
                        </span>
                        {item.targetCode && (
                          <span className="rounded-md bg-[#003B95]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#003B95] dark:text-amber-400">
                            {item.targetCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmtDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="h-3 w-3 text-[#003B95] dark:text-amber-400 shrink-0" />
                      <span>{item.targetCompany || "CLB Doanh Nhân CEO 1983"}</span>
                    </p>

                    {item.targetTitle && (
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.targetTitle}
                      </p>
                    )}

                    {item.opportunityTitle && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Briefcase className="h-3 w-3 text-amber-500" />
                        <span>Cơ hội: {item.opportunityTitle}</span>
                      </div>
                    )}

                    {item.purpose && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-amber-600 dark:text-amber-400 mr-1">Nội dung đề xuất:</span>
                        <span>"{item.purpose}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div>
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                        <Clock className="h-3 w-3 animate-pulse" />
                        <span>Đang chờ phản hồi</span>
                      </span>
                    )}
                    {item.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        <span>Đã kết nối thành công</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                        <X className="h-3 w-3" />
                        <span>Đã từ chối</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.targetCode && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/association/messages",
                            search: { peerCode: item.targetCode, peerName: item.targetName },
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-200 hover:text-[#003B95] dark:hover:text-amber-400 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Nhắn tin</span>
                      </button>
                    )}
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(item.id, item.targetName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2.5 py-1 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                        <span>Hủy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-card/[0.04]" />
            ))}
          </div>
        ) : tab === "payments" ? (
          data.payments.length === 0 ? (
            <Empty label={t("m.history.empty")} />
          ) : (
            data.payments.map((p) => (
              <div key={p.id} className="vba-card flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--vba-gold)]/10 text-[var(--vba-gold)]">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                    {p.description || p.invoice}
                  </div>
                  <div className="text-[11px] text-[var(--vba-text-muted)]">
                    {p.invoice} · {fmtDate(p.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[var(--vba-text)]">
                    {fmtVND(p.amount)}
                  </div>
                  <div
                    className={`text-[10px] font-medium ${
                      p.status === "paid"
                        ? "text-[var(--vba-success,#4ade80)]"
                        : p.status === "refunded"
                          ? "text-[var(--vba-text-muted)]"
                          : "text-[var(--vba-gold)]"
                    }`}
                  >
                    {payStatusLabel(p.status)}
                  </div>
                </div>
              </div>
            ))
          )
        ) : tab === "events" ? (
          data.events.length === 0 ? (
            <Empty label={t("m.history.empty")} />
          ) : (
            data.events.map((e: any) => (
              <div key={e.id} className="vba-card flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--vba-gold)]/10 text-[var(--vba-gold)]">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                    {e.name}
                  </div>
                  <div className="text-[11px] text-[var(--vba-text-muted)]">{fmtDate(e.date)}</div>
                </div>
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    e.checkedIn
                      ? "text-[var(--vba-success,#4ade80)]"
                      : "text-[var(--vba-text-muted)]"
                  }`}
                >
                  {e.checkedIn ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {e.checkedIn ? t("m.history.checkedIn") : t("m.history.registered")}
                </span>
              </div>
            ))
          )
        ) : data.activities.length === 0 ? (
          <Empty label={t("m.history.empty")} />
        ) : (
          data.activities.map((a: any) => (
            <div key={a.id} className="vba-card flex items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--vba-gold)]/10 text-[var(--vba-gold)]">
                <Activity className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                  {a.title}
                </div>
                <div className="text-[11px] text-[var(--vba-text-muted)]">{fmtDate(a.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[var(--vba-border)] bg-white dark:bg-[var(--vba-surface)] grid place-items-center py-12 text-[13px] text-slate-500 dark:text-[var(--vba-text-muted)] shadow-xs">
      {label}
    </div>
  );
}
