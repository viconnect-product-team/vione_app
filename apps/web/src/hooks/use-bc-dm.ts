// BC-Mobile-8A — Hooks hộp thư nội bộ.
// Khoá cache luôn gắn với người xem hiện tại (viewer isolation).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  bcDmMarkReadFn,
  bcDmOpenThreadFn,
  bcDmRetractFn,
  bcDmSendFn,
  bcDmThreadFn,
  bcDmThreadsFn,
} from "@/lib/business-connect/mobile/dm.functions";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";

export const bcDmKeys = {
  root: ["bc-dm"] as const,
  threads: (viewerKey: string) => ["bc-dm", viewerKey, "threads"] as const,
  thread: (viewerKey: string, threadId: string) => ["bc-dm", viewerKey, "thread", threadId] as const,
};

function useViewerKey(): string {
  return useViewerUserId() ?? "anon";
}

export function useDmThreads(enabled = true) {
  const viewerKey = useViewerKey();
  const fn = useServerFn(bcDmThreadsFn);
  return useQuery({
    queryKey: bcDmKeys.threads(viewerKey),
    queryFn: () => fn({ data: undefined as never }),
    enabled,
    staleTime: 15_000,
    refetchInterval: enabled ? 20_000 : false,
  });
}

export function useDmThread(threadId: string | null) {
  const viewerKey = useViewerKey();
  const fn = useServerFn(bcDmThreadFn);
  return useQuery({
    queryKey: bcDmKeys.thread(viewerKey, threadId ?? "none"),
    queryFn: () => fn({ data: { threadId: threadId as string, limit: 50 } }),
    enabled: Boolean(threadId),
    staleTime: 5_000,
    refetchInterval: threadId ? 12_000 : false,
  });
}

export function useDmSend(threadId: string) {
  const viewerKey = useViewerKey();
  const qc = useQueryClient();
  const fn = useServerFn(bcDmSendFn);
  return useMutation({
    mutationFn: (input: { body: string; clientToken: string }) =>
      fn({ data: { threadId, ...input } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bcDmKeys.thread(viewerKey, threadId) });
      void qc.invalidateQueries({ queryKey: bcDmKeys.threads(viewerKey) });
    },
  });
}

export function useDmMarkRead() {
  const viewerKey = useViewerKey();
  const qc = useQueryClient();
  const fn = useServerFn(bcDmMarkReadFn);
  return useMutation({
    mutationFn: (threadId: string) => fn({ data: { threadId } }),
    onSuccess: (_res, threadId) => {
      void qc.invalidateQueries({ queryKey: bcDmKeys.thread(viewerKey, threadId) });
      void qc.invalidateQueries({ queryKey: bcDmKeys.threads(viewerKey) });
    },
  });
}

export function useDmRetract(threadId: string) {
  const viewerKey = useViewerKey();
  const qc = useQueryClient();
  const fn = useServerFn(bcDmRetractFn);
  return useMutation({
    mutationFn: (messageId: string) => fn({ data: { messageId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bcDmKeys.thread(viewerKey, threadId) });
      void qc.invalidateQueries({ queryKey: bcDmKeys.threads(viewerKey) });
    },
  });
}

export function useDmOpenThread() {
  const viewerKey = useViewerKey();
  const qc = useQueryClient();
  const fn = useServerFn(bcDmOpenThreadFn);
  return useMutation({
    mutationFn: (personId: string) => fn({ data: { personId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bcDmKeys.threads(viewerKey) });
    },
  });
}
