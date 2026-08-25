// BC-Mobile-4A — card scan RPC (thin).
//
// Auth context, input validation, per-user rate budget, telemetry, and typed
// failure mapping only. Domain logic lives in card-scan.service/extract;
// the vision call lives in card-scan.server.
//
// Abuse + cost controls: authenticated only, ≤2MB processed JPEG, exactly one
// image per attempt, 20 scans / 10 min / user (per edge instance), 30s server
// timeout. NOTHING is persisted — 4A stops at the candidate preview.

import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { allowPublicRequest } from "@/lib/public-rate-limit";
import { reportCardScanMetric } from "./card-scan.telemetry";
import { candidateFromRawModelOutput } from "./card-scan.service";
import { runCardOcrVision } from "./card-scan.server";
import type { CardScanFailureCode, CardScanResponse } from "./card-scan.types";

// ~2MB JPEG binary ≈ 2.7MB base64; generous headroom, still bounded.
const DATA_URL_MAX_CHARS = 3 * 1024 * 1024;

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const scanInput = z.object({
  imageDataUrl: z
    .string()
    .min(64)
    .max(DATA_URL_MAX_CHARS)
    .refine((s) => s.startsWith("data:image/jpeg"), "processed card image must be a JPEG data URL"),
  // Opaque per-attempt token from the client: transport retries replay the
  // same attempt instead of fanning out uncontrolled OCR jobs.
  clientToken: z.string().uuid(),
});

function mapVisionError(e: unknown): CardScanFailureCode {
  const msg = e instanceof Error ? e.message : "";
  if (msg.includes("timed out")) return "timeout";
  if (msg.includes("rate-limited")) return "provider_busy";
  return "failed";
}

export const bcMobileCardScanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => scanInput.parse(data))
  .handler(async ({ data, context }): Promise<CardScanResponse> => {
    if (!allowPublicRequest(`bc-ocr:${context.userId}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      reportCardScanMetric("OCR_FAILED");
      return { ok: false, code: "rate_limited" };
    }

    reportCardScanMetric("OCR_REQUESTED");
    const started = Date.now();
    try {
      const raw = await runCardOcrVision(data.imageDataUrl);
      const result = candidateFromRawModelOutput(raw, crypto.randomUUID());
      const latencyMs = Date.now() - started;
      if (result.ok) reportCardScanMetric("OCR_SUCCEEDED", { latencyMs });
      else if (result.code === "unusable") reportCardScanMetric("OCR_UNUSABLE", { latencyMs });
      else reportCardScanMetric("OCR_FAILED", { latencyMs });
      return result;
    } catch (e) {
      reportCardScanMetric("OCR_FAILED", { latencyMs: Date.now() - started });
      return { ok: false, code: mapVisionError(e) };
    }
  });
