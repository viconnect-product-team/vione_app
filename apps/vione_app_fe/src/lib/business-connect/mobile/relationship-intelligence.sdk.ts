// BC-Mobile-6A — RelationshipIntelSDK: stable client façade.
//
// UI code uses this and never imports server functions directly.
// Client-safe: statically imports only *.functions (RPC stubs) and types.

import {
  bcRelationshipDismissRecommendationFn,
  bcRelationshipPersonRecommendationFn,
  bcRelationshipTodayRecommendationsFn,
} from "./relationship-intelligence.functions";
import type {
  BcMobileDismissRecommendationResult,
  BcMobilePersonRecommendationResult,
  BcMobileTodayRecommendationsResult,
  RelationshipRecommendationType,
  RelationshipWordingLocale,
} from "./relationship-intelligence.types";

export const RelationshipIntelSDK = {
  today: (locale: RelationshipWordingLocale): Promise<BcMobileTodayRecommendationsResult> =>
    bcRelationshipTodayRecommendationsFn({ data: { locale } }),

  person: (
    personId: string,
    locale: RelationshipWordingLocale,
  ): Promise<BcMobilePersonRecommendationResult> =>
    bcRelationshipPersonRecommendationFn({ data: { personId, locale } }),

  dismiss: (
    personId: string,
    recommendationType: RelationshipRecommendationType,
  ): Promise<BcMobileDismissRecommendationResult> =>
    bcRelationshipDismissRecommendationFn({ data: { personId, recommendationType } }),
};

export type RelationshipIntelSDKType = typeof RelationshipIntelSDK;
