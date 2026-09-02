import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Car,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Truck,
  UserCog,
} from "lucide-react";
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
import { signOut, useAuth } from "@/hooks/useAuth";
import {
  BUSINESS_TYPE_LABELS,
  FULFILLMENT_OPTIONS,
  STATUS_LABELS,
  TIER_LABELS,
  URGENCY_OPTIONS,
  formatDate,
  formatMoney,
  formatVin,
} from "@/lib/wholesale/constants";
import type { BusinessType } from "@/lib/wholesale/constants";
import {
  fetchMyAccountProfile,
  isAccountProfileComplete,
  saveMyAccountProfile,
  type AccountProfile,
} from "@/lib/account/api";
import {
  claimApplication,
  deleteVehicle,
  fetchMyApplications,
  fetchMyInvoices,
  fetchMyOrders,
  fetchMyProfile,
  fetchMyRequests,
  fetchMyWholesaleQuotes,
  fetchTierPricing,
  fetchVehicles,
  saveVehicle,
  signedCustomerFileUrl,
  submitPartsRequest,
  updateMyProfile,
  uploadWholesaleFile,
  type Vehicle,
} from "@/lib/wholesale/api";

export const Route = createFileRoute("/_authenticated/wholesale/dashboard")({
  head: () => ({
    meta: [
      { title: "Wholesale Dashboard | Precision Bimmer Parts" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WholesaleDashboard,
});

type TabKey =
  | "overview"
  | "request"
  | "requests"
  | "quotes"
  | "orders"
  | "invoices"
  | "vehicles"
  | "account";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Boxes }> = [
  { key: "overview", label: "Overview", icon: Boxes },
  { key: "request", label: "New parts request", icon: Plus },
  { key: "requests", label: "Requests", icon: ClipboardList },
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "vehicles", label: "Saved vehicles / VINs", icon: Car },
  { key: "account", label: "Account", icon: UserCog },
];


function WholesaleDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tab, setTab] = useState<TabKey>("overview");

  const accountQuery = useQuery({
    queryKey: ["account-profile", userId],
    enabled: Boolean(userId),
    queryFn: fetchMyAccountProfile,
  });
  const profileQuery = useQuery({
    queryKey: ["wholesale-profile", userId],
    enabled: Boolean(userId),
    queryFn: fetchMyProfile,
  });
  const applicationsQuery = useQuery({
    queryKey: ["wholesale-my-applications", userId],
    enabled: Boolean(userId),
    queryFn: fetchMyApplications,
  });

  const profile = profileQuery.data ?? null;
  const account = accountQuery.data ?? null;
  const approved = profile?.status === "approved";

  if (profileQuery.isLoading || applicationsQuery.isLoading || accountQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  // One-time top-up for accounts created before we collected business details.
  if (!isAccountProfileComplete(account)) {
    return <CompleteProfileScreen userId={userId!} email={user?.email ?? ""} account={account} />;
  }

  if (!approved) {
    return (
      <StatusScreen
        status={profile?.status ?? applicationsQuery.data?.[0]?.status ?? null}
        reference={applicationsQuery.data?.[0]?.reference_code ?? null}
        hasApplication={Boolean(profile) || (applicationsQuery.data?.length ?? 0) > 0}
        account={account}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Wholesale dashboard
          </p>
          <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {profile?.company_name ?? account?.business_name ?? "Your shop"}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              {TIER_LABELS[profile!.tier ?? "standard"]} tier
            </span>
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Approved
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </header>

      <nav
        className="sticky top-16 z-30 -mx-4 mt-6 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
        aria-label="Dashboard sections"
      >
        <div className="flex min-w-max gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-8">
        {tab === "overview" ? <Overview account={account} onNavigate={setTab} /> : null}
        {tab === "vehicles" ? <VehiclesPanel userId={userId!} /> : null}
        {tab === "request" ? (
          <RequestPanel userId={userId!} onDone={() => setTab("requests")} />
        ) : null}
        {tab === "requests" ? <HistoryPanel only="requests" /> : null}
        {tab === "orders" ? <HistoryPanel only="orders" /> : null}
        {tab === "quotes" ? <QuotesPanel /> : null}
        {tab === "invoices" ? <InvoicesPanel /> : null}
        {tab === "account" ? <AccountPanel userId={userId!} account={account} /> : null}
      </div>
    </div>
  );
}

function CompleteProfileScreen({
  userId,
  email,
  account,
}: {
  userId: string;
  email: string;
  account: AccountProfile | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: account?.full_name ?? "",
    business_name: account?.business_name ?? "",
    phone: account?.phone ?? "",
    business_type: (account?.business_type ?? "") as BusinessType | "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      saveMyAccountProfile(userId, {
        ...form,
        business_email: account?.business_email || email,
      }),
    onSuccess: () => {
      toast.success("Business profile saved");
      queryClient.invalidateQueries({ queryKey: ["account-profile"] });
    },
    onError: () => toast.error("We couldn't save your profile"),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
        Complete your business profile
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We ask for these details once. They prefill your wholesale application and every parts
        request, so you never re-type them.
      </p>
      <form
        className="mt-8 space-y-4 rounded-xl border border-border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.full_name.trim().length < 2) return setError("Enter your full name.");
          if (form.business_name.trim().length < 2) return setError("Enter your business name.");
          if (form.phone.trim().length < 7) return setError("Enter a reachable business phone.");
          if (!form.business_type) return setError("Select your business type.");
          setError(null);
          save.mutate();
        }}
      >
        <div>
          <Label htmlFor="cp-name">Contact name</Label>
          <Input
            id="cp-name"
            className="mt-1.5"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cp-business">Legal / business name</Label>
          <Input
            id="cp-business"
            className="mt-1.5"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cp-phone">Business phone</Label>
          <Input
            id="cp-phone"
            type="tel"
            className="mt-1.5"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cp-type">Business type</Label>
          <select
            id="cp-type"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.business_type}
            onChange={(e) =>
              setForm({ ...form, business_type: e.target.value as BusinessType | "" })
            }
          >
            <option value="">Select…</option>
            {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="cp-email">Account email</Label>
          <Input
            id="cp-email"
            className="mt-1.5"
            value={account?.business_email || email}
            readOnly
            aria-describedby="cp-email-help"
          />
          <p id="cp-email-help" className="mt-1.5 text-xs text-muted-foreground">
            This is your sign-in email. Contact us to change it.
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Save and continue
        </Button>
      </form>
    </div>
  );
}


function StatusScreen({
  status,
  hasApplication,
  reference,
  account,
}: {
  status: string | null;
  hasApplication: boolean;
  reference: string | null;
  account: AccountProfile | null;
}) {
  const queryClient = useQueryClient();
  const [claimRef, setClaimRef] = useState("");

  const claim = useMutation({
    mutationFn: () => claimApplication(claimRef.trim().toUpperCase()),

    onSuccess: () => {
      toast.success("Application linked to your account");
      queryClient.invalidateQueries({ queryKey: ["wholesale-profile"] });
      queryClient.invalidateQueries({ queryKey: ["wholesale-my-applications"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? "We couldn't find a matching application for that reference and email."
          : "Something went wrong",
      ),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
        {hasApplication ? "Application in review" : "No wholesale account yet"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {hasApplication
          ? `Your application status is "${status ? (STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status) : "pending"}". Wholesale pricing and ordering unlock once our team approves the account. We'll reach out if we need anything else.`
          : "Wholesale pricing and shop ordering require an approved account. Submit an application and we'll review it, usually within one business day."}
      </p>

      {hasApplication && reference ? (
        <p className="mt-4 text-sm">
          Reference{" "}
          <span className="font-mono font-bold">{reference}</span> — keep this for any follow-up with
          our wholesale desk.
        </p>
      ) : null}
      {account ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Account on file: {account.business_name} · {account.business_email}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/wholesale/apply"
          className="rounded-md bg-gradient-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
        >
          {hasApplication ? "Submit another application" : "Apply for wholesale"}
        </Link>
        <Link
          to="/request-quote"
          className="rounded-md border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide"
        >
          Request a standard quote
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          Already applied before creating this account?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the reference number from your application confirmation. It links only when the
          application's business email matches your sign-in email.
        </p>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (claimRef.trim().length < 4) {
              toast.error("Enter your application reference number");
              return;
            }
            claim.mutate();
          }}
        >
          <Input
            aria-label="Application reference number"
            placeholder="WS-XXXXXX"
            value={claimRef}
            onChange={(e) => setClaimRef(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" disabled={claim.isPending}>
            {claim.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Link application
          </Button>
        </form>
      </div>
    </div>
  );
}

function Overview({
  account,
  onNavigate,
}: {
  account: AccountProfile | null;
  onNavigate: (tab: TabKey) => void;
}) {
  const requests = useQuery({ queryKey: ["wholesale-requests"], queryFn: fetchMyRequests });
  const orders = useQuery({ queryKey: ["wholesale-orders"], queryFn: fetchMyOrders });
  const pricing = useQuery({ queryKey: ["wholesale-tier-pricing"], queryFn: fetchTierPricing });
  const profile = useQuery({ queryKey: ["wholesale-profile-overview"], queryFn: fetchMyProfile });

  const tier = profile.data?.tier ?? "standard";
  const tierRow = pricing.data?.find((row) => row.tier === tier);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Account identity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {account?.business_name ?? "Business name on file"} · {account?.full_name ?? "Contact"} ·{" "}
          {account?.business_email ?? ""}
          {account?.phone ? ` · ${account.phone}` : ""}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open requests" value={String(
          (requests.data ?? []).filter((r) => !["closed", "fulfilled"].includes(r.status)).length,
        )} />
        <Stat label="Orders on file" value={String((orders.data ?? []).length)} />
        <Stat label="Saved tier" value={TIER_LABELS[tier]} />
      </div>

      <section className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Your account pricing</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Quotes we build for your shop are priced using your{" "}
          <strong className="text-foreground">{TIER_LABELS[tier]}</strong> tier.
          {tierRow?.discount_percent
            ? ` Current configured tier adjustment: ${tierRow.discount_percent}%${tierRow.is_sample ? " (sample value set by our team, not final)" : ""}.`
            : " Your tier discount has not been configured yet, so quotes are priced at standard wholesale until our team sets it."}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => onNavigate("request")}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New parts request
          </Button>
          <Button variant="outline" onClick={() => onNavigate("vehicles")}>
            <Car className="mr-2 h-4 w-4" aria-hidden="true" />
            Manage saved VINs
          </Button>
          <Button variant="outline" onClick={() => onNavigate("requests")}>
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            View history
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Recent requests</h2>
        {requests.isLoading ? (
          <PanelLoading />
        ) : (requests.data ?? []).length === 0 ? (
          <Empty>
            No parts requests yet. Submit your first request and it will appear here with its
            reference number and status.
          </Empty>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(requests.data ?? []).slice(0, 5).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.reference_code}</TableCell>
                    <TableCell>{r.po_number || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.vin || "—"}</TableCell>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell className="capitalize">{r.status.replace(/_/g, " ")}</TableCell>
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

function VehiclesPanel({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const vehicles = useQuery({ queryKey: ["wholesale-vehicles"], queryFn: fetchVehicles });
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    nickname: "",
    vin: "",
    model_year: "",
    model: "",
    chassis_notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      saveVehicle(userId, {
        ...(editing ? { id: editing.id } : {}),
        nickname: form.nickname.trim(),
        vin: form.vin,
        model_year: form.model_year.trim() || null,
        model: form.model.trim() || null,
        chassis_notes: form.chassis_notes.trim() || null,
      }),
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated" : "Vehicle saved");
      setEditing(null);
      setForm({ nickname: "", vin: "", model_year: "", model: "", chassis_notes: "" });
      queryClient.invalidateQueries({ queryKey: ["wholesale-vehicles"] });
    },
    onError: () => toast.error("We couldn't save that vehicle"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle removed");
      queryClient.invalidateQueries({ queryKey: ["wholesale-vehicles"] });
    },
    onError: () => toast.error("We couldn't remove that vehicle"),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form
        className="rounded-xl border border-border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.nickname.trim().length < 2) {
            setError("Give the vehicle a nickname");
            return;
          }
          if (form.vin.length !== 17) {
            setError("VIN must be exactly 17 characters");
            return;
          }
          setError(null);
          save.mutate();
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {editing ? "Edit vehicle" : "Add a vehicle"}
        </h2>
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="v-nick">Nickname</Label>
            <Input
              id="v-nick"
              className="mt-1.5"
              value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="v-vin">VIN (17 characters)</Label>
            <Input
              id="v-vin"
              className="mt-1.5 font-mono uppercase"
              value={form.vin}
              onChange={(e) => setForm((f) => ({ ...f, vin: formatVin(e.target.value) }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">{form.vin.length}/17</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="v-year">Year</Label>
              <Input
                id="v-year"
                className="mt-1.5"
                value={form.model_year}
                onChange={(e) => setForm((f) => ({ ...f, model_year: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="v-model">Model</Label>
              <Input
                id="v-model"
                className="mt-1.5"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="v-notes">Chassis / body notes</Label>
            <Textarea
              id="v-notes"
              rows={3}
              className="mt-1.5"
              value={form.chassis_notes}
              onChange={(e) => setForm((f) => ({ ...f, chassis_notes: e.target.value }))}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {editing ? "Save changes" : "Add vehicle"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setForm({ nickname: "", vin: "", model_year: "", model: "", chassis_notes: "" });
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide">Saved vehicles</h2>
        {vehicles.isLoading ? (
          <PanelLoading />
        ) : (vehicles.data ?? []).length === 0 ? (
          <Empty>No saved vehicles yet. Add the VINs you work on most to speed up requests.</Empty>
        ) : (
          <ul className="mt-4 space-y-3">
            {(vehicles.data ?? []).map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-bold">{v.nickname}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{v.vin}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[v.model_year, v.model].filter(Boolean).join(" ") || "Vehicle details not set"}
                  </p>
                  {v.chassis_notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">{v.chassis_notes}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(v);
                      setForm({
                        nickname: v.nickname,
                        vin: v.vin,
                        model_year: v.model_year ?? "",
                        model: v.model ?? "",
                        chassis_notes: v.chassis_notes ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Remove ${v.nickname}`}
                    onClick={() => remove.mutate(v.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type LineItem = { part_number: string; description: string; quantity: number };

function RequestPanel({ userId, onDone }: { userId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const vehicles = useQuery({ queryKey: ["wholesale-vehicles"], queryFn: fetchVehicles });
  const [vehicleId, setVehicleId] = useState("");
  const [vin, setVin] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [model, setModel] = useState("");
  const [po, setPo] = useState("");
  const [urgency, setUrgency] = useState<string>("standard");
  const [fulfillment, setFulfillment] = useState<string>("shipping");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<LineItem[]>([
    { part_number: "", description: "", quantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      const paths: string[] = [];
      for (const file of files) {
        paths.push(await uploadWholesaleFile(userId, file));
      }
      return submitPartsRequest(
        userId,
        {
          vehicle_id: vehicleId || null,
          vin: vehicleId ? null : vin || null,
          model_year: modelYear.trim() || null,
          model: model.trim() || null,
          po_number: po.trim() || null,
          urgency,
          fulfillment_preference: fulfillment,
          notes: notes.trim() || null,
          attachment_paths: paths,
        },
        items
          .filter((item) => item.description.trim())
          .map((item) => ({
            part_number: item.part_number.trim() || null,
            description: item.description.trim(),
            quantity: Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1,
          })),
      );
    },
    onSuccess: (data) => {
      setReference(data.reference_code);
      queryClient.invalidateQueries({ queryKey: ["wholesale-requests"] });
      toast.success("Parts request submitted");
    },
    onError: () => toast.error("We couldn't submit the request. Try again."),
  });

  if (reference) {
    return (
      <div className="rounded-xl border border-border p-8">
        <h2 className="text-xl font-extrabold uppercase tracking-tight">Request submitted</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Our team is verifying fitment and will follow up with a priced quote.
        </p>
        <p className="mt-5 font-mono text-lg font-bold">{reference}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={onDone}>View request history</Button>
          <Button
            variant="outline"
            onClick={() => {
              setReference(null);
              setItems([{ part_number: "", description: "", quantity: 1 }]);
              setNotes("");
              setPo("");
              setFiles([]);
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!vehicleId && vin.length !== 17) {
          setError("Select a saved vehicle or enter a full 17-character VIN");
          return;
        }
        if (!items.some((item) => item.description.trim())) {
          setError("Add at least one part line with a description");
          return;
        }
        setError(null);
        submit.mutate();
      }}
    >
      <section className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Vehicle</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="r-vehicle">Saved vehicle</Label>
            <select
              id="r-vehicle"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">Enter a VIN manually…</option>
              {(vehicles.data ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname} — {v.vin}
                </option>
              ))}
            </select>
          </div>
          {!vehicleId ? (
            <div>
              <Label htmlFor="r-vin">VIN</Label>
              <Input
                id="r-vin"
                className="mt-1.5 font-mono uppercase"
                value={vin}
                onChange={(e) => setVin(formatVin(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">{vin.length}/17</p>
            </div>
          ) : null}
          <div>
            <Label htmlFor="r-year">Year (optional)</Label>
            <Input
              id="r-year"
              className="mt-1.5"
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="r-model">Model (optional)</Label>
            <Input
              id="r-model"
              className="mt-1.5"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Job details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="r-po">PO / reference number</Label>
            <Input id="r-po" className="mt-1.5" value={po} onChange={(e) => setPo(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-urgency">Urgency</Label>
            <select
              id="r-urgency"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              {URGENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="r-fulfill">Delivery preference</Label>
            <select
              id="r-fulfill"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value)}
            >
              {FULFILLMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide">Parts needed</h2>
        <ul className="mt-5 space-y-4">
          {items.map((item, index) => (
            <li key={index} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto]">
              <div>
                <Label htmlFor={`p-num-${index}`} className="sr-only">
                  Part number
                </Label>
                <Input
                  id={`p-num-${index}`}
                  placeholder="Part number (optional)"
                  value={item.part_number}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((it, i) => (i === index ? { ...it, part_number: e.target.value } : it)),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor={`p-desc-${index}`} className="sr-only">
                  Description
                </Label>
                <Input
                  id={`p-desc-${index}`}
                  placeholder="Description, e.g. front left control arm"
                  value={item.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((it, i) => (i === index ? { ...it, description: e.target.value } : it)),
                    )
                  }
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`p-qty-${index}`} className="sr-only">
                  Quantity
                </Label>
                <Input
                  id={`p-qty-${index}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((it, i) =>
                        i === index ? { ...it, quantity: Number(e.target.value) } : it,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove part line ${index + 1}`}
                disabled={items.length === 1}
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
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
          onClick={() =>
            setItems((prev) => [...prev, { part_number: "", description: "", quantity: 1 }])
          }
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add part line
        </Button>

        <div className="mt-6">
          <Label htmlFor="r-notes">Notes</Label>
          <Textarea
            id="r-notes"
            rows={4}
            className="mt-1.5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <Label htmlFor="r-files">Photos or estimate files</Label>
          <Input
            id="r-files"
            type="file"
            multiple
            accept="application/pdf,image/*"
            className="mt-1.5"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 8))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Up to 8 files, stored privately with your account.
          </p>
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={submit.isPending}>
        {submit.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        Submit parts request
      </Button>
    </form>
  );
}

function HistoryPanel({ only }: { only: "requests" | "orders" }) {
  const requests = useQuery({
    queryKey: ["wholesale-requests"],
    queryFn: fetchMyRequests,
    enabled: only === "requests",
  });
  const orders = useQuery({
    queryKey: ["wholesale-orders"],
    queryFn: fetchMyOrders,
    enabled: only === "orders",
  });
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests.data ?? [];
    return (requests.data ?? []).filter((r) =>
      [r.reference_code, r.po_number, r.vin, r.model, r.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [requests.data, search]);

  return (
    <div className="space-y-10">
      {only === "requests" ? (
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Parts requests</h2>
          <Input
            aria-label="Search requests"
            placeholder="Search reference, PO, VIN…"
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {requests.isLoading ? (
          <PanelLoading />
        ) : filtered.length === 0 ? (
          <Empty>No requests match. Submitted requests show up here with their status.</Empty>
        ) : (
          <ul className="mt-4 space-y-3">
            {filtered.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-4">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                  aria-expanded={openId === r.id}
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                >
                  <span>
                    <span className="font-mono text-sm font-bold">{r.reference_code}</span>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    {r.po_number ? (
                      <span className="text-muted-foreground">PO {r.po_number}</span>
                    ) : null}
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide capitalize">
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </span>
                </button>
                {openId === r.id ? (
                  <div className="mt-4 border-t border-border pt-4 text-sm">
                    <p className="text-muted-foreground">
                      VIN <span className="font-mono">{r.vin || "from saved vehicle"}</span> ·{" "}
                      {[r.model_year, r.model].filter(Boolean).join(" ") || "vehicle details on file"}{" "}
                      · urgency {r.urgency.replace(/_/g, " ")} · {r.fulfillment_preference.replace(/_/g, " ")}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {r.wholesale_request_items.map((item) => (
                        <li key={item.id}>
                          {item.quantity} × {item.description}
                          {item.part_number ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {" "}
                              ({item.part_number})
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {r.notes ? <p className="mt-3 text-muted-foreground">{r.notes}</p> : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      ) : null}

      {only === "orders" ? (
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide">Orders</h2>
        {orders.isLoading ? (
          <PanelLoading />
        ) : (orders.data ?? []).length === 0 ? (
          <Empty>
            No orders yet. Once you approve a quote, the order — with tracking when it ships —
            appears here.
          </Empty>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(orders.data ?? []).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.order_number}</TableCell>
                    <TableCell>{o.po_number || "—"}</TableCell>
                    <TableCell>{formatDate(o.placed_at)}</TableCell>
                    <TableCell>{formatMoney(o.total_amount)}</TableCell>
                    <TableCell className="capitalize">{o.status.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      {o.tracking_number ? (
                        o.tracking_url ? (
                          <a
                            href={o.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <Truck className="h-4 w-4" aria-hidden="true" />
                            {o.carrier ? `${o.carrier} ` : ""}
                            {o.tracking_number}
                          </a>
                        ) : (
                          <span className="font-mono text-xs">
                            {o.carrier ? `${o.carrier} ` : ""}
                            {o.tracking_number}
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      ) : null}
    </div>
  );
}

function QuotesPanel() {
  const quotes = useQuery({ queryKey: ["wholesale-quotes"], queryFn: fetchMyWholesaleQuotes });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide">Wholesale quotes</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Quotes issued to your account. Wholesale accounts see complete OEM part numbers.
      </p>
      {quotes.isLoading ? (
        <PanelLoading />
      ) : (quotes.data ?? []).length === 0 ? (
        <Empty>
          No quotes yet. When our team prices one of your parts requests, the quote appears here with
          its amount, expiration, and full part numbers.
        </Empty>
      ) : (
        <ul className="mt-4 space-y-3">
          {(quotes.data ?? []).map((q) => (
            <li key={q.id} className="rounded-xl border border-border p-4">
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                aria-expanded={openId === q.id}
                onClick={() => setOpenId(openId === q.id ? null : q.id)}
              >
                <span>
                  <span className="font-mono text-sm font-bold">{q.quote_number}</span>
                  <span className="ml-3 text-sm text-muted-foreground">
                    {formatDate(q.created_at)}
                    {q.expires_at ? ` · expires ${formatDate(q.expires_at)}` : ""}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-sm">
                  <span className="font-bold">{formatMoney(q.total)}</span>
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide capitalize">
                    {q.status.replace(/_/g, " ")}
                  </span>
                </span>
              </button>
              {openId === q.id ? (
                <div className="mt-4 overflow-x-auto border-t border-border pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {q.wholesale_quote_lines
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="font-mono text-xs">
                              {line.part_number || "—"}
                            </TableCell>
                            <TableCell>{line.description}</TableCell>
                            <TableCell>{line.quantity}</TableCell>
                            <TableCell>{formatMoney(line.unit_price)}</TableCell>
                            <TableCell>{formatMoney(line.line_total)}</TableCell>
                            <TableCell>{line.availability || "—"}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <dl className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd>{formatMoney(q.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd>{formatMoney(q.shipping_total)}</dd>
                    </div>
                    <div className="flex justify-between font-bold">
                      <dt>Total</dt>
                      <dd>{formatMoney(q.total)}</dd>
                    </div>
                  </dl>
                  {q.notes ? (
                    <p className="mt-3 text-sm text-muted-foreground">{q.notes}</p>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function InvoicesPanel() {
  const invoices = useQuery({ queryKey: ["wholesale-invoices"], queryFn: fetchMyInvoices });

  async function openFile(path: string) {
    try {
      const url = await signedCustomerFileUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("We couldn't open that invoice file");
    }
  }

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide">Invoices</h2>
      {invoices.isLoading ? (
        <PanelLoading />
      ) : (invoices.data ?? []).length === 0 ? (
        <Empty>
          No invoices yet. Invoices issued for your account will be listed here, with a download
          link when the document is available.
        </Empty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoices.data ?? []).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                  <TableCell>{formatDate(inv.issued_on)}</TableCell>
                  <TableCell>{formatMoney(inv.amount)}</TableCell>
                  <TableCell className="capitalize">{inv.status.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    {inv.file_path ? (
                      <Button variant="outline" size="sm" onClick={() => openFile(inv.file_path!)}>
                        Download
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not available yet</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function AccountPanel({ userId, account }: { userId: string; account: AccountProfile | null }) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["wholesale-profile"], queryFn: fetchMyProfile });
  const profile = profileQuery.data;
  const [form, setForm] = useState<Record<string, string> | null>(null);

  const values: Record<string, string> | null =
    form ??
    (profile
      ? {
          contact_name: profile.contact_name ?? "",
          contact_email: profile.contact_email ?? "",
          contact_phone: profile.contact_phone ?? "",
          ship_address_line1: profile.ship_address_line1 ?? "",
          ship_address_line2: profile.ship_address_line2 ?? "",
          ship_city: profile.ship_city ?? "",
          ship_state: profile.ship_state ?? "",
          ship_postal_code: profile.ship_postal_code ?? "",
        }
      : null);

  const save = useMutation({
    mutationFn: () => updateMyProfile(profile!.id, values!),
    onSuccess: () => {
      toast.success("Account details updated");
      queryClient.invalidateQueries({ queryKey: ["wholesale-profile"] });
      if (account) {
        void saveMyAccountProfile(userId, {
          full_name: values!.contact_name || account.full_name,
          business_name: account.business_name,
          phone: values!.contact_phone || account.phone,
          business_type: (account.business_type ?? "") as BusinessType | "",
          business_email: account.business_email,
        });
      }
    },
    onError: () => toast.error("We couldn't save your changes"),
  });

  if (profileQuery.isLoading || !values) return <PanelLoading />;

  const fields: Array<[string, string]> = [
    ["contact_name", "Contact name"],
    ["contact_email", "Contact email"],
    ["contact_phone", "Contact phone"],
    ["ship_address_line1", "Default shipping street"],
    ["ship_address_line2", "Suite / unit"],
    ["ship_city", "City"],
    ["ship_state", "State"],
    ["ship_postal_code", "ZIP / postal code"],
  ];

  return (
    <form
      className="max-w-2xl rounded-xl border border-border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide">Business contact &amp; shipping</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Account: <strong className="text-foreground">{account?.business_name}</strong> ·{" "}
        {account?.full_name} · {account?.business_email}
        {account?.business_type
          ? ` · ${BUSINESS_TYPE_LABELS[account.business_type as BusinessType]}`
          : ""}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Company name, tier, and tax-exempt status are managed by our wholesale team — contact us to
        change them.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div key={key} className={key.includes("line") ? "sm:col-span-2" : undefined}>
            <Label htmlFor={`a-${key}`}>{label}</Label>
            <Input
              id={`a-${key}`}
              className="mt-1.5"
              value={values[key] ?? ""}
              onChange={(e) => setForm({ ...values, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="mt-6" disabled={save.isPending}>
        {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Save changes
      </Button>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function PanelLoading() {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading…
    </div>
  );
}
