import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";

// ---------- Member directory ----------
export type DirectoryMember = {
  code: string;
  name: string;
  industry: string;
  region: string;
  type: "company" | "individual";
  verified: boolean;
};

import { fetchNestApiFromServer } from "@/lib/api-client";

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<DirectoryMember[]> => {
    return fetchNestApiFromServer("/members/directory", context.token);
  });
