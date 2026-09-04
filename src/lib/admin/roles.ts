import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type RoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

/** Owner-only: every role assignment. RLS restricts this read to admins. */
export async function adminListRoles(): Promise<RoleRow[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Owner-only: grant a role to an existing account. RLS enforces admin. */
export async function adminGrantRole(userId: string, role: AppRole) {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
  if (error) throw error;
}

/** Owner-only: revoke a role from an existing account. */
export async function adminRevokeRole(userId: string, role: AppRole) {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw error;
}

/** Owner-only: every account we can name, for the staff-access picker. */
export async function adminListAccountsForRoles(): Promise<
  Array<{ user_id: string; label: string; email: string }>
> {
  const { data, error } = await supabase
    .from("account_profiles")
    .select("user_id, full_name, business_name, business_email")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    user_id: row.user_id,
    email: row.business_email,
    label: [row.full_name, row.business_name].filter(Boolean).join(" · ") || row.business_email,
  }));
}
