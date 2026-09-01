import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeQuote, money } from "@/lib/admin/pricing";
import {
  updateShop,
  useAdminState,
  type CommercialAccount,
} from "@/lib/admin/store";

export const Route = createFileRoute("/admin/accounts")({
  component: CommercialAccounts,
});

const ACCOUNT_STATUS_TONE: Record<CommercialAccount["status"], string> = {
  Active: "bg-emerald-100 text-emerald-800",
  "Pending review": "bg-amber-100 text-amber-800",
  "On hold": "bg-destructive/10 text-destructive",
};

function CommercialAccounts() {
  const { shops, requests, settings } = useAdminState();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops
      .filter((s) =>
        q ? [s.shopName, s.contactName, s.email, s.phone, s.billingAddress].join(" ").toLowerCase().includes(q) : true,
      )
      .map((shop) => {
        const mine = requests.filter((r) => r.shopId === shop.id);
        const orders = mine.filter((r) =>
          ["Paid", "Ordered", "Shipped", "Accepted"].includes(r.status),
        );
        const volume = orders.reduce(
          (t, r) =>
            t +
            computeQuote(r.lines, settings, r.delivery ? { type: r.delivery.type } : undefined)
              .grandTotal,
          0,
        );
        return { shop, quoteCount: mine.length, orderCount: orders.length, volume };
      });
  }, [shops, requests, settings, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Commercial accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Repair and body shop accounts, their addresses, and their quote/order volume.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="Search accounts"
          placeholder="Search shop, contact, email…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {rows.map(({ shop, quoteCount, orderCount, volume }) => (
          <article key={shop.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold uppercase tracking-tight">{shop.shopName}</h2>
                  <Badge className={`${ACCOUNT_STATUS_TONE[shop.status]} border-transparent`}>
                    {shop.status}
                  </Badge>
                  <Badge className="border-transparent bg-muted text-muted-foreground">
                    Resale: {shop.resaleStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shop.contactName} · {shop.email} · {shop.phone} · Prefers {shop.preferredContact}
                </p>
              </div>
              <Link
                to="/admin"
                search={{}}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View requests
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Item label="Billing address" value={shop.billingAddress} />
              <Item label="Delivery address" value={shop.deliveryAddress} />
              <Item label="Receiving hours" value={shop.receivingHours} />
              <Item
                label="Volume"
                value={`${quoteCount} quotes · ${orderCount} orders · ${money(volume)}`}
              />
            </dl>

            <div className="mt-5 grid gap-4 border-t border-border pt-5 lg:grid-cols-[14rem_1fr]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account status
                <Select
                  value={shop.status}
                  onValueChange={(v) =>
                    updateShop(shop.id, { status: v as CommercialAccount["status"] })
                  }
                >
                  <SelectTrigger className="mt-2" aria-label={`Status for ${shop.shopName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Active", "Pending review", "On hold"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account notes
                <Textarea
                  className="mt-2 text-sm font-normal normal-case tracking-normal"
                  value={shop.notes}
                  onChange={(e) => updateShop(shop.id, { notes: e.target.value })}
                />
              </label>
            </div>
          </article>
        ))}

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No accounts match that search.
          </p>
        ) : null}
      </div>
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
