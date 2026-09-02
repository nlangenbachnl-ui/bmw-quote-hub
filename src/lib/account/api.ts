import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { BusinessType } from "@/lib/wholesale/constants";

export type AccountProfile = Database["public"]["Tables"]["account_profiles"]["Row"];

export type AccountProfileInput = {
  full_name: string;
  business_name: string;
  phone: string;
  business_type: BusinessType | "";
  business_email: string;
};

/** Reads the signed-in user's account profile. RLS scopes this to auth.uid(). */
export async function fetchMyAccountProfile(): Promise<AccountProfile | null> {
  const { data, error } = await supabase
    .from("account_profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Writes the signed-in user's own profile row. `user_id` is always the caller's
 * id and the RLS policy rejects any other value, so this cannot touch another
 * user's profile.
 */
export async function saveMyAccountProfile(userId: string, input: AccountProfileInput) {
  const { error } = await supabase.from("account_profiles").upsert(
    {
      user_id: userId,
      full_name: input.full_name.trim(),
      business_name: input.business_name.trim(),
      phone: input.phone.trim(),
      business_type: (input.business_type || null) as BusinessType | null,
      business_email: input.business_email.trim(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export function isAccountProfileComplete(profile: AccountProfile | null): boolean {
  return Boolean(
    profile &&
      profile.full_name.trim() &&
      profile.business_name.trim() &&
      profile.phone.trim() &&
      profile.business_type,
  );
}

/**
 * After sign-in, materialise the profile row from the metadata captured at
 * signup so returning users are not asked for details they already gave.
 */
export async function ensureAccountProfileFromMetadata() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const existing = await fetchMyAccountProfile();
  if (isAccountProfileComplete(existing)) return existing;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const asText = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string) : "");
  const candidate: AccountProfileInput = {
    full_name: existing?.full_name || asText("full_name"),
    business_name: existing?.business_name || asText("business_name"),
    phone: existing?.phone || asText("phone"),
    business_type: (existing?.business_type ?? (asText("business_type") as BusinessType | "")) || "",
    business_email: existing?.business_email || user.email || "",
  };

  if (!candidate.full_name && !candidate.business_name && !candidate.phone) {
    // Nothing to save yet — the "Complete your business profile" screen collects it.
    return existing;
  }

  await saveMyAccountProfile(user.id, candidate);
  return fetchMyAccountProfile();
}
