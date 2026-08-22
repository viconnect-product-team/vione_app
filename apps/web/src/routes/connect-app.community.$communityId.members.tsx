// BC-Mobile-7A — Community member directory (leaf).

import { createFileRoute } from "@tanstack/react-router";
import { CommunityMembers } from "@/components/business-connect/mobile/community/CommunityMembers";

export const Route = createFileRoute("/connect-app/community/$communityId/members")({
  head: () => ({
    meta: [{ title: "Thành viên — Business Connect" }, { name: "robots", content: "noindex" }],
  }),
  component: ConnectAppCommunityMembersPage,
});

function ConnectAppCommunityMembersPage() {
  const { communityId } = Route.useParams();
  return <CommunityMembers communityId={communityId} />;
}
