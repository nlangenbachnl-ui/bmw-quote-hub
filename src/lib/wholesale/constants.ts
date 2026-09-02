import type { Database } from "@/integrations/supabase/types";

export type WholesaleStatus = Database["public"]["Enums"]["wholesale_app_status"];
export type WholesaleTier = Database["public"]["Enums"]["wholesale_tier"];
export type BusinessType = Database["public"]["Enums"]["wholesale_business_type"];

export const STATUS_LABELS: Record<WholesaleStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  more_info_requested: "More info requested",
  approved: "Approved",
  denied: "Denied",
};

export const STATUS_ORDER: WholesaleStatus[] = [
  "pending",
  "under_review",
  "more_info_requested",
  "approved",
  "denied",
];

export const TIER_LABELS: Record<WholesaleTier, string> = {
  standard: "Standard",
  plus: "Plus",
  preferred: "Preferred",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  independent_repair: "Independent repair shop",
  body_shop: "Body shop",
  dealership: "Dealership",
  fleet: "Fleet",
  performance_tuning: "Performance / tuning shop",
  other: "Other",
};

export const URGENCY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "next_day", label: "Next day" },
  { value: "same_day", label: "Same day / vehicle down" },
] as const;

export const FULFILLMENT_OPTIONS = [
  { value: "shipping", label: "Ship to my shop" },
  { value: "local_delivery", label: "Local delivery (if eligible)" },
  { value: "pickup", label: "Will pick up" },
] as const;

export const PREFERRED_CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text message" },
] as const;

export function statusBadgeClass(status: WholesaleStatus): string {
  switch (status) {
    case "approved":
      return "bg-primary/10 text-primary border-primary/30";
    case "denied":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "under_review":
      return "bg-foreground/5 text-foreground border-border";
    case "more_info_requested":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function formatVin(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, 17);
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
