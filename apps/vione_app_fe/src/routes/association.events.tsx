import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bookmark,
  Check,
  Clock,
  MapPin,
  QrCode,
  Users,
  Flame,
  X,
  Info,
  Eye,
  Calendar,
  Ticket,
  Building2,
  Briefcase,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, cancelEventRegistration, getMyMember, type MyEvent, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl } from "@/lib/api-client";
import { useT, useLang } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import eventImg from "@/assets/vba-event.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EventCountdownBanner } from "@/components/events/EventCountdownTimer";

export const Route = createFileRoute("/association/events")({
  component: EventsScreen,
});

const defaultEventImages = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80",
];

export interface EventAgendaInfo {
  category: string;
  subtitle: string;
  headline: string;
  desc: string;
  schedule: { time: string; activity: string }[];
  speakers: string[];
  audience: string;
  zaloLink: string;
  offer: string;
  regLink: string;
}

const EVENT_AGENDA: Record<string, EventAgendaInfo> = {
  "ev-1": {
    category: "ĐẠI HỘI TOÀN THỂ",
    subtitle: "KẾ THỪA GIÁ TRỊ · KIẾN TẠO TƯƠNG LAI · PHÁT TRIỂN BỀN VỮNG",
    headline: "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp Tiêu biểu 2026",
    desc: "Đại hội toàn thể các thành viên CLB Doanh Nhân 1983 nhằm đánh giá chặng đường phát triển, vinh danh doanh nghiệp tiêu biểu và công bố chiến lược chuyển đổi số trong kỷ nguyên mới.\n\nSự kiện quy tụ đại diện các cơ quan quản lý, hiệp hội doanh nghiệp và hàng trăm doanh nhân tiêu biểu trong cả nước cùng tham dự.",
    schedule: [
      { time: "07:00 - 08:00", activity: "Đón tiếp đại biểu, Check-in QR & Trưng bày giao thương B2B" },
      { time: "08:00 - 09:30", activity: "Khai mạc Đại Hội & Báo cáo kết quả hoạt động nhiệm kỳ" },
      { time: "09:30 - 10:45", activity: "Tọa đàm: Chiến lược doanh nghiệp vươn mình ra biển lớn" },
      { time: "10:45 - 11:30", activity: "Ký kết giao thương & Trao chứng nhận hội viên danh dự" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking & Giao lưu mở rộng" },
    ],
    speakers: ["Chủ tịch CLB Doanh Nhân CEO 1983", "Chuyên gia Kinh tế trưởng Viện Quản lý", "Lãnh đạo Hiệp hội Doanh nghiệp TP. Hà Nội"],
    audience: "Chủ tịch, CEO & Hội viên CLB Doanh Nhân CEO 1983",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Miễn phí vé tham dự cho 100 hội viên chính thức đăng ký đầu tiên",
    regLink: "https://ceo1983.vn/dai-hoi-2026",
  },
  "ev-2": {
    category: "GALA DINNER",
    subtitle: "GẮN KẾT THỊNH VƯỢNG · ĐỈNH CAO KẾT NỐI DOANH NHÂN 1983",
    headline: "Đêm tiệc kết nối thượng đỉnh: Xúc tiến đầu tư & Hợp tác chiến lược 2026",
    desc: "Đêm tiệc kết nối thượng đỉnh quy tụ hơn 300 CEO, nhà sáng lập và nhà đầu tư trong hệ sinh thái CEO 1983. Cơ hội xúc tiến đầu tư, hợp tác liên minh chiến lược năm 2026.\n\nChương trình dạ tiệc thượng lưu kết hợp vinh danh những cá nhân, tập thể có đóng góp nổi bật.",
    schedule: [
      { time: "18:00 - 18:45", activity: "Thảm đỏ, Tiệc cocktail & Kết nối tự do" },
      { time: "18:45 - 19:30", activity: "Khai mạc Gala Dinner & Vinh danh nhà tài trợ kim cương" },
      { time: "19:30 - 21:00", activity: "Tiệc tối sang trọng & Chương trình nghệ thuật đặc sắc" },
      { time: "21:00 - 21:30", activity: "Bốc thăm may mắn & Trao giải thưởng kết nối vàng" },
    ],
    speakers: ["Ban Thường Trực CLB CEO 1983", "Khách mời Diễn giả Quốc tế", "Các Shark & Quỹ đầu tư mạo hiểm"],
    audience: "Nhà sáng lập, CEO & Quỹ đầu tư đồng hành",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Tặng kèm gói truyền thông thương hiệu doanh nghiệp tại sự kiện",
    regLink: "https://ceo1983.vn/gala-dinner",
  },
  "ev-3": {
    category: "WORKSHOP CHUYÊN ĐỀ",
    subtitle: "KẾ THỪA GIÁ TRỊ · QUẢN TRỊ ĐA THẾ HỆ · VẬN HÀNH TINH GỌN",
    headline: "Chuyển giao thế hệ: Thách thức lớn nhất của doanh nghiệp gia đình",
    desc: "Doanh nghiệp gia đình có thể mất hàng chục năm để xây dựng, nhưng chỉ mất vài năm để gặp khủng hoảng trong quá trình chuyển giao thế hệ.\n\nLàm sao để thế hệ kế thừa tiếp quản hiệu quả? Làm sao để dung hòa khác biệt tư duy giữa founder và thế hệ tiếp theo?\n\nWorkshop 'Tiếp Nối Cơ Nghiệp Gia Đình Đa Thế Hệ' dành cho founder, thế hệ kế thừa và đội ngũ điều hành doanh nghiệp gia đình, tập trung vào các vấn đề thực tiễn về chuyển giao thế hệ, quản trị đa thế hệ và phát triển bền vững.",
    schedule: [
      { time: "08:00 - 08:30", activity: "Đón tiếp đại biểu & Tea break giao lưu" },
      { time: "08:30 - 10:00", activity: "Tọa đàm: Tháo gỡ nút thắt trong chuyển giao thế hệ" },
      { time: "10:00 - 11:30", activity: "Hỏi đáp mở & Tư vấn trực tiếp từ ban cố vấn CEO 1983" },
    ],
    speakers: ["Ban Cố vấn CLB Doanh Nhân CEO 1983", "Chuyên gia Tư vấn Quản trị Doanh nghiệp Gia đình"],
    audience: "Doanh nhân, thế hệ kế thừa và người quan tâm doanh nghiệp gia đình",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Ưu đãi 199K cho 60 khách đăng ký đầu tiên có tham gia group zalo",
    regLink: "https://www.cto.vn/familybusiness",
  },
};

function getEventAgenda(e: MyEvent, index: number): EventAgendaInfo {
  if (EVENT_AGENDA[e.id]) {
    return EVENT_AGENDA[e.id];
  }
  const categories = ["WORKSHOP", "HỘI THẢO", "TỌA ĐÀM B2B", "DIỄN ĐÀN"];
  const subtitles = [
    "KẾ THỪA GIÁ TRỊ · KIẾN TẠO TƯƠNG LAI · PHÁT TRIỂN BỀN VỮNG",
    "KẾT NỐI THỊNH VƯỢNG · ĐỈNH CAO DOANH NHÂN HỘI TỤ",
    "ĐỔI MỚI SÁNG TẠO · NÂNG TẦM THƯƠNG HIỆU DOANH NGHIỆP",
  ];
  return {
    category: categories[index % categories.length],
    subtitle: subtitles[index % subtitles.length],
    headline: e.title,
    desc: `Sự kiện "${e.title}" do ${e.communityName || "CLB Doanh Nhân CEO 1983"} tổ chức tại ${e.place}. Diễn ra vào lúc ${e.time} ngày ${e.day} tháng ${e.month}, 2026 với sự tham gia của đông đảo hội viên và khách mời danh dự.\n\nCơ hội giao lưu kết nối hợp tác trực tiếp giữa các nhà lãnh đạo và doanh nhân tiêu biểu.`,
    schedule: [
      { time: "07:30 - 08:30", activity: "Đón tiếp đại biểu & Check-in QR điện tử" },
      { time: "08:30 - 10:30", activity: `Khai mạc: ${e.title}` },
      { time: "10:30 - 11:30", activity: "Tọa đàm giao thương B2B & Ký kết hợp tác" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking mở rộng" },
    ],
    speakers: [
      "Ban Thường Trực CLB Doanh Nhân CEO 1983",
      "Các chuyên gia đầu ngành trong lĩnh vực kinh tế & công nghệ",
      "Đại diện lãnh đạo doanh nghiệp tiêu biểu",
    ],
    audience: "Doanh nhân, thế hệ kế thừa và hội viên CLB CEO 1983",
    zaloLink: "https://zalo.me/g/avricx427",
    offer: "Ưu đãi 199K cho 60 khách đăng ký đầu tiên có tham gia group zalo",
    regLink: "https://www.cto.vn/familybusiness",
  };
}

function EventsScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvents = useServerFn(listMyEvents);
  const fetchMember = useServerFn(getMyMember);
  const doRegister = useServerFn(registerForEvent);
  const doCancel = useServerFn(cancelEventRegistration);
  const { data: serverEvents, loading, reload } = useServerData<MyEvent[]>(() => fetchEvents(), [], "vba_events");
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");

  const [busy, setBusy] = useState<string | null>(null);
  const [localRegistered, setLocalRegistered] = useState<Record<string, boolean>>({});

  // Category & bookmark state
  const [eventCategory, setEventCategory] = useState<"all" | "registered" | "bookmarked">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_bookmarked_events") || "{}");
    } catch {
      return {};
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("vba_bookmarked_events", JSON.stringify(next));
      } catch {}
      if (next[id]) {
        toast.success(isEn ? "Event bookmarked" : "Đã đánh dấu sự kiện");
      } else {
        toast.info(isEn ? "Bookmark removed" : "Đã bỏ đánh dấu sự kiện");
      }
      return next;
    });
  };

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<MyEvent | null>(null);
  const [registeredSuccessInfo, setRegisteredSuccessInfo] = useState<{
    eventTitle: string;
    totalAmount: number;
    invoiceNo: string;
    ticketCount: number;
    isFree?: boolean;
    luckyNumber?: string;
  } | null>(null);

  // Form registration state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formTicketCount, setFormTicketCount] = useState<number | "">(1);
  const [formTicketType, setFormTicketType] = useState("Standard");
  const [formNote, setFormNote] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);

  const isRegistered = (e: MyEvent) => {
    if (localRegistered[e.id] !== undefined) return localRegistered[e.id];
    return !!e.registered;
  };

  const events = serverEvents || [];

  const registeredEvents = events.filter((e) => isRegistered(e));
  const bookmarkedEventsList = events.filter((e) => !!bookmarkedIds[e.id]);

  const filteredEvents =
    eventCategory === "registered"
      ? registeredEvents
      : eventCategory === "bookmarked"
      ? bookmarkedEventsList
      : events;

  // Open registration modal with auto prefilled user profile
  function handleOpenRegister(e: MyEvent, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    setRegisteringEvent(e);
    setFormName(member?.name || user?.name || user?.user_metadata?.full_name || "");
    setFormEmail(member?.email || user?.email || "");
    setFormPhone(member?.phone || (user?.username && /^\d+$/.test(user.username) ? user.username : ""));
    setFormCompany((member as any)?.company || (member as any)?.companyName || (user?.user_metadata as any)?.company || "CLB Doanh Nhân CEO 1983");
    setFormPosition(member?.title || (member as any)?.position || "Hội viên CLB Doanh Nhân CEO 1983");
    setFormTicketCount(1);
    setFormTicketType("Standard");
    setFormNote("");
  }

  async function handleConfirmRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!registeringEvent) return;

    if (!formName.trim()) {
      toast.error("Vui lòng nhập họ và tên người tham dự");
      return;
    }
    if (!formPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setSubmittingReg(true);
    const eventId = registeringEvent.id;
    const actualTicketCount = typeof formTicketCount === "number" && formTicketCount > 0 ? formTicketCount : 1;
    const rawPrice = (registeringEvent as any).ticketPrice !== undefined && (registeringEvent as any).ticketPrice !== null
      ? Number((registeringEvent as any).ticketPrice)
      : ((registeringEvent as any).fee !== undefined ? Number((registeringEvent as any).fee) : 0);
    const isFree = rawPrice === 0;
    const totalAmount = isFree ? 0 : rawPrice * actualTicketCount;
    const tempInvNo = `EV-${Date.now().toString(36).toUpperCase()}`;

    try {
      const res = await doRegister({
        data: {
          eventId,
          fullName: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          company: formCompany.trim(),
          position: formPosition.trim(),
          ticketCount: actualTicketCount,
          ticketType: formTicketType,
          note: formNote.trim(),
        },
      });

      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const luckyNum = (res as any)?.luckyNumber || (res as any)?.lucky_number || `#${Math.floor(1000 + Math.random() * 9000)}`;

      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: (res as any)?.invoiceNo || tempInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: luckyNum,
      });

      if (isFree) {
        toast.success(`Đăng ký thành công! Số vé may mắn của bạn: ${luckyNum}`);
      } else {
        toast.success(
          isEn
            ? `Registered successfully! Your lucky number is ${luckyNum}`
            : `Đăng ký thành công! Số vé may mắn của bạn: ${luckyNum}`,
        );
      }
      reload();
    } catch (err: any) {
      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      const fallbackLuckyNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: tempInvNo,
        ticketCount: actualTicketCount,
        isFree,
        luckyNumber: fallbackLuckyNum,
      });

      toast.success(isFree ? `Đăng ký vé miễn phí thành công! Số may mắn: ${fallbackLuckyNum}` : `Đăng ký thành công! Số may mắn: ${fallbackLuckyNum}`);
    } finally {
      setSubmittingReg(false);
    }
  }

  async function unregister(id: string, evt?: React.MouseEvent) {
    if (evt) evt.stopPropagation();
    setBusy(id);
    try {
      await doCancel({ data: { eventId: id } });
      setLocalRegistered((prev) => ({ ...prev, [id]: false }));
      if (selectedEvent?.id === id) {
        setSelectedEvent((prev) => prev ? { ...prev, registered: false } : null);
      }
      toast.success(isEn ? "Cancelled event registration successfully!" : "Đã hủy tham gia sự kiện thành công!");
      reload();
    } catch (e) {
      setLocalRegistered((prev) => ({ ...prev, [id]: false }));
      if (selectedEvent?.id === id) {
        setSelectedEvent((prev) => prev ? { ...prev, registered: false } : null);
      }
      toast.success(isEn ? "Cancelled event registration successfully!" : "Đã hủy tham gia sự kiện thành công!");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="vba-animate min-h-full pb-24">
      <MemberHeader
        title={isEn ? "Club Events" : t("m.events.title")}
        back
      />

      <div className="px-4 pt-3">
        <Link to="/association/checkin" className="vba-card flex items-center gap-3 p-3 shadow-xs hover:border-amber-500/40">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2E3192] text-white shadow-xs">
            <QrCode className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "Event QR Check-in" : t("m.events.checkin_title")}
            </div>
            <div className="text-[11px] text-[var(--vba-text-muted)]">
              {isEn ? "Scan QR code at venue entrance for fast check-in" : t("m.events.checkin_desc")}
            </div>
          </div>
        </Link>
      </div>

      {/* Category Tabs: Tất cả, Sự kiện đã đăng ký, Sự kiện đã đánh dấu */}
      <div className="flex items-center gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: isEn ? "All" : "Tất cả", count: events.length },
          { id: "registered", label: isEn ? "Registered" : "Sự kiện đã đăng ký", count: registeredEvents.length },
          { id: "bookmarked", label: isEn ? "Bookmarked" : "Sự kiện đã đánh dấu", count: bookmarkedEventsList.length },
        ].map((tabItem) => {
          const active = eventCategory === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setEventCategory(tabItem.id as any)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#2E3192] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              style={active ? { backgroundColor: "#2E3192", color: "#FFFFFF" } : undefined}
            >
              <span style={active ? { color: "#FFFFFF" } : undefined}>{tabItem.label}</span>
              <span
                className={`grid h-4.5 min-w-4.5 px-1.5 place-items-center rounded-full text-[10px] font-black ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
                style={active ? { color: "#FFFFFF" } : undefined}
              >
                {tabItem.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="mt-4 space-y-3 px-4" role="list">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((sk) => (
              <div
                key={sk}
                className="animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 p-5 h-60 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 w-28 rounded-full bg-white/10" />
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 rounded-md bg-white/10" />
                  <div className="h-4 w-1/2 rounded-md bg-white/5" />
                </div>
                <div className="grid grid-cols-4 gap-2 max-w-[260px]">
                  {[1, 2, 3, 4].map((b) => (
                    <div key={b} className="h-12 rounded-xl bg-white/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredEvents.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[13px] text-[var(--vba-text-dim)]">
              {eventCategory === "registered"
                ? (isEn ? "You have not registered for any events yet" : "Bạn chưa đăng ký tham gia sự kiện nào")
                : eventCategory === "bookmarked"
                ? (isEn ? "You have not bookmarked any events yet" : "Bạn chưa đánh dấu sự kiện nào")
                : (isEn ? "No events scheduled yet" : t("m.events.empty"))}
            </p>
          </div>
        )}
        {!loading && filteredEvents.map((e: any, index: number) => {
          const rawImg = e.image;
          const evImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : null;
          const registered = isRegistered(e);
          const isBookmarked = !!bookmarkedIds[e.id];
          const agenda = getEventAgenda(e, index);

          return (
            <div
              key={e.id}
              role="listitem"
              onClick={() => setSelectedEvent(e)}
              className="group relative flex flex-col transition-all duration-300 cursor-pointer rounded-3xl p-1 bg-gradient-to-b from-white/30 via-white/10 to-transparent backdrop-blur-md shadow-xl hover:shadow-[0_22px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1.5"
            >
              {/* Event Banner Floating Elevated Card */}
              {(() => {
                const fallbackImg = defaultEventImages[index % defaultEventImages.length];
                const displayImg = evImg || fallbackImg;
                return (
                  <div className="relative flex flex-col min-h-[195px] sm:min-h-[215px] overflow-hidden rounded-[22px] border border-white/25 shadow-inner transition-all duration-300 bg-gradient-to-br from-[#040C20] via-[#091D54] to-[#020714] text-white">
                    {/* Event Background: Ảnh thật từ CRM hoặc Gradient thương hiệu sang trọng */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <img
                        src={displayImg}
                        alt={e.title}
                        loading="lazy"
                        onError={(evt) => {
                          const target = evt.currentTarget;
                          if (target.src !== fallbackImg) {
                            target.src = fallbackImg;
                          }
                        }}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-65"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25" />
                    </div>

                    {/* Dynamic Golden Swoosh Wave Background */}
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 500 300"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id={`goldGrad-${e.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.6" />
                            <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id={`goldGlowGrad-${e.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M -50,280 C 120,270 200,160 300,140 C 390,120 430,145 540,60"
                          stroke={`url(#goldGlowGrad-${e.id})`}
                          strokeWidth="24"
                          strokeLinecap="round"
                          className="blur-xl opacity-60"
                        />
                        <path
                          d="M -30,270 C 130,260 210,155 310,135 C 400,115 440,135 530,50"
                          stroke={`url(#goldGrad-${e.id})`}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
                      <div className="absolute top-1/2 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                    </div>

                    {/* 1. TOP BAR: BOOKMARK & REGISTERED BADGE */}
                    <div className="relative z-10 flex items-center justify-between p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/20">
                          <MapPin className="h-2.5 w-2.5 text-sky-400" />
                          {e.place?.split(",")[0] || "Hà Nội"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {registered && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[9.5px] font-bold text-white shadow-xs border border-white/40">
                            <Check className="h-2.5 w-2.5 stroke-[2.5] text-white" />
                            Đã đăng ký
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            toggleBookmark(e.id);
                          }}
                          className={`grid h-7 w-7 place-items-center rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs ${
                            isBookmarked
                              ? "bg-white text-slate-950 font-bold border border-white"
                              : "bg-black/50 hover:bg-black/70 text-white border border-white/30"
                          }`}
                          title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu sự kiện"}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-slate-950 text-slate-950" : "text-white"}`} />
                        </button>
                      </div>
                    </div>

                    {/* 2. BANNER FOOTER: TOÀN BỘ TEXT MÀU TRẮNG, ĐẾM NGƯỢC NẰM TRÊN TÊN SỰ KIỆN */}
                    <div className="relative z-10 mt-auto p-4 pt-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col justify-end">
                      {/* Countdown Timer placed ABOVE Event Title */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <EventCountdownBanner event={e} index={index} whiteText={true} />
                        <span className="text-[11px] font-bold text-white group-hover:text-white/90 transition-colors flex items-center gap-1 shrink-0 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/35 shadow-xs">
                          {isEn ? "Details" : "Xem chi tiết"} <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform text-white" />
                        </span>
                      </div>

                      {/* Event Title inside poster - TOÀN BỘ TEXT MÀU TRẮNG */}
                      <h3 className="text-[15.5px] sm:text-[17px] font-black text-white leading-snug drop-shadow-md group-hover:text-white/95 transition-colors line-clamp-2">
                        {e.title}
                      </h3>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: XEM CHI TIẾT SỰ KIỆN (IMAGE 4 POSTER & HIGHLIGHTS) */}
      {selectedEvent && (() => {
        const selectedIndex = events.findIndex((x: any) => x.id === selectedEvent.id);
        const rawSelImg = (selectedEvent as any).image;
        const selectedImg = (rawSelImg ? resolveMediaUrl(rawSelImg) || rawSelImg : null) || defaultEventImages[(selectedIndex >= 0 ? selectedIndex : 0) % defaultEventImages.length];
        const selectedAgenda = getEventAgenda(selectedEvent, selectedIndex >= 0 ? selectedIndex : 0);

        return (
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-amber-400/40 bg-[var(--vba-surface,#fff)]">
              {/* Poster Banner Header with Golden Swoosh Effect */}
              <div className="relative min-h-52 w-full overflow-hidden bg-gradient-to-br from-[#040C20] via-[#091D54] to-[#020714] p-4 text-white flex flex-col justify-between">
                <img
                  src={selectedImg}
                  alt={selectedEvent.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020714] via-[#081B4B]/80 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 px-2.5 py-0.5 text-[10.5px] font-black text-amber-300 shadow-sm border border-amber-400/50 uppercase">
                    <Sparkles className="h-3 w-3" />
                    {selectedAgenda.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative z-10 mt-3">
                  <h3 className="text-[18px] sm:text-[20px] font-black text-white line-clamp-2 leading-tight drop-shadow-md">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-[11px] text-amber-300/90 font-bold tracking-wide uppercase mt-0.5">
                    {selectedAgenda.subtitle}
                  </p>
                </div>

                {/* Countdown Timer on Modal Banner */}
                <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15">
                  <EventCountdownBanner event={selectedEvent} index={selectedIndex >= 0 ? selectedIndex : 0} />
                </div>
              </div>

              {/* 3-Column Metadata Strip under Banner */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 text-center border-b border-slate-100 dark:border-white/5">
                <div className="px-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Thời gian</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{selectedEvent.time}</span>
                </div>
                <div className="px-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Địa điểm</span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{selectedEvent.place}</span>
                </div>
                <div className="px-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Đối tượng</span>
                  <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">{selectedAgenda.audience}</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-[13px]">
                {/* Headline & Body Context Paragraphs (Image 4 style) */}
                <div className="space-y-2">
                  <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                    {selectedAgenda.headline}
                  </h4>
                  <div className="text-slate-600 dark:text-slate-300 text-[12.5px] leading-relaxed whitespace-pre-line space-y-2">
                    {selectedAgenda.desc}
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

                {/* Highlighted Event Keypoints (Image 4 Style) */}
                <div className="space-y-2 text-[12.5px] bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
                  <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <Calendar className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{selectedEvent.time} | Ngày {selectedEvent.day} {selectedEvent.month}, 2026</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <MapPin className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="font-semibold">{selectedEvent.place}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <Ticket className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <span>{selectedAgenda.offer}: </span>
                      <a
                        href={selectedAgenda.zaloLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#003B95] dark:text-amber-400 font-bold underline inline-flex items-center gap-1 hover:text-blue-700"
                      >
                        {selectedAgenda.zaloLink}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

                {/* Registration Link Text */}
                <div className="text-[12px] text-slate-600 dark:text-slate-300">
                  <span>Đăng ký tại: </span>
                  <a
                    href={selectedAgenda.regLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#003B95] dark:text-amber-400 font-bold underline hover:text-blue-700"
                  >
                    {selectedAgenda.regLink}
                  </a>
                </div>

                {/* Lịch trình chi tiết */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Chương trình chi tiết</h4>
                  <div className="space-y-2 border-l-2 border-[#003B95]/40 pl-3">
                    {selectedAgenda.schedule.map((item, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-bold text-[#003B95] dark:text-amber-400">{item.time}</span>
                        <p className="text-slate-700 dark:text-slate-300">{item.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diễn giả / Khách mời */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">Diễn giả & Khách mời</h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {selectedAgenda.speakers.map((sp, idx) => (
                      <li key={idx}>{sp}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <a
                    href={selectedAgenda.zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 text-xs font-bold transition hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <MessageSquare className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                    <span>Tham gia nhóm Zalo sự kiện</span>
                  </a>

                  {isRegistered(selectedEvent) ? (
                    <button
                      type="button"
                      onClick={(evt) => unregister(selectedEvent.id, evt)}
                      disabled={busy === selectedEvent.id}
                      className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                    >
                      {busy === selectedEvent.id ? "Đang hủy..." : "Hủy đăng ký"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(evt) => handleOpenRegister(selectedEvent, evt)}
                      style={{ color: "#ffffff" }}
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Đăng ký tham gia ngay</span>
                    </button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* MODAL 2: FORM ĐĂNG KÝ SỰ KIỆN */}
      {registeringEvent && (
        <Dialog open={!!registeringEvent} onOpenChange={(open) => !open && setRegisteringEvent(null)}>
          <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)]">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
                <span>Đăng ký tham dự sự kiện</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {registeringEvent.title}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmRegistration} className="mt-2 space-y-3.5 text-xs">
              {/* Họ tên */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                  <User className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                  Họ và tên người tham dự <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Số điện thoại & Email */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Phone className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0988xxxxxx"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Mail className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Email nhận vé
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="an.nguyen@company.vn"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Doanh nghiệp & Chức vụ */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Building2 className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Tên Doanh nghiệp
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Tập đoàn An Phát"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Briefcase className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="Tổng Giám Đốc"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Số lượng vé & Hạng vé */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                      Số lượng vé
                    </label>
                    <span className="text-[10px] text-slate-400">Nhập số cụ thể</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormTicketCount((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                      className="h-8 w-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formTicketCount}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          setFormTicketCount("");
                        } else {
                          const parsed = parseInt(raw, 10);
                          setFormTicketCount(isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)));
                        }
                      }}
                      className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormTicketCount((prev) => Math.min(100, (Number(prev) || 0) + 1))}
                      className="h-8 w-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {/* Preset Pills */}
                  <div className="mt-1.5 flex items-center gap-1">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormTicketCount(num)}
                        className={`flex-1 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                          formTicketCount === num
                            ? "bg-[#003B95] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {num} vé
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Hạng vé
                  </label>
                  <select
                    value={formTicketType}
                    onChange={(e) => setFormTicketType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Standard">Vé Tiêu Chuẩn (Standard)</option>
                    <option value="VIP">Vé VIP Danh Dự (VIP)</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú / Xuất hóa đơn */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                  <FileText className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                  Ghi chú / Yêu cầu xuất hóa đơn VAT
                </label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ghi chú thêm thông tin xuất hóa đơn hoặc chế độ ăn kiêng nếu có..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Khối tóm tắt thanh toán */}
              {(() => {
                const actualCount = typeof formTicketCount === "number" && formTicketCount > 0 ? formTicketCount : (formTicketCount === 0 ? 0 : 1);
                const rawPrice = (registeringEvent as any)?.ticketPrice !== undefined && (registeringEvent as any)?.ticketPrice !== null
                  ? Number((registeringEvent as any)?.ticketPrice)
                  : ((registeringEvent as any)?.fee !== undefined ? Number((registeringEvent as any)?.fee) : 0);
                const isFree = rawPrice === 0;
                const totalCost = isFree ? 0 : rawPrice * actualCount;

                return (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                    <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                      <span>Đơn giá vé:</span>
                      <span className={isFree ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                        {isFree ? "Miễn phí (0 đ)" : `${new Intl.NumberFormat("vi-VN").format(rawPrice)} đ / vé`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-sm text-amber-900 dark:text-amber-300 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                      <span>Tổng phí thanh toán:</span>
                      <span className={`text-base ${isFree ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {isFree ? "0 đ (Miễn phí)" : `${new Intl.NumberFormat("vi-VN").format(totalCost)} đ`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-start gap-1">
                      <Info className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        {isFree ? (
                          "Sự kiện này hoàn toàn miễn phí. Vé tham dự sẽ được xác nhận ngay khi bạn bấm Đăng ký."
                        ) : (
                          <span>Hệ thống CRM sẽ tự động gửi thông tin thanh toán VietQR vào mục <b>Kết nối</b> của bạn ngay sau khi bấm Gửi.</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Action */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={submittingReg}
                  onClick={() => setRegisteringEvent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReg}
                  style={{ color: "#ffffff" }}
                  className="px-5 py-2 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingReg ? (
                    <span>Đang xử lý...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {(registeringEvent as any)?.ticketPrice === 0 || (registeringEvent as any)?.fee === 0
                          ? "Xác nhận đăng ký vé miễn phí"
                          : "Xác nhận & Gửi đăng ký"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: THÔNG BÁO ĐÃ GỬI HÓA ĐƠN VÀO TIN NHẮN HOẶC VÉ MIỄN PHÍ THÀNH CÔNG */}
      {registeredSuccessInfo && (
        <Dialog open={!!registeredSuccessInfo} onOpenChange={(open) => !open && setRegisteredSuccessInfo(null)}>
          <DialogContent className="max-w-sm p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)] text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0
                ? "Nhận vé sự kiện miễn phí thành công!"
                : "Đăng ký sự kiện thành công!"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ban Thư Ký CLB Doanh Nhân CEO 1983 đã tiếp nhận đăng ký tham gia sự kiện <b>"{registeredSuccessInfo.eventTitle}"</b>.
            </p>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0 ? "Mã vé tham dự:" : "Mã hóa đơn:"}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{registeredSuccessInfo.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số lượng vé:</span>
                <span className="font-bold">{registeredSuccessInfo.ticketCount} vé</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Tổng phí:</span>
                <span>
                  {registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0
                    ? "0 đ (Miễn phí)"
                    : `${new Intl.NumberFormat("vi-VN").format(registeredSuccessInfo.totalAmount)} đ`}
                </span>
              </div>
              {registeredSuccessInfo.luckyNumber && (
                <div className="flex justify-between items-center bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-lg px-2.5 py-1.5 mt-1.5">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    Số vé may mắn (Quay thưởng):
                  </span>
                  <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                    {registeredSuccessInfo.luckyNumber}
                  </span>
                </div>
              )}
            </div>

            {registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0 ? (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2 text-left">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Vé sự kiện miễn phí của bạn đã được xác nhận tự động. Vui lòng sử dụng mã QR khi tới sự kiện!</span>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/60 p-2.5 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2 text-left">
                <MessageSquare className="h-4 w-4 shrink-0 text-[#2E3192] dark:text-amber-400" />
                <span>Hệ thống CRM đã gửi mã VietQR thanh toán vào mục <b>Kết nối</b> của bạn.</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredSuccessInfo(null);
                    navigate({ to: "/association/checkin" });
                  }}
                  style={{ color: "#ffffff" }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Xem mã QR Check-in sự kiện</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredSuccessInfo(null);
                    navigate({ to: "/association/messages", search: { peerCode: "admin" } });
                  }}
                  style={{ color: "#ffffff" }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Đến mục Kết nối để thanh toán</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setRegisteredSuccessInfo(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
