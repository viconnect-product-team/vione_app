import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MemberScreen } from "@/components/member/MemberShell";
import { checkRenewalReminder } from "@/lib/member-app.functions";
import { MEMBER_MANIFEST_HREF } from "@/lib/pwa-manifest";

export const Route = createFileRoute("/association")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "theme-color", content: "#0B0F19" },
      { name: "apple-mobile-web-app-title", content: "ViOne Hội viên" },
    ],
    links: [{ rel: "manifest", href: MEMBER_MANIFEST_HREF }],
  }),
  beforeLoad: async ({ location }) => {
    // Nếu đang ở màn hình đăng nhập Hiệp hội, KHÔNG BAO GIỜ redirect vòng lặp
    if (location.pathname === "/association/login" || location.pathname.startsWith("/association/login")) {
      return;
    }

    const hasLocal = typeof window !== "undefined" && Boolean(
      localStorage.getItem("vibe_token") || 
      localStorage.getItem("token") || 
      localStorage.getItem("access_token")
    );
    if (!hasLocal) {
      const searchStr = typeof (location as any).searchStr === "string" ? (location as any).searchStr : "";
      const target = location.pathname.startsWith("/association/login")
        ? "/association"
        : location.pathname + searchStr;

      throw redirect({
        to: "/association/login",
        search: {
          redirect: target,
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
  const routerState = useRouterState();
  const isLoginPage = routerState.location.pathname.startsWith("/association/login");
  useRenewalReminder();

  // Trang đăng nhập Hiệp hội hiển thị màn hình riêng, không hiển thị thanh Tab Bar hội viên
  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <MemberScreen>
      <Outlet />
    </MemberScreen>
  );
}
