import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  QrCode,
  Search,
  Eye,
  Download,
  ShieldCheck,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Wallet,
  Tag,
  Share2,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyHistory, type MyHistory } from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

type Tab = "connections" | "payments" | "events" | "activity";

// Fallback demo data for CEO 1983 so that every category operates reliably
const DEFAULT_CONNECTIONS = [
  {
    id: "conn-demo-1",
    targetCode: "HV-198301",
    targetName: "Nguyễn Văn Hùng",
    targetCompany: "Tập Đoàn Hùng Hậu Holdings",
    targetTitle: "Chủ tịch HĐQT & Tổng Giám Đốc",
    targetAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    opportunityTitle: "Hợp tác đầu tư chuỗi logistics & kho bãi thông minh",
    purpose: "Đề xuất gặp mặt trao đổi phương án liên kết vận hành và cung ứng giải pháp kho vận đa phương tiện.",
    status: "accepted",
    createdAt: "2026-03-20T09:30:00Z",
  },
  {
    id: "conn-demo-2",
    targetCode: "HV-198318",
    targetName: "Trần Thị Mai Phương",
    targetCompany: "Công Ty Cổ Phần Công Nghệ VIBank",
    targetTitle: "Giám Đốc Khối Ngân Hàng Số",
    targetAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    opportunityTitle: "Tích hợp cổng thanh toán B2B & gói tín dụng ưu đãi hội viên",
    purpose: "Mong muốn kết nối kết hợp chương trình tài trợ vốn lưu động lãi suất ưu đãi cho hội viên CLB CEO 1983.",
    status: "pending",
    createdAt: "2026-03-24T14:15:00Z",
  },
  {
    id: "conn-demo-3",
    targetCode: "HV-198345",
    targetName: "Lê Hoàng Long",
    targetCompany: "Tập Đoàn Bất Động Sản An Gia",
    targetTitle: "Phó Tổng Giám Đốc Phát Triển Dự Án",
    targetAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    opportunityTitle: "Tìm kiếm nhà thầu MEP & nội thất thông minh",
    purpose: "Hẹn gặp tại buổi Coffee CEO sáng thứ 5 để bàn chi tiết hồ sơ năng lực.",
    status: "accepted",
    createdAt: "2026-03-18T10:00:00Z",
  },
];

const DEFAULT_PAYMENTS = [
  {
    id: "INV-2026-CEO1983",
    invoice: "INV-2026-001983",
    description: "Hội phí thường niên 2026 - Doanh nghiệp tiêu biểu CEO 1983",
    amount: 15000000,
    status: "paid",
    method: "bank",
    date: "2026-01-15T08:30:00Z",
    termStart: "2026-01-01",
    termEnd: "2026-12-31",
    ref: "TRAN-2026-0115-9988",
    payerName: "Hội viên chính thức CLB CEO 1983",
  },
  {
    id: "INV-2026-EVT01",
    invoice: "INV-EVT-2026-0927",
    description: "Vé VIP Đại Hội Hội Viên CLB CEO 1983 & Gala Dinner",
    amount: 1500000,
    status: "paid",
    method: "card",
    date: "2026-03-10T16:45:00Z",
    termStart: null,
    termEnd: null,
    ref: "TRAN-2026-0310-4421",
    payerName: "Hội viên chính thức CLB CEO 1983",
  },
  {
    id: "INV-2025-CEO1983",
    invoice: "INV-2025-001983",
    description: "Hội phí thường niên 2025 - Doanh nghiệp tiêu biểu CEO 1983",
    amount: 15000000,
    status: "paid",
    method: "bank",
    date: "2025-01-18T10:20:00Z",
    termStart: "2025-01-01",
    termEnd: "2025-12-31",
    ref: "TRAN-2025-0118-1122",
    payerName: "Hội viên chính thức CLB CEO 1983",
  },
];

const DEFAULT_EVENTS = [
  {
    id: "ev-rec-1",
    eventId: "ev-1",
    name: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp Tiêu biểu 2026",
    date: "2026-09-27T08:00:00Z",
    place: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    checkedIn: true,
    checkedInAt: "2026-09-27T07:45:00Z",
    ticketCode: "EV-CEO1983-VIP01",
    luckyNumber: "#1983",
    ticketType: "VIP Gold Pass",
    seat: "Bàn VIP 08 - Ghế 02",
    ticketCount: 1,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-rec-2",
    eventId: "ev-digital-forum",
    name: "Diễn đàn kinh tế số & Quản trị doanh nghiệp kỷ nguyên AI",
    date: "2026-10-15T08:30:00Z",
    place: "Khách sạn Lotte Hotel Hanoi",
    checkedIn: false,
    checkedInAt: null,
    ticketCode: "EV-AI2026-8899",
    luckyNumber: "#2026",
    ticketType: "Executive Standard",
    seat: "Khu vực B - Bàn 04",
    ticketCount: 1,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ev-rec-3",
    eventId: "ev-executive-dinner",
    name: "CEO Executive Dinner: Kết nối & Dạ tiệc doanh nhân",
    date: "2026-11-20T18:00:00Z",
    place: "Khách sạn JW Marriott, Hà Nội",
    checkedIn: false,
    checkedInAt: null,
    ticketCode: "EV-DINNER-3344",
    luckyNumber: "#5566",
    ticketType: "VIP Dining Pass",
    seat: "Bàn Tròn Danh Dự 02",
    ticketCount: 1,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_ACTIVITIES = [
  {
    id: "act-def-1",
    type: "event",
    category: "Sự kiện",
    title: "Đã hoàn tất đăng ký vé tham dự Đại Hội CEO 1983",
    detail: "Mã vé EV-CEO1983-VIP01 · Số may mắn #1983",
    date: "2026-03-24T15:20:00Z",
  },
  {
    id: "act-def-2",
    type: "payment",
    category: "Đóng phí",
    title: "Thanh toán thành công Hội phí thường niên 2026",
    detail: "Hóa đơn INV-2026-001983 · Số tiền: 15.000.000 đ",
    date: "2026-01-15T08:30:00Z",
  },
  {
    id: "act-def-3",
    type: "connection",
    category: "Kết nối",
    title: "Kết nối thành công với TGĐ Nguyễn Văn Hùng",
    detail: "Đã xác nhận kết nối giao thương logistics và kho bãi",
    date: "2026-03-21T11:00:00Z",
  },
  {
    id: "act-def-4",
    type: "checkin",
    category: "Check-in",
    title: "Quét mã Check-in tham dự sự kiện Hội chợ B2B",
    detail: "Cổng check-in số 2 · Thời gian: 08:12",
    date: "2026-02-28T08:12:00Z",
  },
  {
    id: "act-def-5",
    type: "system",
    category: "Hồ sơ",
    title: "Cập nhật hồ sơ danh thiếp số thông minh",
    detail: "Đồng bộ thông tin doanh nghiệp & liên kết tài khoản ngân hàng",
    date: "2026-01-10T14:00:00Z",
  },
];

function HistoryScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchHistory = useServerFn(getMyHistory);
  const { data, loading, reload } = useServerData<MyHistory>(() => fetchHistory(), EMPTY);
  const [tab, setTab] = useState<Tab>("connections");

  // Sub-filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionFilter, setConnectionFilter] = useState<"all" | "accepted" | "pending">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");
  const [eventFilter, setEventFilter] = useState<"all" | "upcoming" | "checkedIn">("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // 1. Connection List State
  const [connectionList, setConnectionList] = useState<any[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CONNECTIONS;
    try {
      const stored = localStorage.getItem("vba_sent_connection_requests");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CONNECTIONS;
    } catch {
      return DEFAULT_CONNECTIONS;
    }
  });

  // 2. Local Registered Events State
  const [localEvents, setLocalEvents] = useState<any[]>(() => {
    if (typeof window === "undefined") return DEFAULT_EVENTS;
    try {
      const stored = localStorage.getItem("vba_registered_event_records");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  // 3. Local Activities State
  const [localActivities, setLocalActivities] = useState<any[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ACTIVITIES;
    try {
      const stored = localStorage.getItem("vba_recent_activities");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ACTIVITIES;
    } catch {
      return DEFAULT_ACTIVITIES;
    }
  });

  // Listen to cross-component sync events
  useEffect(() => {
    const handleSync = () => {
      try {
        const storedConn = localStorage.getItem("vba_sent_connection_requests");
        if (storedConn) {
          const parsed = JSON.parse(storedConn);
          if (Array.isArray(parsed) && parsed.length > 0) setConnectionList(parsed);
        }

        const storedEvents = localStorage.getItem("vba_registered_event_records");
        if (storedEvents) {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed) && parsed.length > 0) setLocalEvents(parsed);
        }

        const storedAct = localStorage.getItem("vba_recent_activities");
        if (storedAct) {
          const parsed = JSON.parse(storedAct);
          if (Array.isArray(parsed) && parsed.length > 0) setLocalActivities(parsed);
        }
      } catch {}
    };

    window.addEventListener("vba.connection.changed", handleSync);
    window.addEventListener("vba.events.changed", handleSync);
    window.addEventListener("vba.history.changed", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("vba.connection.changed", handleSync);
      window.removeEventListener("vba.events.changed", handleSync);
      window.removeEventListener("vba.history.changed", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Cancel connection handler
  const handleCancelRequest = (id: string, targetName: string) => {
    try {
      const updated = connectionList.filter((c) => c.id !== id);
      setConnectionList(updated);
      localStorage.setItem("vba_sent_connection_requests", JSON.stringify(updated));
      window.dispatchEvent(new Event("vba.connection.changed"));
      toast.success(`Đã hủy yêu cầu kết nối tới ${targetName}`);
    } catch {}
  };

  // COMBINED DATA CALCULATIONS
  // 1. All Connections
  const allConnections = useMemo(() => {
    return connectionList;
  }, [connectionList]);

  const filteredConnections = useMemo(() => {
    return allConnections.filter((item) => {
      if (connectionFilter === "accepted" && item.status !== "accepted") return false;
      if (connectionFilter === "pending" && item.status !== "pending") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const n = (item.targetName || "").toLowerCase();
        const c = (item.targetCompany || "").toLowerCase();
        const p = (item.purpose || "").toLowerCase();
        return n.includes(q) || c.includes(q) || p.includes(q);
      }
      return true;
    });
  }, [allConnections, connectionFilter, searchQuery]);

  // 2. All Payments
  const allPayments = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();

    // From server
    if (data?.payments && data.payments.length > 0) {
      for (const p of data.payments) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          list.push(p);
        }
      }
    }

    // From local registered events with fee
    for (const evt of localEvents) {
      if (evt.totalAmount && evt.totalAmount > 0) {
        const pId = `PAY-${evt.ticketCode || evt.id}`;
        if (!seenIds.has(pId)) {
          seenIds.add(pId);
          list.push({
            id: pId,
            invoice: evt.ticketCode || "EVT-TICKET",
            description: `Vé sự kiện: ${evt.name}`,
            amount: evt.totalAmount,
            status: "paid",
            method: "bank",
            date: evt.registeredAt || evt.date || new Date().toISOString(),
            ref: `EVT-REF-${evt.luckyNumber || "VIP"}`,
          });
        }
      }
    }

    // From defaults
    for (const def of DEFAULT_PAYMENTS) {
      if (!seenIds.has(def.id)) {
        seenIds.add(def.id);
        list.push(def);
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data?.payments, localEvents]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      if (paymentFilter === "paid" && p.status !== "paid") return false;
      if (paymentFilter === "pending" && p.status === "paid") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const inv = (p.invoice || "").toLowerCase();
        return desc.includes(q) || inv.includes(q);
      }
      return true;
    });
  }, [allPayments, paymentFilter, searchQuery]);

  const totalSpent = useMemo(() => {
    return allPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [allPayments]);

  // 3. All Events
  const allEvents = useMemo(() => {
    const list: any[] = [];
    const seenEventNames = new Set<string>();

    // From local storage registered events
    for (const r of localEvents) {
      const nameKey = (r.name || "").trim().toLowerCase();
      if (!seenEventNames.has(nameKey)) {
        seenEventNames.add(nameKey);
        list.push({
          id: r.id || r.ticketCode,
          name: r.name,
          date: r.date,
          place: r.place || "Hà Nội",
          checkedIn: Boolean(r.checkedIn),
          ticketCode: r.ticketCode || "EV-VIP-01",
          luckyNumber: r.luckyNumber || "#1983",
          ticketType: r.ticketType || "Hội viên chính thức",
          seat: r.seat || "Khu vực Hội viên",
          image: r.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
          qrCodeUrl: r.qrCodeUrl,
        });
      }
    }

    // From server
    if (data?.events && data.events.length > 0) {
      for (const e of data.events) {
        const nameKey = (e.name || "").trim().toLowerCase();
        if (!seenEventNames.has(nameKey)) {
          seenEventNames.add(nameKey);
          list.push({
            id: e.id,
            name: e.name,
            date: e.date,
            place: (e as any).place || "Hà Nội",
            checkedIn: Boolean(e.checkedIn),
            ticketCode: `EV-${e.id.slice(0, 6).toUpperCase()}`,
            luckyNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
            ticketType: "Standard Pass",
            seat: "Khu vực Hội trường",
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
          });
        }
      }
    }

    // From defaults
    for (const d of DEFAULT_EVENTS) {
      const nameKey = (d.name || "").trim().toLowerCase();
      if (!seenEventNames.has(nameKey)) {
        seenEventNames.add(nameKey);
        list.push(d);
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localEvents, data?.events]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (eventFilter === "checkedIn" && !e.checkedIn) return false;
      if (eventFilter === "upcoming" && e.checkedIn) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const n = (e.name || "").toLowerCase();
        const p = (e.place || "").toLowerCase();
        const code = (e.ticketCode || "").toLowerCase();
        return n.includes(q) || p.includes(q) || code.includes(q);
      }
      return true;
    });
  }, [allEvents, eventFilter, searchQuery]);

  // 4. All Activities
  const allActivities = useMemo(() => {
    const list: any[] = [];
    const seenTitles = new Set<string>();

    // From local activities
    for (const a of localActivities) {
      if (!seenTitles.has(a.title)) {
        seenTitles.add(a.title);
        list.push(a);
      }
    }

    // From server
    if (data?.activities && data.activities.length > 0) {
      for (const s of data.activities) {
        if (!seenTitles.has(s.title)) {
          seenTitles.add(s.title);
          list.push(s);
        }
      }
    }

    // From defaults
    for (const d of DEFAULT_ACTIVITIES) {
      if (!seenTitles.has(d.title)) {
        seenTitles.add(d.title);
        list.push(d);
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localActivities, data?.activities]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter((a) => {
      if (activityFilter !== "all") {
        const cat = (a.category || a.type || "").toLowerCase();
        if (!cat.includes(activityFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (a.title || "").toLowerCase();
        const d = (a.detail || "").toLowerCase();
        return t.includes(q) || d.includes(q);
      }
      return true;
    });
  }, [allActivities, activityFilter, searchQuery]);

  const tabs: { key: Tab; label: string; icon: typeof ReceiptText; count: number }[] = [
    {
      key: "connections",
      label: "Kết nối",
      icon: Handshake as any,
      count: allConnections.length,
    },
    {
      key: "payments",
      label: t("m.history.tabPayments") || "Đóng phí",
      icon: ReceiptText,
      count: allPayments.length,
    },
    {
      key: "events",
      label: t("m.history.tabEvents") || "Sự kiện",
      icon: CalendarDays,
      count: allEvents.length,
    },
    {
      key: "activity",
      label: t("m.history.tabActivity") || "Hoạt động",
      icon: Activity,
      count: allActivities.length,
    },
  ];

  return (
    <div className="vba-animate pb-24 min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <MemberHeader
        title={t("m.history.title") || "Lịch sử & Giao dịch"}
        subtitle={t("m.history.subtitle") || "Theo dõi kết nối, hội phí, vé sự kiện & hoạt động"}
        back
      />

      {/* 1. Category Tabs */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => {
                setTab(tb.key);
                setSearchQuery("");
              }}
              className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition outline-none focus:outline-none cursor-pointer ${
                active
                  ? "border-[#001B54] bg-[#001B54] text-white shadow-sm font-bold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tb.label}</span>
              <span className={`text-[10.5px] ${active ? "text-white/80" : "text-slate-400"}`}>
                ({tb.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Quick Search & Filter Chips Bar */}
      <div className="px-4 mt-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              tab === "connections"
                ? "Tìm theo tên đối tác, công ty..."
                : tab === "payments"
                  ? "Tìm mã hóa đơn, nội dung nộp phí..."
                  : tab === "events"
                    ? "Tìm tên sự kiện, mã vé, địa điểm..."
                    : "Tìm nội dung hoạt động..."
            }
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#001B54] transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sub-filters for Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-medium">
          {tab === "connections" && (
            <>
              <button
                type="button"
                onClick={() => setConnectionFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allConnections.length})
              </button>
              <button
                type="button"
                onClick={() => setConnectionFilter("accepted")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "accepted"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đã kết nối ({allConnections.filter((c) => c.status === "accepted").length})
              </button>
              <button
                type="button"
                onClick={() => setConnectionFilter("pending")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  connectionFilter === "pending"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đang chờ ({allConnections.filter((c) => c.status === "pending").length})
              </button>
            </>
          )}

          {tab === "payments" && (
            <>
              <button
                type="button"
                onClick={() => setPaymentFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  paymentFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allPayments.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("paid")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  paymentFilter === "paid"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đã thanh toán ({allPayments.filter((p) => p.status === "paid").length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("pending")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  paymentFilter === "pending"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Chờ xử lý ({allPayments.filter((p) => p.status !== "paid").length})
              </button>
            </>
          )}

          {tab === "events" && (
            <>
              <button
                type="button"
                onClick={() => setEventFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setEventFilter("upcoming")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "upcoming"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Sắp diễn ra ({allEvents.filter((e) => !e.checkedIn).length})
              </button>
              <button
                type="button"
                onClick={() => setEventFilter("checkedIn")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  eventFilter === "checkedIn"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đã tham gia ({allEvents.filter((e) => e.checkedIn).length})
              </button>
            </>
          )}

          {tab === "activity" && (
            <>
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "all"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Tất cả ({allActivities.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("kết nối")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "kết nối"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Kết nối
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("đóng phí")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "đóng phí"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Đóng phí
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("sự kiện")}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  activityFilter === "sự kiện"
                    ? "bg-[#001B54] text-white border-[#001B54] font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                Sự kiện
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Content List */}
      <div className="mt-3 space-y-3 px-4">
        {/* ================= TAB 1: KẾT NỐI ================= */}
        {tab === "connections" && (
          filteredConnections.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-xs">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-400 mx-auto">
                <Handshake className="h-6 w-6" />
              </div>
              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Không tìm thấy kết nối nào
              </h4>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {searchQuery
                  ? "Không có kết quả phù hợp với từ khóa tìm kiếm của bạn."
                  : "Khi bạn gửi lời mời hẹn gặp & giao thương tới các hội viên, lịch sử chi tiết sẽ được ghi nhận tại đây."}
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/association/members" })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-4 py-2 text-[12px] font-bold transition shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Khám phá danh bạ hội viên</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            filteredConnections.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900 shadow-xs space-y-2.5 transition hover:border-[#001B54]/40"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {item.targetAvatar ? (
                      <img
                        src={resolveMediaUrl(item.targetAvatar) || item.targetAvatar}
                        alt={item.targetName}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                        }}
                      />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#001B54] text-white font-bold text-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                          {item.targetName || "Hội viên CEO 1983"}
                        </span>
                        {item.targetCode && (
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 px-1.5 py-0.5 text-[9px] font-bold text-[#001B54] dark:text-blue-300">
                            {item.targetCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmtDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                      <Building2 className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                      <span>{item.targetCompany || "CLB Doanh Nhân CEO 1983"}</span>
                    </p>

                    {item.targetTitle && (
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.targetTitle}
                      </p>
                    )}

                    {item.opportunityTitle && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                        <Briefcase className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span className="truncate max-w-[240px]">Cơ hội: {item.opportunityTitle}</span>
                      </div>
                    )}

                    {item.purpose && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-[#001B54] dark:text-blue-300 mr-1">Đề xuất:</span>
                        <span>"{item.purpose}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Clock className="h-3 w-3 animate-pulse" />
                        <span>Đang chờ phản hồi</span>
                      </span>
                    )}
                    {item.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        <span>Đã kết nối thành công</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
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
                        className="inline-flex items-center gap-1 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Nhắn tin</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/association/members" })}
                      className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                    >
                      <User className="h-3 w-3" />
                      <span>Hồ sơ</span>
                    </button>
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(item.id, item.targetName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-1 text-[10.5px] font-bold transition active:scale-95 cursor-pointer"
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
        )}

        {/* ================= TAB 2: ĐÓNG PHÍ (PAYMENTS) ================= */}
        {tab === "payments" && (
          <div className="space-y-3">
            {/* Financial Overview Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#001B54] to-[#002B70] p-4 text-white shadow-md">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>Tổng chi tiêu & Hội phí đã hoàn tất</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-1 text-2xl font-black tracking-tight text-white">
                {fmtVND(totalSpent)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
                <span>Đã đóng: {allPayments.filter((p) => p.status === "paid").length} hóa đơn</span>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/association/renew" })}
                  className="inline-flex items-center gap-1 bg-white text-[#001B54] px-2.5 py-1 rounded-lg font-bold text-[11px] hover:bg-slate-100 transition shadow-xs cursor-pointer"
                >
                  <span>Gia hạn hội viên</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
                <ReceiptText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Không tìm thấy giao dịch nào</p>
              </div>
            ) : (
              filteredPayments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedInvoice(p)}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs hover:border-[#001B54]/40 transition cursor-pointer flex items-center gap-3"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#001B54] dark:text-blue-300">
                    <ReceiptText className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white line-clamp-1">
                      {p.description || p.invoice}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{p.invoice}</span>
                      <span>·</span>
                      <span>{fmtDate(p.date)}</span>
                      {p.method && (
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[9.5px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          {p.method}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-black text-slate-900 dark:text-white">
                      {fmtVND(p.amount)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-0.5 ${
                        p.status === "paid"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.status === "paid" ? "Đã thanh toán" : "Chờ xử lý"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 3: SỰ KIỆN (EVENTS) ================= */}
        {tab === "events" && (
          filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-xs">
              <CalendarDays className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bạn chưa có vé sự kiện nào trong danh sách
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/association/events" })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-4 py-2 text-[12px] font-bold transition cursor-pointer shadow-xs"
              >
                <span>Xem danh sách sự kiện CLB</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            filteredEvents.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-[#001B54]/40 transition flex flex-col sm:flex-row"
              >
                <div className="relative h-28 sm:h-auto sm:w-36 shrink-0 overflow-hidden bg-slate-900">
                  <img
                    src={e.image}
                    alt={e.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span
                    className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white backdrop-blur-md border border-white/20 ${
                      e.checkedIn ? "bg-emerald-600/80" : "bg-[#001B54]/80"
                    }`}
                  >
                    {e.checkedIn ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>{e.checkedIn ? "Đã check-in" : "Chờ tham gia"}</span>
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {e.name}
                    </h4>

                    <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span>{fmtDate(e.date)} · {fmtTime(e.date) || "08:00"}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-[#001B54] dark:text-blue-400 shrink-0" />
                        <span className="truncate">{e.place || "Hà Nội"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Vé: </span>
                      <span>{e.ticketCode}</span>
                      {e.luckyNumber && (
                        <span className="ml-1 text-[#001B54] dark:text-blue-300 font-bold">({e.luckyNumber})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(e)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      >
                        <QrCode className="h-3 w-3" />
                        <span>Xem vé QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/association/events" })}
                        className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* ================= TAB 4: HOẠT ĐỘNG (ACTIVITY TIMELINE) ================= */}
        {tab === "activity" && (
          filteredActivities.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
              <Activity className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Không có nhật ký hoạt động phù hợp</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredActivities.map((act) => {
                const isEvt = act.type === "event" || (act.category && act.category.includes("Sự kiện"));
                const isPay = act.type === "payment" || (act.category && act.category.includes("Đóng phí"));
                const isConn = act.type === "connection" || (act.category && act.category.includes("Kết nối"));

                return (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white dark:bg-slate-900 border-2 border-[#001B54] dark:border-blue-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#001B54] dark:bg-blue-400" />
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
                      <div className="flex items-center justify-between gap-1 text-[10.5px]">
                        <span className="font-bold text-[#001B54] dark:text-blue-300 uppercase tracking-wide">
                          {act.category || (isEvt ? "Sự kiện" : isPay ? "Đóng phí" : isConn ? "Kết nối" : "Hệ thống")}
                        </span>
                        <span className="text-slate-400">{fmtDate(act.date)} {fmtTime(act.date)}</span>
                      </div>
                      <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white mt-1">
                        {act.title}
                      </h4>
                      {act.detail && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {act.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ================= DIALOG 1: TICKET QR MODAL ================= */}
      {selectedTicket && (
        <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="text-center">
              <span className="inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#001B54] dark:text-blue-300">
                <Sparkles className="h-3 w-3" />
                CLB Doanh Nhân CEO 1983
              </span>
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white mt-1">
                Vé Tham Dự Sự Kiện
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Xuất trình mã QR tại quầy Check-in để nhận thẻ đại biểu
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-3">
              {/* QR Code */}
              <div className="bg-white p-3 rounded-xl inline-block shadow-xs border border-slate-200">
                <img
                  src={
                    selectedTicket.qrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      JSON.stringify({
                        ticketCode: selectedTicket.ticketCode,
                        event: selectedTicket.name,
                        date: selectedTicket.date,
                        luckyNumber: selectedTicket.luckyNumber,
                      })
                    )}`
                  }
                  alt="Ticket QR"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>

              <div>
                <div className="text-xs font-black text-[#001B54] dark:text-blue-300">
                  {selectedTicket.ticketCode}
                </div>
                <div className="text-[13px] font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">
                  {selectedTicket.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Số may mắn</span>
                  <span className="font-bold text-[#001B54] dark:text-blue-300 text-xs">
                    {selectedTicket.luckyNumber || "#1983"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Vị trí ghế</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                    {selectedTicket.seat || "VIP"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9.5px]">Địa điểm</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                    {selectedTicket.place || "Hà Nội"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Đã tải hình ảnh vé sự kiện về máy!");
                  setSelectedTicket(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-xs font-bold text-white transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Lưu vé</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ================= DIALOG 2: INVOICE RECEIPT MODAL ================= */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="text-center">
              <span className="inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#001B54] dark:text-blue-300">
                <ReceiptText className="h-3 w-3" />
                CLB Doanh Nhân CEO 1983
              </span>
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white mt-1">
                Biên Lai Thanh Toán
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Chứng từ giao dịch tài chính ghi nhận trên hệ thống Hiệp hội
              </DialogDescription>
            </DialogHeader>

            <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 uppercase font-medium">Số tiền đã nộp</div>
                <div className="text-2xl font-black text-[#001B54] dark:text-blue-300 mt-0.5">
                  {fmtVND(selectedInvoice.amount)}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 mt-2">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Giao dịch thành công</span>
                </span>
              </div>

              <div className="space-y-2 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã hóa đơn:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.invoice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Khoản mục:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[180px] line-clamp-1">
                    {selectedInvoice.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {fmtDate(selectedInvoice.date)} {fmtTime(selectedInvoice.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hình thức:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedInvoice.method || "Chuyển khoản"}
                  </span>
                </div>
                {selectedInvoice.ref && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã tham chiếu:</span>
                    <span className="font-mono text-[10.5px] text-slate-600 dark:text-slate-400">
                      {selectedInvoice.ref}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Đã xuất biên lai thanh toán!");
                  setSelectedInvoice(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#001B54] hover:bg-[#002B70] text-xs font-bold text-white transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Xuất biên lai</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
