// BC-Mobile-6A — Relationship Intelligence queries (mobile Home + Person).
//
// Own query keys; never blocks Home or Person Detail (separate suspense-free
// queries with their own loading/error states). Dismissal invalidates the
// whole rel-intel root so both surfaces refresh truthfully.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RelationshipIntelSDK } from "@/lib/business-connect/mobile/relationship-intelligence.sdk";
import { trackRelationshipIntel } from "@/lib/business-connect/mobile/relationship-intelligence.telemetry";
import type { RelationshipWordingLocale } from "@/lib/business-connect/mobile/relationship-intelligence.types";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";

export const relationshipIntelKeys = {
  root: ["bc-mobile", "rel-intel"] as const,
  today: (viewerId: string) => [...relationshipIntelKeys.root, viewerId, "today"] as const,
  person: (viewerId: string, personId: string) =>
    [...relationshipIntelKeys.root, viewerId, "person", personId] as const,
};

export function useTodayRelationshipRecommendations(
  locale: RelationshipWordingLocale,
  enabled = true,
) {
  const viewerId = useViewerUserId();
  const key = relationshipIntelKeys.today(viewerId ?? "viewer-pending");
  const query = useQuery({
    queryKey: key,
    enabled: enabled && viewerId !== null,
    staleTime: 60_000,
    queryFn: () => {
      trackRelationshipIntel("RELATIONSHIP_RECOMMENDATION_REQUESTED", { surface: "home" });
      return RelationshipIntelSDK.today(locale);
    },
  });
  return {
    recommendations: query.data?.recommendations ?? [],
    initialLoading: query.isPending && viewerId !== null,
    error: query.isError && !query.data,
    retry: () => void query.refetch(),
  };
}

export function usePersonRelationshipRecommendation(
  personId: string,
  locale: RelationshipWordingLocale,
  enabled = true,
) {
  const viewerId = useViewerUserId();
  const key = relationshipIntelKeys.person(viewerId ?? "viewer-pending", personId);
  const query = useQuery({
    queryKey: key,
    enabled: enabled && viewerId !== null,
    staleTime: 60_000,
    queryFn: () => {
      trackRelationshipIntel("RELATIONSHIP_RECOMMENDATION_REQUESTED", { surface: "person" });
      return RelationshipIntelSDK.person(personId, locale);
    },
  });
  return {
    recommendation: query.data?.recommendation ?? null,
    initialLoading: query.isPending && viewerId !== null,
    error: query.isError && !query.data,
    retry: () => void query.refetch(),
  };
}

export function useDismissRelationshipRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, type }: { personId: string; type: "reconnect" }) =>
      RelationshipIntelSDK.dismiss(personId, type),
    onSuccess: () => {
      trackRelationshipIntel("RELATIONSHIP_RECOMMENDATION_DISMISSED", {});
      void queryClient.invalidateQueries({ queryKey: relationshipIntelKeys.root });
    },
  });
}
