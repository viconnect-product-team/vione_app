import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MemberScreen } from "@/components/member/MemberShell";
import { supabase } from "@/integrations/supabase/client";
import { checkRenewalReminder } from "@/lib/member-app.functions";
import { MEMBER_MANIFEST_HREF } from "@/lib/pwa-manifest";
import {
  hasRememberedVioneAppContext,
  isVioneStandaloneContext,
  rememberVioneAppContext,
} from "@/lib/business-connect/mobile/vione-auth-context";

export const Route = createFileRoute("/m")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "theme-color", content: "#0a1834" },
      { name: "apple-mobile-web-app-title", content: "ViOne Hội viên" },
    ],
    links: [{ rel: "manifest", href: MEMBER_MANIFEST_HREF }],
  }),
  beforeLoad: async ({ location }) => {
    // Shortcut ViOne cũ có thể vẫn khởi động tại `/m`. Nhận diện bằng ngữ cảnh
    // trình duyệt và chuyển sang màn đăng nhập Connect-app, không dựa vào manifest.
    const isVioneLaunch = hasRememberedVioneAppContext() || isVioneStandaloneContext();
    if (isVioneLaunch) rememberVioneAppContext();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Preserve the intended deep-link destination so we can return to it
      // after authentication (handles custom domains + browser refresh).
      throw redirect({
        to: "/auth",
        search: {
          redirect: isVioneLaunch ? "/connect-app" : location.href,
          ...(isVioneLaunch ? { m: "1" as const } : {}),
        },
      });
    }
  },
  component: MemberRoot,
});

const REMINDER_KEY = "vba.renewal.reminderCheckedAt";

/** Runs the renewal-reminder check at most once per day per device. */
function useRenewalReminder() {
  const check = useServerFn(checkRenewalReminder);
  useEffect(() => {
    let last = 0;
    try {
      last = Number(localStorage.getItem(REMINDER_KEY) ?? 0);
    } catch {
      /* ignore */
    }
    if (Date.now() - last < 24 * 3600 * 1000) return;
    void check({})
      .then((res) => {
        try {
          localStorage.setItem(REMINDER_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        if (res?.created) {
          // Let the notifications badge refresh.
          window.dispatchEvent(new Event("notifications-updated"));
        }
      })
      .catch(() => {
        /* silent — reminder is best-effort */
      });
  }, [check]);
}

function MemberRoot() {
  useRenewalReminder();
  return (
    <MemberScreen>
      <Outlet />
    </MemberScreen>
  );
}
