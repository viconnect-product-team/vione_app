import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMockModeStatusFn, type MockModeStatus } from "@/lib/mock-mode.functions";

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

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (data?.anyMock) {
      console.warn(
        "[MOCK-MODE] Hệ thống đang chạy MOCK — kết quả có thể không phản ánh dữ liệu thật.",
        data,
      );
    }
  }, [data]);

  if (!data?.anyMock || dismissed) return null;

  const reasons: string[] = [];
  if (data.ai.mode === "mock") {
    reasons.push(
      data.ai.overridden
        ? "AI (ghi đè admin)"
        : "AI chưa bật provider thật",
    );
  }
  if (data.member.active) reasons.push("Dữ liệu hội viên");

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="mock-mode-banner"
      style={{ background: "linear-gradient(90deg, #7c5c1e 0%, #b8912a 50%, #7c5c1e 100%)" }}
      className="sticky top-0 z-[60] flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
      </span>

      <span className="min-w-0 flex-1 truncate text-yellow-100">
        Chế độ MOCK đang bật
        {reasons.length > 0 && (
          <> &mdash; <span className="text-yellow-200">{reasons.join(" · ")}</span></>
        )}
        . Kết quả không phải từ hệ thống thật.
      </span>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Đóng thông báo mock mode"
        className="ml-1 rounded px-2 py-0.5 text-yellow-200 transition-colors hover:bg-yellow-900/40 hover:text-yellow-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400"
      >
        ✕
      </button>
    </div>
  );
}
