import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983CinematicInteractiveWorldLanding } from "@/components/landing/Ceo1983CinematicInteractiveWorldLanding";

const TITLE = "CLB Doanh Nhân CEO 1983 — Hành Trình Khát Vọng & Vị Thế Doanh Nhân";
const DESC = "Hành trình trải nghiệm điện ảnh tương tác xuyên suốt 6 chiều không gian: Sky, Birds, Kites, Villas, Infinity Pool và Thế giới Lãnh đạo Underwater của CLB Doanh nhân CEO 1983 (HanoiBA).";

export const Route = createFileRoute("/landing/ceo/v1")({
  ssr: true,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:site_name", content: "CLB CEO 1983" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: Ceo1983CinematicRoute,
});

function Ceo1983CinematicRoute() {
  return <Ceo1983CinematicInteractiveWorldLanding />;
}

