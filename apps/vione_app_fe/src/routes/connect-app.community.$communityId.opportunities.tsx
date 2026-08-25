import { createFileRoute } from "@tanstack/react-router";
import { CommunityOpportunities } from "@/components/business-connect/mobile/community/CommunityOpportunities";

export const Route = createFileRoute("/connect-app/community/$communityId/opportunities")({
  head: () => ({
    meta: [{ title: "Cơ hội kinh doanh — Business Connect" }, { name: "robots", content: "noindex" }],
  }),
  component: CommunityOpportunitiesPage,
});

function CommunityOpportunitiesPage() {
  const { communityId } = Route.useParams();
  return <CommunityOpportunities communityId={communityId} />;
}
