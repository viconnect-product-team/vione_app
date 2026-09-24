import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983LandingV1 } from "@/components/landing/Ceo1983LandingV1";

export const Route = createFileRoute("/landing/business-connect")({
  component: Ceo1983BusinessConnectPage,
});

function Ceo1983BusinessConnectPage() {
  return <Ceo1983LandingV1 />;
}
