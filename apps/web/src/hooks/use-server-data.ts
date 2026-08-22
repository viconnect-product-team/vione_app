import { useEffect, useState } from "react";

/**
 * Lightweight client-side fetch for PWA pages.
 * The m.* routes are public (auth handled by AuthGate), so we must NOT call
 * auth-protected server functions in loaders (SSR would 401). Fetch on mount.
 */
export function useServerData<T>(fn: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fn()
      .then((d) => {
        if (active) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
