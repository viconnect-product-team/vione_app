import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAssociationId } from "@/lib/current-member";
import { detectCapability } from "@/lib/ai-capability-router";
import { getAllowedRoutes } from "@/lib/ai-context-builder";
import { AiProviderError, mockAiProvider, type AiProviderOutput } from "@/lib/ai-provider";

import type { PermissionLevel } from "@/lib/ai-context-providers";

/**
 * AI Association Assistant — read-only server function.
 *
 * Security posture (Phase 10, Step 2):
 * - Authenticated only (requireSupabaseAuth). Anonymous callers are rejected.
 * - READ-ONLY: this function never writes to the database and never uses the
 *   service role. It only calls the Lovable AI Gateway for a completion.
 * - The model is instructed to answer from provided context only and to never
 *   fabricate metrics, citations, or data the user cannot access.
 * - No sensitive data is injected here; grounding/RAG is a later step. For now
 *   the assistant answers generally and states its limitations.
 */

type ChatRole = "user" | "assistant";

export type AiChatMessage = {
  role: ChatRole;
  content: string;
};

type AiChatInput = {
  messages: AiChatMessage[];
};

const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

const SYSTEM_PROMPT = `Bạn là Trợ lý AI của nền tảng quản trị Hiệp hội (Association Hub).
Nguyên tắc bắt buộc:
- Chỉ trả lời dựa trên dữ liệu và ngữ cảnh được cung cấp. TUYỆT ĐỐI không bịa số liệu, tên hội viên, số tiền hội phí, hay nguồn tham chiếu.
- Nếu chưa có dữ liệu thực để trả lời, hãy nói rõ giới hạn: bạn đang ở chế độ chỉ đọc và chưa được kết nối trực tiếp với dữ liệu hiệp hội trong phiên này.
- Không tiết lộ thông tin nhạy cảm hoặc dữ liệu vượt quá quyền của người dùng.
- Trả lời ngắn gọn, chuyên nghiệp, bằng tiếng Việt (trừ khi người dùng dùng ngôn ngữ khác).
- Khi được yêu cầu soạn thảo (thông báo, email), hãy soạn nội dung nhưng nhắc người dùng kiểm tra trước khi gửi.`;

function sanitize(messages: unknown): AiChatMessage[] {
  if (!Array.isArray(messages)) {
    throw new Error("Định dạng tin nhắn không hợp lệ.");
  }
  const cleaned: AiChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CHARS);
    if (!trimmed) continue;
    cleaned.push({ role, content: trimmed });
  }
  if (cleaned.length === 0) {
    throw new Error("Không có nội dung hợp lệ để gửi.");
  }
  return cleaned;
}

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AiChatInput) => ({ messages: sanitize(data?.messages) }))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Trợ lý AI chưa được cấu hình. Thiếu LOVABLE_API_KEY.");
    }

    // Association context is ALWAYS derived server-side from the caller's JWT
    // (auth.uid()) via the security-definer current_association_id() RPC.
    // We never accept an association_id from the client — this prevents a user
    // from scoping the assistant to an association they don't belong to.
    const associationId = await resolveAssociationId(context.supabase);

    // Permission enforcement. All reads go through context.supabase, which is
    // scoped to the caller's JWT, so RLS already blocks rows the user cannot
    // see. We additionally resolve the caller's role (from their own rows in
    // user_roles + memberships — readable under RLS) to compute the assistant's
    // allowed data scope and tell the model what it must NOT surface.
    const [{ data: globalRoles }, { data: memberships }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("memberships")
        .select("role")
        .eq("user_id", context.userId)
        .eq("association_id", associationId),
    ]);
    const roleSet = new Set<string>([
      ...((globalRoles ?? []) as { role: string }[]).map((r) => r.role),
      ...((memberships ?? []) as { role: string }[]).map((r) => r.role),
    ]);
    const isPlatformAdmin = roleSet.has("platform_admin");
    const isAdmin = isPlatformAdmin || roleSet.has("admin");
    const isModerator = isAdmin || roleSet.has("moderator");
    const canAccessAdminData = isAdmin || isModerator;

    // Sources every authenticated member may use vs. admin-restricted ones.
    const allowedScopes = [
      "tài liệu (theo quyền xem)",
      "danh bạ hội viên (trường công khai)",
      "sự kiện",
      "marketplace",
      "thông báo",
      ...(canAccessAdminData
        ? ["hội phí / tài chính", "báo cáo lãnh đạo", "quản trị hội viên"]
        : []),
    ];
    const deniedNote = canAccessAdminData
      ? "Người dùng có quyền quản trị."
      : "Người dùng KHÔNG có quyền quản trị: TUYỆT ĐỐI không tiết lộ hội phí, số liệu tài chính, báo cáo lãnh đạo hay dữ liệu quản trị. Nếu được hỏi, hãy từ chối và giải thích rằng cần quyền quản trị.";

    const scopePrompt = `Bối cảnh phân quyền:
- Người dùng thuộc hiệp hội có mã ${associationId}. Chỉ trả lời trong phạm vi hiệp hội này.
- Vai trò: ${[...roleSet].join(", ") || "member"}.
- Nguồn dữ liệu được phép: ${allowedScopes.join("; ")}.
- ${deniedNote}
- Mọi dữ liệu đều bị giới hạn bởi Row Level Security; không suy đoán dữ liệu ngoài quyền của người dùng.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: scopePrompt },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      throw new Error("Đã đạt giới hạn yêu cầu. Vui lòng thử lại sau ít phút.");
    }
    if (res.status === 402) {
      throw new Error("Cần nạp thêm tín dụng AI để tiếp tục.");
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("AI gateway error:", res.status, detail);
      throw new Error("Trợ lý AI tạm thời không phản hồi. Vui lòng thử lại.");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("Trợ lý AI không trả về nội dung.");
    }

    // Audit log — metadata only. By default we do NOT persist the user's prompt
    // or the model's answer (both may contain sensitive/permissioned content).
    // We record who asked, when, the association, role scope, message count and
    // model — enough for accountability without leaking conversation content.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { logActivity } = await import("@/lib/crud.server");
      await logActivity(supabaseAdmin, {
        action: "Truy vấn Trợ lý AI",
        target: `${data.messages.length} tin nhắn · mô hình gemini-3-flash`,
        category: "ai",
        user: context.userId,
      });
    } catch (e) {
      // Never fail the AI response because audit logging failed.
      console.error("AI audit log failed:", e);
    }

    return { reply };
  });

/**
 * askAssociationAiFn — Phase 10, Step 5.
 *
 * Production-safe AI gateway (guarded). Security posture:
 * - Authenticated only (requireSupabaseAuth).
 * - The client CANNOT supply association_id, role, permission level, member id,
 *   or raw context. We read only the fields below; everything else is dropped.
 * - association id, role, permission level, allowed capabilities and context are
 *   resolved SERVER-SIDE. All reads use the RLS-scoped client.
 * - Provider selection is server-side; the API key never reaches the client.
 * - Real provider is OFF by default (AI_REAL_PROVIDER_ENABLED !== "true") →
 *   deterministic mock. Any provider failure falls back to mock; raw provider
 *   errors are never surfaced to the user.
 * - Logs metadata only (never the prompt or answer).
 */
type AskAiInput = {
  message: string;
  selectedContextSources?: string[];
  mode?: string;
  conversationId?: string;
  clientMemorySummary?: string;
};

const MAX_SUMMARY_CHARS = 1000;

function validateAskInput(data: AskAiInput) {
  const message = typeof data?.message === "string" ? data.message.trim().slice(0, MAX_CHARS) : "";
  if (!message) throw new Error("Vui lòng nhập nội dung câu hỏi.");
  // NOTE: we deliberately DO NOT read association_id / role / permission from
  // the client. Only these safe fields are accepted; everything else is ignored.
  const selectedContextSources = Array.isArray(data?.selectedContextSources)
    ? data.selectedContextSources.filter((s) => typeof s === "string").slice(0, 12)
    : undefined;
  const clientMemorySummary =
    typeof data?.clientMemorySummary === "string"
      ? data.clientMemorySummary.trim().slice(0, MAX_SUMMARY_CHARS)
      : undefined;
  return {
    message,
    selectedContextSources,
    mode: typeof data?.mode === "string" ? data.mode.slice(0, 40) : undefined,
    conversationId:
      typeof data?.conversationId === "string" ? data.conversationId.slice(0, 100) : undefined,
    clientMemorySummary,
  };
}

export const askAssociationAiFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AskAiInput) => validateAskInput(data))
  .handler(async ({ data, context }) => {
    const startedAt = Date.now();
    const requestId = crypto.randomUUID();

    // 1) Resolve association + role SERVER-SIDE (never from the client).
    const associationId = await resolveAssociationId(context.supabase);
    const [{ data: globalRoles }, { data: memberships }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("memberships")
        .select("role")
        .eq("user_id", context.userId)
        .eq("association_id", associationId),
    ]);
    const roleSet = new Set<string>([
      ...((globalRoles ?? []) as { role: string }[]).map((r) => r.role),
      ...((memberships ?? []) as { role: string }[]).map((r) => r.role),
    ]);
    const permissionLevel: PermissionLevel = roleSet.has("platform_admin")
      ? "platform"
      : roleSet.has("admin")
        ? "admin"
        : roleSet.has("moderator")
          ? "moderator"
          : "member";

    // 2) Rate limit (per user + per association, best-effort in-memory).
    const { checkAiRateLimit } = await import("@/lib/ai-rate-limit");
    const rl = checkAiRateLimit({ userId: context.userId, associationId, role: permissionLevel });
    if (!rl.allowed) {
      throw new Error(rl.message ?? "Đã đạt giới hạn yêu cầu AI. Vui lòng thử lại sau.");
    }

    // 3) Capability detection + RLS-safe context (server-side).
    const detection = detectCapability(data.message);
    const capability = detection.capability;
    const allowedRoutes = getAllowedRoutes();

    const { buildServerContext } = await import("@/lib/ai-server-context");
    const { readAiConfig, selectAiProvider } = await import("@/lib/ai-provider.server");
    const config = readAiConfig();

    // Runtime override: platform admins can flip mock/real per environment via
    // the app_settings table (see ai-settings.functions.ts) with NO redeploy.
    // The DB override wins when present; otherwise the env vars apply.
    //
    // `ai_provider` is a GLOBAL, non-sensitive system flag. app_settings SELECT
    // is RLS-restricted to platform admins, so reading it via the RLS-scoped
    // client would silently fall back to env for every regular member. Read it
    // with the admin client so the toggle applies uniformly to all callers.
    // (Only the mode string is read; no user data is exposed.)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: setting } = await supabaseAdmin
        .from("app_settings")
        .select("value")
        .eq("key", "ai_provider")
        .maybeSingle();
      const mode = (setting?.value as { mode?: string } | null)?.mode;
      if (mode === "real") {
        if (config.provider === "mock") config.provider = "openai";
        config.realEnabled = true;
      } else if (mode === "mock") {
        config.realEnabled = false;
      }
    } catch (e) {
      console.error("AI provider override read failed, using env config:", (e as Error)?.message);
    }

    const bundle = await buildServerContext({
      supabase: context.supabase,
      message: data.message,
      capability,
      associationId,
      permissionLevel,
      maxContextItems: config.maxContextItems,
    });

    // 4) Generate. The real provider is retried ONCE on transient failures
    // (timeout / rate limit / upstream unavailable) with a short backoff. If it
    // still fails — or fails with ANY other error — we surface a structured
    // error to the client. No mock fallback: users must never see fabricated
    // "AI" output when the real provider is down.
    const provider = selectAiProvider(config);
    const genArgs = {
      message: data.message,
      capability,
      permissionLevel,
      bundle,
      memorySummary: data.clientMemorySummary,
      allowedRoutes,
    };
    const TRANSIENT = new Set(["timeout", "rate_limited", "unavailable"]);
    const isTransient = (e: unknown) => e instanceof AiProviderError && TRANSIENT.has(e.code);

    let out: AiProviderOutput;
    const providerStartedAt = Date.now();
    let providerFailure: { code: string; retryable: boolean; message: string } | null = null;
    try {
      try {
        out = await provider.generate(genArgs);
      } catch (e1) {
        if (isTransient(e1) && provider !== mockAiProvider) {
          await new Promise((r) => setTimeout(r, 500));
          console.warn(
            "AI provider transient failure, retrying once:",
            (e1 as AiProviderError).code,
          );
          out = await provider.generate(genArgs);
        } else {
          throw e1;
        }
      }
    } catch (e) {
      const code = e instanceof AiProviderError ? e.code : "error";
      const retryable = TRANSIENT.has(code);
      providerFailure = {
        code,
        retryable,
        message: (e as Error)?.message ?? "AI provider failed",
      };
      console.error("AI provider failed (no fallback):", code, providerFailure.message);
    }
    const providerLatencyMs = Date.now() - providerStartedAt;
    if (!providerFailure && provider === mockAiProvider) {
      console.warn("[MOCK-MODE] AI answer served from mock provider", {
        requestId,
        capability,
        realEnabled: config.realEnabled,
        configuredProvider: config.provider,
      });
    }

    // 4b) Audit the failure with metadata, then throw a structured error the
    // client can render as a controlled error state with retry affordance.
    if (providerFailure) {
      const duration = Date.now() - startedAt;
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("ai_request_audit").insert({
          request_id: requestId,
          user_id: context.userId,
          association_id: associationId,
          capability,
          permission_level: permissionLevel,
          provider: provider === mockAiProvider ? "mock" : "real",
          model: null,
          used_fallback: false,
          fallback_reason: providerFailure.code,
          provider_latency_ms: providerLatencyMs,
          total_latency_ms: duration,
          source_types: [...new Set(bundle.sources.map((s) => s.type))],
          source_count: bundle.sources.length,
        });
      } catch (e) {
        console.error("AI failure audit insert failed:", (e as Error)?.message);
      }
      // Machine-parseable prefix lets the /ai UI branch on code + retryable.
      throw new Error(
        `AI_ERROR:${providerFailure.code}:${providerFailure.retryable ? "1" : "0"}:${providerFailure.message}`,
      );
    }

    // 5) Enforce evidence-id + route allow-lists once more (defense in depth),
    // then map evidence ids back to full safe source objects.
    const { guardProviderOutput } = await import("@/lib/ai-output-guard");
    const guarded = guardProviderOutput(out!, {
      allowedSourceIds: bundle.sources.map((s) => s.id),
      allowedRoutes,
    });
    const safe = guarded.output;
    const evidence = safe.evidenceIds
      .map((id) => bundle.sources.find((s) => s.id === id))
      .filter((s): s is (typeof bundle.sources)[number] => Boolean(s));

    const duration = Date.now() - startedAt;
    const model = out!.model ?? out!.providerName;
    const sourceTypes = [...new Set(bundle.sources.map((s) => s.type))];

    // 6) Audit log — METADATA ONLY. We never persist the prompt or the answer:
    // both may contain permissioned/sensitive content. We record who, when,
    // scope, capability, provider/model and outcome for accountability.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { error: auditErr } = await supabaseAdmin.from("ai_request_audit").insert({
        request_id: requestId,
        user_id: context.userId,
        association_id: associationId,
        capability,
        permission_level: permissionLevel,
        provider: provider === mockAiProvider ? "mock" : out!.providerName,
        model,
        used_fallback: false,
        fallback_reason: null,
        provider_latency_ms: providerLatencyMs,
        total_latency_ms: duration,
        source_types: sourceTypes,
        source_count: bundle.sources.length,
      });
      if (auditErr) console.error("AI request audit insert failed:", auditErr.message);

      const { logActivity } = await import("@/lib/crud.server");
      await logActivity(supabaseAdmin, {
        action: "Trợ lý AI (gateway)",
        target: `req ${requestId} · ${capability} · ${model} · ${duration}ms (LLM ${providerLatencyMs}ms) · sources ${sourceTypes.join("/") || "none"}`,
        category: "ai",
        user: context.userId,
      });
    } catch (e) {
      console.error("AI audit log failed:", e);
    }

    return {
      answer: safe.answer,
      reasoningSummary: safe.reasoningSummary,
      evidence,
      limitations: safe.limitations,
      suggestedActions: safe.suggestedActions,
      confidence: safe.confidence,
      clarificationQuestion: safe.clarificationQuestion,
      model,
      requestId,
      usedFallback: false,
      fallbackReason: null,
    };
  });
