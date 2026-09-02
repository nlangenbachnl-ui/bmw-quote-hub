import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import type { WholesaleStatus, WholesaleTier } from "./constants";

export type Application = Database["public"]["Tables"]["wholesale_applications"]["Row"];
export type ApplicationInsert =
  Database["public"]["Tables"]["wholesale_applications"]["Insert"];
export type ApplicationEvent =
  Database["public"]["Tables"]["wholesale_application_events"]["Row"];
export type WholesaleProfile = Database["public"]["Tables"]["wholesale_profiles"]["Row"];
export type Vehicle = Database["public"]["Tables"]["wholesale_vehicles"]["Row"];
export type PartsRequest = Database["public"]["Tables"]["wholesale_parts_requests"]["Row"];
export type RequestItem = Database["public"]["Tables"]["wholesale_request_items"]["Row"];
export type Order = Database["public"]["Tables"]["wholesale_orders"]["Row"];
export type Invoice = Database["public"]["Tables"]["wholesale_invoices"]["Row"];
export type TierPricing = Database["public"]["Tables"]["wholesale_tier_pricing"]["Row"];

const DOC_BUCKET = "wholesale-docs";
const FILE_BUCKET = "wholesale-files";

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Uploads a resale certificate to the private application-documents bucket. */
export async function uploadApplicationDocument(file: File): Promise<string> {
  const path = `applications/${randomId()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(DOC_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Uploads a customer attachment into the signed-in user's private folder. */
export async function uploadWholesaleFile(userId: string, file: File): Promise<string> {
  const path = `${userId}/${randomId()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(FILE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function signedDocumentUrl(path: string, bucket = DOC_BUCKET) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function signedCustomerFileUrl(path: string) {
  return signedDocumentUrl(path, FILE_BUCKET);
}

/**
 * Applications are inserted through a security-definer function: applicants may
 * submit but never read application rows, so the function returns only the
 * reference number they need.
 */
export async function submitApplication(input: ApplicationInsert) {
  const { data, error } = await supabase.rpc("submit_wholesale_application", {
    _payload: input as unknown as Json,
  });
  if (error) throw error;
  return { reference_code: data as string };
}

/* ---------------- customer ---------------- */

export async function fetchMyProfile(): Promise<WholesaleProfile | null> {
  const { data, error } = await supabase
    .from("wholesale_profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMyApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("wholesale_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function claimApplication(referenceCode: string) {
  const { data, error } = await supabase.rpc("claim_wholesale_application", {
    _reference_code: referenceCode,
  });
  if (error) throw error;
  return data;
}

export async function fetchTierPricing(): Promise<TierPricing[]> {
  const { data, error } = await supabase.from("wholesale_tier_pricing").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("wholesale_vehicles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveVehicle(
  userId: string,
  input: {
    id?: string;
    nickname: string;
    vin: string;
    model_year: string | null;
    model: string | null;
    chassis_notes: string | null;
  },
) {
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("wholesale_vehicles").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("wholesale_vehicles")
    .insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from("wholesale_vehicles").delete().eq("id", id);
  if (error) throw error;
}

export async function submitPartsRequest(
  userId: string,
  request: {
    vehicle_id: string | null;
    vin: string | null;
    model_year: string | null;
    model: string | null;
    po_number: string | null;
    urgency: string;
    fulfillment_preference: string;
    notes: string | null;
    attachment_paths: string[];
  },
  items: Array<{ part_number: string | null; description: string; quantity: number }>,
) {
  const { data, error } = await supabase
    .from("wholesale_parts_requests")
    .insert({ ...request, user_id: userId })
    .select("id, reference_code")
    .single();
  if (error) throw error;

  if (items.length) {
    const { error: itemsError } = await supabase
      .from("wholesale_request_items")
      .insert(items.map((item) => ({ ...item, request_id: data.id })));
    if (itemsError) throw itemsError;
  }
  return data;
}

export async function fetchMyRequests(): Promise<
  Array<PartsRequest & { wholesale_request_items: RequestItem[] }>
> {
  const { data, error } = await supabase
    .from("wholesale_parts_requests")
    .select("*, wholesale_request_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<PartsRequest & { wholesale_request_items: RequestItem[] }>;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("wholesale_orders")
    .select("*")
    .order("placed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("wholesale_invoices")
    .select("*")
    .order("issued_on", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateMyProfile(
  id: string,
  patch: Partial<Database["public"]["Tables"]["wholesale_profiles"]["Update"]>,
) {
  const { error } = await supabase.from("wholesale_profiles").update(patch).eq("id", id);
  if (error) throw error;
}

/* ---------------- admin ---------------- */

export async function adminListApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("wholesale_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from("wholesale_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminListEvents(applicationId: string): Promise<ApplicationEvent[]> {
  const { data, error } = await supabase
    .from("wholesale_application_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateApplication(opts: {
  application: Application;
  actorId: string;
  status?: WholesaleStatus;
  tier?: WholesaleTier | null;
  note?: string;
  eventType?: string;
}) {
  const { application, actorId, status, tier, note, eventType } = opts;
  const patch: Database["public"]["Tables"]["wholesale_applications"]["Update"] = {};
  if (status && status !== application.status) {
    patch.status = status;
    patch.reviewed_by = actorId;
    patch.reviewed_at = new Date().toISOString();
  }
  if (tier !== undefined && tier !== application.tier) patch.tier = tier;

  if (Object.keys(patch).length) {
    const { error } = await supabase
      .from("wholesale_applications")
      .update(patch)
      .eq("id", application.id);
    if (error) throw error;
  }

  const { error: eventError } = await supabase.from("wholesale_application_events").insert({
    application_id: application.id,
    actor_id: actorId,
    event_type: eventType ?? (patch.status ? "status_change" : "note"),
    from_status: patch.status ? application.status : null,
    to_status: (patch.status as WholesaleStatus | undefined) ?? null,
    note: note ?? null,
  });
  if (eventError) throw eventError;
}

export async function adminListProfiles(): Promise<WholesaleProfile[]> {
  const { data, error } = await supabase
    .from("wholesale_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateProfile(
  id: string,
  patch: Database["public"]["Tables"]["wholesale_profiles"]["Update"],
) {
  const { error } = await supabase.from("wholesale_profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function adminUpsertTierPricing(
  tier: WholesaleTier,
  discountPercent: number | null,
  description: string | null,
  isSample: boolean,
) {
  const { error } = await supabase
    .from("wholesale_tier_pricing")
    .update({ discount_percent: discountPercent, description, is_sample: isSample })
    .eq("tier", tier);
  if (error) throw error;
}

export async function adminListRequests(): Promise<
  Array<PartsRequest & { wholesale_request_items: RequestItem[] }>
> {
  const { data, error } = await supabase
    .from("wholesale_parts_requests")
    .select("*, wholesale_request_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<PartsRequest & { wholesale_request_items: RequestItem[] }>;
}

export async function adminUpdateRequestStatus(id: string, status: string) {
  const { error } = await supabase
    .from("wholesale_parts_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function adminListOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("wholesale_orders")
    .select("*")
    .order("placed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminSaveOrder(
  input: Database["public"]["Tables"]["wholesale_orders"]["Insert"] & { id?: string },
) {
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("wholesale_orders").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("wholesale_orders").insert(input);
  if (error) throw error;
}

export async function adminListInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("wholesale_invoices")
    .select("*")
    .order("issued_on", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminSaveInvoice(
  input: Database["public"]["Tables"]["wholesale_invoices"]["Insert"] & { id?: string },
) {
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("wholesale_invoices").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("wholesale_invoices").insert(input);
  if (error) throw error;
}

export async function adminUploadInvoiceFile(userId: string, file: File) {
  return uploadWholesaleFile(userId, file);
}

/* ---------------- wholesale quotes ---------------- */

export type WholesaleQuote = Database["public"]["Tables"]["wholesale_quotes"]["Row"];
export type WholesaleQuoteLine = Database["public"]["Tables"]["wholesale_quote_lines"]["Row"];

/**
 * Quotes issued to the signed-in wholesale account. Wholesale users are exempt
 * from retail part-number masking, so full OEM numbers are returned here.
 */
export async function fetchMyWholesaleQuotes(): Promise<
  Array<WholesaleQuote & { wholesale_quote_lines: WholesaleQuoteLine[] }>
> {
  const { data, error } = await supabase
    .from("wholesale_quotes")
    .select("*, wholesale_quote_lines(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<WholesaleQuote & { wholesale_quote_lines: WholesaleQuoteLine[] }>;
}

export async function adminListWholesaleQuotes(): Promise<
  Array<WholesaleQuote & { wholesale_quote_lines: WholesaleQuoteLine[] }>
> {
  return fetchMyWholesaleQuotes();
}

export async function adminListAllPartsRequests(): Promise<PartsRequest[]> {
  const { data, error } = await supabase
    .from("wholesale_parts_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateWholesaleQuote(input: {
  userId: string;
  createdBy: string;
  requestId: string | null;
  poNumber: string | null;
  shippingTotal: number;
  expiresAt: string | null;
  notes: string | null;
  lines: Array<{
    part_number: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    availability: string | null;
  }>;
}) {
  const lines = input.lines.map((line, index) => ({
    ...line,
    position: index,
    line_total: Number((line.quantity * line.unit_price).toFixed(2)),
  }));
  const subtotal = Number(lines.reduce((sum, line) => sum + line.line_total, 0).toFixed(2));

  const { data, error } = await supabase
    .from("wholesale_quotes")
    .insert({
      user_id: input.userId,
      created_by: input.createdBy,
      request_id: input.requestId,
      po_number: input.poNumber,
      shipping_total: input.shippingTotal,
      subtotal,
      total: Number((subtotal + input.shippingTotal).toFixed(2)),
      expires_at: input.expiresAt,
      notes: input.notes,
    })
    .select("id, quote_number")
    .single();
  if (error) throw error;

  if (lines.length) {
    const { error: linesError } = await supabase
      .from("wholesale_quote_lines")
      .insert(lines.map((line) => ({ ...line, quote_id: data.id })));
    if (linesError) throw linesError;
  }
  return data;
}

export async function adminUpdateWholesaleQuoteStatus(id: string, status: string) {
  const { error } = await supabase.from("wholesale_quotes").update({ status }).eq("id", id);
  if (error) throw error;
}
