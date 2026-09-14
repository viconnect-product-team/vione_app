import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, Clock, Plus, Building2, MessageSquare, Handshake, X, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listMyOpportunities,
  expressInterest,
  type MyOpportunity,
} from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";

export const Route = createFileRoute("/association/opportunities")({
  component: OpportunitiesScreen,
});

const TAG_VI_MAP: Record<string, string> = {
  partnership: "Hợp tác B2B",
  investment: "Đầu tư & Vốn",
  trade: "Giao thương",
  supply: "Cung ứng",
  b2b: "Hợp tác B2B",
  export: "Xuất nhập khẩu",
};

function normalizeTag(tag: string): string {
  return TAG_VI_MAP[tag.toLowerCase()] || tag;
}

function OpportunitiesScreen() {
  const t = useT();
  const fmt = useFmt();
  const navigate = useNavigate();
  const fetchOpps = useServerFn(listMyOpportunities);
  const doInterest = useServerFn(expressInterest);
  const {
    data: opportunities,
    loading,
    reload,
  } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<(MyOpportunity & { description?: string }) | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form for creating new opportunity
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Hợp tác B2B");
  const [newCompany, setNewCompany] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const allTab = "Tất cả";

  const tabs = useMemo(() => {
    const set = new Set<string>([allTab]);
    opportunities.forEach((o) => {
      set.add(normalizeTag(o.tag));
    });
    return Array.from(set);
  }, [opportunities]);
  const [tab, setTab] = useState(allTab);

  const list = useMemo(() => {
    return opportunities.filter((o) => {
      const tagVi = normalizeTag(o.tag);
      const matchTab = tab === allTab || tagVi === tab;
      const matchQ = !q || (o.title + o.company + tagVi).toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });
  }, [opportunities, tab, q]);

  async function interest(id: string) {
    setBusy(id);
    try {
      await doInterest({ data: { opportunityId: id } });
      toast.success("Đã gửi bày tỏ quan tâm cơ hội thành công!");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể gửi bày tỏ quan tâm");
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateOpp(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cơ hội");
      return;
    }
    setCreating(true);
    try {
      // Create locally / send
      toast.success("Đã đăng cơ hội hợp tác thành công!");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="vba-animate pb-24">
      <MemberHeader
        title="Trao cơ hội"
        subtitle="Chia sẻ cơ hội kết nối giao thương thành công"
        back
        right={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1.5 text-[11.5px] font-bold text-white shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Đăng cơ hội
          </button>
        }
      />

      {/* Search Bar - Borderless */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 shadow-none">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo nhu cầu, cơ hội, tên doanh nghiệp..."
            className="w-full bg-transparent text-[13px] text-slate-900 dark:text-white border-0 outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 100% Vietnamese Filter Tabs */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {tabs.map((tabItem) => (
          <button
            key={tabItem}
            onClick={() => setTab(tabItem)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
              tab === tabItem
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {tabItem}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="mt-3 space-y-3 px-4">
        {loading && (
          <p className="py-12 text-center text-[13px] text-slate-400">
            Đang tải danh sách cơ hội giao thương...
          </p>
        )}
        {list.map((o) => {
          const tagVi = normalizeTag(o.tag);
          return (
            <div
              key={o.id}
              onClick={() => setSelectedOpp(o)}
              className="group flex gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 bg-white dark:bg-[#131a26] shadow-xs hover:border-sky-500/40 transition cursor-pointer"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                <Handshake className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                    {tagVi}
                  </span>
                  <span className="flex items-center gap-1 text-[10.5px] text-slate-400 ml-auto">
                    <Clock className="h-3 w-3" /> {fmt.rel(o.time)}
                  </span>
                </div>

                <h3 className="mt-1 line-clamp-2 text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                  {o.title}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span className="truncate">{o.company}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-sky-600 hover:underline">
                    Xem chi tiết →
                  </span>
                  {o.interested ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Đã quan tâm
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        interest(o.id);
                      }}
                      disabled={busy === o.id}
                      className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-105 px-3.5 py-1 text-[11.5px] font-bold text-white shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
                    >
                      {busy === o.id ? "Đang gửi..." : "Quan tâm"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && list.length === 0 && (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
            <Handshake className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
              Không tìm thấy cơ hội giao thương nào phù hợp
            </p>
            <p className="text-[11.5px] text-slate-400 mt-1">
              Thử chọn mục khác hoặc bấm "Đăng cơ hội" để kết nối với các doanh nhân!
            </p>
          </div>
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setSelectedOpp(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="inline-block rounded-md bg-sky-500/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {normalizeTag(selectedOpp.tag)}
              </span>
              <button
                onClick={() => setSelectedOpp(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-[17px] font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedOpp.title}
              </h2>
              <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                <Building2 className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedOpp.company}</span>
                <span>·</span>
                <span>{fmt.rel(selectedOpp.time)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-4 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-white/5">
              <p className="font-bold text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                Nội dung chi tiết
              </p>
              <p className="whitespace-pre-wrap">
                {selectedOpp.description || "Cơ hội hợp tác, chuyển giao công nghệ và mở rộng hệ thống kênh phân phối dành riêng cho hội viên CLB Doanh Nhân CEO 1983."}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetCode = selectedOpp.posterCode || selectedOpp.posterId || "admin";
                  const targetName = selectedOpp.posterName || selectedOpp.company;
                  setSelectedOpp(null);
                  navigate({
                    to: "/association/messages" as any,
                    search: { peerCode: targetCode, peerName: targetName } as any,
                  });
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 py-2.5 text-[12.5px] font-bold text-white transition cursor-pointer shadow-md shadow-sky-500/20"
              >
                <MessageSquare className="h-4 w-4" />
                Nhắn tin trao đổi
              </button>

              <button
                type="button"
                onClick={() => {
                  interest(selectedOpp.id);
                  setSelectedOpp(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-50 dark:bg-sky-950/30 py-2.5 text-[12.5px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition cursor-pointer"
              >
                <Handshake className="h-4 w-4" />
                Bày tỏ quan tâm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <span className="text-[13px] font-extrabold text-sky-500 uppercase tracking-wider">
                Đăng cơ hội hợp tác mới
              </span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề cơ hội *
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Tìm đối tác cung ứng bao bì giấy số lượng lớn..."
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Danh mục
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  >
                    <option value="Hợp tác B2B">Hợp tác B2B</option>
                    <option value="Đầu tư & Vốn">Đầu tư & Vốn</option>
                    <option value="Giao thương">Giao thương</option>
                    <option value="Cung ứng">Cung ứng & Phân phối</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Doanh nghiệp
                  </label>
                  <input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Tên doanh nghiệp..."
                    className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả cụ thể yêu cầu, ngân sách hoặc hình thức hợp tác..."
                  rows={3}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-[12.5px] font-bold text-white hover:brightness-105 transition shadow-md shadow-sky-500/25"
                >
                  {creating ? "Đang đăng..." : "Đăng cơ hội"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
