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

export const IdentityConnectSDK = {
  getState: (token: string): Promise<IdentityConnectionState> =>
    fetchNestApi(`/connect-app/network/token-state/${token}`),

  send: (token: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    fetchNestApi("/connect-app/network/connections/token", {
      method: "POST",
      body: JSON.stringify({ token, mutationKey }),
    }),

  accept: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.accept(connectionId, mutationKey),

  decline: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.decline(connectionId, { mutationKey }),

  withdraw: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
    GlobalNetworkSDK.mutations.cancel(connectionId, mutationKey),
};

export type IdentityConnectSDKType = typeof IdentityConnectSDK;
