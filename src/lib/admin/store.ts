// Mock admin + commercial data layer.
// State lives in memory and is mirrored to localStorage so the prototype
// survives reloads. Every mutation goes through one of the exported actions,
// so swapping in Supabase later means replacing the bodies of those actions
// (and the `seed()` fixture) without touching any component.

import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  type DeliveryType,
  type LineItem,
  type PricingSettings,
} from "./pricing";

export const QUOTE_STATUSES = [
  "Draft",
  "Quote Ready",
  "Sent",
  "Accepted",
  "Paid",
  "Ordered",
  "Shipped",
  "Closed/Lost",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const DELIVERY_ELIGIBILITY = ["Eligible", "Needs Review", "Outside Zone"] as const;
export type DeliveryEligibility = (typeof DELIVERY_ELIGIBILITY)[number];

export const DELIVERY_STATUSES = [
  "Pending Eligibility",
  "Ready for Pickup",
  "Courier Requested",
  "Driver Assigned",
  "Out for Delivery",
  "Delivered",
  "Delivery Exception",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const URGENCY_LEVELS = ["Standard", "Same-day needed", "Vehicle down / rush"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export interface DeliveryDetails {
  type: DeliveryType;
  eligibility: DeliveryEligibility;
  status: DeliveryStatus;
  /** Requested delivery window, free text for the prototype. */
  requestedWindow: string;
  /** ISO date (yyyy-mm-dd) the delivery is scheduled for. */
  scheduledDate: string;
  instructions: string;
  receivingHours: string;
  oversized: boolean;
  /** Courier partner / driver placeholder until courier APIs are wired. */
  courier: string;
  /** Desk notes about eligibility (radius, size, capacity). */
  eligibilityNote: string;
}

export interface UploadedFileRef {
  name: string;
  type: string;
}

export interface CommercialAccount {
  id: string;
  shopName: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  deliveryAddress: string;
  /** Resale / tax-exempt certificate placeholder. */
  resaleStatus: "On file" | "Pending" | "Not provided";
  resaleCertNumber: string;
  preferredContact: "Email" | "Phone" | "Text";
  status: "Active" | "Pending review" | "On hold";
  receivingHours: string;
  deliveryInstructions: string;
  notes: string;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  vin: string;
  modelYear: string;
  bmwModel: string;
  mileage?: string;
  partsRequested: string;
  shippingZip: string;
  notes?: string;
  submittedAt: string;
  status: QuoteStatus;
  /** ISO date the quote expires; set when the quote is marked ready. */
  expiresAt: string | null;
  lines: LineItem[];
  photoCount: number;

  /* ------------------------- commercial (B2B) fields ------------------------ */
  channel: "consumer" | "commercial";
  shopId?: string;
  /** Shop repair order number. */
  roNumber?: string;
  /** Insurer / estimate reference. */
  insurerRef?: string;
  urgency?: Urgency;
  /** Shop-side vehicle reference (e.g. "Bay 4 / silver X3"). */
  vehicleRef?: string;
  /** Shop-side customer reference — intentionally not the end customer's PII. */
  customerRef?: string;
  estimateFiles?: UploadedFileRef[];
  delivery?: DeliveryDetails;
}

interface AdminState {
  requests: QuoteRequest[];
  shops: CommercialAccount[];
  settings: PricingSettings;
}

const STORAGE_KEY = "pbp:admin:v2";

const isoDay = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

function seed(): AdminState {
  return {
    settings: { ...DEFAULT_SETTINGS },
    shops: [
      {
        id: "shop_apex",
        shopName: "Apex Collision & Refinish",
        contactName: "Marcus Hale",
        email: "parts@apexcollision.example",
        phone: "(312) 555-0310",
        billingAddress: "2210 W Fulton St, Chicago, IL 60612",
        deliveryAddress: "2210 W Fulton St, Dock B, Chicago, IL 60612",
        resaleStatus: "On file",
        resaleCertNumber: "IL-RS-884120",
        preferredContact: "Email",
        status: "Active",
        receivingHours: "Mon–Fri 7:30 AM – 5:00 PM",
        deliveryInstructions: "Use rear dock B. Ring bell, ask for parts manager.",
        notes: "High-volume collision account. Prefers same-day on body panels.",
        createdAt: "2026-03-11T14:00:00.000Z",
      },
      {
        id: "shop_northshore",
        shopName: "North Shore Euro Service",
        contactName: "Dana Whitfield",
        email: "dana@northshoreeuro.example",
        phone: "(847) 555-0188",
        billingAddress: "515 Green Bay Rd, Evanston, IL 60202",
        deliveryAddress: "515 Green Bay Rd, Evanston, IL 60202",
        resaleStatus: "On file",
        resaleCertNumber: "IL-RS-771905",
        preferredContact: "Phone",
        status: "Active",
        receivingHours: "Mon–Fri 8:00 AM – 6:00 PM",
        deliveryInstructions: "Front counter drop-off; do not leave unattended.",
        notes: "Mechanical repair. Mostly maintenance and suspension work.",
        createdAt: "2026-05-02T16:20:00.000Z",
      },
      {
        id: "shop_ridgeline",
        shopName: "Ridgeline Auto Body",
        contactName: "Priyanka Shah",
        email: "estimates@ridgelinebody.example",
        phone: "(815) 555-0244",
        billingAddress: "88 Industrial Dr, Rockford, IL 61109",
        deliveryAddress: "88 Industrial Dr, Rockford, IL 61109",
        resaleStatus: "Pending",
        resaleCertNumber: "",
        preferredContact: "Email",
        status: "Pending review",
        receivingHours: "Mon–Fri 8:00 AM – 4:30 PM",
        deliveryInstructions: "Deliveries to side entrance.",
        notes: "Outside the same-day radius — standard freight only for now.",
        createdAt: "2026-08-19T13:05:00.000Z",
      },
    ],
    requests: [
      /* ------------------------------ commercial ----------------------------- */
      {
        id: "req_2104",
        reference: "PBP-C2104",
        channel: "commercial",
        shopId: "shop_apex",
        customerName: "Apex Collision & Refinish",
        email: "parts@apexcollision.example",
        phone: "(312) 555-0310",
        vin: "WBA5R7C56KAJ12345",
        modelYear: "2019",
        bmwModel: "330i (G20)",
        roNumber: "RO-48210",
        insurerRef: "STF-9928471",
        urgency: "Vehicle down / rush",
        vehicleRef: "Bay 3 · black sedan",
        customerRef: "CUST-4412",
        partsRequested:
          "Front bumper cover (primed), left headlight assembly, bumper carrier, absorber. Per attached estimate lines 4–11.",
        shippingZip: "60612",
        notes: "Insurer approved OEM. Need panels today if possible.",
        submittedAt: hoursAgo(5),
        status: "Quote Ready",
        expiresAt: daysFromNow(14),
        photoCount: 4,
        estimateFiles: [
          { name: "RO-48210-estimate.pdf", type: "application/pdf" },
          { name: "left-front-damage.jpg", type: "image/jpeg" },
        ],
        delivery: {
          type: "Local Same-Day",
          eligibility: "Eligible",
          status: "Ready for Pickup",
          requestedWindow: "Today 1:00 PM – 3:00 PM",
          scheduledDate: isoDay(0),
          instructions: "Rear dock B, ask for parts manager.",
          receivingHours: "Mon–Fri 7:30 AM – 5:00 PM",
          oversized: true,
          courier: "In-house van 2",
          eligibilityNote: "4.2 mi from hub. Oversize panel — van 2 assigned.",
        },
        lines: [
          {
            id: "li_c1",
            partNumber: "51117478153",
            description: "Front bumper cover, primed",
            quantity: 1,
            dealerCost: 412.5,
            msrp: 689.0,
            shipping: 0,
            priceOverride: null,
          },
          {
            id: "li_c2",
            partNumber: "63117439097",
            description: "Left LED headlight assembly",
            quantity: 1,
            dealerCost: 748.0,
            msrp: 1240.0,
            shipping: 0,
            priceOverride: null,
          },
          {
            id: "li_c3",
            partNumber: "51117440729",
            description: "Bumper carrier, front",
            quantity: 1,
            dealerCost: 132.9,
            msrp: 219.0,
            shipping: 0,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_2103",
        reference: "PBP-C2103",
        channel: "commercial",
        shopId: "shop_northshore",
        customerName: "North Shore Euro Service",
        email: "dana@northshoreeuro.example",
        phone: "(847) 555-0188",
        vin: "5UXTR9C55KLP12345",
        modelYear: "2019",
        bmwModel: "X3 xDrive30i (G01)",
        roNumber: "RO-7741",
        urgency: "Same-day needed",
        vehicleRef: "Lift 2 · white X3",
        customerRef: "JOB-2291",
        partsRequested: "Rear brake pads and rotors, both rear wheel speed sensors.",
        shippingZip: "60202",
        submittedAt: hoursAgo(28),
        status: "Paid",
        expiresAt: daysFromNow(10),
        photoCount: 0,
        estimateFiles: [],
        delivery: {
          type: "Local Same-Day",
          eligibility: "Eligible",
          status: "Out for Delivery",
          requestedWindow: "Today 11:00 AM – 1:00 PM",
          scheduledDate: isoDay(0),
          instructions: "Front counter drop-off; signature required.",
          receivingHours: "Mon–Fri 8:00 AM – 6:00 PM",
          oversized: false,
          courier: "Courier partner · run 118",
          eligibilityNote: "12.6 mi from hub, inside radius.",
        },
        lines: [
          {
            id: "li_c4",
            partNumber: "34216873093",
            description: "Rear brake pad set, genuine BMW",
            quantity: 1,
            dealerCost: 88.4,
            msrp: 154.0,
            shipping: 0,
            priceOverride: null,
          },
          {
            id: "li_c5",
            partNumber: "34216860925",
            description: "Rear brake rotor (each)",
            quantity: 2,
            dealerCost: 104.2,
            msrp: 178.5,
            shipping: 0,
            priceOverride: null,
          },
          {
            id: "li_c6",
            partNumber: "34526870077",
            description: "Wheel speed sensor, rear",
            quantity: 2,
            dealerCost: 62.75,
            msrp: 112.0,
            shipping: 0,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_2102",
        reference: "PBP-C2102",
        channel: "commercial",
        shopId: "shop_ridgeline",
        customerName: "Ridgeline Auto Body",
        email: "estimates@ridgelinebody.example",
        phone: "(815) 555-0244",
        vin: "WBA7E2C51JG12345",
        modelYear: "2018",
        bmwModel: "740i (G11)",
        roNumber: "RO-3312",
        insurerRef: "ALL-4471200",
        urgency: "Standard",
        vehicleRef: "Frame bay · gray 740i",
        customerRef: "TICKET-88",
        partsRequested:
          "Right front fender, wheel arch trim, inner liner. Estimate attached, OEM only.",
        shippingZip: "61109",
        submittedAt: hoursAgo(52),
        status: "Sent",
        expiresAt: daysFromNow(12),
        photoCount: 2,
        estimateFiles: [{ name: "ridgeline-RO-3312.pdf", type: "application/pdf" }],
        delivery: {
          type: "Priority/Oversize Courier",
          eligibility: "Outside Zone",
          status: "Pending Eligibility",
          requestedWindow: "Tomorrow AM",
          scheduledDate: isoDay(1),
          instructions: "Side entrance, forklift available.",
          receivingHours: "Mon–Fri 8:00 AM – 4:30 PM",
          oversized: true,
          courier: "",
          eligibilityNote: "84 mi from hub — outside same-day radius. Quote oversize courier.",
        },
        lines: [
          {
            id: "li_c7",
            partNumber: "41007438633",
            description: "Right front fender, primed",
            quantity: 1,
            dealerCost: 388.0,
            msrp: 641.0,
            shipping: 0,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_2101",
        reference: "PBP-C2101",
        channel: "commercial",
        shopId: "shop_apex",
        customerName: "Apex Collision & Refinish",
        email: "parts@apexcollision.example",
        phone: "(312) 555-0310",
        vin: "WBXHT3C34K5L12345",
        modelYear: "2019",
        bmwModel: "X1 xDrive28i (F48)",
        roNumber: "RO-48155",
        urgency: "Standard",
        vehicleRef: "Bay 1 · blue X1",
        customerRef: "CUST-4390",
        partsRequested: "Left mirror assembly, mirror cap, and door handle trim.",
        shippingZip: "60612",
        submittedAt: hoursAgo(96),
        status: "Shipped",
        expiresAt: daysFromNow(6),
        photoCount: 1,
        estimateFiles: [],
        delivery: {
          type: "Local Same-Day",
          eligibility: "Eligible",
          status: "Delivered",
          requestedWindow: "Delivered 9:40 AM",
          scheduledDate: isoDay(-1),
          instructions: "Rear dock B.",
          receivingHours: "Mon–Fri 7:30 AM – 5:00 PM",
          oversized: false,
          courier: "In-house van 1",
          eligibilityNote: "4.2 mi from hub.",
        },
        lines: [
          {
            id: "li_c8",
            partNumber: "51167445123",
            description: "Left exterior mirror assembly, heated",
            quantity: 1,
            dealerCost: 296.4,
            msrp: 498.0,
            shipping: 0,
            priceOverride: 468,
          },
        ],
      },
      {
        id: "req_2100",
        reference: "PBP-C2100",
        channel: "commercial",
        shopId: "shop_northshore",
        customerName: "North Shore Euro Service",
        email: "dana@northshoreeuro.example",
        phone: "(847) 555-0188",
        vin: "WBA8B9C50HK12345",
        modelYear: "2017",
        bmwModel: "330i (F30)",
        roNumber: "RO-7702",
        urgency: "Standard",
        vehicleRef: "Lift 4 · gray 330i",
        customerRef: "JOB-2260",
        partsRequested: "Water pump, thermostat, coolant hose kit.",
        shippingZip: "60202",
        submittedAt: hoursAgo(20),
        status: "Draft",
        expiresAt: null,
        photoCount: 0,
        estimateFiles: [],
        delivery: {
          type: "Local Same-Day",
          eligibility: "Needs Review",
          status: "Pending Eligibility",
          requestedWindow: "Today 3:00 PM – 5:00 PM",
          scheduledDate: isoDay(0),
          instructions: "Front counter.",
          receivingHours: "Mon–Fri 8:00 AM – 6:00 PM",
          oversized: false,
          courier: "",
          eligibilityNote: "Awaiting parts availability confirmation from dealer.",
        },
        lines: [],
      },

      /* ------------------------------- consumer ------------------------------ */
      {
        id: "req_1041",
        reference: "PBP-1041",
        channel: "consumer",
        customerName: "Daniel Ortiz",
        email: "daniel.ortiz@example.com",
        phone: "(312) 555-0142",
        vin: "WBA8E9G59GNT12345",
        modelYear: "2016",
        bmwModel: "340i (F30)",
        mileage: "78,400",
        partsRequested:
          "Front brake pads and rotors, both front control arms. Slight shudder under braking.",
        shippingZip: "60614",
        notes: "Needs parts before a track day in three weeks.",
        submittedAt: "2026-08-29T15:12:00.000Z",
        status: "Draft",
        expiresAt: null,
        photoCount: 3,
        lines: [
          {
            id: "li_1",
            partNumber: "34116865459",
            description: "Front brake pad set, genuine BMW",
            quantity: 1,
            dealerCost: 96.4,
            msrp: 168.95,
            shipping: 0,
            priceOverride: null,
          },
          {
            id: "li_2",
            partNumber: "34116864047",
            description: "Front brake rotor, vented (each)",
            quantity: 2,
            dealerCost: 112.75,
            msrp: 189.5,
            shipping: 14,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_1040",
        reference: "PBP-1040",
        channel: "consumer",
        customerName: "Meredith Kaye",
        email: "m.kaye@example.com",
        phone: "(206) 555-0198",
        vin: "5UXCR6C09L9C12345",
        modelYear: "2020",
        bmwModel: "X5 xDrive40i (G05)",
        mileage: "41,100",
        partsRequested: "Cabin air filters, oil filter housing gasket, engine air filter.",
        shippingZip: "98109",
        submittedAt: "2026-08-27T19:40:00.000Z",
        status: "Sent",
        expiresAt: "2026-09-10T00:00:00.000Z",
        photoCount: 1,
        lines: [
          {
            id: "li_3",
            partNumber: "64119366401",
            description: "Cabin micro filter set",
            quantity: 1,
            dealerCost: 48.2,
            msrp: 89.0,
            shipping: 12,
            priceOverride: 74.5,
          },
          {
            id: "li_4",
            partNumber: "11428583898",
            description: "Oil filter housing gasket kit",
            quantity: 1,
            dealerCost: 21.35,
            msrp: 42.5,
            shipping: 0,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_1039",
        reference: "PBP-1039",
        channel: "consumer",
        customerName: "Anthony Vaughn",
        email: "avaughn@example.com",
        phone: "(704) 555-0110",
        vin: "WBS8M9C54J5J12345",
        modelYear: "2018",
        bmwModel: "M3 Competition (F80)",
        mileage: "52,800",
        partsRequested: "Charge pipe, diverter valve, and OEM spark plugs (set of 6).",
        shippingZip: "28202",
        submittedAt: "2026-08-24T13:05:00.000Z",
        status: "Paid",
        expiresAt: "2026-09-07T00:00:00.000Z",
        photoCount: 0,
        lines: [
          {
            id: "li_5",
            partNumber: "12120039664",
            description: "Spark plug, genuine BMW (each)",
            quantity: 6,
            dealerCost: 18.9,
            msrp: 32.75,
            shipping: 0,
            priceOverride: null,
          },
        ],
      },
      {
        id: "req_1038",
        reference: "PBP-1038",
        channel: "consumer",
        customerName: "Priya Raman",
        email: "priya.raman@example.com",
        phone: "(415) 555-0176",
        vin: "WBA5R1C54KAK12345",
        modelYear: "2019",
        bmwModel: "330i (G20)",
        mileage: "35,600",
        partsRequested: "Driver side mirror glass and heated mirror assembly.",
        shippingZip: "94110",
        submittedAt: "2026-08-21T09:22:00.000Z",
        status: "Closed/Lost",
        expiresAt: null,
        photoCount: 2,
        lines: [],
      },
    ],
  };
}

let state: AdminState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — the prototype keeps working in memory only.
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminState>;
      if (parsed?.requests && parsed?.settings) {
        state = {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          requests: parsed.requests,
          shops: parsed.shops?.length ? parsed.shops : seed().shops,
        };
      }
    }
  } catch {
    // Corrupt payload — fall back to the seed.
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function setState(next: AdminState) {
  state = next;
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

function snapshot() {
  return state;
}

export function useAdminState() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function useAdminRequest(id: string) {
  const s = useAdminState();
  return s.requests.find((r) => r.id === id);
}

export function useCommercialAccount(id: string | null) {
  const s = useAdminState();
  return id ? s.shops.find((shop) => shop.id === id) : undefined;
}

/* ---------------------------------- actions --------------------------------- */

export function updateSettings(patch: Partial<PricingSettings>) {
  setState({ ...state, settings: { ...state.settings, ...patch } });
}

export function resetSettings() {
  setState({ ...state, settings: { ...DEFAULT_SETTINGS } });
}

function mapRequest(id: string, fn: (r: QuoteRequest) => QuoteRequest) {
  setState({
    ...state,
    requests: state.requests.map((r) => (r.id === id ? fn(r) : r)),
  });
}

export function addLine(requestId: string) {
  const line: LineItem = {
    id: newId("li"),
    partNumber: "",
    description: "",
    quantity: 1,
    dealerCost: 0,
    msrp: 0,
    shipping: 0,
    priceOverride: null,
  };
  mapRequest(requestId, (r) => ({ ...r, lines: [...r.lines, line] }));
}

export function updateLine(requestId: string, lineId: string, patch: Partial<LineItem>) {
  mapRequest(requestId, (r) => ({
    ...r,
    lines: r.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
  }));
}

export function removeLine(requestId: string, lineId: string) {
  mapRequest(requestId, (r) => ({ ...r, lines: r.lines.filter((l) => l.id !== lineId) }));
}

export function setStatus(requestId: string, status: QuoteStatus) {
  mapRequest(requestId, (r) => {
    const shouldStamp = status === "Quote Ready" || status === "Sent";
    const expiresAt =
      shouldStamp && !r.expiresAt
        ? new Date(Date.now() + state.settings.quoteExpirationDays * 86400000).toISOString()
        : r.expiresAt;
    return { ...r, status, expiresAt };
  });
}

export function refreshExpiration(requestId: string) {
  mapRequest(requestId, (r) => ({
    ...r,
    expiresAt: new Date(Date.now() + state.settings.quoteExpirationDays * 86400000).toISOString(),
  }));
}

/* ------------------------------ commercial ---------------------------------- */

export function updateShop(shopId: string, patch: Partial<CommercialAccount>) {
  setState({
    ...state,
    shops: state.shops.map((s) => (s.id === shopId ? { ...s, ...patch } : s)),
  });
}

export interface ShopRequestInput {
  shopId: string;
  vin: string;
  modelYear: string;
  bmwModel: string;
  roNumber: string;
  insurerRef: string;
  urgency: Urgency;
  partsRequested: string;
  vehicleRef: string;
  customerRef: string;
  notes: string;
  photoCount: number;
  estimateFiles: UploadedFileRef[];
  deliveryType: DeliveryType;
  requestedWindow: string;
  deliveryInstructions: string;
  receivingHours: string;
}

/** Initial eligibility triage. Real radius/size/capacity checks land server-side. */
export function initialEligibility(
  type: DeliveryType,
  zip: string,
  inZoneZips: string[] = IN_ZONE_ZIPS,
): DeliveryEligibility {
  if (type === "Standard Shipping") return "Eligible";
  if (!inZoneZips.includes(zip)) return "Outside Zone";
  return "Needs Review";
}

/** Prototype stand-in for a mapping/distance radius check. */
export const IN_ZONE_ZIPS = [
  "60612",
  "60614",
  "60622",
  "60642",
  "60654",
  "60201",
  "60202",
  "60302",
  "60everything".slice(0, 5),
];

export function submitShopRequest(input: ShopRequestInput): QuoteRequest {
  const shop = state.shops.find((s) => s.id === input.shopId);
  const zip = (shop?.deliveryAddress.match(/\b\d{5}\b/) ?? [""])[0];
  const request: QuoteRequest = {
    id: newId("req"),
    reference: `PBP-C${2105 + state.requests.filter((r) => r.channel === "commercial").length}`,
    channel: "commercial",
    shopId: input.shopId,
    customerName: shop?.shopName ?? "Commercial account",
    email: shop?.email ?? "",
    phone: shop?.phone ?? "",
    vin: input.vin,
    modelYear: input.modelYear,
    bmwModel: input.bmwModel,
    roNumber: input.roNumber,
    insurerRef: input.insurerRef,
    urgency: input.urgency,
    vehicleRef: input.vehicleRef,
    customerRef: input.customerRef,
    partsRequested: input.partsRequested,
    shippingZip: zip,
    notes: input.notes,
    submittedAt: new Date().toISOString(),
    status: "Draft",
    expiresAt: null,
    lines: [],
    photoCount: input.photoCount,
    estimateFiles: input.estimateFiles,
    delivery: {
      type: input.deliveryType,
      eligibility: initialEligibility(input.deliveryType, zip),
      status: "Pending Eligibility",
      requestedWindow: input.requestedWindow,
      scheduledDate: isoDay(0),
      instructions: input.deliveryInstructions,
      receivingHours: input.receivingHours,
      oversized: false,
      courier: "",
      eligibilityNote: "",
    },
  };

  setState({ ...state, requests: [request, ...state.requests] });
  return request;
}

/** Repeat job helper — copies the request details, not the pricing or status. */
export function duplicateRequest(requestId: string): QuoteRequest | undefined {
  const source = state.requests.find((r) => r.id === requestId);
  if (!source) return undefined;

  const copy: QuoteRequest = {
    ...source,
    id: newId("req"),
    reference: `${source.reference}-R${Math.floor(Math.random() * 90 + 10)}`,
    submittedAt: new Date().toISOString(),
    status: "Draft",
    expiresAt: null,
    lines: [],
    delivery: source.delivery
      ? {
          ...source.delivery,
          eligibility: initialEligibility(source.delivery.type, source.shippingZip),
          status: "Pending Eligibility",
          scheduledDate: isoDay(0),
          courier: "",
          eligibilityNote: "",
        }
      : undefined,
  };

  setState({ ...state, requests: [copy, ...state.requests] });
  return copy;
}

export function updateDelivery(requestId: string, patch: Partial<DeliveryDetails>) {
  mapRequest(requestId, (r) =>
    r.delivery
      ? { ...r, delivery: { ...r.delivery, ...patch } }
      : {
          ...r,
          delivery: {
            type: "Standard Shipping",
            eligibility: "Eligible",
            status: "Pending Eligibility",
            requestedWindow: "",
            scheduledDate: isoDay(0),
            instructions: "",
            receivingHours: "",
            oversized: false,
            courier: "",
            eligibilityNote: "",
            ...patch,
          },
        },
  );
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

export function resetAll() {
  setState(seed());
}

export const STATUS_TONE: Record<QuoteStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Quote Ready": "bg-accent text-accent-foreground",
  Sent: "bg-primary/10 text-primary",
  Accepted: "bg-emerald-100 text-emerald-800",
  Paid: "bg-emerald-600/15 text-emerald-700",
  Ordered: "bg-amber-100 text-amber-800",
  Shipped: "bg-sky-100 text-sky-800",
  "Closed/Lost": "bg-destructive/10 text-destructive",
};

export const ELIGIBILITY_TONE: Record<DeliveryEligibility, string> = {
  Eligible: "bg-emerald-100 text-emerald-800",
  "Needs Review": "bg-amber-100 text-amber-800",
  "Outside Zone": "bg-muted text-muted-foreground",
};

export const DELIVERY_STATUS_TONE: Record<DeliveryStatus, string> = {
  "Pending Eligibility": "bg-muted text-muted-foreground",
  "Ready for Pickup": "bg-accent text-accent-foreground",
  "Courier Requested": "bg-primary/10 text-primary",
  "Driver Assigned": "bg-sky-100 text-sky-800",
  "Out for Delivery": "bg-amber-100 text-amber-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  "Delivery Exception": "bg-destructive/10 text-destructive",
};

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export const todayKey = () => isoDay(0);
