import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Share2, X, BookOpen, Check, ExternalLink, Calendar, HardDrive } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listDocuments, type LibraryDoc } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/association/library")({
  component: LibraryScreen,
});

function LibraryScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const fetchDocs = useServerFn(listDocuments);
  const { data: docs, loading } = useServerData<LibraryDoc[]>(() => fetchDocs(), []);
  const [selectedDoc, setSelectedDoc] = useState<LibraryDoc | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (doc: LibraryDoc) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success(isEn ? `Downloading "${doc.name}"` : `Đang tải xuống tài liệu "${doc.name}"`);
      if (doc.url) {
        window.open(doc.url, "_blank");
      }
    }, 600);
  };

  const handleShare = (doc: LibraryDoc) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isEn ? "Document link copied to clipboard!" : "Đã sao chép liên kết tài liệu vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="vba-animate pb-20">
      <MemberHeader title={isEn ? "Resource Library" : t("m.library.title")} back />

      <div className="mt-3 space-y-2.5 px-4">
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.library.loading")}
          </p>
        )}
        {!loading && docs.length === 0 && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.library.empty")}
          </p>
        )}
        {docs.map((d) => (
          <div
            key={d.id}
            onClick={() => setSelectedDoc(d)}
            className="vba-card flex items-center gap-3 p-3.5 cursor-pointer transition hover:border-sky-500/50 hover:shadow-sm active:scale-[0.99]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                {d.name}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-[var(--vba-text-muted)] flex items-center gap-1.5">
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[9.5px] font-bold text-slate-700 dark:text-slate-300">
                  {d.type?.toUpperCase() || "PDF"}
                </span>
                <span>•</span>
                <span>{d.size}</span>
                <span>•</span>
                <span>{d.time}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDoc(d);
              }}
              className="rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2.5 py-1 text-[11px] font-bold transition"
            >
              {isEn ? "View" : "Xem"}
            </button>
          </div>
        ))}
      </div>

      {/* ── DOCUMENT VIEWER MODAL ── */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 text-slate-900 dark:text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Document Header */}
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {selectedDoc.category || "Tài liệu chính thức"}
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {selectedDoc.type?.toUpperCase() || "PDF"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedDoc.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sky-500" />
                  {selectedDoc.time}
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                  {selectedDoc.size}
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 p-4 border border-sky-200 dark:border-sky-800/40">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {isEn ? "Document Overview" : "Tóm tắt nội dung văn bản"}
              </div>
              <p className="text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedDoc.description ||
                  "Văn bản chính thức ban hành bởi Ban Điều Hành CLB Doanh Nhân CEO 1983. Toàn bộ hội viên có nghĩa vụ tuân thủ và vận dụng vào hoạt động giao thương nội khối."}
              </p>
            </div>

            {/* Chapter Breakdown Preview */}
            <div className="space-y-2">
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? "Contents & Chapters" : "Mục lục & Các điều khoản chính"}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2">
                {(selectedDoc.chapters || [
                  "Chương I: Tôn chỉ, mục đích và tư cách pháp nhân",
                  "Chương II: Tiêu chuẩn, quyền lợi và nghĩa vụ hội viên",
                  "Chương III: Tổ chức bộ máy Ban Thường Trực và Ban Chấp Hành",
                  "Chương IV: Quản lý tài chính, quỹ tương trợ và xúc tiến thương mại",
                ]).map((chap, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-2 px-2 text-[12px] text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-[10px] font-black text-sky-600 dark:text-sky-400">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{chap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex gap-2.5">
              <button
                type="button"
                onClick={() => handleDownload(selectedDoc)}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-2.5 text-xs font-bold shadow-md shadow-sky-500/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? (isEn ? "Downloading..." : "Đang tải...") : (isEn ? "Download PDF" : "Tải xuống tài liệu")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(selectedDoc)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>{isEn ? "Share" : "Chia sẻ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
