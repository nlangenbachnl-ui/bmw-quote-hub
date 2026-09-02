import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeQuote, money, percent } from "@/lib/admin/pricing";
import {
  formatDate,
  QUOTE_STATUSES,
  STATUS_TONE,
  useAdminState,
  type QuoteStatus,
} from "@/lib/admin/store";
import { adminListAllPartsRequests } from "@/lib/wholesale/api";
import { formatDate as formatWholesaleDate } from "@/lib/wholesale/constants";

export const Route = createFileRoute("/admin/")({
  component: AdminRequests,
});

type Source = "all" | "retail" | "wholesale";

function AdminRequests() {
  const { requests, settings } = useAdminState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | QuoteStatus>("all");
  const [source, setSource] = useState<Source>("all");

  const wholesaleRequests = useQuery({
    queryKey: ["admin-all-wholesale-requests"],
    queryFn: adminListAllPartsRequests,
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) =>
        q
          ? [r.customerName, r.vin, r.bmwModel, r.reference, r.shippingZip, r.partsRequested]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .map((r) => ({ request: r, math: computeQuote(r.lines, settings) }));
  }, [requests, settings, query, status]);

  const wholesaleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (wholesaleRequests.data ?? []).filter((r) =>
      q
        ? [r.reference_code, r.po_number, r.vin, r.model, r.status]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        : true,
    );
  }, [wholesaleRequests.data, query]);

  const open = requests.filter(
    (r) => r.status !== "Closed/Lost" && r.status !== "Shipped",
  ).length;
  const pipeline = requests
    .filter((r) => r.status !== "Closed/Lost")
    .reduce((t, r) => t + computeQuote(r.lines, settings).grandTotal, 0);
  const projectedNet = requests
    .filter((r) => r.status !== "Closed/Lost")
    .reduce((t, r) => t + computeQuote(r.lines, settings).netContribution, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One work queue for retail and wholesale parts requests. Open a retail request to build a
          priced quote.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search requests"
            placeholder="Search name, VIN, model, reference…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div
          className="inline-flex gap-1 rounded-lg border border-border bg-muted/50 p-1"
          role="tablist"
          aria-label="Request source"
        >
          {(["all", "retail", "wholesale"] as Source[]).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={source === s}
              onClick={() => setSource(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition ${
                source === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | QuoteStatus)}>
          <SelectTrigger className="lg:w-56" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {QUOTE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <details className="rounded-xl border border-border bg-card p-4 shadow-card">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pipeline summary
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat label="Open requests" value={String(open)} />
          <Stat label="Pipeline value" value={money(pipeline)} />
          <Stat
            label="Projected net contribution"
            value={money(projectedNet)}
            hint={`After ${percent(settings.processingPercent, 2)} + ${money(settings.processingFixed)} processing`}
          />
        </div>
      </details>

      {source !== "retail" ? (
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-tight">Wholesale requests</h2>
          {wholesaleRequests.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading wholesale requests…</p>
          ) : wholesaleRows.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No wholesale parts requests match those filters.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                    <th scope="col" className="px-4 py-3 font-semibold">PO / RO</th>
                    <th scope="col" className="px-4 py-3 font-semibold">VIN</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {wholesaleRows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono text-xs">{r.reference_code}</td>
                      <td className="px-4 py-3">{r.po_number || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.vin || "—"}</td>
                      <td className="px-4 py-3">
                        {[r.model_year, r.model].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatWholesaleDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3 capitalize">{r.status.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/quotes-orders"
                          search={{ view: "quotes" }}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          Quote
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {source === "wholesale" ? null : (
      <section>
        <h2 className="text-lg font-extrabold uppercase tracking-tight">Retail requests</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <caption className="sr-only">Incoming BMW parts quote requests</caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">VIN</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Requested parts</th>
                <th scope="col" className="px-4 py-3 font-semibold">ZIP</th>
                <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Quote total</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ request, math }) => (
                <tr key={request.id} className="align-top hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{request.customerName}</div>
                    <div className="text-xs text-muted-foreground">{request.reference}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{request.vin}</td>
                  <td className="px-4 py-3">
                    {request.modelYear} {request.bmwModel}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2">{request.partsRequested}</span>
                  </td>
                  <td className="px-4 py-3">{request.shippingZip}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(request.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_TONE[request.status]} border-transparent`}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {request.lines.length ? money(math.grandTotal) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/requests/$id"
                      params={{ id: request.id }}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Open
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    No requests match those filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
