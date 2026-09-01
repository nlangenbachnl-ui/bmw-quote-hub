import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { computeQuote, money, percent } from "@/lib/admin/pricing";
import { formatDate, useAdminRequest, useAdminState } from "@/lib/admin/store";

export const Route = createFileRoute("/quote/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Parts Quote — Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Review your personalized BMW parts quote from Precision Bimmer Parts, including line items, shipping, and savings versus BMW MSRP.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CustomerQuote,
});

function CustomerQuote() {
  const { id } = Route.useParams();
  const { settings } = useAdminState();
  const request = useAdminRequest(id);

  if (!request) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Quote unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          This quote link is no longer active. Request a fresh quote and we will follow up by email.
        </p>
        <Button asChild className="mt-6">
          <Link to="/request-quote">Request a free quote</Link>
        </Button>
      </div>
    );
  }

  const math = computeQuote(request.lines, settings);

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <header className="bg-carbon px-6 py-7 text-carbon-foreground sm:px-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground"
              >
                PB
              </span>
              <div>
                <p className="text-base font-extrabold uppercase tracking-tight">
                  Precision Bimmer Parts
                </p>
                <p className="text-xs text-carbon-muted">
                  Concierge OEM BMW parts sourcing · VIN-verified fitment
                </p>
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-tight">
              Quote {request.reference}
            </h1>
            <p className="mt-1 text-sm text-carbon-muted">
              Prepared for {request.customerName} · {request.modelYear} {request.bmwModel} · VIN{" "}
              <span className="font-mono">{request.vin}</span>
            </p>
          </header>

          <div className="px-6 py-6 sm:px-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">Quoted parts and pricing</caption>
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="py-2">Part</th>
                    <th scope="col" className="py-2 text-center">Qty</th>
                    <th scope="col" className="py-2 text-right">MSRP</th>
                    <th scope="col" className="py-2 text-right">Your price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {math.lines.map(({ line, math: m }) => (
                    <tr key={line.id}>
                      <td className="py-3">
                        <p className="font-semibold">{line.description || "Sourced part"}</p>
                        <p className="font-mono text-xs text-muted-foreground">{line.partNumber}</p>
                      </td>
                      <td className="py-3 text-center">{line.quantity}</td>
                      <td className="py-3 text-right text-muted-foreground line-through">
                        {m.msrpTotal > 0 ? money(m.msrpTotal) : "—"}
                      </td>
                      <td className="py-3 text-right font-semibold">{money(m.customerTotal)}</td>
                    </tr>
                  ))}
                  {math.lines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Your quote is being prepared — you will receive it by email shortly.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <Row label="Subtotal" value={money(math.subtotal)} />
              <Row label="Shipping" value={math.shippingTotal > 0 ? money(math.shippingTotal) : "Included"} />
              <Row label="Total" value={money(math.grandTotal)} strong />
            </dl>

            {math.savings > 0 ? (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                You save {money(math.savings)} ({percent(math.savingsPercent)}) versus BMW MSRP.
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Quote valid through <strong>{formatDate(request.expiresAt)}</strong>
              </p>
              <Button size="lg" disabled title="Secure checkout is coming soon">
                Accept quote &amp; pay
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Card checkout is coming soon. For now, reply to your quote email and we will confirm
              the order and payment details.
            </p>

            <p className="mt-6 flex items-start gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Genuine OEM parts, fitment verified against your VIN. Precision Bimmer Parts is an
              independent supplier and is not affiliated with, endorsed by, or sponsored by BMW AG.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-base font-extrabold" : ""}`}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
