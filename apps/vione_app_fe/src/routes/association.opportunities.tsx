import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Check,
  Clock,
  Plus,
  Building2,
  MessageSquare,
  Handshake,
  X,
  Send,
  Sparkles,
  ImagePlus,
  Trash2,
  Phone,
  User,
  Briefcase,
  Loader2,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listMyOpportunities,
  expressInterest,
  getMyMember,
  type MyOpportunity,
  type MyMember,
} from "@/lib/member-app.functions";
import { uploadChatAttachment } from "@/lib/upload-media";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
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

const defaultOppImages = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
];

function normalizeTag(tag: string): string {
  return TAG_VI_MAP[tag.toLowerCase()] || tag;
}

function OpportunitiesScreen() {
  const t = useT();
  const fmt = useFmt();
  const navigate = useNavigate();
  const fetchOpps = useServerFn(listMyOpportunities);
  const doInterest = useServerFn(expressInterest);
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const {
    data: opportunities,
    loading,
    reload,
  } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<(MyOpportunity & { description?: string }) | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<(MyOpportunity & { description?: string }) | null>(null);

  // Scroll lock for modals
  useEffect(() => {
    if (selectedOpp || createModalOpen || editingOpp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOpp, createModalOpen, editingOpp]);

  // Form for creating new opportunity with full CRM deal fields
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Hợp tác B2B");
  const [newCompany, setNewCompany] = useState("");
  const [newBudgetMin, setNewBudgetMin] = useState("");
  const [newBudgetMax, setNewBudgetMax] = useState("");
  const [newIndustry, setNewIndustry] = useState("Công nghệ & Số hóa");
  const [newRegion, setNewRegion] = useState("Toàn quốc");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form for editing opportunity
  const [editTitle, setEditTitle] = useState("");
  const [editTag, setEditTag] = useState("Hợp tác B2B");
  const [editCompany, setEditCompany] = useState("");
  const [editBudgetMin, setEditBudgetMin] = useState("");
  const [editBudgetMax, setEditBudgetMax] = useState("");
  const [editIndustry, setEditIndustry] = useState("Công nghệ & Số hóa");
  const [editRegion, setEditRegion] = useState("Toàn quốc");
  const [editDeadline, setEditDeadline] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editContactName, setEditContactName] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactTitle, setEditContactTitle] = useState("");
  const [updating, setUpdating] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      if (!newContactName) setNewContactName(member.name || "");
      if (!newContactPhone) setNewContactPhone(member.phone || "");
      if (!newContactTitle) setNewContactTitle(member.title || "");
      if (!newCompany) setNewCompany(member.title || "CLB Doanh Nhân CEO 1983");
    }
  }, [member]);

  const allTab = "Tất cả";
  const myOppsTab = "Cơ hội của tôi";

  // Check if an opportunity was posted by current user
  const checkIsMine = (o: MyOpportunity) => {
    if (!member) return false;
    return Boolean(
      (member.code && o.posterCode === member.code) ||
      (member.name && (o.posterName === member.name || o.contactName === member.name)) ||
      (member.id && (o.posterId === member.id || o.posterId === member.userId)) ||
      (member.userId && (o.posterId === member.userId || o.posterId === member.id))
    );
  };

  const allOpportunities = useMemo(() => {
    const arr = [...(opportunities || [])];
    arr.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });
    return arr;
  }, [opportunities]);

  const tabs = useMemo(() => {
    const set = new Set<string>([allTab, myOppsTab]);
    allOpportunities.forEach((o) => {
      set.add(normalizeTag(o.tag));
    });
    return Array.from(set);
  }, [allOpportunities]);
  const [tab, setTab] = useState(allTab);

  const list = useMemo(() => {
    return allOpportunities.filter((o) => {
      const tagVi = normalizeTag(o.tag);
      const isMine = checkIsMine(o);

      let matchTab = true;
      if (tab === myOppsTab) {
        matchTab = Boolean(isMine);
      } else if (tab !== allTab) {
        matchTab = tagVi === tab;
      }

      const matchQ = !q || (o.title + o.company + tagVi).toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });
  }, [allOpportunities, tab, q, member]);

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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploaded = await uploadChatAttachment(file);
      if (isEdit) {
        setEditImage(uploaded.url);
      } else {
        setNewImage(uploaded.url);
      }
      toast.success("Đã tải ảnh lên thành công");
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (isEdit) {
          setEditImage(reader.result as string);
        } else {
          setNewImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const startEditOpp = (o: MyOpportunity & { description?: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOpp(o);
    setEditTitle(o.title || "");
    setEditTag(normalizeTag(o.tag || "Hợp tác B2B"));
    setEditCompany(o.company || member?.title || "");
    setEditBudgetMin(o.budgetMin ? String(o.budgetMin) : "");
    setEditBudgetMax(o.budgetMax ? String(o.budgetMax) : "");
    setEditDesc(o.description || "");
    setEditImage(o.image || null);
    setEditContactName(o.contactName || member?.name || "");
    setEditContactPhone(o.contactPhone || member?.phone || "");
    setEditContactTitle(o.contactTitle || member?.title || "");
    setEditIndustry("Công nghệ & Số hóa");
    setEditRegion("Toàn quốc");
    setEditDeadline("");
  };

  const handleDeleteOpp = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa cơ hội giao thương này khỏi hệ thống không?")) return;
    try {
      await fetchNestApi(`/opportunities/${id}`, { method: "DELETE" });
      toast.success("Đã xóa cơ hội thành công!");
      if (selectedOpp?.id === id) {
        setSelectedOpp(null);
      }
      reload();
    } catch {
      toast.error("Không thể xóa cơ hội. Vui lòng thử lại!");
    }
  };

  const handleUpdateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    if (!editTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cơ hội");
      return;
    }
    setUpdating(true);
    const cleanBudgetMin = Number(editBudgetMin.replace(/\D/g, "")) || 0;
    const cleanBudgetMax = Number(editBudgetMax.replace(/\D/g, "")) || 0;

    try {
      await fetchNestApi(`/opportunities/${editingOpp.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          type: editTag,
          budgetMin: cleanBudgetMin,
          budgetMax: cleanBudgetMax,
          region: editRegion,
          industry: editIndustry,
          deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
          contactName: editContactName.trim(),
          contactPhone: editContactPhone.trim(),
          contactTitle: editContactTitle.trim(),
          company: editCompany.trim(),
          image: editImage || null,
        }),
      });
      toast.success("Cập nhật cơ hội thành công!");
      setEditingOpp(null);
      if (selectedOpp?.id === editingOpp.id) {
        setSelectedOpp(null);
      }
      reload();
    } catch {
      toast.error("Không thể cập nhật cơ hội. Vui lòng thử lại!");
    } finally {
      setUpdating(false);
    }
  };

  async function handleCreateOpp(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cơ hội");
      return;
    }
    if (!newContactName.trim()) {
      toast.error("Vui lòng nhập tên người liên hệ");
      return;
    }
    if (!newContactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }
    setCreating(true);
    const cleanBudgetMin = Number(newBudgetMin.replace(/\D/g, "")) || 0;
    const cleanBudgetMax = Number(newBudgetMax.replace(/\D/g, "")) || 0;

    try {
      await fetchNestApi("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || `${newCompany.trim()} - Cơ hội: ${newTitle.trim()}. Khu vực: ${newRegion}. Ngành nghề: ${newIndustry}`,
          type: newTag,
          budgetMin: cleanBudgetMin,
          budgetMax: cleanBudgetMax,
          region: newRegion,
          industry: newIndustry,
          deadline: newDeadline ? new Date(newDeadline).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
          contactName: newContactName.trim(),
          contactPhone: newContactPhone.trim(),
          contactTitle: newContactTitle.trim(),
          company: newCompany.trim(),
          image: newImage || null,
        }),
      });
      toast.success("Đã đăng cơ hội thành công lên hệ thống!");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewBudgetMin("");
      setNewBudgetMax("");
      setNewDeadline("");
      setNewImage(null);
      reload();
    } catch {
      toast.error("Không thể đăng cơ hội. Vui lòng thử lại!");
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
            style={{ color: "#ffffff" }}
            className="flex items-center gap-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-3 py-1.5 text-[11.5px] font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
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
                ? "bg-[#003B95] text-white shadow-xs"
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
        {list.map((o, index) => {
          const tagVi = normalizeTag(o.tag);
          const rawOppImg = o.image;
          const oppImg =
            (rawOppImg && (rawOppImg.startsWith("data:") || rawOppImg.startsWith("http") || rawOppImg.startsWith("/"))
              ? (rawOppImg.startsWith("data:") ? rawOppImg : resolveMediaUrl(rawOppImg) || rawOppImg)
              : null) || defaultOppImages[index % defaultOppImages.length];

          return (
            <div
              key={o.id}
              onClick={() => setSelectedOpp(o)}
              className="vba-card flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:border-amber-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer bg-white dark:bg-[#131a26] group"
            >
              {/* 1. POSTER BANNER ON TOP (IMAGE 3) */}
              <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-slate-900">
                <img
                  src={oppImg}
                  alt={o.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#003B95]/90 backdrop-blur-md px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-amber-300 shadow-md border border-amber-400/30">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    {tagVi}
                  </span>

                  {o.interested && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Đã quan tâm
                    </span>
                  )}
                </div>

                {/* Poster Title & Company & Posting Date */}
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h3 className="text-[16px] sm:text-[17px] font-extrabold text-white line-clamp-2 leading-tight drop-shadow-md group-hover:text-amber-200 transition-colors">
                    {o.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-amber-300/90">
                    <p className="flex items-center gap-1.5 truncate">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{o.company}</span>
                    </p>
                    <span className="text-[10px] text-white/80 shrink-0 font-medium ml-2">
                      📅 {o.time ? new Date(o.time).toLocaleDateString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. 3-COLUMN METADATA BAR (IMAGE 3 LAYOUT) */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3 text-center border-b border-slate-100 dark:border-white/5">
                {/* Col 1: NGÀY ĐĂNG */}
                <div className="px-1.5 flex flex-col items-center justify-start">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-0.5">
                    <Calendar className="h-3 w-3 text-[#003B95] dark:text-amber-400 shrink-0" />
                    <span>NGÀY ĐĂNG</span>
                  </div>
                  <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {o.time ? new Date(o.time).toLocaleDateString("vi-VN") : "Hôm nay"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {fmt.rel(o.time)}
                  </p>
                </div>

                {/* Col 2: GIÁ TRỊ DEAL TỪ CRM */}
                <div className="px-1.5 flex flex-col items-center justify-start">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                    <span>GIÁ TRỊ DEAL</span>
                  </div>
                  <p className="text-[11.5px] font-black text-amber-600 dark:text-amber-400 leading-snug truncate max-w-full">
                    {o.value || "Thỏa thuận B2B"}
                  </p>
                  <p className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Từ CRM CEO 1983
                  </p>
                </div>

                {/* Col 3: ĐỊA BÀN */}
                <div className="px-1.5 flex flex-col items-center justify-start">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-0.5">
                    <MapPin className="h-3 w-3 text-[#003B95] dark:text-amber-400 shrink-0" />
                    <span>ĐỊA BÀN</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                    Toàn quốc & B2B
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Hội viên CLB
                  </p>
                </div>
              </div>

              {/* 3. CARD ACTION FOOTER */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {o.contactName ? (
                    <span className="truncate text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span>LH: {o.contactName}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">CLB CEO 1983 thẩm định</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {checkIsMine(o) && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => startEditOpp(o, e)}
                        className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition active:scale-95 cursor-pointer flex items-center gap-1"
                        title="Chỉnh sửa cơ hội"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOpp(o.id, e)}
                        className="p-1.5 rounded-xl border border-rose-300 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition active:scale-95 cursor-pointer"
                        title="Xóa cơ hội"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setSelectedOpp(o);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-amber-500/50 hover:text-[#003B95] dark:hover:text-amber-400 transition active:scale-95 cursor-pointer"
                  >
                    Xem chi tiết
                  </button>

                  {o.interested ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Đã quan tâm
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        interest(o.id);
                      }}
                      disabled={busy === o.id}
                      style={{ color: "#ffffff" }}
                      className="rounded-xl bg-[#003B95] hover:bg-[#002B70] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-50"
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

      {/* Opportunity Detail Modal (React Portal - IMAGE 4 LAYOUT) */}
      {mounted && selectedOpp && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setSelectedOpp(null)}
        >
          <div
            className="w-full max-w-[440px] my-auto flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poster Header (Image 4) */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900 shrink-0">
              <img
                src={(selectedOpp.image ? resolveMediaUrl(selectedOpp.image) || selectedOpp.image : null) || defaultOppImages[0]}
                alt={selectedOpp.title}
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer z-20"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#003B95]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-300 mb-1 shadow-sm border border-amber-400/30">
                  <Sparkles className="h-3 w-3" />
                  {normalizeTag(selectedOpp.tag)}
                </span>
                <h3 className="text-[16px] font-extrabold text-white line-clamp-2 leading-tight">
                  {selectedOpp.title}
                </h3>
                <p className="text-[11px] text-amber-300/90 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span>{selectedOpp.company}</span>
                </p>
              </div>
            </div>

            {/* 3-Column Metadata Strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 text-center border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="px-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Hạn tiếp nhận</span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{fmt.rel(selectedOpp.time)}</span>
              </div>
              <div className="px-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Địa bàn</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">Toàn quốc & B2B</span>
              </div>
              <div className="px-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Đối tượng</span>
                <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">Hội viên CEO 1983</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 space-y-3.5 text-[13px] overflow-y-auto max-h-[55vh] [scrollbar-width:thin]">
              {/* Context Paragraphs */}
              <div className="space-y-2">
                <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                  Chi tiết cơ hội hợp tác & giao thương
                </h4>
                <div className="text-slate-600 dark:text-slate-300 text-[12.5px] leading-relaxed whitespace-pre-line">
                  {selectedOpp.description ||
                    "Cơ hội hợp tác kinh doanh, chuyển giao công nghệ và mở rộng mạng lưới đối tác chiến lược dành riêng cho cộng đồng doanh nhân và hội viên CLB CEO 1983."}
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

              {/* CRM Deal Value Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border border-amber-500/30">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-500">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Giá trị hợp đồng / Deal CRM</span>
                    <p className="text-[15px] font-black text-amber-600 dark:text-amber-400">{selectedOpp.value || "Thỏa thuận B2B"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Xác thực CRM
                </span>
              </div>

              {/* Highlighted Key Points (Image 4 Style) */}
              <div className="space-y-2 text-[12.5px] bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <Clock className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Thời hạn tiếp nhận:</strong> {fmt.rel(selectedOpp.time)} (Đang mở tiếp nhận hồ sơ)</span>
                </div>

                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <MapPin className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Khu vực hợp tác:</strong> Toàn quốc & Liên kết mạng lưới vùng miền</span>
                </div>

                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <Briefcase className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Hình thức:</strong> {normalizeTag(selectedOpp.tag)} · Ưu đãi độc quyền hội viên CEO 1983</span>
                </div>

                {(selectedOpp.contactName || selectedOpp.contactPhone) && (
                  <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 pt-1 border-t border-amber-500/10">
                    <User className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span><strong>Đầu mối phụ trách:</strong> {selectedOpp.contactName || "Ban Xúc tiến Thương mại"} {selectedOpp.contactTitle ? `(${selectedOpp.contactTitle})` : ""}</span>
                      {selectedOpp.contactPhone && (
                        <span className="block mt-0.5">
                          Hotline: <a href={`tel:${selectedOpp.contactPhone}`} className="text-emerald-600 dark:text-emerald-400 font-bold underline">{selectedOpp.contactPhone}</a>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="flex gap-2.5 px-4 py-3 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
              {checkIsMine(selectedOpp) ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      const opp = selectedOpp;
                      setSelectedOpp(null);
                      startEditOpp(opp, e);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 py-2.5 text-[12.5px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                    Chỉnh sửa cơ hội
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOpp(selectedOpp.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2.5 text-[12.5px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </>
              ) : (
                <>
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
                    style={{ color: "#ffffff" }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[12.5px] font-bold text-white transition cursor-pointer shadow-md shadow-[#003B95]/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Gắn kết & nhắn tin
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      interest(selectedOpp.id);
                      setSelectedOpp(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 py-2.5 text-[12.5px] font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Handshake className="h-4 w-4" />
                    Bày tỏ quan tâm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Opportunity Modal (React Portal) */}
      {mounted && createModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          style={{ minHeight: "100dvh" }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px] max-h-[90dvh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
              <span className="text-[13.5px] font-extrabold text-[#003B95] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="h-4 w-4" />
                Đăng cơ hội hợp tác mới
              </span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
                {/* Image upload */}
                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hình ảnh minh họa / Poster cơ hội
                  </label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                  {newImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                      <img src={newImage} alt="Hình ảnh cơ hội" className="w-full h-44 object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition bg-slate-50 dark:bg-white/[0.02] cursor-pointer"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                          <span className="text-[12px] font-medium">Đang tải ảnh lên...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 text-amber-500" />
                          <span className="text-[12.5px] font-semibold">Tải lên hình ảnh dự án / cơ hội</span>
                          <span className="text-[10.5px] text-slate-400">JPG, PNG, WebP (Tối đa 10MB)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tiêu đề cơ hội <span className="text-red-500">*</span>
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
                      Phân loại cơ hội
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
                      <option value="Xuất nhập khẩu">Xuất nhập khẩu</option>
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

                {/* CRM Deal Fields: Budget Min/Max */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngân sách tối thiểu (VNĐ)
                    </label>
                    <input
                      value={newBudgetMin}
                      onChange={(e) => setNewBudgetMin(e.target.value)}
                      placeholder="VD: 500.000.000"
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngân sách tối đa (VNĐ)
                    </label>
                    <input
                      value={newBudgetMax}
                      onChange={(e) => setNewBudgetMax(e.target.value)}
                      placeholder="VD: 2.000.000.000"
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Industry & Region & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngành nghề
                    </label>
                    <select
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Công nghệ & Số hóa">Công nghệ & Số hóa</option>
                      <option value="Xây dựng & Bất động sản">Xây dựng & BĐS</option>
                      <option value="Sản xuất & Công nghiệp">Sản xuất & Chế tạo</option>
                      <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                      <option value="Thương mại & Dịch vụ">Thương mại & Dịch vụ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Khu vực
                    </label>
                    <select
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Toàn quốc">Toàn quốc</option>
                      <option value="Hà Nội & Miền Bắc">Hà Nội & Miền Bắc</option>
                      <option value="TP. Hồ Chí Minh & Miền Nam">TP.HCM & Miền Nam</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Quốc tế">Quốc tế</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hạn chót
                    </label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Contact information fields */}
                <div className="rounded-2xl p-3.5 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-500/20 space-y-2.5">
                  <p className="text-[11.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Thông tin người đại diện kết nối
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Họ tên người liên hệ <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          placeholder="VD: Nguyễn Văn A"
                          className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          placeholder="VD: 0912345678"
                          className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                      Chức vụ / Chức danh
                    </label>
                    <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <input
                        value={newContactTitle}
                        onChange={(e) => setNewContactTitle(e.target.value)}
                        placeholder="VD: Giám đốc kinh doanh / CEO"
                        className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mô tả chi tiết nội dung cơ hội
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Mô tả cụ thể nhu cầu, tiêu chuẩn đối tác, ngân sách hoặc phương án hợp tác..."
                    rows={3}
                    className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ color: "#ffffff" }}
                  className="flex-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[12.5px] font-bold text-white transition shadow-md shadow-[#003B95]/25 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Đang đăng..." : "Đăng cơ hội"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Opportunity Modal (React Portal) */}
      {mounted && editingOpp && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          style={{ minHeight: "100dvh" }}
          onClick={() => setEditingOpp(null)}
        >
          <div
            className="w-full max-w-[440px] max-h-[90dvh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
              <span className="text-[13.5px] font-extrabold text-[#003B95] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pencil className="h-4 w-4" />
                Chỉnh sửa cơ hội giao thương
              </span>
              <button
                onClick={() => setEditingOpp(null)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOpp} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
                {/* Image upload */}
                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hình ảnh minh họa / Poster cơ hội
                  </label>
                  <input
                    type="file"
                    ref={editImageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, true)}
                  />
                  {editImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                      <img src={editImage} alt="Hình ảnh cơ hội" className="w-full h-44 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-4 text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                        {uploadingImage ? "Đang tải ảnh lên..." : "Tải ảnh mới từ thiết bị"}
                      </span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tiêu đề cơ hội hợp tác <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="VD: Cần tìm đối tác cung ứng dịch vụ phần mềm..."
                    className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Loại cơ hội
                    </label>
                    <select
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Hợp tác B2B">Hợp tác B2B</option>
                      <option value="Đầu tư & Vốn">Đầu tư & Vốn</option>
                      <option value="Giao thương">Giao thương</option>
                      <option value="Cung ứng">Cung ứng</option>
                      <option value="Xuất nhập khẩu">Xuất nhập khẩu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Tên doanh nghiệp
                    </label>
                    <input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="VD: Công ty Cổ phần ABC"
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Deal Budget Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngân sách từ (VNĐ)
                    </label>
                    <input
                      value={editBudgetMin}
                      onChange={(e) => setEditBudgetMin(e.target.value)}
                      placeholder="VD: 50,000,000"
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-[12.5px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Đến (VNĐ)
                    </label>
                    <input
                      value={editBudgetMax}
                      onChange={(e) => setEditBudgetMax(e.target.value)}
                      placeholder="VD: 200,000,000"
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-[12.5px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Industry, Region, Deadline */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngành nghề
                    </label>
                    <select
                      value={editIndustry}
                      onChange={(e) => setEditIndustry(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Công nghệ & Số hóa">Công nghệ</option>
                      <option value="Xây dựng & Bất động sản">Xây dựng & BĐS</option>
                      <option value="Sản xuất & Công nghiệp">Sản xuất</option>
                      <option value="Tài chính & Đầu tư">Tài chính</option>
                      <option value="Thương mại & Dịch vụ">Dịch vụ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Khu vực
                    </label>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Toàn quốc">Toàn quốc</option>
                      <option value="Hà Nội & Miền Bắc">Miền Bắc</option>
                      <option value="TP. Hồ Chí Minh & Miền Nam">Miền Nam</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Quốc tế">Quốc tế</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Hạn xử lý
                    </label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Contact information fields */}
                <div className="rounded-2xl p-3.5 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-500/20 space-y-2.5">
                  <p className="text-[11.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Thông tin người đại diện kết nối
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Họ tên người liên hệ <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          value={editContactName}
                          onChange={(e) => setEditContactName(e.target.value)}
                          placeholder="VD: Nguyễn Văn A"
                          className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          value={editContactPhone}
                          onChange={(e) => setEditContactPhone(e.target.value)}
                          placeholder="VD: 0912345678"
                          className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                      Chức vụ / Chức danh
                    </label>
                    <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <input
                        value={editContactTitle}
                        onChange={(e) => setEditContactTitle(e.target.value)}
                        placeholder="VD: Giám đốc kinh doanh / CEO"
                        className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mô tả chi tiết nội dung cơ hội
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Mô tả cụ thể nhu cầu, tiêu chuẩn đối tác, ngân sách hoặc phương án hợp tác..."
                    rows={3}
                    className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{ color: "#ffffff" }}
                  className="flex-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[12.5px] font-bold text-white transition shadow-md shadow-[#003B95]/25 cursor-pointer disabled:opacity-50"
                >
                  {updating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
