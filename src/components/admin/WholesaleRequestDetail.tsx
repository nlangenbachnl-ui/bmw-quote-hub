import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatMoney, formatVin } from "@/lib/wholesale/constants";
import {
  adminCreateWholesaleQuote,
  adminGetPartsRequest,
  adminListProfiles,
  adminListQuotesForRequest,
  adminUpdateRequestStatus,
} from "@/lib/wholesale/api";

const REQUEST_STATUSES = [
  "new",
  "in_review",
  "sourcing",
  "quoted",
  "ordered",
  "fulfilled",
  "closed",
] as const;

type Line = {
  part_number: string;
  description: string;
  quantity: number;
  unit_price: number;
  availability: string;
};

/**
 * Staff/admin detail view for one wholesale parts request. Everything needed to
 * price the request is loaded from the request itself, so nobody has to search
 * for the account or the request again.
 */
export function WholesaleRequestDetail({
  id,
  backTo,
}: {
  id: string;
  backTo: "/admin" | "/staff";
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const requestQuery = useQuery({
    queryKey: ["wholesale-request-detail", id],
    queryFn: () => adminGetPartsRequest(id),
  });
  const profiles = useQuery({ queryKey: ["admin-wholesale-profiles"], queryFn: adminListProfiles });
  const quotes = useQuery({
    queryKey: ["wholesale-request-quotes", id],
    queryFn: () => adminListQuotesForRequest(id),
  });

  const request = requestQuery.data ?? null;
  const shop = useMemo(
    () => (profiles.data ?? []).find((p) => p.user_id === request?.user_id) ?? null,
    [profiles.data, request?.user_id],
  );

  const [lines, setLines] = useState<Line[]>([]);
  const [shipping, setShipping] = useState(0);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Prefill the quote lines from what the shop actually asked for.
  useEffect(() => {
    if (seeded || !request) return;
    const items = request.wholesale_request_items ?? [];
    setLines(
      items.length
        ? items.map((item) => ({
            part_number: item.part_number ?? "",
            description: item.description,
            quantity: item.quantity,
            unit_price: 0,
            availability: "",
          }))
        : [{ part_number: "", description: "", quantity: 1, unit_price: 0, availability: "" }],
    );
    setSeeded(true);
  }, [request, seeded]);

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);
  const total = subtotal + (Number(shipping) || 0);

  const create = useMutation({
    mutationFn: () =>
      adminCreateWholesaleQuote({
        userId: request!.user_id,
        createdBy: user!.id,
        requestId: request!.id,
        poNumber: request!.po_number,
        shippingTotal: Number(shipping) || 0,
        expiresAt: expiresInDays
          ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
          : null,
        notes: notes.trim() || null,
        lines: lines
          .filter((l) => l.description.trim())
          .map((l) => ({
            part_number: l.part_number.trim() || null,
            description: l.description.trim(),
            quantity: Math.max(1, Number(l.quantity) || 1),
            unit_price: Number(l.unit_price) || 0,
            availability: l.availability.trim() || null,
          })),
      }),
    onSuccess: async (data) => {
      toast.success(`Quote ${data.quote_number} sent to ${shop?.company_name ?? "the shop"}`);
      await adminUpdateRequestStatus(id, "quoted").catch(() => null);
      queryClient.invalidateQueries({ queryKey: ["wholesale-request-quotes", id] });
      queryClient.invalidateQueries({ queryKey: ["wholesale-request-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["staff-wholesale-requests"] });
      setNotes("");
    },
    onError: () => toast.error("We couldn't create that quote"),
  });

  const setStatus = useMutation({
    mutationFn: (status: string) => adminUpdateRequestStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["wholesale-request-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["staff-wholesale-requests"] });
    },
    onError: () => toast.error("We couldn't update the status"),
  });

  if (requestQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading request…
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-16">
        <h1 className="text-xl font-extrabold uppercase tracking-tight">Request not found</h1>
        <Link to={backTo} className="mt-2 inline-block text-primary hover:underline">
          Back to the queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the queue
      </Link>

      <header className="rounded-xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Wholesale request
        </p>
        <h1 className="mt-2 font-mono text-2xl font-extrabold">{request.reference_code}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {shop?.company_name ?? "Wholesale account"}
          {shop?.contact_name ? ` · ${shop.contact_name}` : ""}
          {shop?.contact_phone ? ` · ${shop.contact_phone}` : ""}
        </p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">VIN</dt>
            <dd className="font-mono">{request.vin ? formatVin(request.vin) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</dt>
            <dd>{[request.model_year, request.model].filter(Boolean).join(" ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">PO / RO</dt>
            <dd>{request.po_number || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Received</dt>
            <dd>{formatDate(request.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Urgency</dt>
            <dd className="capitalize">{request.urgency.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Fulfillment</dt>
            <dd className="capitalize">{request.fulfillment_preference.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
            <dd>
              <select
                aria-label="Request status"
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                value={request.status}
                onChange={(e) => setStatus.mutate(e.target.value)}
              >
                {[...new Set([request.status, ...REQUEST_STATUSES])].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </dd>
          </div>
        </dl>
        {request.notes ? (
          <p className="mt-5 rounded-md bg-muted/60 p-4 text-sm">{request.notes}</p>
        ) : null}
      </header>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Parts requested</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
          {(request.wholesale_request_items ?? []).map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
              <span>
                {item.quantity} × {item.description}
              </span>
              {item.part_number ? (
                <span className="font-mono text-xs text-muted-foreground">{item.part_number}</span>
              ) : null}
            </li>
          ))}
          {(request.wholesale_request_items ?? []).length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              No itemised lines — see the notes and attachments.
            </li>
          ) : null}
        </ul>
      </section>

      <form
        className="space-y-6 rounded-xl border border-border bg-background p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lines.some((l) => l.description.trim()))
            return setError("Add at least one line with a description");
          setError(null);
          create.mutate();
        }}
      >
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Build the wholesale quote</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Lines are prefilled from this request. The quote is attached to{" "}
            {shop?.company_name ?? "this wholesale account"} and appears in their dashboard with
            full OEM part numbers.
          </p>
        </div>

        <ul className="space-y-3">
          {lines.map((line, index) => (
            <li key={index} className="grid gap-3 sm:grid-cols-[1fr_2fr_5rem_7rem_1fr_auto]">
              <Input
                aria-label={`Part number line ${index + 1}`}
                placeholder="OEM part number"
                value={line.part_number}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l, i) => (i === index ? { ...l, part_number: e.target.value } : l)),
                  )
                }
              />
              <Input
                aria-label={`Description line ${index + 1}`}
                placeholder="Description"
                value={line.description}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l, i) => (i === index ? { ...l, description: e.target.value } : l)),
                  )
                }
              />
              <Input
                aria-label={`Quantity line ${index + 1}`}
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l, i) =>
                      i === index ? { ...l, quantity: Number(e.target.value) } : l,
                    ),
                  )
                }
              />
              <Input
                aria-label={`Unit price line ${index + 1}`}
                type="number"
                min={0}
                step="0.01"
                value={line.unit_price}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l, i) =>
                      i === index ? { ...l, unit_price: Number(e.target.value) } : l,
                    ),
                  )
                }
              />
              <Input
                aria-label={`Availability line ${index + 1}`}
                placeholder="Availability"
                value={line.availability}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l, i) => (i === index ? { ...l, availability: e.target.value } : l)),
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove line ${index + 1}`}
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { part_number: "", description: "", quantity: 1, unit_price: 0, availability: "" },
            ])
          }
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add line
        </Button>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="wr-ship">Shipping</Label>
            <Input
              id="wr-ship"
              type="number"
              min={0}
              step="0.01"
              className="mt-1.5"
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="wr-exp">Expires in (days)</Label>
            <Input
              id="wr-exp"
              type="number"
              min={0}
              className="mt-1.5"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            />
          </div>
          <div className="rounded-md border border-border p-4 text-sm">
            <p className="text-muted-foreground">Subtotal {formatMoney(subtotal)}</p>
            <p className="mt-1 text-base font-extrabold">Total {formatMoney(total)}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="wr-notes">Notes to the shop</Label>
          <Textarea
            id="wr-notes"
            className="mt-1.5"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Send quote to shop
        </Button>
      </form>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Quotes on this request</h2>
        {quotes.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading quotes…</p>
        ) : (quotes.data ?? []).length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No quote issued yet for this request.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
            {(quotes.data ?? []).map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <span className="font-mono font-bold">{q.quote_number}</span>
                <span className="text-muted-foreground">
                  {q.wholesale_quote_lines.length} lines · {formatMoney(q.total)} ·{" "}
                  <span className="capitalize">{q.status.replace(/_/g, " ")}</span> ·{" "}
                  {formatDate(q.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
