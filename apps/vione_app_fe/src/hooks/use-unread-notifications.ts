import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { listNotificationsFn } from "@/lib/notifications.functions";

export const SEEN_KEY = "vba.notif.lastSeenAt";

export function getLastSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** Persist "all seen" and notify listeners (badge + open panels). */
export function markNotificationsSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("notifications-seen"));
}

/**
 * Unread badge for the admin "Thông báo" menu item.
 * The broadcast `notifications` table has no per-user read state, so we treat
 * anything newer than the last time the user opened /notifications as unread.
 */
export function useUnreadNotifications() {
  const list = useServerFn(listNotificationsFn);
  const pathname = useRouterState({ select: (s) => s?.location?.pathname });
  const [count, setCount] = useState(0);

  function lastSeen(): number {
    try {
      return Number(localStorage.getItem(SEEN_KEY) ?? 0);
    } catch {
      return 0;
    }
  }

  async function refresh() {
    try {
      const items = await list({});
      const seen = lastSeen();
      const unread = items.filter((n) => {
        const ts = n.sentAt ? new Date(n.sentAt).getTime() : 0;
        return ts > seen && n.status === "sent";
      }).length;
      setCount(unread);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void refresh();
    // Re-sync when another instance marks notifications as seen.
    const onSeen = () => setCount(0);
    window.addEventListener("notifications-seen", onSeen);
    return () => window.removeEventListener("notifications-seen", onSeen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark as seen when the user opens the notifications page.
  useEffect(() => {
    if (pathname === "/notifications") {
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setCount(0);
      window.dispatchEvent(new Event("notifications-seen"));
    }
  }, [pathname]);

  return count;
}
