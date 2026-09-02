import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { computeQuote, money } from "@/lib/admin/pricing";
import { formatDate, STATUS_TONE, useAdminState } from "@/lib/admin/store";
import { DeliveryBoard } from "@/components/admin/DeliveryBoard";
import { AdminWholesaleQuotes } from "@/components/admin/WholesaleQuotesPanel";

type View = "quotes" | "orders" | "deliveries";

const VIEWS: Array<{ key: View; label: string }> = [
  { key: "quotes", label: "Quotes" },
  { key: "orders", label: "Orders" },
  { key: "deliveries", label: "Deliveries" },
];

export const Route = createFileRoute("/admin/quotes-orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: (["quotes", "orders", "deliveries"] as string[]).includes(String(search.view))
      ? (search.view as View)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quotes & Orders — Precision Bimmer Parts" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuotesAndOrders,
});

const QUOTE_VIEW_STATUSES = ["Draft", "Quote Ready", "Sent", "Closed/Lost"];
const ORDER_VIEW_STATUSES = ["Accepted", "Paid", "Ordered", "Shipped"];

function QuotesAndOrders() {
  const { view: initialView } = Route.useSearch();
  const [view, setView] = useState<View>(initialView ?? "quotes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Quotes &amp; orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retail and wholesale quotes, accepted work, and the delivery board in one place.
        </p>
      </div>

      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1"
        role="tablist"
        aria-label="Quotes and orders views"
      >
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              view === v.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "quotes" ? (
        <div className="space-y-10">
          <RetailQuoteTable
            title="Retail quotes"
            statuses={QUOTE_VIEW_STATUSES}
            empty="No retail quotes in progress. Open a request to build one."
          />
          <AdminWholesaleQuotes />
        </div>
      ) : null}

      {view === "orders" ? (
        <RetailQuoteTable
          title="Accepted, paid and shipped work"
          statuses={ORDER_VIEW_STATUSES}
          empty="No accepted or paid work yet."
        />
      ) : null}

      {view === "deliveries" ? <DeliveryBoard /> : null}
    </div>
  );
}

function RetailQuoteTable({
  title,
  statuses,
  empty,
}: {
  title: string;
  statuses: string[];
  empty: string;
}) {
  const { requests, settings } = useAdminState();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => statuses.includes(r.status))
      .filter((r) =>
        q
          ? [r.customerName, r.reference, r.vin, r.bmwModel].join(" ").toLowerCase().includes(q)
          : true,
      )
      .map((r) => ({
        request: r,
        math: computeQuote(r.lines, settings, r.delivery ? { type: r.delivery.type } : undefined),
      }));
  }, [requests, settings, query, statuses]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold uppercase tracking-tight">{title}</h2>
        <Input
          aria-label={`Search ${title}`}
          placeholder="Search customer, reference, VIN…"
          className="max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ request, math }) => (
                <tr key={request.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs">{request.reference}</td>
                  <td className="px-4 py-3 font-semibold">{request.customerName}</td>
                  <td className="px-4 py-3">
                    {request.modelYear} {request.bmwModel}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDate(request.submittedAt)}
                  </td>
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
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
