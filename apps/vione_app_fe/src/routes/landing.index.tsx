import { createFileRoute } from "@tanstack/react-router";
import { BusinessConnectLanding } from "@/components/landing/BusinessConnectLanding";

export const Route = createFileRoute("/landing/")({
  head: () => ({
    meta: [
      { title: "ViOne — Hệ điều hành kết nối kinh doanh | Business Connection OS" },
      {
        name: "description",
        content:
          "Nền tảng hợp nhất quản lý hiệp hội, doanh nghiệp & kết nối giao thương đa chiều bằng AI và NFC.",
      },
      { property: "og:title", content: "ViOne — Business Connection OS" },
    ],
  }),
  component: ViOneLandingPage,
});

function ViOneLandingPage() {
  return <BusinessConnectLanding />;
}
