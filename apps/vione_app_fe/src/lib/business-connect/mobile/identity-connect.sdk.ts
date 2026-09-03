// BC-Mobile-5E — IdentityConnectSDK: the stable client façade for the
// Connection Handshake. UI code uses this and never imports the server
// functions directly. Send/state resolve the opaque token server-side;
// accept/decline/withdraw delegate to the frozen GlobalNetworkSDK verbs
// (actor-role authorization lives in the RPCs, keyed by connectionId).
//
// Client-safe: statically imports only *.functions (RPC stubs) and types.

import { fetchNestApi } from "@/lib/api-client";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";
import type { IdentityConnectionState } from "./identity-connect.types";
import type { GlobalConnectionMutationResult } from "@/lib/global-network/types";

export interface NfcTapProfile {
  displayName: string | null;
  headline: string | null;
  jobTitle: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  website: string | null;
  linkedinUrl: string | null;
  city: string | null;
}

export interface NfcTapResult {
  ok: boolean;
  reason: "created" | "existing" | "not_found" | "self";
  profile: NfcTapProfile | null;
  connectionId: string | null;
  state: "outgoing_pending" | "incoming_pending" | "connected" | "unavailable" | "self";
}

export const IdentityConnectSDK = {
  getState: (token: string): Promise<IdentityConnectionState> =>
    fetchNestApi(`/connect-app/network/token-state/${token}`),

  send: (token: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    fetchNestApi("/connect-app/network/connections/token", {
      method: "POST",
      body: JSON.stringify({ token, mutationKey }),
    }),

  /**
   * NFC Tap-to-Exchange — single call.
   * Resolves token → fetches profile → creates connection.
   * Returns profile + state. Call this immediately after reading NFC.
   */
  nfcTap: (token: string): Promise<NfcTapResult> =>
    fetchNestApi("/connect-app/network/nfc-tap", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  accept: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.accept(connectionId, mutationKey),

  decline: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.decline(connectionId, { mutationKey }),

  withdraw: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.cancel(connectionId, mutationKey),
};

export type IdentityConnectSDKType = typeof IdentityConnectSDK;
