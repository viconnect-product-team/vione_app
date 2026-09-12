import { createFileRoute } from "@tanstack/react-router";
import { BusinessConnectLandingV2 } from "@/components/landing/BusinessConnectLandingV2";

export const Route = createFileRoute("/business-connect/v2")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect v2 — Tu Tiên & Tiên Cảnh Đông Phương | VIONE" },
      {
        name: "description",
        content: "Mẫu giao diện v2: Phong cách Tu Tiên, Kỳ Lân Tụ Hội, Tiên Cảnh Doanh Gia, mây núi ngút ngàn, sắc đỏ hồng chu sa và ngọc bích.",
      },
    ],
  }),
  component: BusinessConnectV2Page,
});

function BusinessConnectV2Page() {
  return <BusinessConnectLandingV2 />;
}
