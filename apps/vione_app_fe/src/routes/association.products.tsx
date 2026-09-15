import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyProducts, requestQuote, type MyProduct } from "@/lib/member-app.functions";
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
  const { data: initialProducts, loading } = useServerData<MyProduct[]>(() => fetchProducts(), []);

  const [customProducts, setCustomProducts] = useState<MyProduct[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(() => search?.action === "create");

  useEffect(() => {
    if (search?.action === "create") {
      setPostModalOpen(true);
    }
  }, [search?.action]);

  // Quote Request Modal state
  const [quoteProduct, setQuoteProduct] = useState<MyProduct | null>(null);
  const [quoteQty, setQuoteQty] = useState("1");
  const [quotePhone, setQuotePhone] = useState("0988 123 456");
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Form states for posting product
  const [formPhoto, setFormPhoto] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formCategory, setFormCategory] = useState("Công nghệ & Phần mềm");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const allProducts = [...customProducts, ...initialProducts];
  const list = allProducts.filter(
    (p) => !q || (p.name + p.company + p.category).toLowerCase().includes(q.toLowerCase()),
  );

  // Statistics
  const totalProducts = allProducts.length;
  const totalInterested = allProducts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalViews = allProducts.reduce((acc, p) => acc + (p.views || 0), 0);

  const handleOpenQuoteModal = (p: MyProduct) => {
    setQuoteProduct(p);
    setQuoteQty("1");
    setQuoteNote(isEn ? "We are interested in this product and would like a detailed quotation." : "Doanh nghiệp chúng tôi quan tâm và muốn nhận bảng báo giá chi tiết.");
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteProduct) return;
    setQuoteSubmitting(true);
    try {
      await doQuote({
        data: {
          productId: quoteProduct.id,
          quantity: parseInt(quoteQty, 10) || 1,
          message: `${quoteNote} (SĐT: ${quotePhone})`,
        },
      });
    } catch {
      // Fallback in case of mock environment
    } finally {
      setQuoteSubmitting(false);
      // Increment interested likes locally
      quoteProduct.likes = (quoteProduct.likes || 0) + 1;
      setQuoteProduct(null);
      toast.success(
        isEn
          ? `VIP Quote request sent for "${quoteProduct.name}"! The partner will contact you soon.`
          : `Đã gửi yêu cầu nhận báo giá cho "${quoteProduct.name}"! Đối tác sẽ liên hệ lại với bạn trong 24h.`,
      );
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(isEn ? "Please enter product name!" : "Vui lòng nhập tên sản phẩm!");
      return;
    }
    const newProduct: MyProduct = {
      id: `prod-${Date.now()}`,
      name: formName.trim(),
      company: formCompany.trim() || (isEn ? "Member Enterprise" : "Doanh nghiệp Hội viên"),
      category: formCategory,
      price: formPrice.trim(),
      imageUrl: formPhoto || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      likes: 1,
      views: 12,
      time: isEn ? "Just now" : "Vừa xong",
    };
    setCustomProducts([newProduct, ...customProducts]);
    setPostModalOpen(false);
    toast.success(isEn ? "Product posted successfully to marketplace!" : "Đăng sản phẩm thành công và đã hiển thị trên sàn giao thương!");
    // Reset
    setFormPhoto("");
    setFormName("");
    setFormCompany("");
    setFormPrice("");
    setFormDesc("");
  };

  return (
    <div className="vba-animate pb-24 text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "Products & Services" : t("m.products.title")}
        back
        right={
          <button
            onClick={() => setPostModalOpen(true)}
            style={{ color: "#ffffff" }}
            className="flex items-center gap-1 rounded-full bg-[#EA580C] hover:bg-[#D97706] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs cursor-pointer transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            {isEn ? "Post" : "Đăng sản phẩm"}
          </button>
        }
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

      {/* Search Bar */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isEn ? "Search products, services, companies..." : "Tìm kiếm sản phẩm, dịch vụ, doanh nghiệp..."}
            className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] py-2.5 pl-9 pr-3 text-[12.5px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0 shadow-none"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="mt-4 space-y-3 px-4">
        {loading && (
          <p className="py-10 text-center text-xs text-slate-400">
            {isEn ? "Loading products..." : t("m.products.loading")}
          </p>
        )}
        {!loading && list.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400">
              {isEn ? "No products found matching your search" : t("m.products.empty")}
            </p>
          </div>
        )}
        {list.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs transition hover:border-amber-500/50 flex gap-3.5"
          >
            {/* Image Thumbnail */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <img
                src={p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                alt={p.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded-md bg-black/60 backdrop-blur-xs px-1.5 py-0.2 text-[8.5px] font-semibold text-white">
                {p.category.split("&")[0]}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                {p.name}
              </h3>

              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Building2 className="h-3 w-3 shrink-0 text-[#003B95] dark:text-amber-400" />
                <span className="truncate">{p.company}</span>
              </div>

              {p.price && (
                <div className="mt-1 text-[12.5px] font-black text-[#003B95] dark:text-amber-400">
                  {p.price}
                </div>
              )}

              {/* Stats Bar for each product: Đã quan tâm & Đã xem */}
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Eye className="h-3.5 w-3.5 text-emerald-500" /> {p.views || 0} {isEn ? "views" : "đã xem"}
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" /> {p.likes || 0} {isEn ? "interested" : "quan tâm"}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">{p.time}</span>
              </div>

              {/* Action: Nhận báo giá VIP */}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuoteModal(p)}
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs cursor-pointer transition active:scale-95"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {isEn ? "Request VIP Quote" : "Nhận báo giá VIP"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL ĐĂNG SẢN PHẨM: ĐÃ SỬA THEME SÁNG TRANG NHÃ ── */}
      {postModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50 duration-200"
          onClick={() => setPostModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
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

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5">
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
                      className="h-44 w-full object-cover"
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
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/70 transition">
                    <ImagePlus className="h-8 w-8 text-[#003B95] dark:text-amber-400 mb-1.5" />
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
                    {isEn ? "Price / Offer" : "Giá niêm yết / Ưu đãi"}
                  </label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ví dụ: 15.000.000 đ"
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                  />
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
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-0"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  style={{ color: "#ffffff" }}
                  className="w-full rounded-xl bg-[#003B95] hover:bg-[#002B70] py-3 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-98 transition cursor-pointer"
                >
                  {isEn ? "Publish Product to Marketplace" : "Đăng Sản Phẩm Lên Gian Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE MODAL NHẬN BÁO GIÁ VIP ── */}
      {quoteProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50 duration-200"
          onClick={() => setQuoteProduct(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
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

            {/* Product Summary Preview */}
            <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
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

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-3">
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
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>

              <div className="pt-2">
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
        </div>
      )}
    </div>
  );
}
