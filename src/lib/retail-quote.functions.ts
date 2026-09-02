import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { maskPartNumber } from "@/lib/part-number";

export interface RetailQuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  msrpTotal: number;
  availability: string | null;
  /** Masked ("••••••482") until the order is paid/completed. */
  partNumber: string | null;
  partNumberMasked: boolean;
}

export interface RetailQuoteView {
  reference: string;
  customerName: string;
  vin: string | null;
  modelYear: string | null;
  bmwModel: string | null;
  status: string;
  subtotal: number;
  shippingTotal: number;
  deliveryLabel: string | null;
  deliveryFee: number;
  deliveryFree: boolean;
  grandTotal: number;
  msrpTotal: number;
  expiresAt: string | null;
  partNumbersRevealed: boolean;
  lines: RetailQuoteLine[];
}

export type RetailQuoteResult =
  | { state: "ok"; quote: RetailQuoteView }
  | { state: "expired"; reference: string }
  | { state: "not-found" };

const num = (value: unknown) => (typeof value === "number" ? value : Number(value ?? 0) || 0);
const str = (value: unknown) => (typeof value === "string" && value.length ? value : null);

/**
 * Public, token-gated read of a retail quote.
 *
 * Uses the publishable key plus the security-definer RPC `get_retail_quote`, so
 * the underlying tables stay unreadable to `anon` and the JSON that reaches the
 * browser contains masked part numbers unless the order is paid/completed.
 */
export const fetchRetailQuote = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => ({ token: String(data?.token ?? "").trim() }))
  .handler(async ({ data }): Promise<RetailQuoteResult> => {
    if (data.token.length < 16) return { state: "not-found" };

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: payload, error } = await supabase.rpc("get_retail_quote", {
      _token: data.token,
    });
    if (error) throw error;
    if (!payload || typeof payload !== "object") return { state: "not-found" };

    const raw = payload as Record<string, unknown>;
    if (raw["expired"] === true) {
      return { state: "expired", reference: String(raw["reference"] ?? "") };
    }

    const revealed = raw["part_numbers_revealed"] === true;
    const rawLines = Array.isArray(raw["lines"]) ? (raw["lines"] as Record<string, unknown>[]) : [];

    return {
      state: "ok",
      quote: {
        reference: String(raw["reference"] ?? ""),
        customerName: String(raw["customer_name"] ?? ""),
        vin: str(raw["vin"]),
        modelYear: str(raw["model_year"]),
        bmwModel: str(raw["bmw_model"]),
        status: String(raw["status"] ?? "sent"),
        subtotal: num(raw["subtotal"]),
        shippingTotal: num(raw["shipping_total"]),
        deliveryLabel: str(raw["delivery_label"]),
        deliveryFee: num(raw["delivery_fee"]),
        deliveryFree: raw["delivery_free"] === true,
        grandTotal: num(raw["grand_total"]),
        msrpTotal: num(raw["msrp_total"]),
        expiresAt: str(raw["expires_at"]),
        partNumbersRevealed: revealed,
        lines: rawLines.map((line, index) => {
          const value = str(line["part_number"]);
          return {
            id: String(line["id"] ?? index),
            description: String(line["description"] ?? ""),
            quantity: Number(line["quantity"] ?? 1) || 1,
            unitPrice: num(line["unit_price"]),
            lineTotal: num(line["line_total"]),
            msrpTotal: num(line["msrp_total"]),
            availability: str(line["availability"]),
            // Defence in depth: the RPC already redacted this value; normalise
            // the mask presentation and never let a full value through here.
            partNumber: revealed ? value : maskPartNumber(value),
            partNumberMasked: !revealed,
          };
        }),
      },
    };
  });
