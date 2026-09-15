import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listConversations,
  listMessages,
  sendMessage,
  listMembers,
  type MyConversation,
  type ChatMessage,
  type DirectoryMember,
} from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  User,
  Users,
  Video,
  X,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  RotateCcw,
  MoreHorizontal,
  Smile,
} from "lucide-react";
import { uploadChatAttachment } from "@/lib/upload-media";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api-client";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import {
  ZaloTransactionCard,
  type ZaloTransactionData,
} from "@/components/business-connect/mobile/ZaloTransactionCard";
import { MemberProfileModal } from "@/components/member/MemberProfileModal";

const messagesSearchSchema = z.object({
  peerCode: z.string().optional(),
  peerName: z.string().optional(),
});

export const Route = createFileRoute("/association/messages")({
  validateSearch: (search: Record<string, unknown>) => messagesSearchSchema.parse(search),
  component: MessagesScreen,
});

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function formatMessageTime(isoOrText?: string) {
  if (!isoOrText) return "";
  if (isoOrText === "Vừa xong" || isoOrText === "justNow") return "Vừa xong";
  const d = new Date(isoOrText);
  if (isNaN(d.getTime())) return isoOrText;
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(isoStr?: string) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("");
}

function cleanPersonName(fullName?: string | null): string {
  if (!fullName) return "";
  const clean = fullName.split(/\s*[-–—|]\s*/)[0].trim();
  return clean || fullName.trim();
}

function getShortName(fullName?: string | null): string {
  if (!fullName) return "";
  const person = cleanPersonName(fullName);
  const parts = person.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return parts[0] || person;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileBadgeInfo(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) {
    return { label: "PDF", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  }
  if (["doc", "docx"].includes(ext)) {
    return { label: "DOC", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return { label: "XLS", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  }
  if (["ppt", "pptx"].includes(ext)) {
    return { label: "PPT", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { label: "ZIP", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
  }
  return {
    label: ext.toUpperCase().slice(0, 4) || "FILE",
    color: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
}

export type ActionPaymentData = ZaloTransactionData;

export type ActionMeetingData = {
  title: string;
  time: string;
  location: string;
  link?: string;
  desc?: string;
};

type ParsedContent =
  | { type: "image"; url: string; name?: string; caption?: string }
  | { type: "file"; url: string; name: string; size?: number; caption?: string }
  | { type: "action_payment"; data: ActionPaymentData }
  | { type: "action_meeting"; data: ActionMeetingData }
  | { type: "text"; text: string };

function safeDecode(val?: string): string {
  if (!val) return "";
  try {
    return decodeURIComponent(val.replace(/\+/g, " "));
  } catch {
    return val;
  }
}

function parseMessageContent(body: string): ParsedContent {
  // Action: Payment with VietQR
  const payMatch = body.match(
    /\[action:payment\|amount:(\d+)\|invoice:([^|]+)\|qr:([^|]+)(?:\|due:([^|]+))?(?:\|desc:([^\]]*))?\]/i,
  );
  if (payMatch) {
    return {
      type: "action_payment",
      data: {
        amount: parseInt(payMatch[1], 10),
        invoiceNo: payMatch[2],
        qrUrl: payMatch[3],
        dueDate: payMatch[4],
        desc: safeDecode(payMatch[5]),
      },
    };
  }

  // Action: Meeting invitation with full safe URL decoding
  const meetMatch = body.match(
    /\[action:meeting\|title:([^|]+)\|time:([^|]+)\|location:([^|]+)(?:\|link:([^|]+))?(?:\|desc:([^\]]*))?\]/i,
  );
  if (meetMatch) {
    return {
      type: "action_meeting",
      data: {
        title: safeDecode(meetMatch[1]),
        time: safeDecode(meetMatch[2]),
        location: safeDecode(meetMatch[3]),
        link: meetMatch[4] || undefined,
        desc: safeDecode(meetMatch[5]),
      },
    };
  }

  const imageRegex = /\[image:(https?:\/\/[^|\]]+)(?:\|([^\]]*))?\]/i;
  const imageMatch = body.match(imageRegex);
  if (imageMatch) {
    const url = imageMatch[1];
    const name = imageMatch[2] || "";
    const caption = body.replace(imageRegex, "").trim();
    return { type: "image", url, name, caption: caption || undefined };
  }

  const fileRegex = /\[file:(https?:\/\/[^|\]]+)(?:\|([^|\]]*))?(?:\|(\d+))?\]/i;
  const fileMatch = body.match(fileRegex);
  if (fileMatch) {
    const url = fileMatch[1];
    const name = fileMatch[2] || "Tài liệu đính kèm";
    const size = fileMatch[3] ? parseInt(fileMatch[3], 10) : undefined;
    const caption = body.replace(fileRegex, "").trim();
    return { type: "file", url, name, size, caption: caption || undefined };
  }

  const isRawImageUrl = /^(https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp|svg))(?:\?.*)?$/i.test(
    body.trim(),
  );
  if (isRawImageUrl) {
    return { type: "image", url: body.trim() };
  }

  return { type: "text", text: body };
}

function formatMessagePreview(raw?: string | null): string {
  if (!raw) return "";
  const text = raw.trim();
  if (/\[action:payment/i.test(text)) {
    return "💳 [Hóa đơn] Nhắc nhở thanh toán hội phí VietQR";
  }
  if (/\[action:meeting/i.test(text)) {
    return "📅 [Cuộc họp] Thư mời tham dự cuộc họp";
  }
  if (
    /\[image:(https?:\/\/[^|\]]+)(?:\|([^\]]*))?\]/i.test(text) ||
    /^(https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp|svg))(?:\?.*)?$/i.test(text)
  ) {
    return "📷 [Hình ảnh]";
  }
  const fileMatch = text.match(/\[file:(https?:\/\/[^|\]]+)(?:\|([^|\]]*))?(?:\|(\d+))?\]/i);
  if (fileMatch) {
    return `📎 [Tệp] ${fileMatch[2] || "Tài liệu"}`;
  }
  if (/\[voice:(https?:\/\/[^|\]]+|data:audio\/[^|\]]+)(?:\|(\d+))?\]/i.test(text)) {
    return "🎙️ [Tin nhắn thoại]";
  }
  return text;
}

function MessagesScreen() {
  const search = Route.useSearch();
  const fetchMembers = useServerFn(listMembers);
  const { data: members = [] } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);

  const [active, setActive] = useState<MyConversation | null>(() => {
    if (search.peerCode) {
      return {
        peerCode: search.peerCode,
        name: search.peerName || search.peerCode.toUpperCase(),
        last: "",
        time: "Vừa xong",
        unread: 0,
      };
    }
    return null;
  });

  useEffect(() => {
    if (search.peerCode) {
      setActive({
        peerCode: search.peerCode,
        name: search.peerName || search.peerCode.toUpperCase(),
        last: "",
        time: "Vừa xong",
        unread: 0,
      });
    }
  }, [search.peerCode, search.peerName]);

  if (active) {
    return <ChatThread peer={active} onBack={() => setActive(null)} members={members} />;
  }
  return <ConversationList onOpen={setActive} members={members} />;
}

type ConvFilter = "all" | "unread" | "members" | "pending" | "system";

function saveRecentConversation(peer: MyConversation, lastText: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("vba.recent_conversations");
    const list: MyConversation[] = raw ? JSON.parse(raw) : [];
    const existing = list.find((c) => c.peerCode.toLowerCase() === peer.peerCode.toLowerCase());
    const item: MyConversation = {
      peerCode: peer.peerCode,
      name:
        peer.name && peer.name.trim().toLowerCase() !== peer.peerCode.toLowerCase()
          ? peer.name
          : existing?.name || peer.name,
      last: lastText,
      time: new Date().toISOString(),
      unread: 0,
      avatarUrl: peer.avatarUrl || existing?.avatarUrl || null,
      isSystem: peer.isSystem,
    };
    const next = [item, ...list.filter((c) => c.peerCode.toLowerCase() !== peer.peerCode.toLowerCase())];
    localStorage.setItem("vba.recent_conversations", JSON.stringify(next.slice(0, 50)));
  } catch {}
}

function ConversationList({ onOpen, members: propMembers }: { onOpen: (c: MyConversation) => void; members?: DirectoryMember[] }) {
  const t = useT();
  const fmt = useFmt();
  const {
    data: conversations,
    loading,
    error,
    reload,
  } = useServerData<MyConversation[]>(() => listConversations(), []);

  const [localRecents, setLocalRecents] = useState<MyConversation[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("vba.recent_conversations");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const syncLocal = () => {
      try {
        const raw = localStorage.getItem("vba.recent_conversations");
        if (raw) setLocalRecents(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("focus", syncLocal);
    window.addEventListener("storage", syncLocal);
    return () => {
      window.removeEventListener("focus", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  const fetchMembers = useServerFn(listMembers);
  const { data: fetchedMembers = [] } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);
  const members = propMembers && propMembers.length > 0 ? propMembers : fetchedMembers;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQ, setPickerQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ConvFilter>("all");
  const [selectedMemberModal, setSelectedMemberModal] = useState<DirectoryMember | null>(null);

  const handleAvatarClick = (c: any) => {
    if (c.isSystem || c.peerCode === "admin" || c.peerCode === "system") {
      onOpen(c);
      return;
    }
    const found = members.find((m) => m.code === c.peerCode);
    if (found) {
      setSelectedMemberModal(found);
    } else {
      setSelectedMemberModal({
        code: c.peerCode,
        name: c.name,
        personName: c.name,
        personTitle: "Hội viên CEO 1983",
        industry: "Kinh doanh & Quản lý",
        region: "Hà Nội",
        type: "individual",
        verified: true,
        avatar: c.avatarUrl,
      });
    }
  };

  const [onlineUserMap, setOnlineUserMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!conversations || conversations.length === 0) return;
    setOnlineUserMap((prev) => {
      const next = { ...prev };
      for (const c of conversations) {
        if (c.userId) {
          if (next[c.userId] === undefined) next[c.userId] = Boolean(c.isOnline);
        }
        if (c.peerCode) {
          const codeKey = c.peerCode.toLowerCase();
          if (next[codeKey] === undefined) next[codeKey] = Boolean(c.isOnline);
        }
      }
      return next;
    });
  }, [conversations]);

  useEffect(() => {
    const socket = getConnectAppSocket();
    if (!socket.connected) {
      socket.connect();
    }
    const handleUpdate = () => {
      reload();
      try {
        const raw = localStorage.getItem("vba.recent_conversations");
        if (raw) setLocalRecents(JSON.parse(raw));
      } catch {}
    };
    const handleOnline = (data: { userId?: string }) => {
      if (data?.userId) {
        setOnlineUserMap((prev) => ({
          ...prev,
          [data.userId!]: true,
          [data.userId!.toLowerCase()]: true,
        }));
      }
    };
    const handleOffline = (data: { userId?: string }) => {
      if (data?.userId) {
        setOnlineUserMap((prev) => ({
          ...prev,
          [data.userId!]: false,
          [data.userId!.toLowerCase()]: false,
        }));
      }
    };
    socket.on("dm:message_received", handleUpdate);
    socket.on("dm:thread_updated", handleUpdate);
    socket.on("member:message_received", handleUpdate);
    socket.on("presence:user_online", handleOnline);
    socket.on("presence:user_offline", handleOffline);

    const handleFocus = () => handleUpdate();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      socket.off("dm:message_received", handleUpdate);
      socket.off("dm:thread_updated", handleUpdate);
      socket.off("member:message_received", handleUpdate);
      socket.off("presence:user_online", handleOnline);
      socket.off("presence:user_offline", handleOffline);
    };
  }, [reload]);

  const checkOnline = (c: MyConversation) => {
    if (c.isSystem || c.peerCode === "admin" || c.peerCode === "system") return false;
    if (c.userId && onlineUserMap[c.userId] !== undefined) {
      return onlineUserMap[c.userId];
    }
    const codeKey = c.peerCode?.toLowerCase();
    if (codeKey && onlineUserMap[codeKey] !== undefined) {
      return onlineUserMap[codeKey];
    }
    return Boolean(c.isOnline);
  };

  const allConversations = useMemo(() => {
    const memberMap = new Map<string, DirectoryMember>();
    for (const m of members) {
      if (m.code) memberMap.set(m.code.toLowerCase(), m);
    }

    const map = new Map<string, MyConversation>();
    // First, map server conversations enriched with directory member details
    for (const c of conversations) {
      if (!c.isSystem && c.peerCode !== "admin" && c.peerCode !== "system" && (!c.last || !c.last.trim())) {
        continue;
      }
      const key = c.peerCode.toLowerCase();
      const mem = memberMap.get(key);
      const enriched: MyConversation = {
        ...c,
        name:
          c.name && c.name.trim().toLowerCase() !== key
            ? c.name
            : mem?.personName || mem?.contact || mem?.name || c.name || key.toUpperCase(),
        avatarUrl: c.avatarUrl || mem?.avatar || null,
        isOnline: c.isOnline,
        userId: c.userId || null,
      };
      map.set(key, enriched);
    }
    // Next, merge any local recent conversations, preserving avatars and names
    for (const rec of localRecents) {
      if (!rec.isSystem && rec.peerCode !== "admin" && rec.peerCode !== "system" && (!rec.last || !rec.last.trim())) {
        continue;
      }
      const key = rec.peerCode.toLowerCase();
      const mem = memberMap.get(key);
      if (!map.has(key)) {
        map.set(key, {
          ...rec,
          name:
            rec.name && rec.name.trim().toLowerCase() !== key
              ? rec.name
              : mem?.personName || mem?.contact || mem?.name || rec.name || key.toUpperCase(),
          avatarUrl: rec.avatarUrl || mem?.avatar || null,
        });
      } else {
        const serv = map.get(key)!;
        map.set(key, {
          ...serv,
          name:
            serv.name && serv.name.trim().toLowerCase() !== key
              ? serv.name
              : rec.name && rec.name.trim().toLowerCase() !== key
                ? rec.name
                : mem?.personName || mem?.contact || mem?.name || serv.name,
          avatarUrl: serv.avatarUrl || rec.avatarUrl || mem?.avatar || null,
          last: serv.last || rec.last,
          time: serv.time || rec.time,
        });
      }
    }
    const list = Array.from(map.values()).filter((c) => {
      if (c.isSystem || c.peerCode === "admin" || c.peerCode === "system") return true;
      return Boolean(c.last && c.last.trim().length > 0);
    });
    list.sort((a, b) => {
      const timeA = new Date(a.time || 0).getTime();
      const timeB = new Date(b.time || 0).getTime();
      return timeB - timeA;
    });
    return list;
  }, [conversations, localRecents, members]);

  const filteredMembers = members.filter((m) => {
    const q = pickerQ.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.industry.toLowerCase().includes(q)
    );
  });

  const unreadCount = allConversations.filter((c) => (c.unread || 0) > 0).length;
  const systemCount = allConversations.filter((c) => c.isSystem || c.peerCode === "admin").length;

  const baseConvs = useMemo(() => {
    if (activeTab === "unread") return allConversations.filter((c) => (c.unread || 0) > 0);
    if (activeTab === "system")
      return allConversations.filter((c) => c.isSystem || c.peerCode === "admin" || c.peerCode === "system");
    if (activeTab === "pending")
      return allConversations.filter((c) => (c as any).isPending || (c as any).isStranger);
    if (activeTab === "members")
      return allConversations.filter((c) => !c.isSystem && c.peerCode !== "admin" && c.peerCode !== "system");
    return allConversations;
  }, [allConversations, activeTab]);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return baseConvs;
    return baseConvs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.peerCode.toLowerCase().includes(q) ||
        (c.last && c.last.toLowerCase().includes(q)),
    );
  }, [baseConvs, searchTerm]);

  return (
    <div className="vba-app vba-animate min-h-[100dvh] bg-slate-50 dark:bg-[#070D1A] text-slate-900 dark:text-white pb-20">
      <MemberHeader title="Gắn kết & Tin nhắn" back />

      {/* Borderless Search Bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] shadow-none focus-within:ring-0 focus-within:border-0 focus-within:outline-none">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm người liên hệ hoặc nội dung tin nhắn..."
            className="flex-1 bg-transparent text-[13px] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none focus-visible:ring-offset-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-none borderless-search-input"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messenger-style Online / Active Members Row */}
      <div className="pt-2 pb-1.5 border-b border-slate-200/60 dark:border-white/5">
        <div className="flex items-center gap-3.5 px-4 overflow-x-auto no-scrollbar py-1">
          {/* Compose New Message */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-14 shrink-0 flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-amber-500/60 dark:border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-[#003B95] dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition shadow-xs">
                <Plus className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[56px] text-center">
              Nhắn mới
            </span>
          </button>

          {/* Active / Messaged Members Row with Green Dot ONLY when online */}
          {allConversations
            .filter((c) => !c.isSystem && c.peerCode !== "admin" && c.peerCode !== "system" && Boolean(c.last && c.last.trim()))
            .map((c) => {
              const shortName = getShortName(c.name);
              const avatarUrl = c.avatarUrl ? resolveMediaUrl(c.avatarUrl) || c.avatarUrl : null;
              const isOnline = checkOnline(c);
              return (
                <button
                  key={c.peerCode}
                  type="button"
                  onClick={() => onOpen(c)}
                  className="w-14 shrink-0 flex flex-col items-center gap-1 cursor-pointer group"
                  title={`${c.name} (${c.peerCode}) - ${isOnline ? "Đang hoạt động" : "Không trực tuyến"}`}
                >
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={c.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-amber-500/80 p-0.5 group-hover:scale-105 transition-transform duration-150 shadow-xs"
                      />
                    ) : (
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#003B95] to-[#1E40AF] text-amber-300 font-bold text-xs ring-2 ring-amber-500/80 group-hover:scale-105 transition-transform duration-150 shadow-xs">
                        {initialsOf(c.name)}
                      </span>
                    )}
                    {/* Green online dot indicator ONLY when actually online */}
                    {isOnline && (
                      <span
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070D1A]"
                        title="Đang hoạt động"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[58px] text-center group-hover:text-amber-500 transition-colors">
                    {shortName}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Filter Tabs with Classic Navy & Gold Theme */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#003B95] text-white font-bold shadow-xs"
              : "border-0 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Tất cả</span>
          <span className="text-[11px] opacity-80">({allConversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "unread"
              ? "bg-[#003B95] text-white font-bold shadow-xs"
              : "border-0 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#EA580C] px-1.5 py-0.2 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-[#003B95] text-white font-bold shadow-xs"
              : "border-0 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Hội viên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-[#003B95] text-white font-bold shadow-xs"
              : "border-0 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Tin nhắn đang chờ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "system"
              ? "bg-[#003B95] text-white font-bold shadow-xs"
              : "border-0 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Tin nhắn từ hệ thống</span>
          <span className="text-[11px] opacity-80">({systemCount})</span>
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite" data-testid="messages-announcement">
        {loading
          ? t("m.messages.announce.loading")
          : t("m.messages.announce.count", { count: conversations.length })}
      </p>

      {/* Member Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 p-4 max-h-[85vh] flex flex-col shadow-2xl animate-fade-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                  Tin nhắn mới
                </h3>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="pt-3 pb-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3 py-2 text-[13px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={pickerQ}
                  onChange={(e) => setPickerQ(e.target.value)}
                  placeholder="Tìm thành viên trong hiệp hội..."
                  className="flex-1 bg-transparent text-[13px] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 borderless-search-input"
                  style={{ outline: "none", border: "none", boxShadow: "none" }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
              {filteredMembers.length === 0 ? (
                <p className="py-8 text-center text-[12px] text-slate-400">
                  Không tìm thấy thành viên phù hợp
                </p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.code}
                    onClick={() => {
                      setPickerOpen(false);
                      onOpen({
                        peerCode: m.code,
                        name: m.name,
                        last: "",
                        time: "Vừa xong",
                        unread: 0,
                      });
                    }}
                    className="flex w-full items-center gap-3 py-2.5 px-2 text-left hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/10 text-[#003B95] dark:text-amber-300 font-bold text-[12px] ring-1 ring-amber-500/30">
                      {initialsOf(m.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
                          {m.name}
                        </span>
                        <span className="rounded bg-[#003B95]/15 px-1.5 py-0.2 text-[9px] font-bold text-[#003B95] dark:text-amber-400 shrink-0">
                          {m.code}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {[m.industry, m.region].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversation Thread List */}
      <div
        className="space-y-1.5 pb-20 mt-2 px-4"
        role="list"
        aria-live="polite"
        aria-busy={loading}
        aria-label={t("m.messages.title")}
      >
        {loading && (
          <div className="py-12 text-center text-[13px] text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#003B95] dark:text-amber-400" />
            <span>Đang tải danh sách tin nhắn...</span>
          </div>
        )}
        {error && <p className="py-8 text-center text-[13px] text-rose-500">{error}</p>}
        {!loading && !error && filteredConversations.length === 0 && (
          activeTab === "unread" ? (
            <div className="py-24 text-center">
              <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                Bạn không có tin nhắn nào
              </p>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                {searchTerm
                  ? "Không tìm thấy cuộc trò chuyện phù hợp"
                  : "Chưa có cuộc trò chuyện nào"}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa ô tìm kiếm."
                  : "Bấm nút 'Nhắn mới' để kết nối và trao đổi với các hội viên!"}
              </p>
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-[#003B95] dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Xóa tìm kiếm
                </button>
              ) : (
                <button
                  onClick={() => setPickerOpen(true)}
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-white" />
                  Bắt đầu trò chuyện
                </button>
              )}
            </div>
          )
        )}
        {filteredConversations.map((c: any) => {
          const isSystem = c.isSystem || c.peerCode === "admin" || c.peerCode === "system";
          const matchedMember = members.find((m) => m.code.toLowerCase() === c.peerCode.toLowerCase());
          const resolvedAvatar = c.avatarUrl || matchedMember?.avatar || null;
          const resolvedName =
            c.name && c.name.trim().toLowerCase() !== c.peerCode.toLowerCase()
              ? c.name
              : matchedMember?.personName || matchedMember?.contact || matchedMember?.name || c.name || c.peerCode;

          return (
            <div key={c.peerCode} role="listitem">
              <button
                onClick={() => onOpen(c)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer mb-2.5 ${
                  isSystem
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/10 dark:border-amber-400/30 shadow-sm"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131a27] hover:border-amber-400/30 shadow-xs"
                }`}
              >
                <div
                  className="relative shrink-0 cursor-pointer group/avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAvatarClick(c);
                  }}
                  title="Xem thông tin hội viên & Nhắn tin"
                >
                  {isSystem ? (
                    <img
                      src="/ceo1983-logo.png"
                      alt="CEO 1983"
                      className="h-12 w-12 rounded-full object-contain p-1 bg-white ring-2 ring-amber-500/40 shadow-xs"
                    />
                  ) : resolvedAvatar ? (
                    <img
                      src={resolveMediaUrl(resolvedAvatar) || resolvedAvatar}
                      alt={resolvedName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-500/70 shadow-xs group-hover/avatar:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-[#003B95] to-[#1E40AF] text-[14px] font-bold text-amber-300 ring-2 ring-amber-500/70 shadow-xs group-hover/avatar:scale-105 transition-transform">
                      {initialsOf(resolvedName)}
                    </span>
                  )}
                  {isSystem ? (
                    <span
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[#071322] shadow-xs font-bold"
                      title="Kênh chính thức"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                  ) : checkOnline(c) ? (
                    <span
                      className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131a27]"
                      title="Đang hoạt động"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate text-[14px] font-bold text-slate-900 dark:text-white">
                        {resolvedName}
                      </span>
                      {isSystem && (
                        <span className="shrink-0 rounded-md bg-[var(--vba-gold-soft)] border border-[var(--vba-border-accent)] px-1.5 py-0.2 text-[9px] font-extrabold text-[var(--vba-gold)] uppercase tracking-wide">
                          Hệ thống
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {fmt.rel(c.time)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="truncate text-[12.5px] text-slate-600 dark:text-slate-300 font-normal">
                      {formatMessagePreview(c.last)}
                    </span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-rose-500 px-1.5 text-[10.5px] font-bold text-white shadow-xs">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Profile Modal */}
      <MemberProfileModal
        member={selectedMemberModal}
        onClose={() => setSelectedMemberModal(null)}
        onMessage={(m) => {
          setSelectedMemberModal(null);
          onOpen({
            peerCode: m.code,
            name: m.personName || m.name,
            last: "",
            time: "Vừa xong",
            unread: 0,
            avatarUrl: m.avatar,
          });
        }}
      />
    </div>
  );
}

function ChatThread({
  peer,
  onBack,
  members = [],
}: {
  peer: MyConversation;
  onBack: () => void;
  members?: DirectoryMember[];
}) {
  const t = useT();
  const fmt = useFmt();
  const { data, loading, error, reload } = useServerData(
    () => listMessages({ data: { peerCode: peer.peerCode } }),
    { peerName: peer.name, messages: [] as Awaited<ReturnType<typeof listMessages>>["messages"] },
  );
  const send = useServerFn(sendMessage);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<ActionPaymentData | null>(null);
  const [profileMember, setProfileMember] = useState<DirectoryMember | null>(null);

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`vba.chat.${peer.peerCode}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isPeerOnline, setIsPeerOnline] = useState<boolean>(() => Boolean(peer.isOnline));

  useEffect(() => {
    setIsPeerOnline(Boolean(peer.isOnline));
  }, [peer.isOnline]);

  useEffect(() => {
    if (peer.isSystem || peer.peerCode === "admin" || peer.peerCode === "system") return;
    const socket = getConnectAppSocket();
    if (!socket.connected) {
      socket.connect();
    }
    const handleOnline = (data: { userId?: string }) => {
      if (
        data?.userId &&
        (data.userId === peer.userId ||
          data.userId.toLowerCase() === peer.peerCode.toLowerCase())
      ) {
        setIsPeerOnline(true);
      }
    };
    const handleOffline = (data: { userId?: string }) => {
      if (
        data?.userId &&
        (data.userId === peer.userId ||
          data.userId.toLowerCase() === peer.peerCode.toLowerCase())
      ) {
        setIsPeerOnline(false);
      }
    };
    socket.on("presence:user_online", handleOnline);
    socket.on("presence:user_offline", handleOffline);
    return () => {
      socket.off("presence:user_online", handleOnline);
      socket.off("presence:user_offline", handleOffline);
    };
  }, [peer.userId, peer.peerCode, peer.isSystem]);

  const matchedMember = members.find((m) => m.code.toLowerCase() === peer.peerCode.toLowerCase());
  const resolvedAvatar = peer.avatarUrl || matchedMember?.avatar || null;
  const displayName =
    peer.name && peer.name.trim().toLowerCase() !== peer.peerCode.toLowerCase()
      ? peer.name
      : matchedMember?.personName || matchedMember?.contact || matchedMember?.name || data.peerName || peer.name || peer.peerCode;

  const handleOpenPeerProfile = () => {
    if (peer.isSystem || peer.peerCode === "admin" || peer.peerCode === "system") return;
    const found = members.find((m) => m.code.toLowerCase() === peer.peerCode.toLowerCase());
    if (found) {
      setProfileMember(found);
    } else {
      setProfileMember({
        code: peer.peerCode,
        name: displayName,
        personName: displayName,
        contact: displayName,
        personTitle: "Hội viên CEO 1983",
        industry: "Kinh doanh & Quản lý",
        region: "Hà Nội",
        type: "individual",
        verified: true,
        avatar: resolvedAvatar,
      });
    }
  };

  const mergedMessages = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of data.messages) {
      map.set(m.id, m);
    }
    for (const m of localMessages) {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt || a.time).getTime() - new Date(b.createdAt || b.time).getTime(),
    );
  }, [data.messages, localMessages]);

  const [callModal, setCallModal] = useState<{ open: boolean; type: "audio" | "video" }>({
    open: false,
    type: "audio",
  });
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);
  const [retractedMsgIds, setRetractedMsgIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(`vba.chat.retracted.${peer.peerCode}`) || "[]");
      return new Set(saved);
    } catch {
      return new Set();
    }
  });
  const [msgReactions, setMsgReactions] = useState<Record<string, { emoji: string; count: number }[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(`vba.chat.reactions.${peer.peerCode}`) || "{}");
    } catch {
      return {};
    }
  });

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMsgReactions((prev) => {
      const list = prev[msgId] ? [...prev[msgId]] : [];
      const existingIdx = list.findIndex((r) => r.emoji === emoji);
      if (existingIdx !== -1) {
        list.splice(existingIdx, 1);
      } else {
        list.push({ emoji, count: 1 });
      }
      const next = { ...prev, [msgId]: list };
      try {
        localStorage.setItem(`vba.chat.reactions.${peer.peerCode}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveReactionPickerMsgId(null);
  };

  const handleRetractMessage = (msgId: string) => {
    setRetractedMsgIds((prev) => {
      const next = new Set(prev);
      next.add(msgId);
      try {
        localStorage.setItem(`vba.chat.retracted.${peer.peerCode}`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setActiveMenuMsgId(null);
    toast.success("Đã thu hồi tin nhắn");
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Đã sao chép nội dung tin nhắn");
    setActiveMenuMsgId(null);
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
    };
  }, []);

  useEffect(() => {
    const socket = getConnectAppSocket();
    if (!socket.connected) {
      socket.connect();
    }
    const handleUpdate = () => reload();
    socket.on("dm:message_received", handleUpdate);
    socket.on("dm:thread_updated", handleUpdate);
    socket.on("dm:message_retracted", (data: any) => {
      if (data?.messageId) {
        setRetractedMsgIds((prev) => {
          const next = new Set(prev);
          next.add(data.messageId);
          return next;
        });
      }
      reload();
    });
    socket.on("dm:read_receipt", handleUpdate);
    socket.on("dm:reaction_updated", handleUpdate);
    socket.on("member:message_received", handleUpdate);

    const handleFocus = () => reload();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      socket.off("dm:message_received", handleUpdate);
      socket.off("dm:thread_updated", handleUpdate);
      socket.off("dm:message_retracted", handleUpdate);
      socket.off("dm:read_receipt", handleUpdate);
      socket.off("dm:reaction_updated", handleUpdate);
      socket.off("member:message_received", handleUpdate);
    };
  }, [reload, peer.peerCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages.length]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(
      isImage ? `Đang tải ảnh "${file.name}"...` : `Đang tải tệp "${file.name}"...`,
    );
    setUploadMenuOpen(false);

    try {
      const uploaded = await uploadChatAttachment(file);
      let payload = "";
      if (uploaded.isImage) {
        payload = text.trim()
          ? `${text.trim()}\n[image:${uploaded.url}|${uploaded.name}]`
          : `[image:${uploaded.url}|${uploaded.name}]`;
      } else {
        payload = text.trim()
          ? `${text.trim()}\n[file:${uploaded.url}|${uploaded.name}|${uploaded.size}]`
          : `[file:${uploaded.url}|${uploaded.name}|${uploaded.size}]`;
      }

      // Optimistic file message
      const tempId = "local-file-" + Date.now();
      const optimisticMsg: ChatMessage = {
        id: tempId,
        text: payload,
        mine: true,
        time: "Vừa xong",
        createdAt: new Date().toISOString(),
        seen: false,
      };
      const nextLocal = [...localMessages, optimisticMsg];
      setLocalMessages(nextLocal);
      try {
        localStorage.setItem(`vba.chat.${peer.peerCode}`, JSON.stringify(nextLocal.slice(-50)));
      } catch {}
      setText("");

      saveRecentConversation(peer, payload);
      await send({ data: { peerCode: peer.peerCode, text: payload } });
      reload();
    } catch {
      toast.error("Tải tệp đính kèm thất bại");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (e.target) e.target.value = "";
    }
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending || isUploading) return;
    setSending(true);

    // Optimistic instant message
    const tempId = "local-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      text: value,
      mine: true,
      time: "Vừa xong",
      createdAt: new Date().toISOString(),
      seen: false,
    };
    const nextLocal = [...localMessages, optimisticMsg];
    setLocalMessages(nextLocal);
    try {
      localStorage.setItem(`vba.chat.${peer.peerCode}`, JSON.stringify(nextLocal.slice(-50)));
    } catch {}
    setText("");
    saveRecentConversation(peer, value);

    try {
      await send({ data: { peerCode: peer.peerCode, text: value } });
      reload();
    } catch (err) {
      console.warn("Send message sync notice:", err);
      // Still kept in local messages
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#0c121e] text-slate-900 dark:text-white overflow-hidden max-w-[480px] mx-auto shadow-2xl"
      onClick={() => setUploadMenuOpen(false)}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileSelected(e, true)}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
        className="hidden"
        onChange={(e) => void handleFileSelected(e, false)}
      />

      {/* Lightbox Modal for Images & VietQR */}
      {previewImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <a
              href={previewImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={(e) => e.stopPropagation()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Tải ảnh về máy"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <img
            src={previewImageUrl}
            alt="Xem ảnh lớn"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

      {/* VietQR Payment Modal */}
      {paymentModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setPaymentModalData(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[var(--vba-surface)] border border-[var(--vba-gold)]/40 p-5 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--vba-border-soft)]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--vba-gold)]" />
                <span className="text-[14px] font-bold text-[var(--vba-text)]">
                  Thanh toán VietQR
                </span>
              </div>
              <button
                onClick={() => setPaymentModalData(null)}
                className="text-[var(--vba-text-dim)] hover:text-[var(--vba-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[12px] text-[var(--vba-text-muted)]">Số tiền cần thanh toán</p>
              <p className="text-[24px] font-extrabold text-[var(--vba-gold)]">
                {paymentModalData.amount.toLocaleString("vi-VN")} ₫
              </p>
              <p className="text-[12px] font-medium text-[var(--vba-text-dim)]">
                Mã hóa đơn: {paymentModalData.invoiceNo}
              </p>
            </div>

            <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white p-2 shadow-inner overflow-hidden border border-black/10">
              <img
                src={paymentModalData.qrUrl}
                alt="VietQR"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] text-[var(--vba-text-muted)] leading-relaxed">
              Mở ứng dụng ngân hàng bất kỳ để quét mã QR và xác nhận giao dịch. Thông tin người nhận
              và nội dung đã được điền tự động.
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href={paymentModalData.qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`vietqr-${paymentModalData.invoiceNo}.png`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] py-2 text-[12px] font-semibold text-[var(--vba-text)] hover:border-[var(--vba-gold)]"
              >
                <Download className="h-3.5 w-3.5" />
                Lưu mã QR
              </a>
              <button
                onClick={() => {
                  toast.success("Hệ thống đang kiểm tra trạng thái thanh toán!");
                  setPaymentModalData(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--vba-gold)] py-2 text-[12px] font-bold text-slate-950 hover:brightness-110 shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Call & Video Call Actions - Safe Area Insets & High z-index */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c121e]/95 px-4 pb-2.5 shrink-0 backdrop-blur-md shadow-xs"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="grid h-9 w-9 place-items-center rounded-full text-[#003B95] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-white/10 active:scale-95 transition-all shrink-0 -ml-1 mr-0.5 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition"
            onClick={handleOpenPeerProfile}
            title="Bấm để xem profile hội viên"
          >
            <div className="relative shrink-0">
              {peer.isSystem || peer.peerCode === "admin" ? (
                <img
                  src="/ceo1983-logo.png"
                  alt="CEO 1983"
                  className="h-9 w-9 rounded-full object-contain p-0.5 bg-white ring-1 ring-amber-500/40 shadow-xs"
                />
              ) : resolvedAvatar ? (
                <img
                  src={resolveMediaUrl(resolvedAvatar) || resolvedAvatar}
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-500/70 shadow-xs"
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#003B95] to-[#1E40AF] text-amber-300 text-xs font-bold ring-2 ring-amber-500/70 shadow-xs">
                  {initialsOf(displayName)}
                </div>
              )}
              {isPeerOnline && (
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c121e]"
                  title="Đang hoạt động"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-bold text-slate-900 dark:text-white">
                  {displayName}
                </span>
                {(peer.isSystem || peer.peerCode === "admin" || peer.peerCode === "system") && (
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {peer.isSystem || peer.peerCode === "admin" || peer.peerCode === "system" ? (
                  "Kênh thông báo hệ thống"
                ) : isPeerOnline ? (
                  <>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đang hoạt động</span>
                    <span>· Xem profile ›</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Không trực tuyến</span>
                    <span>· Xem profile ›</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Messenger Call Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setCallModal({ open: true, type: "audio" })}
            className="grid h-9 w-9 place-items-center rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Gọi thoại Messenger"
          >
            <Phone className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setCallModal({ open: true, type: "video" })}
            className="grid h-9 w-9 place-items-center rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            title="Gọi video Messenger"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messenger Call Modal */}
      {callModal.open && (
        <MessengerCallModal
          type={callModal.type}
          peerName={displayName}
          peerAvatar={peer.avatarUrl}
          onClose={() => setCallModal({ open: false, type: "audio" })}
        />
      )}

      {/* Message List */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && (
          <p className="py-8 text-center text-[13px] text-slate-400">{t("m.messages.loading")}</p>
        )}
        {error && <p className="py-8 text-center text-[13px] text-rose-500">{error}</p>}
        {!loading && mergedMessages.length === 0 && (
          <p className="py-8 text-center text-[13px] text-slate-400">
            {t("m.messages.emptyThread")}
          </p>
        )}
        {(() => {
          return mergedMessages.map((m, idx) => {
            const prevMsg = idx > 0 ? mergedMessages[idx - 1] : null;
            const isNewDay =
              !prevMsg ||
              new Date(m.createdAt || m.time).toDateString() !==
                new Date(prevMsg.createdAt || prevMsg.time).toDateString();
            const isRetracted = m.retracted || retractedMsgIds.has(m.id);
            const reactions = msgReactions[m.id] || m.reactions || [];
            const content = parseMessageContent(m.text);

            return (
              <div key={m.id} className="space-y-1.5">
                {isNewDay && (
                  <div className="flex items-center justify-center my-3">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                      {formatDateSeparator(m.createdAt || m.time)}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col group relative ${m.mine ? "items-end" : "items-start"}`}>
                  {/* Action buttons (Menu & Reaction) */}
                  {!isRetracted && (
                    <div
                      className={`flex items-center gap-1 mb-1 transition-opacity opacity-0 group-hover:opacity-100 ${
                        m.mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Reaction Picker Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReactionPickerMsgId(
                              activeReactionPickerMsgId === m.id ? null : m.id,
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer text-[12px]"
                          title="Thả cảm xúc"
                        >
                          <Smile className="h-3.5 w-3.5" />
                        </button>
                        {activeReactionPickerMsgId === m.id && (
                          <div className="absolute bottom-7 right-0 z-30 flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl backdrop-blur-md animate-fade-in">
                            {QUICK_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(m.id, emoji)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[15px] hover:scale-125 transition-transform cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* More Menu (...) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuMsgId(activeMenuMsgId === m.id ? null : m.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                          title="Tùy chọn"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {activeMenuMsgId === m.id && (
                          <div className="absolute bottom-7 right-0 z-30 min-w-[130px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl backdrop-blur-md">
                            <button
                              type="button"
                              onClick={() => handleCopyText("text" in content ? (content as any).text : m.text)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Sao chép</span>
                            </button>
                            {m.mine && (
                              <button
                                type="button"
                                onClick={() => handleRetractMessage(m.id)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Thu hồi tin nhắn</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isRetracted ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-3.5 py-2 text-[12.5px] italic text-slate-500 dark:text-slate-400">
                      Tin nhắn đã được thu hồi
                    </div>
                  ) : (
                    <div
                      className={`max-w-[86%] sm:max-w-[78%] rounded-2xl shadow-xs overflow-hidden ${
                        content.type === "action_payment"
                          ? "rounded-2xl bg-transparent border-0 shadow-none p-0"
                          : m.mine
                            ? "border border-[#003B95] bg-transparent text-black shadow-2xs"
                            : "border border-slate-200 dark:border-white/10 bg-transparent text-black shadow-2xs"
                      }`}
                    >
                      {/* Action Card: Overdue Payment VietQR / Zalo OA style */}
                      {content.type === "action_payment" ? (
                        <ZaloTransactionCard data={content.data} isFromMe={m.mine} />
                      ) : content.type === "action_meeting" ? (
                        /* Action Card: Meeting Invitation */
                        <div className="p-3.5 space-y-3 bg-[var(--vba-surface)] text-[var(--vba-text)] border-l-4 border-amber-500">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-1 text-[#003B95] dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <Calendar className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-[12px] font-bold text-[#003B95] dark:text-amber-400 tracking-wide uppercase">
                                Thư mời tham dự cuộc họp
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                CLB Doanh Nhân CEO 1983
                              </p>
                            </div>
                          </div>

                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                            {content.data.title}
                          </h4>

                          <div className="space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-[11px] border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {content.data.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              <span className="truncate text-slate-700 dark:text-slate-300">
                                {content.data.location}
                              </span>
                            </div>
                          </div>

                          {content.data.desc && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {content.data.desc}
                            </p>
                          )}

                          <div className="flex gap-2 pt-1">
                            {content.data.link && (
                              <a
                                href={content.data.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 py-2 text-[11.5px] font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                Vào phòng họp
                              </a>
                            )}
                            <button
                              onClick={() => toast.success("Đã ghi nhận xác nhận tham dự của bạn!")}
                              style={{ color: "#ffffff" }}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2 text-[11.5px] font-bold text-white active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Xác nhận tham dự
                            </button>
                          </div>
                        </div>
                      ) : content.type === "image" ? (
                        <div className="p-1.5 space-y-1.5">
                          <div
                            onClick={() => setPreviewImageUrl(content.url)}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
                          >
                            <img
                              src={content.url}
                              alt={content.name || "Hình ảnh"}
                              className="max-h-60 max-w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Xem ảnh
                              </span>
                            </div>
                          </div>
                          {content.caption ? (
                            <p className="px-2 pb-1 text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
                              {content.caption}
                            </p>
                          ) : null}
                        </div>
                      ) : content.type === "file" ? (
                        <div className="p-2 space-y-1.5">
                          {(() => {
                            const badge = getFileBadgeInfo(content.name);
                            return (
                              <a
                                href={content.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                              >
                                <div
                                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border font-bold text-[11px] ${badge.color}`}
                                >
                                  {badge.label}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">
                                    {content.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {content.size ? (
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {formatFileSize(content.size)}
                                      </span>
                                    ) : null}
                                    <span className="flex items-center gap-0.5 text-[11px] font-medium underline text-[#003B95] dark:text-amber-400">
                                      <Download className="h-3 w-3" />
                                      Tải về
                                    </span>
                                  </div>
                                </div>
                              </a>
                            );
                          })()}
                          {content.caption ? (
                            <p className="px-2 text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
                              {content.caption}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 text-[13px]">
                          <p
                            className="whitespace-pre-wrap break-words text-black font-normal leading-snug"
                            style={{ color: "#000000" }}
                          >
                            {content.text}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 pt-0.5 text-[9.5px] font-medium leading-none select-none">
                            <span style={{ color: "#64748b" }}>
                              {formatMessageTime(m.createdAt || m.time)}
                            </span>
                            {m.mine && (
                              <span
                                className={m.seen ? "font-bold ml-0.5" : "ml-0.5"}
                                style={{ color: m.seen ? "#003B95" : "#64748b" }}
                              >
                                {m.seen ? "✓✓ Đã xem" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions Pill Display */}
                  {reactions.length > 0 && !isRetracted && (
                    <div className="flex items-center gap-1 mt-1">
                      {reactions.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-bold shadow-2xs"
                        >
                          <span>{r.emoji}</span>
                          {r.count && r.count > 1 && (
                            <span className="text-[10px] text-slate-600 dark:text-slate-300">
                              {r.count}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}
        <div ref={bottomRef} />
      </div>

      {isUploading ? (
        <div className="flex items-center gap-2 border-t border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-[12px] text-[#003B95] dark:text-amber-400 animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span className="truncate">{uploadProgress || "Đang tải tệp lên..."}</span>
        </div>
      ) : null}

      {/* Input Bar - Safe Area Insets to avoid mobile navigation bar overlap */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0f172a]/95 px-3 pt-2.5 shrink-0 backdrop-blur-md"
        style={{
          marginBottom: `${keyboardOffset}px`,
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)",
        }}
      >
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUploadMenuOpen((prev) => !prev);
            }}
            disabled={isUploading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Đính kèm tệp hoặc ảnh"
          >
            <Plus className="h-4 w-4" />
          </button>

          {uploadMenuOpen && (
            <div
              className="absolute bottom-12 left-0 z-40 w-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-md animate-fade-in space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                  setUploadMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ImageIcon className="h-4 w-4 text-emerald-500" />
                Gửi hình ảnh
              </button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setUploadMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                Gửi tài liệu
              </button>
            </div>
          )}
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-2xl border-0 border-none bg-slate-100 dark:bg-white/[0.06] px-4 py-2 text-[13px] text-slate-900 dark:text-white outline-none focus:outline-none focus:ring-0 ring-0 placeholder:text-slate-400 shadow-none"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending || isUploading}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer shadow-md"
          title="Gửi tin nhắn"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {/* Member Profile Modal in Chat */}
      <MemberProfileModal
        member={profileMember}
        onClose={() => setProfileMember(null)}
        onMessage={() => setProfileMember(null)}
      />
    </div>
  );
}

function MessengerCallModal({
  type,
  peerName,
  peerAvatar,
  onClose,
}: {
  type: "audio" | "video";
  peerName: string;
  peerAvatar?: string | null;
  onClose: () => void;
}) {
  const [callStatus, setCallStatus] = useState<"ringing" | "connected">("ringing");
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 2500);
    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const fmtDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    toast.info("Cuộc gọi đã kết thúc");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-black p-6 text-white backdrop-blur-2xl animate-fade-in select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-6 text-slate-300">
        <span className="text-[12px] font-semibold tracking-wide uppercase flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          {type === "video" ? "Cuộc gọi Video mã hóa E2E" : "Cuộc gọi Thoại mã hóa E2E"}
        </span>
        <button
          onClick={handleEndCall}
          className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Avatar & Caller Info */}
      <div className="flex flex-col items-center justify-center my-auto space-y-5">
        <div className="relative">
          {/* Concentric wave rings when ringing */}
          {callStatus === "ringing" && (
            <>
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping opacity-60" />
              <div className="absolute -inset-8 rounded-full bg-blue-500/10 animate-pulse opacity-40" />
            </>
          )}

          {peerAvatar ? (
            <img
              src={resolveMediaUrl(peerAvatar) || peerAvatar}
              alt={peerName}
              className="relative h-28 w-28 rounded-full object-cover ring-4 ring-blue-500/50 shadow-2xl"
            />
          ) : (
            <div className="relative grid h-28 w-28 place-items-center rounded-full bg-blue-600/30 text-blue-300 ring-4 ring-blue-500/50 text-3xl font-black shadow-2xl">
              {initialsOf(peerName)}
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">{peerName}</h2>
          <p className="text-sm font-medium text-slate-400">
            {callStatus === "ringing" ? "Đang đổ chuông..." : fmtDuration(callSeconds)}
          </p>
        </div>
      </div>

      {/* Call Controls Bar */}
      <div className="w-full max-w-xs flex items-center justify-around pb-8">
        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          className={`flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer ${
            isMuted ? "text-rose-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border ${
              isMuted
                ? "bg-rose-500/20 border-rose-500"
                : "bg-white/10 border-white/15 hover:bg-white/20"
            }`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </div>
          <span className="text-[11px] font-medium">{isMuted ? "Đã tắt mic" : "Tắt mic"}</span>
        </button>

        {type === "video" && (
          <button
            type="button"
            onClick={() => setIsVideoOff((v) => !v)}
            className={`flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer ${
              isVideoOff ? "text-rose-400" : "text-white"
            }`}
          >
            <div
              className={`grid h-13 w-13 place-items-center rounded-full border ${
                isVideoOff
                  ? "bg-rose-500/20 border-rose-500"
                  : "bg-white/10 border-white/15 hover:bg-white/20"
              }`}
            >
              <Video className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-medium">{isVideoOff ? "Bật cam" : "Tắt cam"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsSpeaker((s) => !s)}
          className={`flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer ${
            isSpeaker ? "text-blue-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border ${
              isSpeaker
                ? "bg-blue-500/20 border-blue-500"
                : "bg-white/10 border-white/15 hover:bg-white/20"
            }`}
          >
            <Volume2 className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-medium">Loa ngoài</span>
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={handleEndCall}
          className="flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer text-white"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-600 hover:bg-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.6)]">
            <PhoneOff className="h-6 w-6 text-white" />
          </div>
          <span className="text-[11px] font-medium text-rose-300">Kết thúc</span>
        </button>
      </div>
    </div>
  );
}
