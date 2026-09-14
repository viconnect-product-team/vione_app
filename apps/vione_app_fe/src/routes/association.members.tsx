import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
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
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
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
  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());

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

      const personName = m.contact || m.personName || "";

      // Search match
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        personName.toLowerCase().includes(term) ||
        m.industry.toLowerCase().includes(term) ||
        m.region.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const targetId = (m.userId || m.code).toLowerCase();

      // Tab filter
      if (tab === "connected") {
        return Boolean(m.userId && connectedMap.has(m.userId.toLowerCase()));
      }
      if (tab === "pending") {
        return Boolean(
          (m.userId && (outgoingMap.has(m.userId.toLowerCase()) || incomingMap.has(m.userId.toLowerCase()))) ||
          localPending.has(targetId),
        );
      }
      return true;
    });
  }, [members, q, tab, myMember, connectedMap, outgoingMap, incomingMap, localPending]);

  const handleConnect = async (m: DirectoryMember) => {
    const target = m.userId || m.code;
    const displayName = m.contact || m.personName || m.name;
    try {
      await fetchNestApi<any>("/network/requests", {
        method: "POST",
        body: JSON.stringify({
          targetUserId: target,
          memberCode: m.code,
          message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
        }),
      });
      setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
      toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
    } catch {
      try {
        if (m.userId) {
          await sendRequest.mutateAsync({
            targetPersonNodeId: m.userId,
            message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
          });
          setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
          toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
          return;
        }
      } catch {}
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

      {/* Search Input - Borderless */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 shadow-none">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên hội viên, doanh nghiệp, ngành nghề..."
            className="flex-1 bg-transparent text-[13px] text-slate-900 dark:text-white border-0 outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
            tab === "all"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Tất cả ({members.length})
        </button>
        <button
          onClick={() => setTab("connected")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "connected"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Bạn bè ({connected.length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "pending"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Đang chờ ({outgoing.length + incoming.length + localPending.size})
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
          <p className="py-10 text-center text-[13px] text-slate-400">
            {t("m.members.loading")}
          </p>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              {tab === "connected"
                ? "Bạn chưa có kết nối nào. Hãy gửi lời mời kết nối với các hội viên bên dưới!"
                : tab === "pending"
                ? "Không có lời mời kết nối nào đang chờ."
                : "Không tìm thấy hội viên phù hợp."}
            </p>
          </div>
        )}

        {filtered.map((m) => {
          const targetId = (m.userId || m.code).toLowerCase();
          const isFriend = Boolean(m.userId && connectedMap.has(m.userId.toLowerCase()));
          const isOutgoing = Boolean(
            (m.userId && outgoingMap.has(m.userId.toLowerCase())) || localPending.has(targetId),
          );
          const isIncoming = Boolean(m.userId && incomingMap.has(m.userId.toLowerCase()));
          const outgoingReqId = m.userId ? outgoingMap.get(m.userId.toLowerCase()) : null;
          const incomingReqId = m.userId ? incomingMap.get(m.userId.toLowerCase()) : null;

          const avatarResolved = m.avatar ? resolveMediaUrl(m.avatar) : null;
          const personDisplayName =
            m.contact || m.personName || (m.type === "individual" ? m.name : "Đại diện Doanh nghiệp");
          const companyDisplayName = m.type === "company" ? m.name : "";

          return (
            <div
              key={m.code}
              role="listitem"
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 transition hover:border-sky-500/50 bg-white dark:bg-[#131a26] shadow-xs"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with click to open profile */}
                <button
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className="relative shrink-0 block group cursor-pointer text-left"
                  title="Xem hồ sơ hội viên"
                >
                  {avatarResolved ? (
                    <img
                      src={avatarResolved}
                      alt={personDisplayName}
                      className="h-13 w-13 rounded-full object-cover ring-2 ring-sky-500/40 group-hover:ring-sky-500 transition-all"
                      onError={(e) => {
                        e.currentTarget.src = "/ceo1983-logo.png";
                      }}
                    />
                  ) : (
                    <span className="grid h-13 w-13 place-items-center rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/20 font-bold text-sm">
                      {m.type === "individual" ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </span>
                  )}
                  {m.verified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-sky-500 fill-white dark:fill-slate-900" />
                  )}
                </button>

                {/* Member Info: Person Name + Company Name */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(m)}
                      className="truncate text-[14px] font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left cursor-pointer"
                    >
                      {personDisplayName}
                    </button>
                    <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                      {m.code}
                    </span>
                  </div>

                  {companyDisplayName && companyDisplayName !== personDisplayName ? (
                    <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 text-sky-500 shrink-0" />
                      <span>{companyDisplayName}</span>
                    </p>
                  ) : null}

                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {[m.personTitle || m.industry, m.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                {/* Chat Action */}
                <button
                  onClick={() => handleOpenChat(m.code, personDisplayName)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] py-1.5 px-3 text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500/50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                  Nhắn tin
                </button>

                {/* Connection 2-way Lifecycle Action */}
                {isFriend ? (
                  <button
                    onClick={() => m.userId && handleDisconnect(m.userId, personDisplayName)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-1.5 px-3 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 active:scale-[0.98] transition-all cursor-pointer group"
                    title="Chạm để hủy kết bạn"
                  >
                    <UserCheck className="h-3.5 w-3.5 group-hover:hidden" />
                    <UserMinus className="h-3.5 w-3.5 hidden group-hover:block" />
                    <span className="group-hover:hidden">Bạn bè</span>
                    <span className="hidden group-hover:inline">Hủy kết bạn</span>
                  </button>
                ) : isOutgoing ? (
                  <button
                    onClick={() => outgoingReqId && handleCancelInvite(outgoingReqId, personDisplayName)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-1.5 px-3 text-[12px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 active:scale-[0.98] transition-all cursor-pointer"
                    title="Chạm để hủy lời mời"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Đã gửi lời mời
                  </button>
                ) : isIncoming ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      onClick={() => incomingReqId && handleAcceptInvite(incomingReqId, personDisplayName)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-sky-500 hover:bg-sky-600 py-1.5 px-2 text-[11px] font-bold text-white active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Đồng ý
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 py-1.5 px-3 text-[12px] font-bold text-white active:scale-[0.98] transition-all cursor-pointer shadow-xs"
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

      {/* Member Profile Modal Sheet */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0f172a] p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-sky-500">
                Hồ sơ hội viên CLB CEO 1983
              </span>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Avatar & Names */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {selectedMember.avatar ? (
                  <img
                    src={resolveMediaUrl(selectedMember.avatar) || selectedMember.avatar}
                    alt={selectedMember.contact || selectedMember.name}
                    className="h-18 w-18 rounded-2xl object-cover ring-2 ring-sky-500/40 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = "/ceo1983-logo.png";
                    }}
                  />
                ) : (
                  <div className="grid h-18 w-18 place-items-center rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/30">
                    <User className="h-9 w-9" />
                  </div>
                )}
                {selectedMember.verified && (
                  <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-sky-500 fill-white dark:fill-slate-900" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[16px] font-extrabold text-slate-900 dark:text-white">
                    {selectedMember.contact || selectedMember.personName || selectedMember.name}
                  </h3>
                  <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                    {selectedMember.code}
                  </span>
                </div>
                {selectedMember.name && (
                  <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span>{selectedMember.name}</span>
                  </p>
                )}
                <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">
                  {[selectedMember.personTitle || selectedMember.industry, selectedMember.region].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            {/* About / Bio if available */}
            {selectedMember.about && (
              <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3.5 text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-white/5">
                <p className="font-semibold text-[11px] text-slate-400 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Giới thiệu
                </p>
                <p className="whitespace-pre-wrap">{selectedMember.about}</p>
              </div>
            )}

            {/* Detailed Contact List */}
            <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3.5 text-[12px] border border-slate-200/60 dark:border-white/5">
              {selectedMember.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-sky-500" />
                    <span>Điện thoại</span>
                  </div>
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {selectedMember.phone}
                  </a>
                </div>
              )}
              {selectedMember.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5 text-sky-500" />
                    <span>Email</span>
                  </div>
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline truncate max-w-[200px]"
                  >
                    {selectedMember.email}
                  </a>
                </div>
              )}
              {selectedMember.address && (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-sky-500" />
                    <span>Địa chỉ</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
                    {selectedMember.address}
                  </span>
                </div>
              )}
              {selectedMember.website && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Globe className="h-3.5 w-3.5 text-sky-500" />
                    <span>Website</span>
                  </div>
                  <a
                    href={selectedMember.website.startsWith("http") ? selectedMember.website : `https://${selectedMember.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Truy cập</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions in Profile */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const pName = selectedMember.contact || selectedMember.personName || selectedMember.name;
                  setSelectedMember(null);
                  handleOpenChat(selectedMember.code, pName);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-50 dark:bg-sky-950/30 py-2.5 text-[12.5px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition active:scale-95 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Nhắn tin
              </button>

              <button
                type="button"
                onClick={() => {
                  handleConnect(selectedMember);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-[12.5px] font-bold text-white hover:brightness-105 transition active:scale-95 cursor-pointer shadow-md shadow-sky-500/20"
              >
                <UserPlus className="h-4 w-4" />
                Kết nối ngay
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                to="/card/$code"
                params={{ code: selectedMember.code }}
                className="text-[12px] font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition underline"
              >
                Xem danh thiếp / thẻ hội viên số
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
