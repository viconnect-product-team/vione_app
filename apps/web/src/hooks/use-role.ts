import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
// RLS lets a user read their own rows in both tables, so the browser client is fine.
export function useRole(): RoleState {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
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

      const set = new Set<AppRole>((globalRoles ?? []).map((r) => r.role as AppRole));
      const isAssocAdmin = (memberships ?? []).some(
        (m) => m.role === "admin" || (m.role as string) === "association_admin",
      );
      if (isAssocAdmin) set.add("admin");

      if (active) {
        setRoles(Array.from(set));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return {
    roles,
    isPlatformAdmin: roles.includes("platform_admin"),
    isAdmin: roles.includes("admin"),
    isModerator: roles.includes("admin") || roles.includes("moderator"),
    loading,
  };
}
