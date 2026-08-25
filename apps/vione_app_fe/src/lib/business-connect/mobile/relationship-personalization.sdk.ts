// BC-Mobile-6C — RelationshipPersonalizationSDK: stable client façade.
//
// UI code uses this and never imports server functions directly.
// Client-safe: statically imports only *.functions (RPC stubs) and types.

import {
  bcRelPersonalizationGetFn,
  bcRelPersonalizationRecordInteractionFn,
  bcRelPersonalizationResetFn,
  bcRelPersonalizationUpdateFn,
} from "./relationship-personalization.functions";
import type {
  BcMobileGetPersonalizationResult,
  BcMobileRecordInteractionResult,
  BcMobileResetPersonalizationResult,
  BcMobileUpdateRelationshipIntelPreferencesResult,
  RelationshipIntelInteractionKind,
  UpdateRelationshipIntelPreferencesInput,
} from "./relationship-personalization.types";

export const RelationshipPersonalizationSDK = {
  get: (): Promise<BcMobileGetPersonalizationResult> => bcRelPersonalizationGetFn(),

  update: (
    input: UpdateRelationshipIntelPreferencesInput,
  ): Promise<BcMobileUpdateRelationshipIntelPreferencesResult> =>
    bcRelPersonalizationUpdateFn({ data: input }),

  record: (
    kind: RelationshipIntelInteractionKind,
    recommendationType?: "reconnect" | null,
  ): Promise<BcMobileRecordInteractionResult> =>
    bcRelPersonalizationRecordInteractionFn({ data: { kind, recommendationType } }),

  reset: (): Promise<BcMobileResetPersonalizationResult> => bcRelPersonalizationResetFn(),
};

export type RelationshipPersonalizationSDKType = typeof RelationshipPersonalizationSDK;
