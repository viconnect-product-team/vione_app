import { createFileRoute } from "@tanstack/react-router";
import { BusinessConnectLandingV5 } from "@/components/landing/BusinessConnectLandingV5";

export const Route = createFileRoute("/business-connect/v5")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect v5 — Hoàng Gia CEO & Sovereign Council | VIONE" },
      {
        name: "description",
        content: "Mẫu giao diện v5: Đẳng cấp Hoàng Gia CEO, Midnight Sapphire Navy, 24K Liquid Gold và Sovereign Council.",
      },
    ],
  }),
  component: BusinessConnectV5Page,
});

function BusinessConnectV5Page() {
  return <BusinessConnectLandingV5 />;
}
