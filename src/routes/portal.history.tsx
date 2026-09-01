import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Copy, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeQuote, money } from "@/lib/admin/pricing";
import {
  DELIVERY_STATUS_TONE,
  duplicateRequest,
  formatDate,
  QUOTE_STATUSES,
  STATUS_TONE,
  useAdminState,
  type QuoteStatus,
} from "@/lib/admin/store";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/history")({
  component: PortalHistory,
});

function PortalHistory() {
  const shopId = usePortalSession();
  const { requests, settings } = useAdminState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | QuoteStatus>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => r.shopId === shopId)
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) =>
        q
          ? [r.reference, r.roNumber, r.insurerRef, r.vin, r.bmwModel, r.vehicleRef, r.customerRef, r.partsRequested]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [requests, shopId, query, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Order &amp; quote history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by reference, RO number, VIN, estimate number, or your own job reference. Duplicate
          any past request for a repeat job.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search history"
            placeholder="Search RO, VIN, reference, parts…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | QuoteStatus)}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by status">
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

      {copied ? (
        <p role="status" className="rounded-lg bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
          Duplicated as {copied} — it&apos;s at the top of the list as a new draft request.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <caption className="sr-only">Your shop&apos;s quote and order history</caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-3 font-semibold">RO / Estimate</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Parts</th>
                <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Delivery</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const math = computeQuote(
                  r.lines,
                  settings,
                  r.delivery ? { type: r.delivery.type } : undefined,
                );
                return (
                  <tr key={r.id} className="align-top hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">{r.reference}</td>
                    <td className="px-4 py-3">
                      {r.roNumber || "—"}
                      <span className="block text-xs text-muted-foreground">
                        {r.insurerRef || "No estimate ref"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.modelYear} {r.bmwModel}
                      <span className="block font-mono text-xs text-muted-foreground">{r.vin}</span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">{r.partsRequested}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(r.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${STATUS_TONE[r.status]} border-transparent`}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.delivery ? (
                        <>
                          <Badge
                            className={`${DELIVERY_STATUS_TONE[r.delivery.status]} border-transparent`}
                          >
                            {r.delivery.status}
                          </Badge>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {r.delivery.type}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {r.lines.length ? money(math.grandTotal) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to="/quote/$id"
                          params={{ id: r.id }}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          Quote
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold hover:underline"
                          onClick={() => {
                            const copy = duplicateRequest(r.id);
                            if (copy) setCopied(copy.reference);
                          }}
                        >
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          Duplicate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    Nothing matches those filters.
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
