import { createFileRoute } from "@tanstack/react-router";
import { BusinessConnectLandingV3 } from "@/components/landing/BusinessConnectLandingV3";

export const Route = createFileRoute("/business-connect/v3")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect v3 — Cổ Tích Huyền Bí & Thế Giới Diệu Kỳ | VIONE" },
      {
        name: "description",
        content: "Mẫu giao diện v3: Phong cách Cổ Tích Diệu Kỳ, Amethyst Violet, Rose Pink, Cyan Stardust và Enchanted Magic Core.",
      },
    ],
  }),
  component: BusinessConnectV3Page,
});

function BusinessConnectV3Page() {
  return <BusinessConnectLandingV3 />;
}
