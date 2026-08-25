// BC-Mobile-7A — Community Detail (leaf).

import { createFileRoute } from "@tanstack/react-router";
import { CommunityDetail } from "@/components/business-connect/mobile/community/CommunityDetail";

export const Route = createFileRoute("/connect-app/community/$communityId")({
  head: () => ({
    meta: [{ title: "Cộng đồng — Business Connect" }, { name: "robots", content: "noindex" }],
  }),
  component: ConnectAppCommunityDetailPage,
});

function ConnectAppCommunityDetailPage() {
  const { communityId } = Route.useParams();
  return <CommunityDetail communityId={communityId} />;
}
