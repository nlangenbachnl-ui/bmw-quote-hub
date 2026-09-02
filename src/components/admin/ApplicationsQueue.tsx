import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { adminListApplications } from "@/lib/wholesale/api";
import { AdminOnlyNotice } from "@/components/wholesale/AdminOnlyNotice";
import {
  BUSINESS_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  TIER_LABELS,
  formatDate,
  statusBadgeClass,
} from "@/lib/wholesale/constants";


export function WholesaleApplicationsQueue() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [status, setStatus] = useState("all");
  const [businessType, setBusinessType] = useState("all");
  const [taxExempt, setTaxExempt] = useState("all");
  const [since, setSince] = useState("");
  const [search, setSearch] = useState("");

  const applications = useQuery({
    queryKey: ["admin-wholesale-applications"],
    enabled: isAdmin.data === true,
    queryFn: adminListApplications,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (applications.data ?? []).filter((app) => {
      if (status !== "all" && app.status !== status) return false;
      if (businessType !== "all" && app.business_type !== businessType) return false;
      if (taxExempt !== "all" && String(app.tax_exempt_requested) !== taxExempt) return false;
      if (since && new Date(app.created_at) < new Date(since)) return false;
      if (
        q &&
        ![app.legal_business_name, app.dba_name, app.contact_name, app.business_email, app.reference_code]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [applications.data, status, businessType, taxExempt, since, search]);

  if (loading || isAdmin.isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!user || isAdmin.data !== true) {
    return <AdminOnlyNotice signedIn={Boolean(user)} />;
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">
            Wholesale applications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length} of {applications.data?.length ?? 0} applications
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label htmlFor="f-search">Search</Label>
          <Input
            id="f-search"
            className="mt-1.5"
            placeholder="Business, contact, reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="f-status">Status</Label>
          <select
            id="f-status"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="f-type">Business type</Label>
          <select
            id="f-type"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="all">All types</option>
            {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="f-tax">Tax-exempt request</Label>
          <select
            id="f-tax"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={taxExempt}
            onChange={(e) => setTaxExempt(e.target.value)}
          >
            <option value="all">Any</option>
            <option value="true">Requested</option>
            <option value="false">Not requested</option>
          </select>
        </div>
        <div>
          <Label htmlFor="f-since">Submitted on or after</Label>
          <Input
            id="f-since"
            type="date"
            className="mt-1.5"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
        </div>
      </div>

      {applications.isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading applications…
        </div>
      ) : applications.isError ? (
        <p role="alert" className="mt-8 text-sm font-medium text-destructive">
          We couldn't load applications. Refresh and try again.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No applications match these filters.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tax-exempt</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-xs">{app.reference_code}</TableCell>
                  <TableCell className="font-semibold">
                    {app.legal_business_name}
                    {app.dba_name ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        dba {app.dba_name}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {app.contact_name}
                    <span className="block text-xs text-muted-foreground">{app.business_email}</span>
                  </TableCell>
                  <TableCell>{BUSINESS_TYPE_LABELS[app.business_type]}</TableCell>
                  <TableCell>{app.tax_exempt_requested ? "Requested" : "—"}</TableCell>
                  <TableCell>{app.tier ? TIER_LABELS[app.tier] : "—"}</TableCell>
                  <TableCell>{formatDate(app.created_at)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(app.status)}`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/wholesale-applications/$id"
                      params={{ id: app.id }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
