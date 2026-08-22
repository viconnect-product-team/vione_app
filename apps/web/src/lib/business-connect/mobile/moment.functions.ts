// BC-Mobile-2E — Meeting Moment RPC adapters (thin).
//
// Auth context + input validation only; all domain logic lives in
// moment.service.ts and all persistence in moment.server.ts.
//
// Idempotency contract: clientToken is a UUID minted once per composer mount.
// Double-taps, retries, and reconnects replay against the SAME draft row —
// a Moment can never be duplicated by transport noise.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  addMomentPhotoSlots,
  commitMomentPhotos,
  deleteMoment,
  finalizeMoment,
  listMomentPhotos,
  prepareMoment,
  removeMomentPhoto,
  updateMoment,
} from "./moment.service";
import { makeMomentServiceDeps } from "./moment.server";
import {
  MOMENT_MAX_EVENT_NAME_LEN,
  MOMENT_MAX_NOTE_LEN,
  MOMENT_MAX_PHOTOS,
  MOMENT_MAX_PLACE_LABEL_LEN,
} from "./moment.types";

const prepareInput = z.object({
  personId: z.string().regex(/^[uc]:[0-9a-fA-F-]{36}$/),
  occurredAt: z.string().min(4).max(40),
  eventName: z
    .string()
    .max(MOMENT_MAX_EVENT_NAME_LEN + 8)
    .nullish(),
  placeLabel: z
    .string()
    .max(MOMENT_MAX_PLACE_LABEL_LEN + 8)
    .nullish(),
  note: z
    .string()
    .max(MOMENT_MAX_NOTE_LEN + 8)
    .nullish(),
  photoCount: z.number().int().min(0).max(MOMENT_MAX_PHOTOS),
  clientToken: z.string().uuid(),
});

export const bcMobileMomentPrepareFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => prepareInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return prepareMoment(deps, { ...data, viewerId: context.userId });
  });

const finalizeInput = z.object({
  momentId: z.string().uuid(),
  uploadedMediaIds: z.array(z.string().uuid()).max(MOMENT_MAX_PHOTOS),
});

export const bcMobileMomentFinalizeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => finalizeInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return finalizeMoment(deps, { ...data, viewerId: context.userId });
  });

// ── BC-Mobile-7C — quản lý khoảnh khắc đã lưu ───────────────────────────────

const updateInput = z.object({
  momentId: z.string().uuid(),
  occurredAt: z.string().min(4).max(40),
  eventName: z
    .string()
    .max(MOMENT_MAX_EVENT_NAME_LEN + 8)
    .nullish(),
  placeLabel: z
    .string()
    .max(MOMENT_MAX_PLACE_LABEL_LEN + 8)
    .nullish(),
  note: z
    .string()
    .max(MOMENT_MAX_NOTE_LEN + 8)
    .nullish(),
});

export const bcMobileMomentUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return updateMoment(deps, { ...data, viewerId: context.userId });
  });

const deleteInput = z.object({ momentId: z.string().uuid() });

export const bcMobileMomentDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => deleteInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return deleteMoment(deps, { ...data, viewerId: context.userId });
  });

// ── BC-Mobile-7D — sửa ảnh của khoảnh khắc đã lưu ───────────────────────────

const momentIdInput = z.object({ momentId: z.string().uuid() });

export const bcMobileMomentPhotosFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => momentIdInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return listMomentPhotos(deps, { ...data, viewerId: context.userId });
  });

const photoAddInput = z.object({
  momentId: z.string().uuid(),
  count: z.number().int().min(1).max(MOMENT_MAX_PHOTOS),
});

export const bcMobileMomentPhotoSlotsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => photoAddInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return addMomentPhotoSlots(deps, { ...data, viewerId: context.userId });
  });

const photoCommitInput = z.object({
  momentId: z.string().uuid(),
  addedMediaIds: z.array(z.string().uuid()).max(MOMENT_MAX_PHOTOS),
  uploadedMediaIds: z.array(z.string().uuid()).max(MOMENT_MAX_PHOTOS),
});

export const bcMobileMomentPhotoCommitFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => photoCommitInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return commitMomentPhotos(deps, { ...data, viewerId: context.userId });
  });

const photoRemoveInput = z.object({
  momentId: z.string().uuid(),
  mediaId: z.string().uuid(),
});

export const bcMobileMomentPhotoRemoveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => photoRemoveInput.parse(data))
  .handler(async ({ data, context }) => {
    const deps = makeMomentServiceDeps(context.supabase);
    return removeMomentPhoto(deps, { ...data, viewerId: context.userId });
  });

// ── BC-Mobile-7E — AI ghi nhớ bằng giọng nói ────────────────────────────────

const voiceInput = z.object({
  audioBase64: z.string().min(64).max(12_000_000),
  mimeType: z.string().max(80),
});

export const bcMobileMomentVoiceNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => voiceInput.parse(data))
  .handler(async ({ data }) => {
    const { transcribeMomentVoice } = await import("./moment-voice.server");
    return transcribeMomentVoice({ ...data, maxLen: MOMENT_MAX_NOTE_LEN });
  });
