import { supabase } from "@/integrations/supabase/client";
import type { QuoteMath } from "@/lib/admin/pricing";
import type { QuoteRequest, QuoteStatus } from "@/lib/admin/store";

/** Retail-visible quote status derived from the internal pipeline status. */
export function retailStatusFor(status: QuoteStatus): string {
  switch (status) {
    case "Accepted":
      return "accepted";
    case "Paid":
      return "paid";
    case "Ordered":
    case "Shipped":
      return "completed";
    case "Closed/Lost":
      return "closed";
    default:
      return "sent";
  }
}

export interface PublishedQuote {
  id: string;
  accessToken: string;
}

/**
 * Publishes the built quote to the secure `retail_quotes` tables via an
 * admin-only security-definer RPC. Full part numbers live only in that
 * admin/backend record — the customer link returns them masked until the order
 * is paid or completed.
 */
export async function publishRetailQuote(
  request: QuoteRequest,
  math: QuoteMath,
): Promise<PublishedQuote> {
  const payload = {
    source_request_id: request.id,
    reference: request.reference,
    customer_name: request.customerName,
    vin: request.vin,
    model_year: request.modelYear,
    bmw_model: request.bmwModel,
    status: retailStatusFor(request.status),
    subtotal: math.subtotal,
    shipping_total: math.shippingTotal,
    delivery_label: request.delivery?.type ?? null,
    delivery_fee: math.delivery.waived ? 0 : math.delivery.fee,
    delivery_free: math.delivery.waived,
    grand_total: math.grandTotal,
    msrp_total: math.msrpTotal,
    expires_at: request.expiresAt,
    lines: math.lines.map(({ line, math: m }, index) => ({
      position: index,
      part_number: line.partNumber,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.quantity > 0 ? m.customerTotal / line.quantity : m.customerTotal,
      line_total: m.customerTotal,
      msrp_total: m.msrpTotal,
      availability: null,
    })),
  };

  const { data, error } = await supabase.rpc("publish_retail_quote", { _payload: payload });
  if (error) throw error;
  const result = (data ?? {}) as Record<string, unknown>;
  return {
    id: String(result["id"] ?? ""),
    accessToken: String(result["access_token"] ?? ""),
  };
}
