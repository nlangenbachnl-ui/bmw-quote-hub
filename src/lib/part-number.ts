/**
 * Part-number masking for retail (non-wholesale) customers.
 *
 * Retail customers must never receive a complete OEM/BMW part number before the
 * associated order is paid or completed. The authoritative redaction happens in
 * the database (`public.mask_part_number` / `public.get_retail_quote`), so the
 * browser never receives the full value. This helper only normalises the
 * presentation of an already-redacted value and is reused for any UI that needs
 * to render a placeholder.
 */

export const MASK_PREFIX = "••••••";

/** Returns a safe masked value showing only the last 3 characters. */
export function maskPartNumber(partNumber?: string | null): string | null {
  const clean = (partNumber ?? "").replace(/[\s*•]+/g, "");
  if (!clean) return null;
  return `${MASK_PREFIX}${clean.slice(-3)}`;
}

/** Customer-facing label used instead of an OEM part number. */
export const RETAIL_PART_LABEL = "VIN-verified genuine BMW part";
