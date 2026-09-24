import { createFileRoute } from "@tanstack/react-router";
import { ViOneLandingWebOfficial } from "@/components/landing/ViOneLandingWebOfficial";

const TITLE = "ViOne Connect — Hệ Điều Hành Doanh Nghiệp 5.0 Toàn Diện";
const DESC =
  "Nền tảng SaaS Creator AI 5.0, CRM doanh nghiệp cô lập, kết nối kinh doanh B2B và Danh thiếp số Titanium NFC 1-chạm.";

export const Route = createFileRoute("/landing/vione")({
  ssr: true,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:site_name", content: "ViOne Connect" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: ViOneOfficialLandingPage,
});

function ViOneOfficialLandingPage() {
  return <ViOneLandingWebOfficial />;
}
