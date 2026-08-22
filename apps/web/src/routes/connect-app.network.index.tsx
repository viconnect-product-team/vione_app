// BC-Mobile-2A — /connect-app/network index (production Network experience).
// Data contract: docs/business-connect/mobile/BC_MOBILE_2A_NETWORK_DATA_CONTRACT.md

import { createFileRoute } from "@tanstack/react-router";
import { MobilePage } from "@/components/business-connect/mobile/MobilePage";
import { NetworkHome } from "@/components/business-connect/mobile/NetworkHome";

export const Route = createFileRoute("/connect-app/network/")({
  head: () => ({
    meta: [
      { title: "Network — Business Connect" },
      {
        name: "description",
        content:
          "Những người bạn có quan hệ trên Business Connect — tìm kiếm nhanh, kết nối lại dễ dàng.",
      },
      { property: "og:title", content: "Network — Business Connect" },
      {
        property: "og:description",
        content:
          "Những người bạn có quan hệ trên Business Connect — tìm kiếm nhanh, kết nối lại dễ dàng.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnectAppNetworkPage,
});

function ConnectAppNetworkPage() {
  return (
    <MobilePage>
      <NetworkHome />
    </MobilePage>
  );
}
