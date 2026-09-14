import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Check, Clock, MapPin, QrCode, Users, Flame } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, registerForEvent, type MyEvent } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import eventImg from "@/assets/vba-event.jpg";

export const Route = createFileRoute("/association/events")({
  component: EventsScreen,
});

const defaultEventImages = [
  eventImg,
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
];

function EventsScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const fetchEvents = useServerFn(listMyEvents);
  const doRegister = useServerFn(registerForEvent);
  const { data: serverEvents, loading, reload } = useServerData<MyEvent[]>(() => fetchEvents(), []);
  const [busy, setBusy] = useState<string | null>(null);

  const fallbackEvents: MyEvent[] = [
    {
      id: "ev-1",
      title: "Đại Hội Doanh Nhân CEO 1983 - Kỷ Nguyên Vươn Mình",
      time: "07:00",
      day: "16",
      month: "SEP",
      place: "Trung Tâm Hội Nghị Quốc Gia, Hà Nội",
      registered: false,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
    {
      id: "ev-2",
      title: "Gala Dinner Kết Nối Giao Thương & Xúc Tiến Đầu Tư 2026",
      time: "18:00",
      day: "28",
      month: "SEP",
      place: "Khách sạn JW Marriott, Hà Nội",
      registered: true,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
    {
      id: "ev-3",
      title: "Diễn đàn Kinh tế & Bàn tròn Doanh nhân Trẻ Khởi nghiệp",
      time: "14:00",
      day: "05",
      month: "OCT",
      place: "Khách sạn Lotte Hotel, Ba Đình, Hà Nội",
      registered: false,
      communityName: "CLB Doanh Nhân 1983 (CEO 1983)",
    },
  ];

  const events = (serverEvents && serverEvents.length > 0) ? serverEvents : fallbackEvents;

  async function register(id: string) {
    setBusy(id);
    try {
      await doRegister({ data: { eventId: id } });
      toast.success(isEn ? "Registered for event successfully!" : t("m.events.register_success"));
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : (isEn ? "Failed to register" : t("m.events.register_error")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="vba-animate pb-24">
      <MemberHeader
        title={isEn ? "Club Events" : t("m.events.title")}
        back
        right={
          <Link
            to="/association/checkin"
            aria-label={t("m.events.checkin_label")}
            className="grid h-9 w-9 place-items-center rounded-full text-sky-600 dark:text-sky-400 transition hover:bg-sky-50 dark:hover:bg-slate-800"
          >
            <QrCode className="h-5 w-5" />
          </Link>
        }
      />

      <div className="px-4 pt-3">
        <Link to="/association/checkin" className="vba-card flex items-center gap-3 p-3 shadow-xs hover:border-sky-500/40">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-xs">
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

      {/* List */}
      <div className="mt-4 space-y-3 px-4" role="list">
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {isEn ? "Loading events..." : t("m.events.loading")}
          </p>
        )}
        {!loading && events.length === 0 && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {isEn ? "No events scheduled yet" : t("m.events.empty")}
          </p>
        )}
        {events.map((e: any, index: number) => {
          const evImg = defaultEventImages[index % defaultEventImages.length];
          return (
            <div key={e.id} role="listitem" className="vba-card flex flex-col p-3.5 shadow-xs hover:border-sky-500/40 transition">
              <div className="flex gap-3.5">
                {/* Event Photo with Date Overlay */}
                <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={evImg}
                    alt={e.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-1.5 top-1.5 flex flex-col items-center justify-center rounded-lg bg-sky-600/90 backdrop-blur-xs px-1.5 py-0.5 shadow-md">
                    <span className="text-[13px] font-black leading-none text-white">
                      {e.day}
                    </span>
                    <span className="text-[8px] font-bold uppercase text-white/90">
                      {e.month}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[13.5px] font-bold text-[var(--vba-text)]">
                    {e.title}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--vba-text-muted)]">
                    <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> {e.time}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--vba-text-muted)]">
                    <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />{" "}
                    <span className="line-clamp-1">{e.place}</span>
                  </div>
                  {e.communityName && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                      <Users className="h-3 w-3" /> {e.communityName}
                    </div>
                  )}
                </div>

                <Bookmark className="h-4.5 w-4.5 shrink-0 text-slate-400 dark:text-slate-500" />
              </div>

              {/* Action and Registration Status */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  {index === 0 ? "48" : index === 1 ? "32" : "19"} {isEn ? "registered" : "đã đăng ký"}
                </span>

                {e.registered ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> {isEn ? "Registered" : t("m.events.registered")}
                  </span>
                ) : (
                  <button
                    onClick={() => register(e.id)}
                    disabled={busy === e.id}
                    className="rounded-xl bg-sky-600 hover:bg-sky-700 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs disabled:opacity-60 cursor-pointer transition"
                  >
                    {busy === e.id
                      ? (isEn ? "Registering..." : t("m.events.registering"))
                      : (isEn ? "Register Now" : t("m.events.register_btn"))}
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
