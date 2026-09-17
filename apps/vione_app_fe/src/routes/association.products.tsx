import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Eye,
  Plus,
  FileText,
  Heart,
  ImagePlus,
  Trash2,
  X,
  PackageCheck,
  Building2,
  Phone,
  Send,
  CheckCircle2,
  Calendar,
  Pencil,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyProducts, requestQuote, getMyMember, type MyProduct, type MyMember } from "@/lib/member-app.functions";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useT, useFmt, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/association/products")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: (search.action as string) || undefined,
    };
  },
  component: ProductsScreen,
});

function ProductsScreen() {
  const t = useT();
  const fmt = useFmt();
  const { lang } = useLang();
  const isEn = lang === "en";
  const search = Route.useSearch();

  const fetchProducts = useServerFn(listMyProducts);
  const doQuote = useServerFn(requestQuote);
  const fetchMember = useServerFn(getMyMember);
  const { data: initialProducts, loading, reload } = useServerData<MyProduct[]>(() => fetchProducts(), []);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(() => search?.action === "create");
  const [editingProduct, setEditingProduct] = useState<MyProduct | null>(null);

  useEffect(() => {
    if (search?.action === "create") {
      setPostModalOpen(true);
    }
  }, [search?.action]);

  // Category & User-isolated Interested state (prevents new accounts from inheriting old favorites)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const userStorageKey = `vba_interested_products_${member?.userId || member?.id || member?.code || "user"}`;
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(userStorageKey);
      setInterestedIds(stored ? JSON.parse(stored) : []);
    } catch {
      setInterestedIds([]);
    }
  }, [userStorageKey]);

  const toggleInterest = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setInterestedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(next));
      } catch {}
      toast.success(next.includes(id) ? (isEn ? "Added to interested list" : "Đã thêm vào danh mục Đã quan tâm") : (isEn ? "Removed from interested list" : "Đã bỏ khỏi danh mục Đã quan tâm"));
      return next;
    });
  };

  // Quote Request Modal state
  const [quoteProduct, setQuoteProduct] = useState<MyProduct | null>(null);
  const [quoteQty, setQuoteQty] = useState("1");
  const [quotePhone, setQuotePhone] = useState("0988 123 456");
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Lock body scroll when modal is open to ensure 100% stable centering on mobile
  useEffect(() => {
    if (quoteProduct || postModalOpen || editingProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [quoteProduct, postModalOpen, editingProduct]);

  // Form states for posting product with full CRM pricing fields
  const [formPhoto, setFormPhoto] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formCategory, setFormCategory] = useState("Công nghệ & Phần mềm");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formUnit, setFormUnit] = useState("Gói");
  const [formCurrency, setFormCurrency] = useState("VND");
  const [formDesc, setFormDesc] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Form states for editing product
  const [editPhoto, setEditPhoto] = useState("");
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editCategory, setEditCategory] = useState("Công nghệ & Phần mềm");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("Gói");
  const [editCurrency, setEditCurrency] = useState("VND");
  const [editDesc, setEditDesc] = useState("");
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // Check if product was created by current user
  const checkIsProductOwner = (p: MyProduct) => {
    if (!member) return false;
    return Boolean(
      (member.userId && p.sellerId === member.userId) ||
      (member.id && p.sellerId === member.id) ||
      (member.name && p.company?.toLowerCase().includes(member.name.toLowerCase())) ||
      (member.title && p.company?.toLowerCase().includes(member.title.toLowerCase()))
    );
  };

  const allProducts = useMemo(() => {
    const arr = [...(initialProducts || [])];
    arr.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });
    return arr;
  }, [initialProducts]);

  const totalProducts = allProducts.length;
  const totalInterested = interestedIds.length;
  const totalViews = useMemo(() => {
    return allProducts.reduce((sum, p) => sum + (p.views || 1), 0);
  }, [allProducts]);

  const list = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch = !q || (p.name + p.company + p.category).toLowerCase().includes(q.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory === "all") return true;
      if (selectedCategory === "my_products") {
        return checkIsProductOwner(p);
      }
      if (selectedCategory === "interested") return interestedIds.includes(p.id);
      return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [allProducts, q, selectedCategory, interestedIds, member]);

  const myProductsCount = useMemo(() => {
    return allProducts.filter((p) => checkIsProductOwner(p)).length;
  }, [allProducts, member]);

  const categoriesList = useMemo(() => [
    { id: "all", label: isEn ? "All" : "Tất cả", count: allProducts.length },
    { id: "my_products", label: isEn ? "My Products" : "Của tôi", count: myProductsCount },
    { id: "interested", label: isEn ? "Interested" : "Đã quan tâm", count: interestedIds.length },
    { id: "Công nghệ & Phần mềm", label: isEn ? "Technology" : "Công nghệ & Phần mềm" },
    { id: "Bất động sản & Xây dựng", label: isEn ? "Real Estate" : "Bất động sản & Xây dựng" },
    { id: "Sản xuất & Công nghiệp", label: isEn ? "Manufacturing" : "Sản xuất & Công nghiệp" },
    { id: "Tài chính & Đầu tư", label: isEn ? "Finance" : "Tài chính & Đầu tư" },
    { id: "Dịch vụ & Du lịch", label: isEn ? "Services & Tourism" : "Dịch vụ & Du lịch" },
    { id: "Hàng tiêu dùng & Bán lẻ", label: isEn ? "Consumer Goods" : "Hàng tiêu dùng & Bán lẻ" },
  ], [isEn, allProducts.length, myProductsCount, interestedIds.length]);

  const startEditProduct = (p: MyProduct, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingProduct(p);
    setEditPhoto(p.imageUrl || "");
    setEditName(p.name || "");
    setEditCompany(p.company || member?.title || "");
    setEditCategory(p.category || "Công nghệ & Phần mềm");
    setEditPrice(p.memberPrice || p.price || "");
    setEditOriginalPrice(p.originalPrice || "");
    setEditUnit("Gói");
    setEditCurrency("VND");
    setEditDesc("");
  };

  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi sàn giao thương không?")) return;
    try {
      await fetchNestApi(`/products/${id}`, { method: "DELETE" }).catch(() =>
        fetchNestApi(`/marketplace/products/${id}`, { method: "DELETE" })
      );
      toast.success("Đã xóa sản phẩm thành công!");
      if (editingProduct?.id === id) setEditingProduct(null);
      reload();
    } catch {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }
    setUpdatingProduct(true);
    const cleanPrice = Number(editPrice.replace(/\D/g, "")) || 0;
    const cleanOriginalPrice = Number(editOriginalPrice.replace(/\D/g, "")) || cleanPrice;

    try {
      await fetchNestApi(`/products/${editingProduct.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName.trim(),
          title: editName.trim(),
          description: editDesc.trim(),
          price: cleanPrice,
          originalPrice: cleanOriginalPrice,
          memberPrice: cleanPrice,
          category: editCategory,
          imageUrl: editPhoto || null,
          company: editCompany.trim(),
        }),
      }).catch(() =>
        fetchNestApi(`/marketplace/products/${editingProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: editName.trim(),
            name: editName.trim(),
            description: editDesc.trim(),
            price: cleanPrice,
            originalPrice: cleanOriginalPrice,
            category: editCategory,
            imageUrl: editPhoto || null,
            company: editCompany.trim(),
          }),
        })
      );
      toast.success("Đã cập nhật thông tin sản phẩm thành công!");
      setEditingProduct(null);
      reload();
    } catch {
      toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại!");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(isEn ? "Please enter product name!" : "Vui lòng nhập tên sản phẩm!");
      return;
    }
    setCreatingProduct(true);
    const cleanPrice = Number(formPrice.replace(/\D/g, "")) || 0;
    const cleanOriginalPrice = Number(formOriginalPrice.replace(/\D/g, "")) || cleanPrice;

    try {
      await fetchNestApi("/products", {
        method: "POST",
        body: JSON.stringify({
          name: formName.trim(),
          title: formName.trim(),
          description: formDesc.trim(),
          price: cleanPrice,
          originalPrice: cleanOriginalPrice,
          memberPrice: cleanPrice,
          unit: formUnit,
          currency: formCurrency,
          category: formCategory,
          status: "active",
          imageUrl: formPhoto || null,
          imageUrls: formPhoto ? [formPhoto] : [],
          company: formCompany.trim() || member?.title || "CLB Doanh Nhân CEO 1983",
        }),
      }).catch(() =>
        fetchNestApi("/marketplace/products", {
          method: "POST",
          body: JSON.stringify({
            title: formName.trim(),
            description: formDesc.trim(),
            price: cleanPrice,
            originalPrice: cleanOriginalPrice,
            unit: formUnit,
            currency: formCurrency,
            category: formCategory,
            status: "active",
            imageUrls: formPhoto ? [formPhoto] : [],
            company: formCompany.trim(),
          }),
        })
      );
      toast.success(isEn ? "Product posted successfully!" : "Đã đăng sản phẩm thành công lên sàn!");
      setPostModalOpen(false);
      setFormPhoto("");
      setFormName("");
      setFormCompany("");
      setFormOriginalPrice("");
      setFormPrice("");
      setFormUnit("Gói");
      setFormCurrency("VND");
      setFormDesc("");
      reload();
    } catch {
      toast.error(isEn ? "Could not post product" : "Không thể đăng sản phẩm. Vui lòng thử lại!");
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="vba-animate pb-24 text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "Products & Services" : t("m.products.title")}
        back
      />

      {/* KPI / Statistics Bar (Tổng đang có, đã quan tâm, đã xem) */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
          <div className="text-center border-r border-slate-100 dark:border-slate-800 pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isEn ? "Total Products" : "Tổng sản phẩm"}
            </div>
            <div className="mt-1 text-lg font-black text-[#003B95] dark:text-amber-400">
              {totalProducts}
            </div>
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400">
              {isEn ? "Live on market" : "Đang có trên sàn"}
            </div>
          </div>

          <div className="text-center border-r border-slate-100 dark:border-slate-800 px-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isEn ? "Interested" : "Đã quan tâm"}
            </div>
            <div className="mt-1 text-lg font-black text-rose-500">
              {totalInterested}
            </div>
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400">
              {isEn ? "Quote requests" : "Yêu cầu báo giá"}
            </div>
          </div>

          <div className="text-center pl-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isEn ? "Views" : "Đã xem"}
            </div>
            <div className="mt-1 text-lg font-black text-emerald-500">
              {totalViews}
            </div>
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400">
              {isEn ? "Store visits" : "Lượt truy cập"}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Đăng sản phẩm Button */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isEn ? "Search products, services, companies..." : "Tìm kiếm sản phẩm, dịch vụ, doanh nghiệp..."}
            className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] py-2.5 pl-10 pr-3 text-[12.5px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0 shadow-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setPostModalOpen(true)}
          style={{ color: "#ffffff" }}
          className="shrink-0 flex items-center gap-1.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] px-3.5 py-2.5 text-[12px] font-bold text-white shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4 text-amber-300" />
          <span className="hidden sm:inline">{isEn ? "Post Product" : "Đăng sản phẩm"}</span>
          <span className="sm:hidden">{isEn ? "Post" : "Đăng bán"}</span>
        </button>
      </div>

      {/* ── THANH TAB DANH MỤC CÓ MỤC "ĐÃ QUAN TÂM" ── */}
      <div className="flex items-center gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        {categoriesList.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              style={active ? { backgroundColor: "#003B95", color: "#FFFFFF" } : undefined}
            >
              <span style={active ? { color: "#FFFFFF" } : undefined}>{cat.label}</span>
              {cat.count !== undefined && (
                <span
                  className={`grid h-4.5 min-w-4.5 px-1.5 place-items-center rounded-full text-[10px] font-black ${
                    active
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                  style={active ? { color: "#FFFFFF" } : undefined}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Product List: Sàn thương mại điện tử 2 cột chuẩn Mobile UI */}
      <div className="mt-4 px-3.5">
        {loading && (
          <p className="py-10 text-center text-xs text-slate-400">
            {isEn ? "Loading products..." : t("m.products.loading")}
          </p>
        )}
        {!loading && list.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400">
              {selectedCategory === "interested"
                ? (isEn ? "You have no saved or quoted products yet" : "Bạn chưa có sản phẩm nào trong danh mục Đã quan tâm")
                : selectedCategory === "my_products"
                ? (isEn ? "You haven't posted any products yet" : "Bạn chưa đăng sản phẩm nào trên sàn")
                : (isEn ? "No products found matching your filter" : t("m.products.empty"))}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {list.map((p) => {
            const isInterested = interestedIds.includes(p.id);
            const dateDisplay = p.time && p.time.includes("T")
              ? new Date(p.time).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
              : (p.time || "Mới đăng");

            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-[#003B95]/40 transition-all duration-300"
              >
                {/* Product Image: Aspect ratio 1:1 with badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />

                  {/* Top-left Category badge */}
                  <span className="absolute top-2 left-2 rounded-md bg-black/65 backdrop-blur-md px-1.5 py-0.5 text-[8.5px] font-semibold text-amber-300 border border-amber-400/20 max-w-[75%] truncate">
                    {p.category.split("&")[0].trim()}
                  </span>

                  {/* Favorite / Heart on Top-right */}
                  <button
                    type="button"
                    onClick={(e) => toggleInterest(p.id, e)}
                    className={`absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center backdrop-blur-md transition cursor-pointer ${
                      isInterested
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-black/40 text-white hover:bg-black/60"
                    }`}
                    title={isInterested ? "Bỏ quan tâm" : "Thêm vào Đã quan tâm"}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isInterested ? "fill-white text-white" : ""}`} />
                  </button>

                  {/* Date badge on bottom-left of image */}
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1 rounded bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-medium text-white/90">
                    <Calendar className="h-2.5 w-2.5 text-amber-400" />
                    <span>{dateDisplay}</span>
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
                  <div>
                    {/* Company / Seller name */}
                    <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      <Building2 className="h-3 w-3 shrink-0 text-[#003B95] dark:text-amber-400" />
                      <span className="truncate">{p.company}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="line-clamp-2 text-[12.5px] sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#003B95] dark:group-hover:text-amber-400 transition-colors min-h-[32px]">
                      {p.name}
                    </h3>

                    {/* Price Block */}
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-[13px] sm:text-[14px] font-extrabold text-red-600 dark:text-amber-400">
                        {p.memberPrice || p.price}
                      </span>
                      {p.originalPrice && p.originalPrice !== p.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {p.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action & Stats Row */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> {p.views || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className={`h-3 w-3 ${isInterested ? "fill-rose-500 text-rose-500" : ""}`} />
                        {(p.likes || 0) + (isInterested ? 1 : 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checkIsProductOwner(p) && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => startEditProduct(p, e)}
                            className="p-1.5 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                            title="Sửa sản phẩm"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProduct(p.id, e)}
                            className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition active:scale-95 cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenQuoteModal(p)}
                        style={{ color: "#ffffff" }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#003B95] hover:bg-[#002B70] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{isEn ? "Quote" : "Báo giá"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL ĐĂNG SẢN PHẨM: ĐÃ SỬA THEME SÁNG TRANG NHÃ & CHÍNH GIỮA MÀN MOBILE ── */}
      {mounted && postModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setPostModalOpen(false)}
        >
          <div
            className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
                {isEn ? "Post New Product / Service" : "Đăng Sản Phẩm / Dịch Vụ Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
                {/* Photo Upload */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product Image (Clear & Required)" : "Ảnh sản phẩm (Bắt buộc & Rõ ràng)"}
                  </label>
                  {formPhoto ? (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <img
                        src={formPhoto}
                        alt="Ảnh sản phẩm"
                        className="h-40 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormPhoto("")}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/75 text-white hover:bg-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/70 transition">
                      <ImagePlus className="h-7 w-7 text-[#003B95] dark:text-amber-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {isEn ? "Click to upload product image" : "Chọn ảnh sản phẩm tải lên"}
                      </span>
                      <span className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") setFormPhoto(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product / Service Name *" : "Tên sản phẩm / Dịch vụ *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={isEn ? "e.g. Enterprise Cloud Digital Transformation..." : "Ví dụ: Gói giải pháp chuyển đổi số doanh nghiệp..."}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Company / Brand" : "Doanh nghiệp / Hãng"}
                    </label>
                    <input
                      type="text"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder={isEn ? "Company name" : "Tên công ty"}
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Listed Price (Original)" : "Giá niêm yết (Gốc)"}
                    </label>
                    <input
                      type="text"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="Ví dụ: 20.000.000 đ"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "VIP Member Price *" : "Giá ưu đãi Hội viên *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Ví dụ: 15.000.000 đ"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Unit" : "Đơn vị tính"}
                    </label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Gói / Chiếc / Tháng"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Currency" : "Tiền tệ"}
                    </label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="VND">VNĐ</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Industry / Category" : "Lĩnh vực / Danh mục"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 cursor-pointer"
                  >
                    <option value="Công nghệ & Phần mềm">{isEn ? "Technology & Software" : "Công nghệ & Phần mềm"}</option>
                    <option value="Bất động sản & Xây dựng">{isEn ? "Real Estate & Construction" : "Bất động sản & Xây dựng"}</option>
                    <option value="Sản xuất & Công nghiệp">{isEn ? "Manufacturing & Industry" : "Sản xuất & Công nghiệp"}</option>
                    <option value="Tài chính & Đầu tư">{isEn ? "Finance & Investment" : "Tài chính & Đầu tư"}</option>
                    <option value="Dịch vụ & Du lịch">{isEn ? "Services & Hospitality" : "Dịch vụ & Du lịch"}</option>
                    <option value="Hàng tiêu dùng & Bán lẻ">{isEn ? "Retail & Consumer Goods" : "Hàng tiêu dùng & Bán lẻ"}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Description & Quality Commitment" : "Mô tả sản phẩm & Cam kết chất lượng"}
                  </label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder={isEn ? "Describe specs, warranty, exclusive member discounts..." : "Mô tả thông số, chính sách bảo hành, ưu đãi riêng cho hội viên CEO 1983..."}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="submit"
                  style={{ color: "#ffffff" }}
                  className="w-full rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-98 transition cursor-pointer"
                >
                  {isEn ? "Publish Product to Marketplace" : "Đăng Sản Phẩm Lên Gian Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── INTERACTIVE MODAL NHẬN BÁO GIÁ VIP (React Portal) ── */}
      {mounted && quoteProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setQuoteProduct(null)}
        >
          <div
            className="my-auto w-full max-w-[420px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
                {isEn ? "Request VIP Quotation" : "Yêu Cầu Báo Giá VIP"}
              </h3>
              <button
                type="button"
                onClick={() => setQuoteProduct(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
                {/* Product Summary Preview */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
                  <img
                    src={quoteProduct.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{quoteProduct.name}</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 truncate">{quoteProduct.company}</p>
                    <p className="text-[11px] font-bold text-rose-500">{quoteProduct.price || (isEn ? "Contact for price" : "Giá ưu đãi hội viên")}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Desired Quantity / Scope" : "Số lượng dự kiến / Quy mô nhu cầu"}
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteQty}
                    onChange={(e) => setQuoteQty(e.target.value)}
                    placeholder="Ví dụ: 1 gói, 50 bộ, triển khai 1 năm..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Contact Phone / Zalo" : "Số điện thoại / Zalo liên hệ của bạn *"}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={quotePhone}
                      onChange={(e) => setQuotePhone(e.target.value)}
                      placeholder="0988 123 456"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Specific Requirements / Note" : "Yêu cầu chi tiết / Ghi chú"}
                  </label>
                  <textarea
                    rows={2}
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    placeholder={isEn ? "Specific business requirements..." : "Ghi chú thêm về yêu cầu kỹ thuật, thời gian giao hàng..."}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  style={{ color: "#ffffff" }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{quoteSubmitting ? (isEn ? "Sending request..." : "Đang gửi...") : (isEn ? "Send Quote Request Now" : "Gửi Yêu Cầu Báo Giá")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL CHỈNH SỬA SẢN PHẨM: DÀNH CHO NGƯỜI TẠO ĐĂNG ── */}
      {mounted && editingProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
                {isEn ? "Edit Product / Service" : "Chỉnh Sửa Sản Phẩm / Dịch Vụ"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 [scrollbar-width:thin]">
                {/* Image URL / preview */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product Image URL" : "Hình ảnh đại diện sản phẩm"}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                    {editPhoto && (
                      <img src={editPhoto} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product Name *" : "Tên sản phẩm / giải pháp *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="VD: Dịch vụ tư vấn giải pháp AI..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Company" : "Tên doanh nghiệp"}
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="VD: Công ty TNHH ABC"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Category" : "Ngành hàng"}
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Công nghệ & Phần mềm">Công nghệ & Phần mềm</option>
                      <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                      <option value="Sản xuất & Công nghiệp">Sản xuất & Công nghiệp</option>
                      <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                      <option value="Dịch vụ & Du lịch">Dịch vụ & Du lịch</option>
                      <option value="Hàng tiêu dùng & Bán lẻ">Hàng tiêu dùng & Bán lẻ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Original Price" : "Giá niêm yết (VNĐ)"}
                    </label>
                    <input
                      type="text"
                      value={editOriginalPrice}
                      onChange={(e) => setEditOriginalPrice(e.target.value)}
                      placeholder="VD: 50.000.000"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Member Price *" : "Giá ưu đãi hội viên *"}
                    </label>
                    <input
                      type="text"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="VD: 35.000.000"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Description / Specs" : "Mô tả / Thông số / Ưu đãi"}
                  </label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Giới thiệu điểm nổi bật, chính sách bảo hành, hỗ trợ hội viên..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isEn ? "Cancel" : "Hủy"}
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  style={{ color: "#ffffff" }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
                >
                  <span>{updatingProduct ? (isEn ? "Saving..." : "Đang lưu...") : (isEn ? "Save Changes" : "Lưu Thay Đổi")}</span>
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
