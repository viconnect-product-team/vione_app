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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, cancelEventRegistration, type MyEvent } from "@/lib/member-app.functions";
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

export const Route = createFileRoute("/association/events")({
  component: EventsScreen,
});

const defaultEventImages = [
  eventImg,
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
];

const EVENT_AGENDA: Record<string, { desc: string; schedule: { time: string; activity: string }[]; speakers: string[] }> = {
  "ev-1": {
    desc: "Đại hội toàn thể các thành viên CLB Doanh Nhân 1983 nhằm đánh giá chặng đường phát triển, vinh danh doanh nghiệp tiêu biểu và công bố chiến lược chuyển đổi số trong kỷ nguyên mới.",
    schedule: [
      { time: "07:00 - 08:00", activity: "Đón tiếp đại biểu, Check-in QR & Trưng bày giao thương B2B" },
      { time: "08:00 - 09:30", activity: "Khai mạc Đại Hội & Báo cáo kết quả hoạt động nhiệm kỳ" },
      { time: "09:30 - 10:45", activity: "Tọa đàm: Chiến lược doanh nghiệp vươn mình ra biển lớn" },
      { time: "10:45 - 11:30", activity: "Ký kết giao thương & Trao chứng nhận hội viên danh dự" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking & Giao lưu mở rộng" },
    ],
    speakers: ["Chủ tịch CLB Doanh Nhân CEO 1983", "Chuyên gia Kinh tế trưởng Viện Nghiên cứu Quản lý", "Đại diện Lãnh đạo Hiệp hội Doanh nghiệp TP. Hà Nội"],
  },
  "ev-2": {
    desc: "Đêm tiệc kết nối thượng đỉnh quy tụ hơn 300 CEO, nhà sáng lập và nhà đầu tư trong hệ sinh thái CEO 1983. Cơ hội xúc tiến đầu tư, hợp tác liên minh chiến lược năm 2026.",
    schedule: [
      { time: "18:00 - 18:45", activity: "Thảm đỏ, Tiệc cocktail & Kết nối tự do" },
      { time: "18:45 - 19:30", activity: "Khai mạc Gala Dinner & Vinh danh nhà tài trợ kim cương" },
      { time: "19:30 - 21:00", activity: "Tiệc tối sang trọng & Chương trình nghệ thuật đặc sắc" },
      { time: "21:00 - 21:30", activity: "Bốc thăm may mắn & Trao giải thưởng kết nối vàng" },
    ],
    speakers: ["Ban Thường Trực CLB CEO 1983", "Khách mời Diễn giả Quốc tế", "Các Shark & Quỹ đầu tư mạo hiểm"],
  },
  "ev-3": {
    desc: "Bàn tròn thảo luận những thách thức và thời cơ về dòng tiền, quản trị tinh gọn và ứng dụng AI vào tự động hóa vận hành doanh nghiệp trong giai đoạn kinh tế mới.",
    schedule: [
      { time: "14:00 - 14:30", activity: "Đón khách & Tea break giao lưu" },
      { time: "14:30 - 15:45", activity: "Diễn đàn: Ứng dụng AI & Tự động hóa cho SME 2026" },
      { time: "15:45 - 17:00", activity: "Hỏi đáp mở & Tư vấn trực tiếp từ các chuyên gia" },
    ],
    speakers: ["Chuyên gia tư vấn chuyển đổi số doanh nghiệp", "CTO ViOne Ecosystem"],
  },
};

function getEventAgenda(e: MyEvent, index: number) {
  if (EVENT_AGENDA[e.id]) {
    return EVENT_AGENDA[e.id];
  }
  const defaultSchedules = [
    [
      { time: "07:30 - 08:30", activity: "Đón tiếp đại biểu & Check-in QR điện tử" },
      { time: "08:30 - 10:30", activity: `Khai mạc: ${e.title}` },
      { time: "10:30 - 11:30", activity: "Tọa đàm giao thương B2B & Ký kết hợp tác" },
      { time: "11:30 - 13:00", activity: "Tiệc trưa kết nối Networking mở rộng" },
    ],
    [
      { time: "18:00 - 18:45", activity: "Thảm đỏ, Tiệc cocktail & Kết nối tự do" },
      { time: "18:45 - 20:30", activity: `Chương trình Gala: ${e.title}` },
      { time: "20:30 - 21:30", activity: "Giao lưu doanh nhân & Trao kỷ niệm chương" },
    ],
    [
      { time: "14:00 - 14:30", activity: "Tea break & Tiếp đón khách mời" },
      { time: "14:30 - 16:30", activity: `Diễn đàn chuyên đề: ${e.title}` },
      { time: "16:30 - 17:30", activity: "Hỏi đáp mở & Tư vấn trực tiếp từ chuyên gia" },
    ],
  ];
  return {
    desc: `Sự kiện "${e.title}" do ${e.communityName || "CLB Doanh Nhân CEO 1983"} tổ chức tại ${e.place}. Diễn ra vào lúc ${e.time} ngày ${e.day} tháng ${e.month}, 2026 với sự tham gia của đông đảo hội viên và khách mời danh dự.`,
    schedule: defaultSchedules[index % defaultSchedules.length],
    speakers: [
      "Ban Thường Trực CLB Doanh Nhân CEO 1983",
      "Các chuyên gia đầu ngành trong lĩnh vực kinh tế & công nghệ",
      "Đại diện lãnh đạo doanh nghiệp tiêu biểu",
    ],
  };
}

function EventsScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvents = useServerFn(listMyEvents);
  const doRegister = useServerFn(registerForEvent);
  const doCancel = useServerFn(cancelEventRegistration);
  const { data: serverEvents, loading, reload } = useServerData<MyEvent[]>(() => fetchEvents(), []);

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
  } | null>(null);

  // Form registration state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formTicketCount, setFormTicketCount] = useState(1);
  const [formTicketType, setFormTicketType] = useState("Standard");
  const [formNote, setFormNote] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);

  const isRegistered = (e: MyEvent) => {
    if (localRegistered[e.id] !== undefined) return localRegistered[e.id];
    return !!e.registered;
  };

  const fallbackEvents: MyEvent[] = [
    {
      id: "ev-1",
      title: "Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình",
      time: "07:00 - 13:00",
      day: "16",
      month: "SEP",
      place: "Trung Tâm Hội Nghị Quốc Gia, Hà Nội",
      registered: false,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
    {
      id: "ev-2",
      title: "Gala Dinner Kết Nối Giao Thương & Xúc Tiến Đầu Tư 2026",
      time: "18:00 - 21:30",
      day: "28",
      month: "SEP",
      place: "Khách sạn JW Marriott, Hà Nội",
      registered: true,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
    {
      id: "ev-3",
      title: "Diễn đàn Kinh tế & Bàn tròn Doanh nhân Trẻ Khởi nghiệp",
      time: "14:00 - 17:00",
      day: "05",
      month: "OCT",
      place: "Khách sạn Lotte Hotel, Ba Đình, Hà Nội",
      registered: false,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
  ];

  const events = (serverEvents && serverEvents.length > 0) ? serverEvents : fallbackEvents;

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
    setFormName(user?.name || user?.user_metadata?.full_name || "");
    setFormEmail(user?.email || "");
    setFormPhone(user?.username && /^\d+$/.test(user.username) ? user.username : "");
    setFormCompany("Công ty Thành viên CEO 1983");
    setFormPosition("Giám đốc điều hành / CEO");
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
    const ticketPrice = 500000;
    const totalAmount = ticketPrice * formTicketCount;
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
          ticketCount: formTicketCount,
          ticketType: formTicketType,
          note: formNote.trim(),
        },
      });

      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: (res as any)?.invoiceNo || tempInvNo,
        ticketCount: formTicketCount,
      });

      toast.success(
        isEn
          ? "Registered successfully! CRM payment invoice has been sent to Messages."
          : "Đăng ký thành công! Hóa đơn thanh toán VietQR đã được gửi vào mục Tin nhắn.",
      );
      reload();
    } catch (err: any) {
      setLocalRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegisteringEvent(null);
      setSelectedEvent(null);

      setRegisteredSuccessInfo({
        eventTitle: registeringEvent.title,
        totalAmount,
        invoiceNo: tempInvNo,
        ticketCount: formTicketCount,
      });

      toast.success("Đăng ký thành công! Hệ thống CRM đã gửi hóa đơn thanh toán vào mục Tin nhắn.");
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
    <div className="vba-animate pb-24">
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
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {isEn ? "Loading events..." : t("m.events.loading")}
          </p>
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
        {filteredEvents.map((e: any, index: number) => {
          const evImg = e.image || defaultEventImages[index % defaultEventImages.length];
          const registered = isRegistered(e);
          const isBookmarked = !!bookmarkedIds[e.id];

          return (
            <div
              key={e.id}
              role="listitem"
              onClick={() => setSelectedEvent(e)}
              className="vba-card flex flex-col p-2.5 sm:p-3 shadow-xs hover:border-amber-500/50 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex gap-2.5">
                {/* Event Photo with Date Overlay */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={evImg}
                    alt={e.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-1 top-1 flex flex-col items-center justify-center rounded-md bg-[#2E3192]/95 backdrop-blur-xs px-1 py-0.5 shadow-sm">
                    <span className="text-[11px] font-black leading-none text-amber-400">
                      {e.day}
                    </span>
                    <span className="text-[7px] font-bold uppercase text-white/90">
                      {e.month}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[12.5px] font-bold text-[var(--vba-text)] leading-snug">
                    {e.title}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-[var(--vba-text-muted)]">
                    <Clock className="h-3 w-3 text-[#2E3192] dark:text-amber-400" /> {e.time}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-[var(--vba-text-muted)]">
                    <MapPin className="h-3 w-3 text-[#2E3192] dark:text-amber-400" />{" "}
                    <span className="line-clamp-1">{e.place}</span>
                  </div>
                  {e.communityName && (
                    <div className="mt-0.5 flex items-center gap-1 text-[9.5px] font-semibold text-[#2E3192] dark:text-amber-400">
                      <Users className="h-2.5 w-2.5" /> {e.communityName}
                    </div>
                  )}
                </div>

                {/* Bookmark Toggle: Solid blue background when marked */}
                <button
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    toggleBookmark(e.id);
                  }}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all active:scale-95 cursor-pointer ${
                    isBookmarked
                      ? "bg-[#2E3192] text-white shadow-sm hover:bg-[#19194D]"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-400"
                  }`}
                  title={isBookmarked ? (isEn ? "Remove bookmark" : "Bỏ đánh dấu") : (isEn ? "Bookmark event" : "Đánh dấu sự kiện")}
                >
                  <Bookmark
                    className={`h-3.5 w-3.5 ${
                      isBookmarked ? "fill-white text-white" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Action and Registration Status */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#2E3192] dark:text-amber-400">
                  <Users className="h-3 w-3 text-[#2E3192] dark:text-amber-400 stroke-[2.2]" />
                  <span>{index === 0 ? "48" : index === 1 ? "32" : "19"} {isEn ? "registered" : "đã đăng ký"}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setSelectedEvent(e);
                    }}
                    className="h-6.5 w-6.5 inline-flex items-center justify-center rounded-lg border border-[#2E3192] bg-[#2E3192] hover:bg-[#19194D] text-white transition cursor-pointer shadow-xs active:scale-95 shrink-0"
                    style={{ color: "#ffffff" }}
                    title={isEn ? "View details" : "Xem chi tiết"}
                    aria-label="Xem chi tiết"
                  >
                    <Eye className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>

                  {registered ? (
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-flex h-6.5 items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
                        title="Đã đăng ký tham gia sự kiện"
                      >
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        <span>{isEn ? "Registered" : "Đã đăng ký"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(evt) => unregister(e.id, evt)}
                        disabled={busy === e.id}
                        className="h-7 w-7 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 inline-flex items-center justify-center transition cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                        title="Hủy đăng ký"
                        aria-label="Hủy đăng ký"
                      >
                        {busy === e.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(evt) => handleOpenRegister(e, evt)}
                      disabled={busy === e.id}
                      style={{ color: "#ffffff" }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-[#2E3192] hover:bg-[#19194D] text-white shadow-xs disabled:opacity-60 cursor-pointer transition active:scale-95 shrink-0"
                      title={isEn ? "Register" : "Đăng ký tham gia"}
                      aria-label="Đăng ký tham gia"
                    >
                      <Ticket className="h-3.5 w-3.5 stroke-[2.2]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: XEM CHI TIẾT SỰ KIỆN */}
      {selectedEvent && (() => {
        const selectedIndex = events.findIndex((x: any) => x.id === selectedEvent.id);
        const selectedImg = (selectedEvent as any).image || defaultEventImages[(selectedIndex >= 0 ? selectedIndex : 0) % defaultEventImages.length];
        const selectedAgenda = getEventAgenda(selectedEvent, selectedIndex >= 0 ? selectedIndex : 0);

        return (
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)]">
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedImg}
                  alt={selectedEvent.title}
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2E3192]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10.5px] font-bold text-amber-300 mb-1.5 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Sự kiện chính thức
                  </span>
                  <h3 className="text-[15px] font-extrabold text-white line-clamp-2 leading-tight">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-4 text-[13px]">
                {/* Thông tin chính */}
                <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-[#2E3192] dark:text-blue-400 shrink-0" />
                    <span>Ngày {selectedEvent.day} tháng {selectedEvent.month}, 2026 ({selectedEvent.time})</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-[#2E3192] dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{selectedEvent.place}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Users className="h-4 w-4 text-[#2E3192] dark:text-blue-400 shrink-0" />
                    <span>{selectedEvent.communityName || "CLB Doanh Nhân CEO 1983"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    <span>Phí tham dự: 500.000 đ / vé (Thanh toán qua VietQR CRM)</span>
                  </div>
                </div>

                {/* Mô tả chương trình */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">Giới thiệu sự kiện</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    {selectedAgenda.desc}
                  </p>
                </div>

                {/* Lịch trình chi tiết */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Chương trình chi tiết</h4>
                  <div className="space-y-2 border-l-2 border-[#2E3192]/40 pl-3">
                    {selectedAgenda.schedule.map((item, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-bold text-[#2E3192] dark:text-blue-400">{item.time}</span>
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

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Đóng
                  </button>

                  {isRegistered(selectedEvent) ? (
                    <button
                      type="button"
                      onClick={(evt) => unregister(selectedEvent.id, evt)}
                      disabled={busy === selectedEvent.id}
                      className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                    >
                      {busy === selectedEvent.id ? "Đang hủy..." : "Hủy đăng ký"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(evt) => handleOpenRegister(selectedEvent, evt)}
                      style={{ color: "#ffffff" }}
                      className="px-5 py-2 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Đăng ký tham gia</span>
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
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                    <Ticket className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                    Số lượng vé
                  </label>
                  <select
                    value={formTicketCount}
                    onChange={(e) => setFormTicketCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} vé
                      </option>
                    ))}
                  </select>
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
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>Đơn giá vé:</span>
                  <span>500.000 đ / vé</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-amber-900 dark:text-amber-300 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                  <span>Tổng phí thanh toán:</span>
                  <span className="text-base text-rose-600 dark:text-rose-400">
                    {new Intl.NumberFormat("vi-VN").format(500000 * formTicketCount)} đ
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-start gap-1">
                  <Info className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Hệ thống CRM sẽ tự động gửi thông tin thanh toán VietQR vào mục <b>Gắn kết</b> của bạn ngay sau khi bấm Gửi.</span>
                </div>
              </div>

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
                      <span>Xác nhận & Gửi đăng ký</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: THÔNG BÁO ĐÃ GỬI HÓA ĐƠN VÀO TIN NHẮN THÀNH CÔNG */}
      {registeredSuccessInfo && (
        <Dialog open={!!registeredSuccessInfo} onOpenChange={(open) => !open && setRegisteredSuccessInfo(null)}>
          <DialogContent className="max-w-sm p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)] text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Đăng ký sự kiện thành công!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ban Thư Ký CLB Doanh Nhân CEO 1983 đã tiếp nhận đăng ký tham gia sự kiện <b>"{registeredSuccessInfo.eventTitle}"</b>.
            </p>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã hóa đơn:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{registeredSuccessInfo.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số lượng vé:</span>
                <span className="font-bold">{registeredSuccessInfo.ticketCount} vé</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Tổng phí:</span>
                <span>{new Intl.NumberFormat("vi-VN").format(registeredSuccessInfo.totalAmount)} đ</span>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/60 p-2.5 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2 text-left">
              <MessageSquare className="h-4 w-4 shrink-0 text-[#2E3192] dark:text-amber-400" />
              <span>Hệ thống CRM đã gửi mã VietQR thanh toán vào mục <b>Gắn kết</b> của bạn.</span>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setRegisteredSuccessInfo(null);
                  navigate({ to: "/association/messages", search: { peerCode: "admin" } });
                }}
                style={{ color: "#ffffff" }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Đến mục Gắn kết để thanh toán</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRegisteredSuccessInfo(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
