// BC-Mobile-2E — Meeting Moment RPC adapters (thin).
// Directs all requests to backend NestJS RESTful API.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchNestApiFromServer } from "../../api-client";
import type {
  BcMobileMomentPrepareResult,
  BcMobileMomentFinalizeResult,
  BcMobileMomentUpdateResult,
  BcMobileMomentDeleteResult,
} from "./moment.types";
import type {
  BcMobileMomentPhotosResult,
  BcMobileMomentPhotoSlotsResult,
} from "./moment.service";

export const bcMobileMomentPrepareFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentPrepareResult> =>
      fetchNestApiFromServer("/connect-app/moment/prepare", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentFinalizeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentFinalizeResult> =>
      fetchNestApiFromServer("/connect-app/moment/finalize", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

// ── BC-Mobile-7C — quản lý khoảnh khắc đã lưu ───────────────────────────────

export const bcMobileMomentUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> =>
      fetchNestApiFromServer("/connect-app/moment/update", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentDeleteResult> =>
      fetchNestApiFromServer("/connect-app/moment/delete", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

// ── BC-Mobile-7D — sửa ảnh của khoảnh khắc đã lưu ───────────────────────────

export const bcMobileMomentPhotosFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentPhotosResult> =>
      fetchNestApiFromServer("/connect-app/moment/photos", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentPhotoSlotsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentPhotoSlotsResult> =>
      fetchNestApiFromServer("/connect-app/moment/photo-slots", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentPhotoCommitFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> =>
      fetchNestApiFromServer("/connect-app/moment/photo-commit", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentPhotoRemoveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> =>
      fetchNestApiFromServer("/connect-app/moment/photo-remove", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

// ── BC-Mobile-7E — AI ghi nhớ bằng giọng nói ────────────────────────────────

export const bcMobileMomentVoiceNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<any> =>
      fetchNestApiFromServer("/connect-app/moment/voice-note", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );
