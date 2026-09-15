import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Calendar, User, ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listNews, type NewsItem } from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/association/news")({
  component: NewsScreen,
});

function NewsScreen() {
  const t = useT();
  const fmt = useFmt();
  const fetchNews = useServerFn(listNews);
  const { data: news, loading } = useServerData<NewsItem[]>(() => fetchNews(), []);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  return (
    <div className="vba-animate">
      <MemberHeader title={t("m.news.title")} back />

      <div className="mt-3 space-y-3 px-4 pb-12">
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.news.loading")}
          </p>
        )}
        {!loading && news.length === 0 && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.news.empty")}
          </p>
        )}
        {news.map((n: any) => (
          <article
            key={n.id}
            onClick={() => setSelectedNews(n)}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:border-amber-500/50 hover:shadow-md active:scale-[0.99] cursor-pointer shadow-xs"
          >
            {n.category && (
              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-600/80 px-3 py-0.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-300 shadow-2xs tracking-wide">
                {n.category}
              </span>
            )}
            <h2 className="mt-2 text-[15px] font-bold leading-snug text-slate-900 dark:text-white hover:text-[#003B95] dark:hover:text-amber-400 transition-colors">
              {n.title}
            </h2>
            {n.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                {n.excerpt}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <span className="font-medium">{[n.author, fmt.rel(n.time)].filter(Boolean).join(" · ")}</span>
              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Eye className="h-4 w-4 text-[#003B95] dark:text-amber-400 stroke-[2.2]" /> {n.views}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedNews && (
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-3xl !bg-white dark:!bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="pr-6">
              {selectedNews.category && (
                <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-600/80 px-3.5 py-1 text-[11px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2.5 shadow-2xs">
                  {selectedNews.category}
                </span>
              )}

              <DialogTitle className="text-lg sm:text-xl font-extrabold leading-snug text-slate-900 dark:text-white text-left mb-2.5">
                {selectedNews.title}
              </DialogTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              {selectedNews.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#003B95] dark:text-amber-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedNews.author}</span>
                </div>
              )}
              {selectedNews.time && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#003B95] dark:text-amber-400" />
                  <span>{fmt.rel(selectedNews.time)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#003B95] dark:text-amber-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedNews.views} lượt xem</span>
              </div>
            </div>

            <div className="space-y-3.5 text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 leading-relaxed">
                {selectedNews.excerpt}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Hiệp hội doanh nhân CEO 1983 không ngừng đẩy mạnh các hoạt động xúc tiến kết nối
                giao thương nội khối, xây dựng chuỗi cung ứng bền vững và lan tỏa giá trị kinh tế
                thiết thực đến từng hội viên trong kỷ nguyên chuyển đổi số toàn diện.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                style={{ color: "#ffffff" }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] active:scale-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
