import { createFileRoute } from "@tanstack/react-router";
import { BusinessConnectLandingV4 } from "@/components/landing/BusinessConnectLandingV4";

export const Route = createFileRoute("/business-connect/v4")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect v4 — Cyberpunk 2099 & Matrix HUD | VIONE" },
      {
        name: "description",
        content: "Mẫu giao diện v4: Cyber Matrix HUD, Electric Cyan, Laser Magenta, Terminal Green và Quantum Core.",
      },
    ],
  }),
  component: BusinessConnectV4Page,
});

function BusinessConnectV4Page() {
  return <BusinessConnectLandingV4 />;
}
