import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeQuote, money } from "@/lib/admin/pricing";
import {
  DELIVERY_ELIGIBILITY,
  DELIVERY_STATUS_TONE,
  DELIVERY_STATUSES,
  ELIGIBILITY_TONE,
  todayKey,
  updateDelivery,
  useAdminState,
  type DeliveryEligibility,
  type DeliveryStatus,
} from "@/lib/admin/store";


export function DeliveryBoard() {
  const { requests, shops, settings } = useAdminState();
  const [scope, setScope] = useState<"today" | "all">("today");
  const today = todayKey();

  const jobs = requests
    .filter((r) => r.delivery)
    .filter((r) => (scope === "today" ? r.delivery?.scheduledDate === today : true));

  const sameDayCount = jobs.filter((r) => r.delivery?.type === "Local Same-Day").length;
  const feeTotal = jobs.reduce(
    (t, r) =>
      t + computeQuote(r.lines, settings, r.delivery ? { type: r.delivery.type } : undefined).delivery.fee,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Delivery board</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Local same-day and courier runs. Confirm eligibility before committing a window to a
            shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={scope === "today" ? "default" : "outline"} size="sm" onClick={() => setScope("today")}>
            Today
          </Button>
          <Button variant={scope === "all" ? "default" : "outline"} size="sm" onClick={() => setScope("all")}>
            All scheduled
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Jobs on the board" value={String(jobs.length)} />
        <Stat label="Local same-day runs" value={String(sameDayCount)} />
        <Stat label="Delivery fees billed" value={money(feeTotal)} />
      </div>

      <div className="space-y-4">
        {jobs.map((r) => {
          const d = r.delivery!;
          const math = computeQuote(r.lines, settings, { type: d.type });
          const shop = shops.find((s) => s.id === r.shopId);
          return (
            <article key={r.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold uppercase tracking-tight">
                      {r.reference}
                    </h2>
                    <Badge className={`${ELIGIBILITY_TONE[d.eligibility]} border-transparent`}>
                      {d.eligibility}
                    </Badge>
                    <Badge className={`${DELIVERY_STATUS_TONE[d.status]} border-transparent`}>
                      {d.status}
                    </Badge>
                    {d.oversized ? (
                      <Badge className="border-transparent bg-amber-100 text-amber-800">
                        Oversize
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shop?.shopName ?? r.customerName}
                    {r.roNumber ? ` · RO ${r.roNumber}` : ""} · {shop?.deliveryAddress ?? r.shippingZip}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/requests/$id" params={{ id: r.id }}>
                    Open quote
                    <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Item label="Delivery type" value={d.type} />
                <Item label="Order value" value={r.lines.length ? money(math.grandTotal) : "Not quoted"} />
                <Item
                  label="Delivery fee"
                  value={
                    d.type === "Local Same-Day" && math.delivery.waived
                      ? "Free (threshold met)"
                      : money(math.delivery.fee)
                  }
                />
                <Item label="Requested window" value={d.requestedWindow || "Not specified"} />
                <Item label="Receiving hours" value={d.receivingHours || "Not provided"} />
                <Item label="Instructions" value={d.instructions || "None"} />
                <Item label="Scheduled date" value={d.scheduledDate} />
                <Item label="Eligibility note" value={d.eligibilityNote || "—"} />
              </dl>

              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery status
                  <Select
                    value={d.status}
                    onValueChange={(v) => updateDelivery(r.id, { status: v as DeliveryStatus })}
                  >
                    <SelectTrigger className="mt-2" aria-label={`Delivery status for ${r.reference}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Eligibility
                  <Select
                    value={d.eligibility}
                    onValueChange={(v) =>
                      updateDelivery(r.id, { eligibility: v as DeliveryEligibility })
                    }
                  >
                    <SelectTrigger className="mt-2" aria-label={`Eligibility for ${r.reference}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_ELIGIBILITY.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Courier / driver
                  <Input
                    className="mt-2"
                    placeholder="Unassigned"
                    value={d.courier}
                    onChange={(e) => updateDelivery(r.id, { courier: e.target.value })}
                  />
                </label>
                <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Oversize / freight
                  </span>
                  <Switch
                    checked={d.oversized}
                    onCheckedChange={(v) => updateDelivery(r.id, { oversized: v })}
                    aria-label={`Mark ${r.reference} oversize`}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <Truck className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-semibold">No delivery jobs on the board.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Commercial requests with a delivery method appear here once scheduled.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
