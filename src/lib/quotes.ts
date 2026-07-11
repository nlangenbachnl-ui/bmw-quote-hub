// Mock quote data layer.
// Persists submissions to localStorage so this V1 works with no backend.
// The API is async so it can be swapped for Supabase (or any server) without
// touching the form component — just replace the bodies of `submitQuote` and
// `listQuotes` with real network calls.

export interface QuoteRequestInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vin: string;
  model_year: string;
  bmw_model: string;
  mileage?: string;
  parts_requested: string;
  shipping_zip: string;
  notes?: string;
  // base64 data URLs for the mock layer (kept small — see form validation)
  photos: Array<{ name: string; type: string; dataUrl: string }>;
}

export interface QuoteRequestRecord extends QuoteRequestInput {
  id: string;
  submitted_at: string;
  status: "new";
}

const STORAGE_KEY = "bpc:quote-requests:v1";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function submitQuote(input: QuoteRequestInput): Promise<QuoteRequestRecord> {
  // Simulate network latency so the loading state is visible.
  await new Promise((r) => setTimeout(r, 450));

  const record: QuoteRequestRecord = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    submitted_at: new Date().toISOString(),
    status: "new",
  };

  const store = safeStorage();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      const list: QuoteRequestRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(record);
      store.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full or unavailable — the submission still "succeeds" for the user
      // in this mock; a real backend would confirm persistence.
    }
  }

  return record;
}

export async function listQuotes(): Promise<QuoteRequestRecord[]> {
  const store = safeStorage();
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuoteRequestRecord[]) : [];
  } catch {
    return [];
  }
}
