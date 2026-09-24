import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983LandingV1 } from "@/components/landing/Ceo1983LandingV1";

export const Route = createFileRoute("/landing/ceo1983/cinematic")({
  component: Ceo1983CinematicPage,
});

function Ceo1983CinematicPage() {
  return <Ceo1983LandingV1 />;
}
