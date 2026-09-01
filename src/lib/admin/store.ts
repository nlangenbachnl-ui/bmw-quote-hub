// Mock admin data layer.
// State lives in memory and is mirrored to localStorage so the prototype
// survives reloads. Every mutation goes through one of the exported actions,
// so swapping in Supabase later means replacing the bodies of those actions
// (and the `load()` seed) without touching any component.

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, type LineItem, type PricingSettings } from "./pricing";

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
}

interface AdminState {
  requests: QuoteRequest[];
  settings: PricingSettings;
}

const STORAGE_KEY = "pbp:admin:v1";

function seed(): AdminState {
  return {
    settings: { ...DEFAULT_SETTINGS },
    requests: [
      {
        id: "req_1041",
        reference: "PBP-1041",
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
      const parsed = JSON.parse(raw) as AdminState;
      if (parsed?.requests && parsed?.settings) {
        state = { settings: { ...DEFAULT_SETTINGS, ...parsed.settings }, requests: parsed.requests };
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

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
