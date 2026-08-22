import { createFileRoute } from "@tanstack/react-router";
import { CommunityEvents } from "@/components/business-connect/mobile/community/CommunityEvents";

export const Route = createFileRoute("/connect-app/community/$communityId/events")({
  head: () => ({
    meta: [{ title: "Sự kiện cộng đồng — Business Connect" }, { name: "robots", content: "noindex" }],
  }),
  component: CommunityEventsPage,
});

function CommunityEventsPage() {
  const { communityId } = Route.useParams();
  return <CommunityEvents communityId={communityId} />;
}
