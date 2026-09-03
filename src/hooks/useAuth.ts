import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase email/password session hook.
 * Subscribes once per component; the session is persisted by the client.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    loading,
  };
}

/** Admin check is authoritative in the database (RLS + has_role); this only drives UI. */
export function useIsAdmin(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId!,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });
}

/**
 * Role summary for the three roles in this app: shop (no role row), parts staff,
 * and owner/admin. Authoritative enforcement lives in RLS; this drives UI only.
 */
export function useStaffAccess(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["staff-access", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [admin, staff] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId!, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId!, _role: "staff" }),
      ]);
      if (admin.error) throw admin.error;
      if (staff.error) throw staff.error;
      const isAdmin = Boolean(admin.data);
      const isStaff = Boolean(staff.data);
      return { isAdmin, isStaff, canWorkQueue: isAdmin || isStaff };
    },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
