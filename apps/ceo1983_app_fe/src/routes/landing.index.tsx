import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983LandingV1 } from "@/components/landing/Ceo1983LandingV1";

export const Route = createFileRoute("/landing/")({
  head: () => ({
    meta: [
      { title: "CLB Doanh Nhân CEO 1983 — Kết Nối Đồng Niên, Gắn Kết Thương Trường" },
      {
        name: "description",
        content:
          "Hệ sinh thái kết nối giao thương thông minh B2B và đăng ký hội viên chính thức CLB Doanh Nhân CEO 1983.",
      },
      { property: "og:title", content: "CLB Doanh Nhân CEO 1983" },
    ],
  }),
  component: Ceo1983LandingHubPage,
});

function Ceo1983LandingHubPage() {
  // Bản landing chuẩn duy nhất theo yêu cầu: /landing/ceo/v1
  return <Ceo1983LandingV1 />;
}
