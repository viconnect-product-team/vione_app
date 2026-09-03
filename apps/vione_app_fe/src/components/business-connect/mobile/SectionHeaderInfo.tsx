import React, { useId, useState } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Bell, 
  ChevronRight 
} from "lucide-react";
import { MobileSearchBar } from "./MobileSearchBar";

const tabs = [
  { id: "network", label: "Mạng lưới" },
  { id: "customers", label: "Khách hàng" },
  { id: "suggestions", label: "Gợi ý (AI)" },
];

// Mock data cho phần gợi ý AI Match (ảnh 2)
const aiMatches = [
  {
    id: "1",
    name: "Vũ Khánh Lin",
    title: "Giám đốc MKT - Ne...",
    days: "110 ngày từ lần gặp...",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Bùi Đức Thắng",
    title: "Giám đốc VH - Thà...",
    days: "92 ngày từ lần gặp...",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
];

// Mock data cho danh sách cần giữ kết nối (ảnh 3)
const nurtureConnections = [
  {
    id: "1",
    name: "Vũ Khánh Linh",
    title: "Giám đốc Marketing · NextGen",
    days: "110 ngày chưa liên hệ",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Vũ Khánh Linh",
    title: "Giám đốc Marketing · NextGen",
    days: "110 ngày chưa liên hệ",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Bùi Đức Thắng",
    title: "Giám đốc Vận hành · Thành Đạt...",
    days: "92 ngày chưa liên hệ",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  },
];

export const SectionHeaderInfo = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState("network");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchId = useId();

  return (
    <section
      className="flex flex-col items-start gap-4 relative w-full bg-[#08101b] text-[#f2efe9e6] p-4 rounded-3xl border border-[#ea9a4126] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      aria-labelledby="network-heading"
    >
      {/* ── HEADER ── */}
      <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <h1
            id="network-heading"
            className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-semibold text-[#f2efe9e6] text-2xl tracking-[0] leading-8"
          >
            Network
          </h1>
        </div>
        <p className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto] mt-[-0.5px]">
          <span className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-light text-[#d8c3b1b2] text-xs tracking-[0] leading-4 whitespace-nowrap">
            14 kết nối
          </span>
          <span
            className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Light',Helvetica] font-light text-[#d8c3b1b2] text-xs tracking-[0] leading-4 whitespace-nowrap"
            aria-hidden="true"
          >
            •
          </span>
          <span className="mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#DFB260] text-xs leading-4 relative flex items-center w-fit tracking-[0] whitespace-nowrap">
            3 cần chăm sóc
          </span>
        </p>
      </header>

      {/* ── NAV CATEGORIES ── */}
      <nav
        className="flex items-start gap-2 px-0 py-1 relative self-stretch w-full flex-[0_0_auto] overflow-x-auto scrollbar-none"
        aria-label="Network categories"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={`all-unset box-border inline-flex h-[34px] px-4 rounded-full border items-center justify-center relative border-solid transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#DFB260]/15 border-[#DFB260]/40 shadow-[0_2px_8px_rgba(223,178,96,0.12)]"
                  : "bg-[#0c1522] border-[#ea9a4126] hover:border-[#ea9a4166]"
              }`}
            >
              <span
                className={`[font-family:'Inter-Medium',Helvetica] text-xs text-center leading-4 relative flex items-center w-fit tracking-[0] whitespace-nowrap ${
                  isActive ? "text-[#DFB260] font-semibold" : "text-[#D4C3A3] font-normal"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── SEARCH FORM ── */}
      <form
        className="flex items-start gap-2 relative self-stretch w-full flex-[0_0_auto]"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm người, công ty, chức danh..."
        />
        <button
          type="button"
          onClick={() => setIsFilterOpen((currentValue) => !currentValue)}
          aria-label="Mở bộ lọc"
          aria-pressed={isFilterOpen}
          className="flex w-[42px] h-[42px] bg-[#0c1522] rounded-lg border-[#ea9a4126] items-center justify-center relative border border-solid hover:border-[#DFB260] transition-colors"
        >
          <SlidersHorizontal className="w-[15px] h-[15px] text-[#D4C3A3]" aria-hidden="true" />
        </button>
      </form>

      {/* ── SECTION 1: AI MATCH – NÊN KẾT NỐI HÔM NAY (ẢNH 2) ── */}
      <section className="flex flex-col items-start gap-3 w-full mt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[#DFB260]">
            <Sparkles className="w-[15px] h-[15px] fill-current" />
            <h2 className="[font-family:'Inter-Medium',Helvetica] font-medium text-[15px] leading-5 tracking-tight text-[#f5f7fa]">
              AI Match – Nên kết nối hôm nay
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[#DFB260] bg-[#DFB260]/10 border border-[#DFB260]/20 hover:bg-[#DFB260]/20 hover:border-[#DFB260]/40 transition-all cursor-pointer shrink-0"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3 text-[#DFB260]" />
          </button>
        </div>

        {/* Danh sách cuộn ngang */}
        <div className="flex items-stretch gap-3 w-full overflow-x-auto scrollbar-none py-1">
          {aiMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 w-[260px] shrink-0 bg-[#0c1522] rounded-2xl p-3 border border-solid border-[#ea9a4126] hover:border-[#DFB260]/50 transition-colors"
            >
              <img
                className="w-12 h-12 rounded-full object-cover border border-solid border-[#ea9a4126]"
                src={match.avatar}
                alt={match.name}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="[font-family:'Inter-Medium',Helvetica] font-semibold text-sm text-[#f2efe9e6] truncate">
                  {match.name}
                </span>
                <span className="[font-family:'Inter-Light',Helvetica] font-light text-xs text-[#d8c3b1b2] truncate mt-0.5">
                  {match.title}
                </span>
                <span className="[font-family:'Inter-Medium',Helvetica] font-medium text-xs text-[#DFB260] mt-1.5">
                  {match.days}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: CẦN GIỮ KẾT NỐI (ẢNH 3) ── */}
      <section className="flex flex-col items-start gap-3 w-full mt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[#f2efe9e6]">
            <Bell className="w-[15px] h-[15px] text-[#DFB260]" />
            <h2 className="[font-family:'Inter-Medium',Helvetica] font-medium text-[15px] leading-5 tracking-tight text-[#f2efe9e6]">
              Cần giữ kết nối (3)
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex h-7 px-2.5 rounded-full items-center gap-1 text-[11px] font-medium text-[#DFB260] bg-[#DFB260]/10 border border-[#DFB260]/20 hover:bg-[#DFB260]/20 hover:border-[#DFB260]/40 transition-all cursor-pointer shrink-0"
          >
            Xem tất cả
            <ChevronRight className="w-3 h-3 text-[#DFB260]" />
          </button>
        </div>

        {/* Danh sách dọc */}
        <div className="flex flex-col w-full bg-[#0c1522]/80 rounded-2xl border border-solid border-[#ea9a4126] overflow-hidden">
          {nurtureConnections.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3.5 hover:bg-[#0f1826] transition-colors cursor-pointer ${
                index !== nurtureConnections.length - 1 ? "border-b border-solid border-[#ea9a4115]" : ""
              }`}
            >
              <img
                className="w-11 h-11 rounded-full object-cover border border-solid border-[#ea9a4115]"
                src={item.avatar}
                alt={item.name}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="[font-family:'Inter-Medium',Helvetica] font-semibold text-sm text-[#f2efe9e6] truncate">
                  {item.name}
                </span>
                <span className="[font-family:'Inter-Light',Helvetica] font-light text-xs text-[#d8c3b1b2] truncate mt-0.5">
                  {item.title}
                </span>
                <span className="[font-family:'Inter-Light',Helvetica] font-light text-xs text-[#DFB260] mt-1">
                  {item.days}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#d8c3b180] shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};
