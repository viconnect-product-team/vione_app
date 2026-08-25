// BC-3.1C — GlobalNetworkSDK (client-facing façade).
// The ONLY entry point UI/hook code uses to reach Global Business Networking.
// DB-backed verbs delegate to the domain server functions (RPC stubs, safe to
// import on the client); those functions authenticate via requireSupabaseAuth
// and delegate to the service → repository / authoritative RPCs.
//
// UI code MUST consume this SDK (via the hook layer), never the server
// functions, service, repository, or supabase client directly.

import {
  acceptConnectionFn,
  blockUserFn,
  cancelConnectionFn,
  countConnectionsByStatusFn,
  declineConnectionFn,
  disconnectConnectionFn,
  getConnectionByIdFn,
  getConnectionStateFn,
  listConnectionsFn,
  listIncomingRequestsFn,
  listOutgoingRequestsFn,
  resolvePublicCounterpartsFn,
  sendConnectionRequestFn,
} from "@/lib/global-network.functions";
import {
  countUnreadNotificationsFn,
  getNotificationPrefsFn,
  listNetworkNotificationsFn,
  markNotificationsReadFn,
  reportUserFn,
  setNotificationPrefsFn,
} from "@/lib/global-network-abuse.functions";
import type { GnNotificationDTO, GnNotificationPrefs, ReportUserInput } from "./abuse.types";
import type {
  CounterpartSummary,
  GlobalConnectionDTO,
  GlobalConnectionMutationResult,
  ListOptions,
  PairState,
  ReasonInput,
  SendRequestInput,
  StatusCounts,
} from "./types";

export const GlobalNetworkSDK = {
  connections: {
    /** Accepted (mutual) connections for the current user. */
    listAccepted: (options?: ListOptions): Promise<GlobalConnectionDTO[]> =>
      listConnectionsFn({ data: options ?? {} }),
    /** Incoming pending requests (current user is recipient). */
    listIncoming: (options?: ListOptions): Promise<GlobalConnectionDTO[]> =>
      listIncomingRequestsFn({ data: options ?? {} }),
    /** Outgoing pending requests (current user is requester). */
    listOutgoing: (options?: ListOptions): Promise<GlobalConnectionDTO[]> =>
      listOutgoingRequestsFn({ data: options ?? {} }),
    /** Participant-scoped counts by status. */
    countByStatus: (): Promise<StatusCounts> => countConnectionsByStatusFn({}),
    /** A single participant-scoped connection. */
    getById: (connectionId: string): Promise<GlobalConnectionDTO> =>
      getConnectionByIdFn({ data: { connectionId } }),
    /** Directional pair state relative to the current user. */
    getState: (targetUserId: string): Promise<PairState> =>
      getConnectionStateFn({ data: { targetUserId } }),
  },

  mutations: {
    sendRequest: (input: SendRequestInput): Promise<GlobalConnectionMutationResult> =>
      sendConnectionRequestFn({ data: input }),
    accept: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
      acceptConnectionFn({ data: { connectionId, mutationKey } }),
    decline: (connectionId: string, input?: ReasonInput): Promise<GlobalConnectionMutationResult> =>
      declineConnectionFn({
        data: { connectionId, reason: input?.reason, mutationKey: input?.mutationKey },
      }),
    cancel: (connectionId: string, mutationKey?: string): Promise<GlobalConnectionMutationResult> =>
      cancelConnectionFn({ data: { connectionId, mutationKey } }),
    disconnect: (
      connectionId: string,
      input?: ReasonInput,
    ): Promise<GlobalConnectionMutationResult> =>
      disconnectConnectionFn({
        data: { connectionId, reason: input?.reason, mutationKey: input?.mutationKey },
      }),
    block: (targetUserId: string, input?: ReasonInput): Promise<GlobalConnectionMutationResult> =>
      blockUserFn({
        data: { targetUserId, reason: input?.reason, mutationKey: input?.mutationKey },
      }),
  },

  counterparts: {
    /** Privacy-safe PUBLIC summaries for a batch of counterpart user ids. */
    resolvePublic: (userIds: string[]): Promise<CounterpartSummary[]> =>
      resolvePublicCounterpartsFn({ data: { userIds } }),
  },

  // BC-3.1F — abuse controls.
  abuse: {
    /** Report a user for review (rate limited server-side). */
    report: (input: ReportUserInput): Promise<{ reportId: string }> =>
      reportUserFn({ data: input }),
  },

  // BC-3.1F — networking notification center.
  notifications: {
    list: (limit?: number): Promise<GnNotificationDTO[]> =>
      listNetworkNotificationsFn({ data: limit ? { limit } : {} }),
    unreadCount: (): Promise<{ count: number }> => countUnreadNotificationsFn({}),
    markRead: (ids?: string[]): Promise<{ updated: number }> =>
      markNotificationsReadFn({ data: ids ? { ids } : {} }),
    getPrefs: (): Promise<GnNotificationPrefs> => getNotificationPrefsFn({}),
    setPrefs: (prefs: GnNotificationPrefs): Promise<GnNotificationPrefs> =>
      setNotificationPrefsFn({ data: prefs }),
  },
};

export type GlobalNetworkSDKType = typeof GlobalNetworkSDK;
