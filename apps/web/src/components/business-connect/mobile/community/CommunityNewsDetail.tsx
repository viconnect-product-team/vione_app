// BC-Mobile-7B+ — Community news detail (read-only).

import { useT } from "@/lib/i18n";
import { useCommunityNewsDetail } from "@/hooks/use-community-news";
import { BusinessConnectTopBar } from "../BusinessConnectTopBar";
import { CommunityError } from "./CommunityHome";
import { ActivityListSkeleton } from "./CommunityEvents";
import { NewsMeta } from "./CommunityNews";

export function CommunityNewsDetail({
  communityId,
  newsRef,
}: {
  communityId: string;
  newsRef: string;
}) {
  const t = useT();
  const { detail, unavailable, initialLoading, coreError, retry } = useCommunityNewsDetail(
    communityId,
    newsRef,
  );

  return (
    <>
      <BusinessConnectTopBar back title={t("bc.mobile.community.news.title")} />
      <main id="bc-mobile-community-news-detail" className="contents">
        {initialLoading ? (
          <ActivityListSkeleton rows={3} />
        ) : coreError ? (
          <CommunityError onRetry={retry} />
        ) : unavailable || !detail ? (
          <section className="mt-14">
            <p className="max-w-[34ch] text-[15px] leading-relaxed text-[var(--bc-mobile-muted)]">
              {t("bc.mobile.community.unavailable")}
            </p>
          </section>
        ) : (
          <article className="mt-5">
            {detail.news.category ? (
              <span className="inline-flex rounded-full border border-[var(--bc-mobile-accent)]/40 bg-[var(--bc-mobile-accent)]/10 px-2.5 py-1 text-[11.5px] font-medium text-[var(--bc-mobile-accent)]">
                {detail.news.category}
              </span>
            ) : null}
            <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight text-[var(--bc-mobile-text)]">
              {detail.news.title}
            </h1>
            <p className="mt-1 text-[13px] text-[var(--bc-mobile-muted)]">
              {detail.communityName}
            </p>
            <NewsMeta item={detail.news} />

            <div className="mt-4 border-t border-[var(--bc-mobile-border)] pt-4">
              {detail.news.excerpt ? (
                <p className="max-w-[62ch] whitespace-pre-line text-[15px] leading-relaxed text-[var(--bc-mobile-text)]">
                  {detail.news.excerpt}
                </p>
              ) : (
                <p className="text-[14px] leading-relaxed text-[var(--bc-mobile-muted)]">
                  {t("bc.mobile.community.news.noContent")}
                </p>
              )}
            </div>
          </article>
        )}
      </main>
    </>
  );
}
