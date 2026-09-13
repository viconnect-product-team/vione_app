import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Clock,
  MessageSquare,
  Search,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers, getMyMember, type DirectoryMember, type MyMember } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import {
  useConnectedPeople,
  useOutgoingRequests,
  useIncomingRequests,
  useSendConnectionRequest,
  useCancelRequest,
  useAcceptRequest,
  useDisconnect,
} from "@/hooks/use-connection";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/association/members")({
  component: MembersScreen,
});

type FilterTab = "all" | "connected" | "pending";

function MembersScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchMembers = useServerFn(listMembers);
  const fetchMyMember = useServerFn(getMyMember);
  const { data: members, loading, reload: reloadMembers } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);
  const { data: myMember } = useServerData<MyMember | null>(() => fetchMyMember(), null);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

  // Connection data hooks from canonical ViOne connection system
  const { data: connected = [] } = useConnectedPeople(100);
  const { data: outgoing = [] } = useOutgoingRequests(100);
  const { data: incoming = [] } = useIncomingRequests(100);

  const sendRequest = useSendConnectionRequest();
  const cancelRequest = useCancelRequest();
  const acceptRequest = useAcceptRequest();
  const disconnect = useDisconnect();

  // Maps for fast connection lookup by target userId
  const connectedMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> connectionId
    for (const c of connected) {
      const pid = (c as any).counterpartUserId || c.person?.personNodeId;
      if (pid) map.set(String(pid).replace(/^u:/, "").toLowerCase(), c.connectionId);
    }
    return map;
  }, [connected]);

  const outgoingMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> requestId
    for (const req of outgoing) {
      const tid = (req as any).recipientUserId || (req as any).targetPersonNodeId;
      if (tid) map.set(String(tid).replace(/^u:/, "").toLowerCase(), req.id);
    }
    return map;
  }, [outgoing]);

  const incomingMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> requestId
    for (const req of incoming) {
      const sid = (req as any).requesterUserId;
      if (sid) map.set(String(sid).toLowerCase(), req.id);
    }
    return map;
  }, [incoming]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return members.filter((m) => {
      // Exclude self
      if (myMember?.code && m.code.toLowerCase() === myMember.code.toLowerCase()) {
        return false;
      }

      // Search match
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.industry.toLowerCase().includes(term) ||
        m.region.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const targetId = m.userId?.toLowerCase();

      // Tab filter
      if (tab === "connected") {
        return Boolean(targetId && connectedMap.has(targetId));
      }
      if (tab === "pending") {
        return Boolean(targetId && (outgoingMap.has(targetId) || incomingMap.has(targetId)));
      }
      return true;
    });
  }, [members, q, tab, myMember, connectedMap, outgoingMap, incomingMap]);

  const handleConnect = async (m: DirectoryMember) => {
    const target = m.userId || m.code;
    try {
      await sendRequest.mutateAsync({
        targetPersonNodeId: target,
        message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối và giao lưu cùng bạn!`,
      });
      toast.success(`Đã gửi lời mời kết nối tới ${m.name}`);
    } catch {
      toast.error("Không thể gửi lời mời kết nối");
    }
  };

  const handleCancelInvite = async (requestId: string, memberName: string) => {
    try {
      await cancelRequest.mutateAsync({ requestId });
      toast.success(`Đã hủy lời mời gửi tới ${memberName}`);
    } catch {
      toast.error("Không thể hủy lời mời");
    }
  };

  const handleAcceptInvite = async (requestId: string, memberName: string) => {
    try {
      await acceptRequest.mutateAsync({ requestId });
      toast.success(`Đã đồng ý kết nối với ${memberName}`);
    } catch {
      toast.error("Không thể đồng ý kết nối");
    }
  };

  const handleDisconnect = async (targetUserId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${memberName}?`)) return;
    try {
      await disconnect.mutateAsync({ targetPersonNodeId: targetUserId });
      toast.success(`Đã hủy kết bạn với ${memberName}`);
    } catch {
      toast.error("Không thể hủy kết bạn");
    }
  };

  const handleOpenChat = (peerCode: string, peerName: string) => {
    navigate({
      to: "/association/messages" as any,
      search: { peerCode, peerName } as any,
    });
  };

  return (
    <div className="vba-animate pb-24">
      <MemberHeader title={t("m.members.title")} back />

      {/* Search Input */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface)] px-3.5 py-2.5 shadow-xs">
          <Search className="h-4 w-4 text-[var(--vba-text-dim)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên hội viên, ngành nghề, mã số..."
            className="flex-1 bg-transparent text-[13px] text-[var(--vba-text)] outline-none placeholder:text-[var(--vba-text-dim)]"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-[var(--vba-text-dim)] hover:text-[var(--vba-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTab("all")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
            tab === "all"
              ? "bg-[var(--vba-gold)] text-slate-900 shadow-xs"
              : "bg-[var(--vba-surface-2)] text-[var(--vba-text-muted)] hover:text-[var(--vba-text)]"
          }`}
        >
          Tất cả ({members.length})
        </button>
        <button
          onClick={() => setTab("connected")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1 ${
            tab === "connected"
              ? "bg-[var(--vba-gold)] text-slate-900 shadow-xs"
              : "bg-[var(--vba-surface-2)] text-[var(--vba-text-muted)] hover:text-[var(--vba-text)]"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Bạn bè ({connected.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1 ${
            tab === "pending"
              ? "bg-[var(--vba-gold)] text-slate-900 shadow-xs"
              : "bg-[var(--vba-surface-2)] text-[var(--vba-text-muted)] hover:text-[var(--vba-text)]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Đang chờ ({outgoing.length + incoming.length})
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite" data-testid="members-announcement">
        {loading
          ? t("m.members.announce.loading")
          : t("m.members.announce.count", { count: filtered.length })}
      </p>

      {/* Members List */}
      <div
        className="mt-3 space-y-2.5 px-4"
        role="list"
        aria-live="polite"
        aria-busy={loading}
        aria-label={t("m.members.title")}
      >
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.members.loading")}
          </p>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <Users className="h-10 w-10 text-[var(--vba-text-dim)] mx-auto opacity-50" />
            <p className="text-[13px] font-medium text-[var(--vba-text-dim)]">
              {tab === "connected"
                ? "Bạn chưa có kết nối nào. Hãy gửi lời mời kết nối với các hội viên bên dưới!"
                : tab === "pending"
                ? "Không có lời mời kết nối nào đang chờ."
                : "Không tìm thấy hội viên phù hợp."}
            </p>
          </div>
        )}

        {filtered.map((m) => {
          const targetId = m.userId?.toLowerCase();
          const isFriend = Boolean(targetId && connectedMap.has(targetId));
          const isOutgoing = Boolean(targetId && outgoingMap.has(targetId));
          const isIncoming = Boolean(targetId && incomingMap.has(targetId));
          const outgoingReqId = targetId ? outgoingMap.get(targetId) : null;
          const incomingReqId = targetId ? incomingMap.get(targetId) : null;

          const avatarResolved = m.avatar ? resolveMediaUrl(m.avatar) : null;

          return (
            <div
              key={m.code}
              role="listitem"
              className="vba-card rounded-2xl border border-[var(--vba-border-soft)] p-3.5 transition hover:border-[var(--vba-gold)]/60 bg-[var(--vba-surface)] shadow-xs"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with MinIO resolution & Fallback */}
                <Link
                  to="/card/$code"
                  params={{ code: m.code }}
                  className="relative shrink-0 block group"
                  title="Xem thẻ hội viên"
                >
                  {avatarResolved ? (
                    <img
                      src={avatarResolved}
                      alt={m.name}
                      className="h-13 w-13 rounded-full object-cover ring-2 ring-[var(--vba-gold)]/40 group-hover:ring-[var(--vba-gold)] transition-all"
                      onError={(e) => {
                        e.currentTarget.src = "/ceo1983-logo.png";
                      }}
                    />
                  ) : (
                    <span className="grid h-13 w-13 place-items-center rounded-full bg-[var(--vba-surface-2)] text-[var(--vba-gold)] ring-2 ring-[var(--vba-gold)]/20">
                      {m.type === "individual" ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </span>
                  )}
                  {m.verified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-[var(--vba-gold)] fill-slate-900 dark:fill-slate-950" />
                  )}
                </Link>

                {/* Member Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to="/card/$code"
                      params={{ code: m.code }}
                      className="truncate text-[14px] font-bold text-[var(--vba-text)] hover:text-[var(--vba-gold)] transition-colors"
                    >
                      {m.name}
                    </Link>
                    <span className="rounded-md bg-[var(--vba-gold-soft)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--vba-gold)] shrink-0">
                      {m.code}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[var(--vba-text-muted)] mt-0.5">
                    {[m.industry, m.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-2.5 border-t border-[var(--vba-border-soft)]/60 flex items-center justify-between gap-2">
                {/* Chat Action */}
                <button
                  onClick={() => handleOpenChat(m.code, m.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)]/80 py-1.5 px-3 text-[12px] font-semibold text-[var(--vba-text)] hover:border-[var(--vba-gold)]/50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--vba-gold)]" />
                  Nhắn tin
                </button>

                {/* Connection 2-way Lifecycle Action */}
                {isFriend ? (
                  <button
                    onClick={() => targetId && handleDisconnect(targetId, m.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-1.5 px-3 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 active:scale-[0.98] transition-all cursor-pointer group"
                    title="Chạm để hủy kết bạn"
                  >
                    <UserCheck className="h-3.5 w-3.5 group-hover:hidden" />
                    <UserMinus className="h-3.5 w-3.5 hidden group-hover:block" />
                    <span className="group-hover:hidden">Bạn bè</span>
                    <span className="hidden group-hover:inline">Hủy kết bạn</span>
                  </button>
                ) : isOutgoing ? (
                  <button
                    onClick={() => outgoingReqId && handleCancelInvite(outgoingReqId, m.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-1.5 px-3 text-[12px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 active:scale-[0.98] transition-all cursor-pointer"
                    title="Chạm để hủy lời mời"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Hủy lời mời
                  </button>
                ) : isIncoming ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      onClick={() => incomingReqId && handleAcceptInvite(incomingReqId, m.name)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[var(--vba-gold)] py-1.5 px-2 text-[11px] font-bold text-slate-950 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Đồng ý
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--vba-gold)] py-1.5 px-3 text-[12px] font-bold text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Kết nối
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
