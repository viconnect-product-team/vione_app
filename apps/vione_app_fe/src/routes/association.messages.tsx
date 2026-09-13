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
  type DirectoryMember,
} from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
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
} from "lucide-react";
import { uploadChatAttachment } from "@/lib/upload-media";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api-client";
import {
  ZaloTransactionCard,
  type ZaloTransactionData,
} from "@/components/business-connect/mobile/ZaloTransactionCard";

const messagesSearchSchema = z.object({
  peerCode: z.string().optional(),
  peerName: z.string().optional(),
});

export const Route = createFileRoute("/association/messages")({
  validateSearch: (search: Record<string, unknown>) => messagesSearchSchema.parse(search),
  component: MessagesScreen,
});

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("");
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

function parseMessageContent(body: string): ParsedContent {
  // Action: Payment with VietQR
  const payMatch = body.match(/\[action:payment\|amount:(\d+)\|invoice:([^|]+)\|qr:([^|]+)(?:\|due:([^|]+))?(?:\|desc:([^\]]*))?\]/i);
  if (payMatch) {
    return {
      type: "action_payment",
      data: {
        amount: parseInt(payMatch[1], 10),
        invoiceNo: payMatch[2],
        qrUrl: payMatch[3],
        dueDate: payMatch[4],
        desc: payMatch[5] ? decodeURIComponent(payMatch[5]) : undefined,
      },
    };
  }

  // Action: Meeting invitation
  const meetMatch = body.match(/\[action:meeting\|title:([^|]+)\|time:([^|]+)\|location:([^|]+)(?:\|link:([^|]+))?(?:\|desc:([^\]]*))?\]/i);
  if (meetMatch) {
    return {
      type: "action_meeting",
      data: {
        title: meetMatch[1],
        time: meetMatch[2],
        location: meetMatch[3],
        link: meetMatch[4] || undefined,
        desc: meetMatch[5] ? decodeURIComponent(meetMatch[5]) : undefined,
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

  const isRawImageUrl = /^(https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp|svg))(?:\?.*)?$/i.test(body.trim());
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
    return <ChatThread peer={active} onBack={() => setActive(null)} />;
  }
  return <ConversationList onOpen={setActive} />;
}

type ConvFilter = "all" | "unread" | "system" | "members";

function ConversationList({ onOpen }: { onOpen: (c: MyConversation) => void }) {
  const t = useT();
  const fmt = useFmt();
  const {
    data: conversations,
    loading,
    error,
    reload,
  } = useServerData<MyConversation[]>(() => listConversations(), []);

  const fetchMembers = useServerFn(listMembers);
  const { data: members = [] } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQ, setPickerQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ConvFilter>("all");

  useEffect(() => {
    const timer = setInterval(() => reload(), 6000);
    return () => clearInterval(timer);
  }, [reload]);

  const filteredMembers = members.filter((m) => {
    const q = pickerQ.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.industry.toLowerCase().includes(q)
    );
  });

  const unreadCount = conversations.filter((c) => (c.unread || 0) > 0).length;
  const systemCount = conversations.filter((c) => c.isSystem || c.peerCode === "admin").length;

  const baseConvs = useMemo(() => {
    if (activeTab === "unread") return conversations.filter((c) => (c.unread || 0) > 0);
    if (activeTab === "system") return conversations.filter((c) => c.isSystem || c.peerCode === "admin");
    if (activeTab === "members") return conversations.filter((c) => !c.isSystem && c.peerCode !== "admin");
    return conversations;
  }, [conversations, activeTab]);

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
    <div className="vba-app vba-animate min-h-[100dvh] bg-slate-50 dark:bg-[#0c121e] text-slate-900 dark:text-white pb-20">
      <MemberHeader
        title={t("m.messages.title")}
        back
      />

      {/* ViOne Style Search Bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3.5 py-2.5 text-[13px] shadow-xs">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm người liên hệ hoặc nội dung tin nhắn..."
            className="flex-1 bg-transparent text-[13px] outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
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

      {/* ViOne Style Filter Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[var(--vba-gold,#D4AF37)] text-slate-950 font-bold shadow-xs"
              : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Tất cả</span>
          <span className="text-[11px] opacity-75">({conversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "unread"
              ? "bg-[var(--vba-gold,#D4AF37)] text-slate-950 font-bold shadow-xs"
              : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "system"
              ? "bg-[var(--vba-gold,#D4AF37)] text-slate-950 font-bold shadow-xs"
              : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>Hệ thống</span>
          <span className="text-[11px] opacity-75">({systemCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-[var(--vba-gold,#D4AF37)] text-slate-950 font-bold shadow-xs"
              : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          <span>Hội viên</span>
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
                <MessageSquare className="h-5 w-5 text-sky-500" />
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Tin nhắn mới</h3>
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
                  className="flex-1 bg-transparent text-[13px] outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
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
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold text-[12px] ring-1 ring-sky-500/30">
                      {initialsOf(m.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
                          {m.name}
                        </span>
                        <span className="rounded bg-sky-500/15 px-1.5 py-0.2 text-[9px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
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
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            <span>Đang tải danh sách tin nhắn...</span>
          </div>
        )}
        {error && (
          <p className="py-8 text-center text-[13px] text-rose-500">{error}</p>
        )}
        {!loading && !error && filteredConversations.length === 0 && (
          <div className="py-12 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6">
            <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
              {searchTerm ? "Không tìm thấy cuộc trò chuyện phù hợp" : "Chưa có cuộc trò chuyện nào"}
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
                className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            ) : (
              <button
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 px-4 py-2 text-[12px] font-bold text-slate-950 shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer hover:opacity-95"
              >
                <Plus className="h-4 w-4 text-slate-950" />
                Bắt đầu trò chuyện
              </button>
            )}
          </div>
        )}
        {filteredConversations.map((c: any) => {
          const isSystem = c.isSystem || c.peerCode === "admin" || c.peerCode === "system";
          return (
            <div key={c.peerCode} role="listitem">
              <button
                onClick={() => onOpen(c)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer mb-2.5 ${
                  isSystem
                    ? "border-sky-400/40 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-400/10 dark:border-sky-400/30 shadow-sm"
                    : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131a27] hover:border-sky-400/30 shadow-xs"
                }`}
              >
                <div className="relative shrink-0">
                  {isSystem ? (
                    <img
                      src="/ceo1983-logo.png"
                      alt="CEO 1983"
                      className="h-12 w-12 rounded-full object-contain p-1 bg-white ring-2 ring-sky-500/40 shadow-xs"
                    />
                  ) : c.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(c.avatarUrl) || c.avatarUrl}
                      alt={c.name}
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 shadow-xs"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-[14px] font-bold text-sky-600 dark:text-[var(--vba-gold)] ring-1 ring-sky-500/30">
                      {initialsOf(c.name)}
                    </span>
                  )}
                  {isSystem && (
                    <span
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--vba-gold)] text-[#071322] shadow-xs"
                      title="Kênh chính thức"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate text-[14px] font-bold text-slate-900 dark:text-white">
                        {c.name}
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
    </div>
  );
}

function ChatThread({ peer, onBack }: { peer: MyConversation; onBack: () => void }) {
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
    const timer = setInterval(() => reload(), 4000);
    return () => clearInterval(timer);
  }, [reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages.length]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(isImage ? `Đang tải ảnh "${file.name}"...` : `Đang tải tệp "${file.name}"...`);
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

      await send({ data: { peerCode: peer.peerCode, text: payload } });
      setText("");
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
    try {
      await send({ data: { peerCode: peer.peerCode, text: value } });
      setText("");
      reload();
    } catch {
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="vba-app vba-animate flex flex-col bg-[var(--vba-bg)] text-[var(--vba-text)] overflow-hidden"
      style={{ height: "100dvh" }}
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
                <span className="text-[14px] font-bold text-[var(--vba-text)]">Thanh toán VietQR</span>
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
              Mở ứng dụng ngân hàng bất kỳ để quét mã QR và xác nhận giao dịch. Thông tin người nhận và nội dung đã được điền tự động.
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

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c121e]/95 px-4 py-3 shrink-0 backdrop-blur-md shadow-xs">
        <button
          onClick={onBack}
          className="text-sky-600 dark:text-sky-400 hover:underline text-[14px] font-semibold cursor-pointer flex items-center gap-1 shrink-0"
        >
          ‹ {t("m.messages.back")}
        </button>
        <div className="relative shrink-0">
          {peer.isSystem || peer.peerCode === "admin" ? (
            <img
              src="/ceo1983-logo.png"
              alt="CEO 1983"
              className="h-9 w-9 rounded-full object-contain p-0.5 bg-white ring-1 ring-sky-500/30 shadow-xs"
            />
          ) : peer.avatarUrl ? (
            <img
              src={resolveMediaUrl(peer.avatarUrl) || peer.avatarUrl}
              alt={peer.name}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 shadow-xs"
            />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold ring-1 ring-sky-500/30">
              {initialsOf(peer.name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14.5px] font-bold text-slate-900 dark:text-white">
              {data.peerName}
            </span>
            {(peer.isSystem || peer.peerCode === "admin") && (
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {peer.isSystem || peer.peerCode === "admin"
              ? "Kênh thông báo & giao dịch chính thức"
              : "Hội viên CLB Doanh Nhân CEO 1983"}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && (
          <p className="py-8 text-center text-[13px] text-slate-400">
            {t("m.messages.loading")}
          </p>
        )}
        {error && (
          <p className="py-8 text-center text-[13px] text-rose-500">{error}</p>
        )}
        {!loading && data.messages.length === 0 && (
          <p className="py-8 text-center text-[13px] text-slate-400">
            {t("m.messages.emptyThread")}
          </p>
        )}
        {(() => {
          const lastSeenId = [...data.messages].reverse().find((m) => m.mine && m.seen)?.id;
          return data.messages.map((m) => {
            const content = parseMessageContent(m.text);

            return (
              <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[86%] sm:max-w-[78%] rounded-2xl shadow-xs overflow-hidden ${
                    content.type === "action_payment"
                      ? "rounded-2xl bg-transparent border-0 shadow-none p-0"
                      : m.mine
                        ? "vba-gold-grad text-[#071322] font-semibold shadow-sky-500/15"
                        : "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131A26] text-slate-900 dark:text-slate-100 shadow-xs"
                  }`}
                >
                  {/* Action Card: Overdue Payment VietQR / Zalo OA style */}
                  {content.type === "action_payment" ? (
                    <ZaloTransactionCard data={content.data} isFromMe={m.mine} />
                  ) : content.type === "action_meeting" ? (
                    /* Action Card: Meeting Invitation */
                    <div className="p-3.5 space-y-3 bg-[var(--vba-surface)] text-[var(--vba-text)] border-l-4 border-[var(--vba-gold)]">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--vba-gold-soft)] p-1 text-[var(--vba-gold)]">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12px] font-bold text-[var(--vba-gold)] tracking-wide uppercase">
                            Thư mời tham dự cuộc họp
                          </p>
                          <p className="text-[10px] text-[var(--vba-text-dim)]">CLB Doanh Nhân CEO 1983</p>
                        </div>
                      </div>

                      <h4 className="text-[13px] font-bold text-[var(--vba-text)] leading-snug">
                        {content.data.title}
                      </h4>

                      <div className="space-y-1.5 rounded-xl bg-[var(--vba-surface-2)] p-2.5 text-[11px] border border-[var(--vba-border-soft)]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[var(--vba-gold)] shrink-0" />
                          <span className="font-semibold text-[var(--vba-text)]">{content.data.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="truncate text-[var(--vba-text)]">{content.data.location}</span>
                        </div>
                      </div>

                      {content.data.desc && (
                        <p className="text-[11px] text-[var(--vba-text-muted)] leading-relaxed">
                          {content.data.desc}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        {content.data.link && (
                          <a
                            href={content.data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] py-1.5 text-[11px] font-semibold text-[var(--vba-text)] hover:border-[var(--vba-gold)]"
                          >
                            <Video className="h-3 w-3" />
                            Vào phòng họp
                          </a>
                        )}
                        <button
                          onClick={() => toast.success("Đã ghi nhận xác nhận tham gia của bạn!")}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[var(--vba-gold)] py-1.5 text-[11px] font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs"
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
                        <p
                          className={`px-2 pb-1 text-[13px] leading-relaxed ${
                            m.mine ? "text-[#1a1206]" : "text-[var(--vba-text)]"
                          }`}
                        >
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
                            className={`flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer ${
                              m.mine
                                ? "bg-black/10 hover:bg-black/15 text-[#1a1206]"
                                : "bg-[var(--vba-surface-2)] hover:bg-[var(--vba-surface-2)]/80 text-[var(--vba-text)] border border-[var(--vba-border-soft)]"
                            }`}
                          >
                            <div
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border font-bold text-[11px] ${badge.color}`}
                            >
                              {badge.label}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold leading-tight">
                                {content.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {content.size ? (
                                  <span
                                    className={`text-[11px] ${
                                      m.mine ? "text-[#1a1206]/70" : "text-[var(--vba-text-dim)]"
                                    }`}
                                  >
                                    {formatFileSize(content.size)}
                                  </span>
                                ) : null}
                                <span
                                  className={`flex items-center gap-0.5 text-[11px] font-medium underline ${
                                    m.mine ? "text-[#1a1206]" : "text-[var(--vba-gold)]"
                                  }`}
                                >
                                  <Download className="h-3 w-3" />
                                  Tải về
                                </span>
                              </div>
                            </div>
                          </a>
                        );
                      })()}
                      {content.caption ? (
                        <p
                          className={`px-2 text-[13px] leading-relaxed ${
                            m.mine ? "text-[#1a1206]" : "text-[var(--vba-text)]"
                          }`}
                        >
                          {content.caption}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="px-3.5 py-2 text-[13px]">
                      <p className="whitespace-pre-wrap break-words">{content.text}</p>
                    </div>
                  )}

                  <span
                    className={`px-3.5 pb-1.5 block text-[10px] ${
                      m.mine ? "text-[#1a1206]/75 font-semibold text-right" : "text-[var(--vba-text-dim)]"
                    }`}
                  >
                    {fmt.rel(m.time)}
                  </span>
                </div>
                {m.id === lastSeenId && (
                  <span className="mt-0.5 pr-1 text-[10px] text-[var(--vba-gold)] font-medium">
                    ✓✓ {t("m.messages.seen")}
                  </span>
                )}
              </div>
            );
          });
        })()}
        <div ref={bottomRef} />
      </div>

      {isUploading ? (
        <div className="flex items-center gap-2 border-t border-[var(--vba-border-soft)] bg-[var(--vba-surface-2)] px-4 py-2 text-[12px] text-[var(--vba-gold)] animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span className="truncate">{uploadProgress || "Đang tải tệp lên..."}</span>
        </div>
      ) : null}

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-slate-200 dark:border-[var(--vba-border-soft)] bg-white dark:bg-[var(--vba-bg-2)] px-3 py-2.5 shrink-0"
        style={{ marginBottom: `${keyboardOffset}px` }}
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
          className="flex-1 rounded-xl border border-slate-200 dark:border-[var(--vba-border-soft)] bg-slate-50 dark:bg-[var(--vba-surface)] px-3 py-2 text-[13px] text-slate-900 dark:text-[var(--vba-text)] outline-none focus:border-[var(--vba-gold)] placeholder:text-slate-400 dark:placeholder:text-[var(--vba-text-dim)]"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending || isUploading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vba-gold)] text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs"
          title="Gửi tin nhắn"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
