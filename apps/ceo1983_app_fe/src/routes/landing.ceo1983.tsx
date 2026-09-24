import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983LandingV1 } from "@/components/landing/Ceo1983LandingV1";

export const Route = createFileRoute("/landing/ceo1983")({
  component: Ceo1983LandingPage,
});

function Ceo1983LandingPage() {
  return <Ceo1983LandingV1 />;
}
