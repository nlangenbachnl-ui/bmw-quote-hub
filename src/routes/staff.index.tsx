import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { formatDate, useAdminState } from "@/lib/admin/store";
import { adminListAllPartsRequests, adminListProfiles } from "@/lib/wholesale/api";
import { formatDate as formatWholesaleDate } from "@/lib/wholesale/constants";

export const Route = createFileRoute("/staff/")({
  component: StaffQueue,
});

type Row = {
  key: string;
  reference: string;
  retail: string | null;
  wholesale: string | null;
  status: string;
  received: string;
  open: "retail" | "wholesale";
  id: string;
  closed: boolean;
};

function StaffQueue() {
  const { requests } = useAdminState();
  const [query, setQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  const wholesaleRequests = useQuery({
    queryKey: ["staff-wholesale-requests"],
    queryFn: adminListAllPartsRequests,
  });
  const profiles = useQuery({ queryKey: ["staff-wholesale-profiles"], queryFn: adminListProfiles });

  const companyByUser = useMemo(
    () => new Map((profiles.data ?? []).map((p) => [p.user_id, p.company_name])),
    [profiles.data],
  );

  const rows: Row[] = useMemo(() => {
    const retailRows: Row[] = requests.map((r) => ({
      key: `retail-${r.id}`,
      reference: r.reference,
      retail: `${r.customerName} · ${r.modelYear} ${r.bmwModel}`,
      wholesale: null,
      status: r.status,
      received: formatDate(r.submittedAt),
      open: "retail",
      id: r.id,
      closed: r.status === "Closed/Lost" || r.status === "Shipped",
    }));

    const wholesaleRows: Row[] = (wholesaleRequests.data ?? []).map((r) => ({
      key: `wholesale-${r.id}`,
      reference: r.reference_code,
      retail: null,
      wholesale:
        companyByUser.get(r.user_id) ??
        [r.model_year, r.model].filter(Boolean).join(" ") ??
        "Wholesale account",
      status: r.status.replace(/_/g, " "),
      received: formatWholesaleDate(r.created_at),
      open: "wholesale",
      id: r.id,
      closed: ["closed", "fulfilled", "cancelled"].includes(r.status),
    }));

    const q = query.trim().toLowerCase();
    return [...retailRows, ...wholesaleRows]
      .filter((row) => (showClosed ? true : !row.closed))
      .filter((row) =>
        q
          ? [row.reference, row.retail, row.wholesale, row.status]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [requests, wholesaleRequests.data, companyByUser, query, showClosed]);

  const incoming = rows.filter((r) => !r.closed).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Parts desk
        </p>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          {incoming} incoming {incoming === 1 ? "request" : "requests"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a request number to open it and build the quote.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search requests"
            placeholder="Search request #, customer, shop…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
          />
          Show closed/completed
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <caption className="sr-only">Combined retail and wholesale request queue</caption>
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Request #</th>
              <th scope="col" className="px-4 py-3 font-semibold">Retail</th>
              <th scope="col" className="px-4 py-3 font-semibold">Wholesale</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Received</th>
              <th scope="col" className="px-4 py-3 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  {row.open === "retail" ? (
                    <Link
                      to="/staff/requests/$id"
                      params={{ id: row.id }}
                      className="font-mono text-sm font-bold text-primary hover:underline"
                    >
                      {row.reference}
                    </Link>
                  ) : (
                    <Link
                      to="/staff/wholesale/$id"
                      params={{ id: row.id }}
                      className="font-mono text-sm font-bold text-primary hover:underline"
                    >
                      {row.reference}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">{row.retail ?? "—"}</td>
                <td className="px-4 py-3">{row.wholesale ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 capitalize">{row.status}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.received}</td>
                <td className="px-4 py-3">
                  {row.open === "retail" ? (
                    <Link
                      to="/staff/requests/$id"
                      params={{ id: row.id }}
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Open
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      to="/staff/wholesale/$id"
                      params={{ id: row.id }}
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Open
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {wholesaleRequests.isLoading ? "Loading the queue…" : "Nothing in the queue."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
