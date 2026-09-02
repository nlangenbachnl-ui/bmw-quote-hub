import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatMoney } from "@/lib/wholesale/constants";
import {
  adminCreateWholesaleQuote,
  adminListAllPartsRequests,
  adminListProfiles,
  adminListWholesaleQuotes,
} from "@/lib/wholesale/api";


type Line = {
  part_number: string;
  description: string;
  quantity: number;
  unit_price: number;
  availability: string;
};

const emptyLine: Line = {
  part_number: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  availability: "",
};

export function AdminWholesaleQuotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const profiles = useQuery({ queryKey: ["admin-wholesale-profiles"], queryFn: adminListProfiles });
  const quotes = useQuery({ queryKey: ["admin-wholesale-quotes"], queryFn: adminListWholesaleQuotes });
  const requests = useQuery({
    queryKey: ["admin-wholesale-requests"],
    queryFn: adminListAllPartsRequests,
  });

  const [userId, setUserId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [po, setPo] = useState("");
  const [shipping, setShipping] = useState(0);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);
  const [error, setError] = useState<string | null>(null);

  const approved = (profiles.data ?? []).filter((p) => p.status === "approved");
  const companyByUser = useMemo(
    () => new Map((profiles.data ?? []).map((p) => [p.user_id, p.company_name])),
    [profiles.data],
  );
  const eligibleRequests = (requests.data ?? []).filter((r) => !userId || r.user_id === userId);

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  const create = useMutation({
    mutationFn: () =>
      adminCreateWholesaleQuote({
        userId,
        createdBy: user!.id,
        requestId: requestId || null,
        poNumber: po.trim() || null,
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
    onSuccess: (data) => {
      toast.success(`Quote ${data.quote_number} sent to the shop's dashboard`);
      setLines([{ ...emptyLine }]);
      setPo("");
      setNotes("");
      setShipping(0);
      setRequestId("");
      queryClient.invalidateQueries({ queryKey: ["admin-wholesale-quotes"] });
    },
    onError: () => toast.error("We couldn't create that quote"),
  });

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-lg font-extrabold uppercase tracking-tight">Wholesale quotes</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Quotes created here are attached to the shop's authenticated wholesale account and appear
          in their dashboard with full OEM part numbers. Retail quotes stay on the separate,
          part-number-masked flow.
        </p>
      </header>

      <form
        className="space-y-6 rounded-xl border border-border bg-background p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!userId) return setError("Select an approved wholesale account");
          if (!lines.some((l) => l.description.trim()))
            return setError("Add at least one line with a description");
          setError(null);
          create.mutate();
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide">New quote</h2>

        {profiles.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading accounts…
          </p>
        ) : approved.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No approved wholesale accounts yet. Approve an application first and it will show up
            here.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="q-account">Wholesale account</Label>
            <select
              id="q-account"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setRequestId("");
              }}
            >
              <option value="">Select an approved account…</option>
              {approved.map((p) => (
                <option key={p.id} value={p.user_id}>
                  {p.company_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="q-request">Linked parts request (optional)</Label>
            <select
              id="q-request"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            >
              <option value="">Not linked</option>
              {eligibleRequests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reference_code} · {formatDate(r.created_at)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="q-po">PO / RO reference</Label>
            <Input id="q-po" className="mt-1.5" value={po} onChange={(e) => setPo(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="q-ship">Shipping</Label>
              <Input
                id="q-ship"
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="q-exp">Expires in (days)</Label>
              <Input
                id="q-exp"
                type="number"
                min={0}
                className="mt-1.5"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Lines</h3>
          <ul className="mt-4 space-y-3">
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
                  disabled={lines.length === 1}
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
            className="mt-4"
            onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add line
          </Button>
        </div>

        <div>
          <Label htmlFor="q-notes">Notes to the shop</Label>
          <Textarea
            id="q-notes"
            rows={3}
            className="mt-1.5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <p className="text-sm font-semibold">
          Subtotal {formatMoney(subtotal)} · Total{" "}
          {formatMoney(subtotal + (Number(shipping) || 0))}
        </p>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Send quote to account
        </Button>
      </form>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Issued quotes</h2>
        {quotes.isLoading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
          </p>
        ) : (quotes.data ?? []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No wholesale quotes issued yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(quotes.data ?? []).map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.quote_number}</TableCell>
                    <TableCell>{companyByUser.get(q.user_id) ?? "—"}</TableCell>
                    <TableCell>{q.po_number || "—"}</TableCell>
                    <TableCell>{q.wholesale_quote_lines.length}</TableCell>
                    <TableCell>{formatMoney(Number(q.total))}</TableCell>
                    <TableCell>{formatDate(q.expires_at)}</TableCell>
                    <TableCell className="capitalize">{q.status.replace(/_/g, " ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
