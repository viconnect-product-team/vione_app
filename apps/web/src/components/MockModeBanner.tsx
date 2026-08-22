import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle } from "lucide-react";
import { getMockModeStatusFn, type MockModeStatus } from "@/lib/mock-mode.functions";

/**
 * Ops-visible banner that appears whenever any subsystem (AI, member data…)
 * is serving mock results. Also emits a console.warn so browser telemetry
 * captures the state at page load.
 *
 * Rendered globally in __root.tsx. Non-blocking, dismissable per-tab.
 */
export function MockModeBanner() {
  const getStatus = useServerFn(getMockModeStatusFn);
  const { data } = useQuery<MockModeStatus>({
    queryKey: ["mock-mode-status"],
    queryFn: () => getStatus(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  useEffect(() => {
    if (data?.anyMock) {
      console.warn(
        "[MOCK-MODE] Hệ thống đang chạy MOCK — kết quả có thể không phản ánh dữ liệu thật.",
        data,
      );
    }
  }, [data]);

  if (!data?.anyMock) return null;

  const reasons: string[] = [];
  if (data.ai.mode === "mock") {
    reasons.push(
      data.ai.overridden
        ? "AI (ghi đè admin: mock)"
        : "AI (biến môi trường chưa bật provider thật)",
    );
  }
  if (data.member.active) reasons.push("Dữ liệu hội viên (mock)");

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="mock-mode-banner"
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 border-b border-warning/40 bg-warning/95 px-3 py-1.5 text-xs font-medium text-warning shadow-sm"
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        Chế độ MOCK đang bật — {reasons.join(" · ")}. Kết quả không phải từ hệ thống thật.
      </span>
    </div>
  );
}
