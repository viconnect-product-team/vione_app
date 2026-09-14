import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, X, Calendar, User, ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listNews, type NewsItem } from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";

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
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:border-sky-500/50 hover:shadow-md active:scale-[0.99] cursor-pointer shadow-xs"
          >
            {n.category && (
              <span className="inline-block rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[10.5px] font-semibold text-sky-600 dark:text-sky-400">
                {n.category}
              </span>
            )}
            <h2 className="mt-2 text-[15px] font-bold leading-snug text-slate-900 dark:text-white hover:text-sky-500 transition-colors">
              {n.title}
            </h2>
            {n.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                {n.excerpt}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <span>{[n.author, fmt.rel(n.time)].filter(Boolean).join(" · ")}</span>
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Eye className="h-3.5 w-3.5 text-sky-500" /> {n.views}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedNews.category && (
              <span className="inline-block rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">
                {selectedNews.category}
              </span>
            )}

            <h1 className="text-xl font-extrabold leading-snug text-slate-900 dark:text-white mb-3">
              {selectedNews.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              {selectedNews.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-slate-700 dark:text-slate-300">{selectedNews.author}</span>
                </div>
              )}
              {selectedNews.time && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>{fmt.rel(selectedNews.time)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedNews.views} lượt xem</span>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white bg-sky-50 dark:bg-sky-950/40 p-3.5 rounded-xl border border-sky-200 dark:border-sky-800/40 leading-relaxed">
                {selectedNews.excerpt}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Hiệp hội doanh nhân CEO 1983 không ngừng đẩy mạnh các hoạt động xúc tiến kết nối
                giao thương nội khối, xây dựng chuỗi cung ứng bền vững và lan tỏa giá trị kinh tế
                thiết thực đến từng hội viên trong kỷ nguyên chuyển đổi số toàn diện.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs transition-all shadow-md"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
