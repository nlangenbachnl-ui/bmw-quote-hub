import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import {
  adminGetApplication,
  adminListEvents,
  adminUpdateApplication,
  signedDocumentUrl,
} from "@/lib/wholesale/api";
import {
  BUSINESS_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  TIER_LABELS,
  formatDate,
  statusBadgeClass,
  type WholesaleStatus,
  type WholesaleTier,
} from "@/lib/wholesale/constants";
import { AdminOnlyNotice } from "./admin.wholesale-applications";

export const Route = createFileRoute("/admin/wholesale-applications/$id")({
  head: () => ({
    meta: [
      { title: "Review Wholesale Application — Precision Bimmer Parts" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ApplicationDetail,
});

type PendingAction =
  | { kind: "approve" }
  | { kind: "deny" }
  | { kind: "more_info" }
  | { kind: "status"; status: WholesaleStatus }
  | { kind: "tier"; tier: WholesaleTier }
  | null;

function ApplicationDetail() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);

  const appQuery = useQuery({
    queryKey: ["admin-wholesale-application", id],
    enabled: isAdmin.data === true,
    queryFn: () => adminGetApplication(id),
  });
  const eventsQuery = useQuery({
    queryKey: ["admin-wholesale-events", id],
    enabled: isAdmin.data === true,
    queryFn: () => adminListEvents(id),
  });

  const mutate = useMutation({
    mutationFn: async (action: Exclude<PendingAction, null> | { kind: "note" }) => {
      const application = appQuery.data!;
      const base = { application, actorId: user!.id, note: note.trim() || undefined };
      switch (action.kind) {
        case "approve":
          return adminUpdateApplication({
            ...base,
            status: "approved",
            tier: application.tier ?? "standard",
            eventType: "approved",
          });
        case "deny":
          return adminUpdateApplication({ ...base, status: "denied", eventType: "denied" });
        case "more_info":
          return adminUpdateApplication({
            ...base,
            status: "more_info_requested",
            eventType: "more_info_requested",
          });
        case "status":
          return adminUpdateApplication({ ...base, status: action.status });
        case "tier":
          return adminUpdateApplication({ ...base, tier: action.tier, eventType: "tier_change" });
        default:
          return adminUpdateApplication({ ...base, eventType: "note" });
      }
    },
    onSuccess: () => {
      toast.success("Application updated");
      setNote("");
      setPending(null);
      queryClient.invalidateQueries({ queryKey: ["admin-wholesale-application", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-wholesale-events", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-wholesale-applications"] });
    },
    onError: () => {
      setPending(null);
      toast.error("We couldn't apply that change");
    },
  });

  if (loading || isAdmin.isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!user || isAdmin.data !== true) return <AdminOnlyNotice signedIn={Boolean(user)} />;

  if (appQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading application…
      </div>
    );
  }

  const app = appQuery.data;
  if (!app) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">That application no longer exists.</p>
        <Link
          to="/admin/wholesale-applications"
          className="mt-4 inline-block font-semibold text-primary hover:underline"
        >
          Back to queue
        </Link>
      </div>
    );
  }

  async function openDocument(path: string) {
    try {
      const url = await signedDocumentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("We couldn't open that document");
    }
  }

  const shipping = app.shipping_same_as_billing
    ? "Same as billing"
    : [
        app.shipping_address_line1,
        app.shipping_address_line2,
        [app.shipping_city, app.shipping_state, app.shipping_postal_code].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className="space-y-8">
      <Link
        to="/admin/wholesale-applications"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to queue
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{app.reference_code}</p>
          <h1 className="mt-1 text-2xl font-extrabold uppercase tracking-tight">
            {app.legal_business_name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitted {formatDate(app.created_at)}
            {app.reviewed_at ? ` · last reviewed ${formatDate(app.reviewed_at)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusBadgeClass(app.status)}`}
          >
            {STATUS_LABELS[app.status]}
          </span>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {app.tier ? `${TIER_LABELS[app.tier]} tier` : "No tier assigned"}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Business">
            <Row label="Legal name" value={app.legal_business_name} />
            <Row label="DBA" value={app.dba_name} />
            <Row label="Business type" value={BUSINESS_TYPE_LABELS[app.business_type]} />
            <Row label="EIN / tax ID" value={app.tax_id} mono />
            <Row label="Website" value={app.website} />
            <Row label="Years in business" value={app.years_in_business} />
            <Row label="Monthly spend estimate" value={app.monthly_spend_estimate} />
            <Row label="Brands serviced" value={app.brands_serviced} />
            <Row label="BMW / MINI specialist" value={app.bmw_mini_specialist ? "Yes" : "No"} />
          </Card>

          <Card title="Contact">
            <Row label="Applicant" value={app.contact_name} />
            <Row label="Job title" value={app.job_title} />
            <Row label="Email" value={app.business_email} />
            <Row label="Phone" value={app.business_phone} />
            <Row label="Preferred contact" value={app.preferred_contact_method} />
          </Card>

          <Card title="Addresses">
            <Row
              label="Billing"
              value={[
                app.billing_address_line1,
                app.billing_address_line2,
                [app.billing_city, app.billing_state, app.billing_postal_code]
                  .filter(Boolean)
                  .join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            <Row label="Shipping" value={shipping} />
          </Card>

          <Card title="Tax exemption & notes">
            <Row
              label="Tax-exempt requested"
              value={app.tax_exempt_requested ? "Yes" : "No"}
            />
            <div className="py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Resale certificate
              </p>
              {app.resale_certificate_path ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => openDocument(app.resale_certificate_path!)}
                >
                  <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                  Open secure document
                </Button>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">No document uploaded</p>
              )}
            </div>
            <Row label="Additional notes" value={app.additional_notes} />
            <Row
              label="Certifications"
              value={`Accuracy certified: ${app.certified_accurate ? "yes" : "no"} · Terms agreed: ${app.agreed_to_terms ? "yes" : "no"}`}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Review actions">
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="admin-note">Internal note (staff only)</Label>
                <Textarea
                  id="admin-note"
                  rows={3}
                  className="mt-1.5"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Context for the team — never shown to the applicant."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setPending({ kind: "approve" })}>Approve</Button>
                <Button variant="outline" onClick={() => setPending({ kind: "more_info" })}>
                  Request more info
                </Button>
                <Button variant="destructive" onClick={() => setPending({ kind: "deny" })}>
                  Deny
                </Button>
                <Button
                  variant="outline"
                  disabled={!note.trim() || mutate.isPending}
                  onClick={() => mutate.mutate({ kind: "note" })}
                >
                  Add note only
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="set-status">Change status</Label>
                  <select
                    id="set-status"
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={app.status}
                    onChange={(e) =>
                      setPending({ kind: "status", status: e.target.value as WholesaleStatus })
                    }
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="set-tier">Wholesale tier</Label>
                  <select
                    id="set-tier"
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={app.tier ?? ""}
                    onChange={(e) =>
                      setPending({ kind: "tier", tier: e.target.value as WholesaleTier })
                    }
                  >
                    <option value="" disabled>
                      Not assigned
                    </option>
                    {Object.entries(TIER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Status history">
            {eventsQuery.isLoading ? (
              <p className="py-2 text-sm text-muted-foreground">Loading history…</p>
            ) : (eventsQuery.data ?? []).length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-4 py-2">
                {(eventsQuery.data ?? []).map((event) => (
                  <li key={event.id} className="border-l-2 border-border pl-4">
                    <p className="text-sm font-semibold capitalize">
                      {event.event_type.replace(/_/g, " ")}
                      {event.to_status ? ` → ${STATUS_LABELS[event.to_status]}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.created_at)}</p>
                    {event.note ? <p className="mt-1 text-sm">{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "approve"
                ? "Approve this wholesale account?"
                : pending?.kind === "deny"
                  ? "Deny this application?"
                  : pending?.kind === "more_info"
                    ? "Request more information?"
                    : pending?.kind === "tier"
                      ? "Change wholesale tier?"
                      : "Change application status?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === "approve"
                ? "Approving unlocks the wholesale dashboard and tier pricing for the linked account."
                : pending?.kind === "deny"
                  ? "The applicant will see a denied status instead of wholesale pricing."
                  : "This is recorded in the application's status history with your internal note."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pending && mutate.mutate(pending)}
              disabled={mutate.isPending}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 py-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}
