import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983LandingV1 } from "@/components/landing/Ceo1983LandingV1";

export const Route = createFileRoute("/landing/bussiness-connect")({
  component: Ceo1983BusinessConnectAltPage,
});

function Ceo1983BusinessConnectAltPage() {
  return <Ceo1983LandingV1 />;
}
