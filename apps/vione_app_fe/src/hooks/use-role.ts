import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchNestApi } from "@/lib/api-client";

export type AppRole = "platform_admin" | "admin" | "moderator" | "member";

export type RoleState = {
  roles: AppRole[];
  isPlatformAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
};

// Fetches the current user's roles. Global roles live in user_roles, while
// association-scoped admin rights live in memberships.role. An association
// admin must be treated as an admin even when their global role is "member".
// A platform_admin naturally inherits admin and moderator capabilities.
// RLS lets a user read their own rows in both tables, so the browser client is fine.
export function useRole(): RoleState {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      let uid: string | undefined;

      try {
        const { data: auth } = await supabase.auth.getUser();
        uid = auth.user?.id;
      } catch {}

      // Fallback: check localStorage for custom NestJS token if Supabase session is absent
      if (!uid && typeof window !== "undefined") {
        const token = localStorage.getItem("vibe_token");
        if (token) {
          try {
            const parts = token.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(
                window.atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
              );
              uid = payload.sub || payload.id;
            }
          } catch {}
        }
      }

      if (!uid) {
        if (active) {
          setRoles([]);
          setLoading(false);
        }
        return;
      }

      const [{ data: globalRoles }, { data: memberships }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("memberships").select("role").eq("user_id", uid),
      ]);

      const set = new Set<AppRole>((globalRoles ?? []).map((r: any) => r.role as AppRole));
      const isAssocAdmin = (memberships ?? []).some(
        (m) => m.role === "admin" || (m.role as string) === "association_admin",
      );
      if (isAssocAdmin) set.add("admin");

      // Fallback: If no roles resolved from Supabase and we have a local backend token, query /users/me
      if (set.size === 0 && typeof window !== "undefined" && localStorage.getItem("vibe_token")) {
        try {
          const me = await fetchNestApi("/users/me");
          if (me?.roles && Array.isArray(me.roles)) {
            me.roles.forEach((r: string) => set.add(r as AppRole));
          }
        } catch {}
      }

      // Platform admin always inherits association admin rights
      if (set.has("platform_admin")) {
        set.add("admin");
      }

      if (active) {
        setRoles(Array.from(set));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isPlatformAdmin = roles.includes("platform_admin");
  const isAdmin = isPlatformAdmin || roles.includes("admin");
  const isModerator = isAdmin || roles.includes("moderator");

  return {
    roles,
    isPlatformAdmin,
    isAdmin,
    isModerator,
    loading,
  };
}

