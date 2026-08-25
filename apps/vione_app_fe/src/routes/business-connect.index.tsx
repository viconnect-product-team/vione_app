// BC-8.0 — Unified Work Hub landing.
// Replaces the previous overview surface with a read-model that composes
// Connection, Introduction, Meeting, Follow-up, Calendar and Relationship
// Timeline signals into one prioritized action list.

import { createFileRoute } from "@tanstack/react-router";
import { WorkHubPage } from "@/components/business-connect/work-hub/WorkHubPage";

export const Route = createFileRoute("/business-connect/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Work Hub — Business Connect" },
      {
        name: "description",
        content:
          "One prioritized view of everything you need to act on across your Business Connect network.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorkHubPage,
});
