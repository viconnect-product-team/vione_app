// BC-Mobile-7B+ — Community news hooks (viewer-scoped cache keys).

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CommunitySDK } from "@/lib/business-connect/mobile/community.sdk";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";

export const communityNewsKeys = {
  root: ["bc-mobile", "community-news"] as const,
  list: (viewer: string, communityId: string) =>
    [...communityNewsKeys.root, viewer, communityId] as const,
  detail: (viewer: string, communityId: string, newsRef: string) =>
    ["bc-mobile", "community-news-detail", viewer, communityId, newsRef] as const,
};

export function useCommunityNews(communityId: string) {
  const viewerId = useViewerUserId();
  const viewerKey = viewerId ?? "viewer-pending";
  const result = useInfiniteQuery({
    queryKey: communityNewsKeys.list(viewerKey, communityId),
    enabled: viewerId !== null,
    staleTime: 30_000,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => CommunitySDK.listNews({ communityId, offset: pageParam }),
    getNextPageParam: (last) => last?.nextOffset ?? undefined,
  });

  const pages = result.data?.pages ?? [];
  const firstPage = pages[0];
  return {
    items: pages.flatMap((p) => p?.items ?? []),
    unavailable: !result.isPending && !result.isError && firstPage === null,
    totalCount: firstPage?.totalCount ?? 0,
    initialLoading: result.isPending && viewerId !== null,
    coreError: result.isError && !result.data,
    retry: () => void result.refetch(),
    hasMore: result.hasNextPage,
    loadMore: () => void result.fetchNextPage(),
    isLoadingMore: result.isFetchingNextPage,
  };
}

export function useCommunityNewsDetail(communityId: string, newsRef: string) {
  const viewerId = useViewerUserId();
  const viewerKey = viewerId ?? "viewer-pending";
  const query = useQuery({
    queryKey: communityNewsKeys.detail(viewerKey, communityId, newsRef),
    enabled: viewerId !== null,
    staleTime: 30_000,
    queryFn: () => CommunitySDK.getNewsDetail({ communityId, newsRef }),
  });
  return {
    detail: query.data ?? null,
    unavailable: !query.isPending && !query.isError && query.data === null,
    initialLoading: query.isPending && viewerId !== null,
    coreError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
