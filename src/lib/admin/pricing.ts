// Pricing engine for the internal quote builder.
// Pure functions — no storage, no React — so this can move server-side later.

export interface PricingSettings {
  /** Acquisition markup applied to dealer cost. 1.10 = dealer cost + 10%. */
  acquisitionMarkup: number;
  /** Target gross margin as a decimal. 0.25 = 25%. */
  targetMargin: number;
  /** Payment processing percentage as a decimal. 0.029 = 2.9%. */
  processingPercent: number;
  /** Fixed payment processing fee per transaction, in dollars. */
  processingFixed: number;
  /** Days a quote stays valid after it is marked ready. */
  quoteExpirationDays: number;
}

export const DEFAULT_SETTINGS: PricingSettings = {
  acquisitionMarkup: 1.1,
  targetMargin: 0.25,
  processingPercent: 0.029,
  processingFixed: 0.3,
  quoteExpirationDays: 14,
};

export interface LineItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  /** Dealer/net cost per unit. */
  dealerCost: number;
  /** BMW MSRP / reference retail per unit. */
  msrp: number;
  /** Optional shipping dollars allocated to this line (charged to customer). */
  shipping: number;
  /** Manual per-unit selling price override. null = use recommended. */
  priceOverride: number | null;
}

export interface LineMath {
  acquisitionUnit: number;
  recommendedUnit: number;
  unitPrice: number;
  isOverridden: boolean;
  acquisitionTotal: number;
  customerTotal: number;
  grossProfit: number;
  grossMargin: number;
  msrpTotal: number;
  savings: number;
  savingsPercent: number;
  shipping: number;
}

export interface QuoteMath {
  lines: Array<{ line: LineItem; math: LineMath }>;
  acquisitionTotal: number;
  subtotal: number;
  shippingTotal: number;
  msrpTotal: number;
  savings: number;
  savingsPercent: number;
  grandTotal: number;
  grossProfit: number;
  grossMargin: number;
  processingFee: number;
  netContribution: number;
}

export function acquisitionCost(dealerCost: number, settings: PricingSettings) {
  return round2(Math.max(0, dealerCost) * settings.acquisitionMarkup);
}

export function recommendedPrice(acquisition: number, settings: PricingSettings) {
  const margin = clamp(settings.targetMargin, 0, 0.95);
  return round2(acquisition / (1 - margin));
}

export function computeLine(line: LineItem, settings: PricingSettings): LineMath {
  const qty = Math.max(0, line.quantity || 0);
  const acquisitionUnit = acquisitionCost(line.dealerCost, settings);
  const recommendedUnit = recommendedPrice(acquisitionUnit, settings);
  const isOverridden = line.priceOverride !== null && !Number.isNaN(line.priceOverride);
  const unitPrice = isOverridden ? Math.max(0, line.priceOverride as number) : recommendedUnit;

  const acquisitionTotal = round2(acquisitionUnit * qty);
  const customerTotal = round2(unitPrice * qty);
  const grossProfit = round2(customerTotal - acquisitionTotal);
  const msrpTotal = round2(Math.max(0, line.msrp) * qty);
  const savings = round2(msrpTotal - customerTotal);

  return {
    acquisitionUnit,
    recommendedUnit,
    unitPrice,
    isOverridden,
    acquisitionTotal,
    customerTotal,
    grossProfit,
    grossMargin: customerTotal > 0 ? grossProfit / customerTotal : 0,
    msrpTotal,
    savings,
    savingsPercent: msrpTotal > 0 ? savings / msrpTotal : 0,
    shipping: round2(Math.max(0, line.shipping || 0)),
  };
}

export function computeQuote(lines: LineItem[], settings: PricingSettings): QuoteMath {
  const rows = lines.map((line) => ({ line, math: computeLine(line, settings) }));
  const sum = (pick: (m: LineMath) => number) => round2(rows.reduce((t, r) => t + pick(r.math), 0));

  const acquisitionTotal = sum((m) => m.acquisitionTotal);
  const subtotal = sum((m) => m.customerTotal);
  const shippingTotal = sum((m) => m.shipping);
  const msrpTotal = sum((m) => m.msrpTotal);
  const grandTotal = round2(subtotal + shippingTotal);
  const grossProfit = round2(subtotal - acquisitionTotal);
  const processingFee = round2(grandTotal * settings.processingPercent + (grandTotal > 0 ? settings.processingFixed : 0));
  const savings = round2(msrpTotal - subtotal);

  return {
    lines: rows,
    acquisitionTotal,
    subtotal,
    shippingTotal,
    msrpTotal,
    savings,
    savingsPercent: msrpTotal > 0 ? savings / msrpTotal : 0,
    grandTotal,
    grossProfit,
    grossMargin: subtotal > 0 ? grossProfit / subtotal : 0,
    processingFee,
    // Shipping charged to the customer is treated as a pass-through cost.
    netContribution: round2(grandTotal - acquisitionTotal - shippingTotal - processingFee),
  };
}

export function round2(n: number) {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(round2(n));

export const percent = (n: number, digits = 1) =>
  `${(Number.isFinite(n) ? n * 100 : 0).toFixed(digits)}%`;
