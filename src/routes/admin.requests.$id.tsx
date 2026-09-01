import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeQuote, money, percent } from "@/lib/admin/pricing";
import {
  addLine,
  formatDate,
  QUOTE_STATUSES,
  refreshExpiration,
  removeLine,
  setStatus,
  STATUS_TONE,
  updateLine,
  useAdminRequest,
  useAdminState,
} from "@/lib/admin/store";

export const Route = createFileRoute("/admin/requests/$id")({
  component: QuoteBuilder,
});

function QuoteBuilder() {
  const { id } = Route.useParams();
  const { settings } = useAdminState();
  const request = useAdminRequest(id);

  if (!request) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-semibold">Request not found.</p>
        <Link to="/admin" className="mt-2 inline-block text-primary hover:underline">
          Back to requests
        </Link>
      </div>
    );
  }

  const math = computeQuote(request.lines, settings);

  return (
    <div className="space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All requests
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">
              {request.reference} · {request.customerName}
            </h1>
            <Badge className={`${STATUS_TONE[request.status]} border-transparent`}>
              {request.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.modelYear} {request.bmwModel} · VIN{" "}
            <span className="font-mono">{request.vin}</span> · Ships to {request.shippingZip}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/quote/$id" params={{ id: request.id }} target="_blank">
            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
            Customer preview
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card md:grid-cols-2">
        <Detail label="Email" value={request.email} />
        <Detail label="Phone" value={request.phone} />
        <Detail label="Mileage" value={request.mileage ?? "Not provided"} />
        <Detail label="Received" value={formatDate(request.submittedAt)} />
        <Detail label="Photos attached" value={`${request.photoCount}`} />
        <Detail label="Quote expires" value={formatDate(request.expiresAt)} />
        <div className="md:col-span-2">
          <Detail label="Requested parts" value={request.partsRequested} />
        </div>
        {request.notes ? (
          <div className="md:col-span-2">
            <Detail label="Customer notes" value={request.notes} />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="status-heading" className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 id="status-heading" className="text-sm font-bold uppercase tracking-wider">
          Status
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUOTE_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={request.status === s ? "default" : "outline"}
              onClick={() => setStatus(request.id, s)}
              aria-pressed={request.status === s}
            >
              {s}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Expiration is stamped {settings.quoteExpirationDays} days out when a quote is marked ready
          or sent.{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => refreshExpiration(request.id)}
          >
            Reset expiration
          </button>
        </p>
      </section>

      <section aria-labelledby="lines-heading" className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <h2 id="lines-heading" className="text-sm font-bold uppercase tracking-wider">
              Line items
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Acquisition = dealer cost × {settings.acquisitionMarkup.toFixed(2)} · Recommended price
              = acquisition ÷ (1 − {percent(settings.targetMargin, 0)})
            </p>
          </div>
          <Button size="sm" onClick={() => addLine(request.id)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add line item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[72rem] text-left text-sm">
            <caption className="sr-only">Quote line items and pricing math</caption>
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-3">Part number</th>
                <th scope="col" className="px-3 py-3">Description</th>
                <th scope="col" className="px-3 py-3">Qty</th>
                <th scope="col" className="px-3 py-3">Dealer cost</th>
                <th scope="col" className="px-3 py-3">MSRP</th>
                <th scope="col" className="px-3 py-3">Shipping</th>
                <th scope="col" className="px-3 py-3">Sell price (unit)</th>
                <th scope="col" className="px-3 py-3 text-right">Acquisition</th>
                <th scope="col" className="px-3 py-3 text-right">Customer</th>
                <th scope="col" className="px-3 py-3 text-right">GP $ / %</th>
                <th scope="col" className="px-3 py-3 text-right">MSRP savings</th>
                <th scope="col" className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {math.lines.map(({ line, math: m }) => (
                <tr key={line.id}>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="BMW part number"
                      className="w-32 font-mono"
                      value={line.partNumber}
                      onChange={(e) => updateLine(request.id, line.id, { partNumber: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="Description"
                      className="w-64"
                      value={line.description}
                      onChange={(e) =>
                        updateLine(request.id, line.id, { description: e.target.value })
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="Quantity"
                      type="number"
                      min={1}
                      className="w-16"
                      value={String(line.quantity)}
                      onChange={(e) =>
                        updateLine(request.id, line.id, { quantity: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="Dealer cost"
                      type="number"
                      step={0.01}
                      className="w-24"
                      value={String(line.dealerCost)}
                      onChange={(e) =>
                        updateLine(request.id, line.id, { dealerCost: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="BMW MSRP"
                      type="number"
                      step={0.01}
                      className="w-24"
                      value={String(line.msrp)}
                      onChange={(e) =>
                        updateLine(request.id, line.id, { msrp: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="Shipping allocation"
                      type="number"
                      step={0.01}
                      className="w-20"
                      value={String(line.shipping)}
                      onChange={(e) =>
                        updateLine(request.id, line.id, { shipping: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      aria-label="Selling price override"
                      type="number"
                      step={0.01}
                      className="w-24"
                      placeholder={m.recommendedUnit.toFixed(2)}
                      value={line.priceOverride === null ? "" : String(line.priceOverride)}
                      onChange={(e) =>
                        updateLine(request.id, line.id, {
                          priceOverride: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {m.isOverridden ? `Override · rec ${money(m.recommendedUnit)}` : "Recommended"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">{money(m.acquisitionTotal)}</td>
                  <td className="px-3 py-3 text-right font-semibold">{money(m.customerTotal)}</td>
                  <td className="px-3 py-3 text-right">
                    {money(m.grossProfit)}
                    <span className="block text-xs text-muted-foreground">
                      {percent(m.grossMargin)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {money(m.savings)}
                    <span className="block text-xs text-muted-foreground">
                      {percent(m.savingsPercent)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove line ${line.partNumber || "item"}`}
                      onClick={() => removeLine(request.id, line.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
              {math.lines.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">
                    No line items yet — add the parts you sourced for this request.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="totals-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="totals-heading" className="sr-only">
          Quote totals
        </h2>
        <Metric label="Acquisition cost" value={money(math.acquisitionTotal)} />
        <Metric label="Customer subtotal" value={money(math.subtotal)} />
        <Metric label="Shipping" value={money(math.shippingTotal)} />
        <Metric label="Customer total" value={money(math.grandTotal)} emphasis />
        <Metric label="Gross profit" value={money(math.grossProfit)} />
        <Metric label="Gross margin" value={percent(math.grossMargin)} />
        <Metric
          label="MSRP savings"
          value={money(math.savings)}
          hint={`${percent(math.savingsPercent)} off ${money(math.msrpTotal)} MSRP`}
        />
        <Metric
          label="Est. net contribution"
          value={money(math.netContribution)}
          hint={`After ${money(math.processingFee)} processing and shipping cost`}
          emphasis
        />
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-card ${
        emphasis ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
