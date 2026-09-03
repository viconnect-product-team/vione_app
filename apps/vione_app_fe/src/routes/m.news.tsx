// ============= Full file contents =============

import { createFileRoute } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listNews, type NewsItem } from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";

export const Route = createFileRoute("/m/news")({
  component: NewsScreen,
});

function NewsScreen() {
  const t = useT();
  const fmt = useFmt();
  const fetchNews = useServerFn(listNews);
  const { data: news, loading } = useServerData<NewsItem[]>(() => fetchNews(), []);

  return (
    <div className="vba-animate">
      <MemberHeader title={t("m.news.title")} back />

      <div className="mt-3 space-y-3 px-4">
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
          <article key={n.id} className="vba-card p-4">
            {n.category && (
              <span className="inline-block rounded-md bg-[var(--vba-gold-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--vba-gold)]">
                {n.category}
              </span>
            )}
            <h2 className="mt-2 text-[14px] font-semibold leading-snug text-[var(--vba-text)]">
              {n.title}
            </h2>
            {n.excerpt && (
              <p className="mt-1 line-clamp-2 text-[12px] text-[var(--vba-text-muted)]">
                {n.excerpt}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--vba-text-dim)]">
              <span>{[n.author, fmt.rel(n.time)].filter(Boolean).join(" · ")}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {n.views}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
