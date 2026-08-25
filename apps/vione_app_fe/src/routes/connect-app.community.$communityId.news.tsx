import { createFileRoute } from "@tanstack/react-router";
import { CommunityNews } from "@/components/business-connect/mobile/community/CommunityNews";

export const Route = createFileRoute("/connect-app/community/$communityId/news")({
  head: () => ({
    meta: [
      { title: "Bảng tin cộng đồng — ViOne Business Connect" },
      {
        name: "description",
        content: "Tin hoạt động mới nhất của cộng đồng bạn đang tham gia.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityNewsPage,
});

function CommunityNewsPage() {
  const { communityId } = Route.useParams();
  return <CommunityNews communityId={communityId} />;
}
