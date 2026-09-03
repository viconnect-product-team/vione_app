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
      fetchNestApiFromServer("/connect-app/moment/", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );

export const bcMobileMomentFinalizeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentFinalizeResult> => {
      const { momentId, ...rest } = data;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}/finalize`, context.token, {
        method: "POST",
        body: JSON.stringify(rest),
      });
    },
  );

// ── BC-Mobile-7C — quản lý khoảnh khắc đã lưu ───────────────────────────────

export const bcMobileMomentUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> => {
      const { momentId, ...rest } = data;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}`, context.token, {
        method: "PATCH",
        body: JSON.stringify(rest),
      });
    },
  );

export const bcMobileMomentDeleteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentDeleteResult> => {
      const momentId = typeof data === "string" ? data : data.momentId;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}`, context.token, {
        method: "DELETE",
      });
    },
  );

// ── BC-Mobile-7D — sửa ảnh của khoảnh khắc đã lưu ───────────────────────────

export const bcMobileMomentPhotosFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentPhotosResult> => {
      const momentId = typeof data === "string" ? data : data.momentId;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}/photos`, context.token, {
        method: "GET",
      });
    },
  );

export const bcMobileMomentPhotoSlotsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentPhotoSlotsResult> => {
      const { momentId, count } = data;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}/photo-slots`, context.token, {
        method: "POST",
        body: JSON.stringify({ count }),
      });
    },
  );

export const bcMobileMomentPhotoCommitFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> => {
      const { momentId, ...rest } = data;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}/photos/commit`, context.token, {
        method: "POST",
        body: JSON.stringify(rest),
      });
    },
  );

export const bcMobileMomentPhotoRemoveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<BcMobileMomentUpdateResult> => {
      const { momentId, mediaId } = data;
      return fetchNestApiFromServer(`/connect-app/moment/${momentId}/photos/${mediaId}`, context.token, {
        method: "DELETE",
      });
    },
  );

// ── BC-Mobile-7E — AI ghi nhớ bằng giọng nói ────────────────────────────────

export const bcMobileMomentVoiceNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(
    ({ data, context }): Promise<any> =>
      fetchNestApiFromServer("/connect-app/moment/voice-transcribe", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  );
