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

  /* ------------------------------ delivery ------------------------------ */
  /** Local same-day delivery radius, in miles from the fulfilment hub. */
  deliveryRadiusMiles: number;
  /** Flat local same-day delivery fee. */
  sameDayFee: number;
  /** Merchandise subtotal at/above which local same-day delivery is free. */
  freeSameDayThreshold: number;
  /** Same-day order cutoff, local time, 24h "HH:MM". */
  sameDayCutoff: string;
  /** Weekdays local same-day delivery runs. */
  deliveryDays: WeekDay[];
  /** Flat fee for priority / oversize courier runs. */
  priorityCourierFee: number;

  /* ------------------- future integration placeholders ------------------- */
  /** Courier partner name (e.g. Roadie, Curri, in-house). */
  courierProvider: string;
  /** Courier API key placeholder — moves to a server secret later. */
  courierApiKey: string;
  /** Mapping/distance provider placeholder for radius checks. */
  distanceProvider: string;
}

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const DELIVERY_TYPES = [
  "Standard Shipping",
  "Local Same-Day",
  "Priority/Oversize Courier",
] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];

export const DEFAULT_SETTINGS: PricingSettings = {
  acquisitionMarkup: 1.1,
  targetMargin: 0.25,
  processingPercent: 0.029,
  processingFixed: 0.3,
  quoteExpirationDays: 14,

  deliveryRadiusMiles: 25,
  sameDayFee: 19.95,
  freeSameDayThreshold: 500,
  sameDayCutoff: "13:00",
  deliveryDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  priorityCourierFee: 49.95,

  courierProvider: "",
  courierApiKey: "",
  distanceProvider: "",
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

export interface DeliveryQuoteInput {
  type: DeliveryType;
  /** Oversize/freight flag raised by the desk during review. */
  oversized?: boolean;
}

export interface DeliveryMath {
  type: DeliveryType;
  fee: number;
  /** True when the same-day fee was waived by the free-delivery threshold. */
  waived: boolean;
  /** Dollars still needed to reach free same-day delivery (0 when met). */
  amountToFreeDelivery: number;
}

export interface QuoteMath {
  lines: Array<{ line: LineItem; math: LineMath }>;
  acquisitionTotal: number;
  subtotal: number;
  shippingTotal: number;
  delivery: DeliveryMath;
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

/** Delivery pricing. Standard shipping is priced per line, so its fee is 0 here. */
export function computeDelivery(
  subtotal: number,
  settings: PricingSettings,
  delivery?: DeliveryQuoteInput,
): DeliveryMath {
  const type: DeliveryType = delivery?.type ?? "Standard Shipping";
  const threshold = Math.max(0, settings.freeSameDayThreshold);
  const amountToFreeDelivery = round2(Math.max(0, threshold - subtotal));

  if (type === "Local Same-Day") {
    const waived = subtotal >= threshold;
    return {
      type,
      fee: waived ? 0 : round2(Math.max(0, settings.sameDayFee)),
      waived,
      amountToFreeDelivery,
    };
  }

  if (type === "Priority/Oversize Courier") {
    return {
      type,
      fee: round2(Math.max(0, settings.priorityCourierFee)),
      waived: false,
      amountToFreeDelivery,
    };
  }

  return { type, fee: 0, waived: false, amountToFreeDelivery };
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

export function computeQuote(
  lines: LineItem[],
  settings: PricingSettings,
  delivery?: DeliveryQuoteInput,
): QuoteMath {
  const rows = lines.map((line) => ({ line, math: computeLine(line, settings) }));
  const sum = (pick: (m: LineMath) => number) => round2(rows.reduce((t, r) => t + pick(r.math), 0));

  const acquisitionTotal = sum((m) => m.acquisitionTotal);
  const subtotal = sum((m) => m.customerTotal);
  const shippingTotal = sum((m) => m.shipping);
  const msrpTotal = sum((m) => m.msrpTotal);
  const deliveryMath = computeDelivery(subtotal, settings, delivery);
  const grandTotal = round2(subtotal + shippingTotal + deliveryMath.fee);
  const grossProfit = round2(subtotal - acquisitionTotal);
  const processingFee = round2(
    grandTotal * settings.processingPercent + (grandTotal > 0 ? settings.processingFixed : 0),
  );
  const savings = round2(msrpTotal - subtotal);

  return {
    lines: rows,
    acquisitionTotal,
    subtotal,
    shippingTotal,
    delivery: deliveryMath,
    msrpTotal,
    savings,
    savingsPercent: msrpTotal > 0 ? savings / msrpTotal : 0,
    grandTotal,
    grossProfit,
    grossMargin: subtotal > 0 ? grossProfit / subtotal : 0,
    processingFee,
    // Shipping and courier fees charged to the customer are pass-through costs.
    netContribution: round2(
      grandTotal - acquisitionTotal - shippingTotal - deliveryMath.fee - processingFee,
    ),
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

/** "13:00" -> "1:00 PM" for display copy. */
export function formatCutoff(hhmm: string) {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  if (!Number.isFinite(h)) return hhmm;
  const hour = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hour}:${String(Number.isFinite(m) ? m : 0).padStart(2, "0")} ${suffix}`;
}
