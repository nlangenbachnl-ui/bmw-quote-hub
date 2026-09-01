import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Copy, FilePlus2, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computeQuote, money } from "@/lib/admin/pricing";
import {
  DELIVERY_STATUS_TONE,
  duplicateRequest,
  ELIGIBILITY_TONE,
  formatDate,
  STATUS_TONE,
  todayKey,
  useAdminState,
  type QuoteRequest,
} from "@/lib/admin/store";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const shopId = usePortalSession();
  const { requests, settings } = useAdminState();
  const navigate = useNavigate();

  const mine = requests.filter((r) => r.shopId === shopId);
  const total = (r: QuoteRequest) =>
    computeQuote(r.lines, settings, r.delivery ? { type: r.delivery.type } : undefined).grandTotal;

  const openRequests = mine.filter((r) => r.status === "Draft");
  const awaitingApproval = mine.filter((r) => r.status === "Quote Ready" || r.status === "Sent");
  const activeJobs = mine.filter(
    (r) => r.status === "Paid" || r.status === "Ordered" || r.status === "Accepted",
  );
  const deliveriesToday = mine.filter((r) => r.delivery?.scheduledDate === todayKey());
  const recent = mine.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Shop dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quote requests, approvals, and deliveries for your account.
          </p>
        </div>
        <Button asChild>
          <Link to="/portal/request">
            <FilePlus2 className="mr-2 h-4 w-4" aria-hidden="true" />
            New parts request
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open quote requests" value={String(openRequests.length)} hint="Being sourced" />
        <Stat
          label="Quotes awaiting approval"
          value={String(awaitingApproval.length)}
          hint={money(awaitingApproval.reduce((t, r) => t + total(r), 0))}
        />
        <Stat
          label="Paid / ordered jobs"
          value={String(activeJobs.length)}
          hint={money(activeJobs.reduce((t, r) => t + total(r), 0))}
        />
        <Stat label="Deliveries today" value={String(deliveriesToday.length)} hint="Scheduled runs" />
      </div>

      <section
        aria-labelledby="deliveries-today"
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="deliveries-today" className="text-sm font-bold uppercase tracking-wider">
            Deliveries today
          </h2>
        </div>
        <ul className="mt-4 space-y-3">
          {deliveriesToday.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">
                  {r.reference} · {r.roNumber ? `RO ${r.roNumber}` : "No RO"} · {r.modelYear}{" "}
                  {r.bmwModel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.delivery?.type} · {r.delivery?.requestedWindow || "Window to be confirmed"}
                  {r.delivery?.oversized ? " · Oversize" : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.delivery ? (
                  <>
                    <Badge className={`${ELIGIBILITY_TONE[r.delivery.eligibility]} border-transparent`}>
                      {r.delivery.eligibility}
                    </Badge>
                    <Badge
                      className={`${DELIVERY_STATUS_TONE[r.delivery.status]} border-transparent`}
                    >
                      {r.delivery.status}
                    </Badge>
                  </>
                ) : null}
              </div>
            </li>
          ))}
          {deliveriesToday.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No deliveries scheduled today. Local same-day requests placed before the cutoff appear
              here once eligibility is confirmed.
            </li>
          ) : null}
        </ul>
      </section>

      <section
        aria-labelledby="recent-orders"
        className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <h2 id="recent-orders" className="text-sm font-bold uppercase tracking-wider">
            Recent quotes &amp; orders
          </h2>
          <Link to="/portal/history" className="text-sm font-semibold text-primary hover:underline">
            View full history
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <caption className="sr-only">Recent quote requests and orders for your shop</caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-3 font-semibold">RO</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{r.reference}</td>
                  <td className="px-4 py-3">{r.roNumber || "—"}</td>
                  <td className="px-4 py-3">
                    {r.modelYear} {r.bmwModel}
                    <span className="block text-xs text-muted-foreground">{r.vehicleRef}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_TONE[r.status]} border-transparent`}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {r.lines.length ? money(total(r)) : "—"}
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
                          if (copy) navigate({ to: "/portal/history" });
                        }}
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No requests yet — submit your first parts request to get started.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
