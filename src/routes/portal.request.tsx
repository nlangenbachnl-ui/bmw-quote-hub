import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, FileUp, Info, Truck } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DELIVERY_TYPES,
  formatCutoff,
  money,
  type DeliveryType,
} from "@/lib/admin/pricing";
import {
  ELIGIBILITY_TONE,
  initialEligibility,
  submitShopRequest,
  URGENCY_LEVELS,
  useAdminState,
  type Urgency,
} from "@/lib/admin/store";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/request")({
  component: ShopRequest,
});

const schema = z.object({
  vin: z
    .string()
    .trim()
    .min(11, { message: "Enter at least the last 11 characters of the VIN" })
    .max(17, { message: "A VIN is 17 characters" }),
  modelYear: z.string().trim().max(4, { message: "Use a 4-digit year" }),
  bmwModel: z.string().trim().max(80, { message: "Keep the model under 80 characters" }),
  roNumber: z.string().trim().min(1, { message: "Add your RO number" }).max(40),
  insurerRef: z.string().trim().max(60),
  partsRequested: z
    .string()
    .trim()
    .min(5, { message: "Tell us which parts you need (or note that the estimate covers it)" })
    .max(2000),
  vehicleRef: z.string().trim().max(80),
  customerRef: z.string().trim().max(80),
  notes: z.string().trim().max(1000),
  requestedWindow: z.string().trim().max(80),
  deliveryInstructions: z.string().trim().max(300),
  receivingHours: z.string().trim().max(120),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function ShopRequest() {
  const shopId = usePortalSession();
  const { shops, settings } = useAdminState();
  const shop = shops.find((s) => s.id === shopId);

  const [form, setForm] = useState({
    vin: "",
    modelYear: "",
    bmwModel: "",
    roNumber: "",
    insurerRef: "",
    partsRequested: "",
    vehicleRef: "",
    customerRef: "",
    notes: "",
    requestedWindow: "",
    deliveryInstructions: shop?.deliveryInstructions ?? "",
    receivingHours: shop?.receivingHours ?? "",
  });
  const [urgency, setUrgency] = useState<Urgency>("Standard");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("Local Same-Day");
  const [photos, setPhotos] = useState<File[]>([]);
  const [estimates, setEstimates] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<{ reference: string; id: string } | null>(null);

  const zip = (shop?.deliveryAddress.match(/\b\d{5}\b/) ?? [""])[0];
  const eligibility = initialEligibility(deliveryType, zip);

  if (!shop) return null;

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight">Request received</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Reference <strong>{submitted.reference}</strong>. Our sourcing desk verifies fitment
          against the VIN and builds your OEM parts quote. Delivery eligibility is confirmed before
          any same-day commitment is made.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/portal">Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/portal/history">View history</Link>
          </Button>
        </div>
      </div>
    );
  }

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const request = submitShopRequest({
      shopId: shop.id,
      ...parsed.data,
      urgency,
      deliveryType,
      photoCount: photos.length,
      estimateFiles: estimates.map((f) => ({ name: f.name, type: f.type })),
    });
    setSubmitted({ reference: request.reference, id: request.id });
  };

  return (
    <form className="max-w-4xl space-y-6" onSubmit={onSubmit} noValidate>
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">New parts request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the estimate and VIN and we&apos;ll build the OEM parts quote. Everything else is
          optional context.
        </p>
      </div>

      <Section title="Vehicle & job">
        <Field
          id="vin"
          label="VIN"
          required
          value={form.vin}
          onChange={(v) => set("vin")(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17))}
          error={errors.vin}
          mono
        />
        <Field id="modelYear" label="Year (if known)" value={form.modelYear} onChange={set("modelYear")} error={errors.modelYear} />
        <Field id="bmwModel" label="Model (if known)" value={form.bmwModel} onChange={set("bmwModel")} error={errors.bmwModel} />
        <Field id="roNumber" label="Repair order (RO) number" required value={form.roNumber} onChange={set("roNumber")} error={errors.roNumber} />
        <Field
          id="insurerRef"
          label="Insurer / estimate number (optional)"
          value={form.insurerRef}
          onChange={set("insurerRef")}
          error={errors.insurerRef}
        />
        <div>
          <Label htmlFor="urgency">Urgency</Label>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
            <SelectTrigger id="urgency" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENCY_LEVELS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Field
          id="vehicleRef"
          label="Your vehicle reference"
          hint="e.g. “Bay 3 · black sedan”"
          value={form.vehicleRef}
          onChange={set("vehicleRef")}
          error={errors.vehicleRef}
        />
        <Field
          id="customerRef"
          label="Your job / customer reference"
          hint="Use an internal code — no end-customer details needed."
          value={form.customerRef}
          onChange={set("customerRef")}
          error={errors.customerRef}
        />
      </Section>

      <Section title="Parts & estimate" full>
        <div>
          <Label htmlFor="partsRequested">Requested parts / notes</Label>
          <Textarea
            id="partsRequested"
            className="mt-2 min-h-28"
            placeholder="Per attached estimate lines 4–11, OEM only. Include any part numbers you already have."
            value={form.partsRequested}
            onChange={(e) => set("partsRequested")(e.target.value)}
            aria-invalid={Boolean(errors.partsRequested)}
          />
          {errors.partsRequested ? (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {errors.partsRequested}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-dashed border-border p-4">
            <Label htmlFor="estimates" className="flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary" aria-hidden="true" />
              Estimate upload (PDF or image)
            </Label>
            <Input
              id="estimates"
              type="file"
              multiple
              accept="application/pdf,image/*"
              className="mt-2"
              onChange={(e) => setEstimates(Array.from(e.target.files ?? []).slice(0, 5))}
            />
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {estimates.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-border p-4">
            <Label htmlFor="photos">Damage / part photos</Label>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              className="mt-2"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 6))}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {photos.length ? `${photos.length} photo(s) attached` : "Up to 6 photos"}
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Anything else for the desk?</Label>
          <Textarea
            id="notes"
            className="mt-2"
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </div>
      </Section>

      <Section title="Delivery" full>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="deliveryType">Delivery method</Label>
            <Select value={deliveryType} onValueChange={(v) => setDeliveryType(v as DeliveryType)}>
              <SelectTrigger id="deliveryType" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              Local same-day is {money(settings.sameDayFee)} and free at{" "}
              {money(settings.freeSameDayThreshold)}+ merchandise subtotal. Cutoff{" "}
              {formatCutoff(settings.sameDayCutoff)} local, {settings.deliveryDays.join(" · ")}.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold">Initial eligibility</p>
            </div>
            <Badge className={`mt-3 ${ELIGIBILITY_TONE[eligibility]} border-transparent`}>
              {eligibility}
            </Badge>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Delivery to {shop.deliveryAddress}. Final eligibility depends on parts availability,
              our {settings.deliveryRadiusMiles}-mile radius, package size and weight, and courier
              capacity. We won&apos;t promise a delivery until it&apos;s confirmed.
            </p>
          </div>
        </div>
        <Field
          id="requestedWindow"
          label="Requested delivery window"
          hint="e.g. “Today 1:00 PM – 3:00 PM”"
          value={form.requestedWindow}
          onChange={set("requestedWindow")}
          error={errors.requestedWindow}
        />
        <Field
          id="receivingHours"
          label="Receiving hours"
          value={form.receivingHours}
          onChange={set("receivingHours")}
          error={errors.receivingHours}
        />
        <div className="sm:col-span-2">
          <Label htmlFor="deliveryInstructions">Delivery instructions</Label>
          <Textarea
            id="deliveryInstructions"
            className="mt-2"
            value={form.deliveryInstructions}
            onChange={(e) => set("deliveryInstructions")(e.target.value)}
          />
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Submit request
        </Button>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Submitting sends the job to our sourcing desk. Pricing is confirmed on the quote we return.
        </p>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      <div className={`mt-4 gap-4 ${full ? "space-y-4" : "grid sm:grid-cols-2"}`}>{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  mono,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true" className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        className={`mt-2 ${mono ? "font-mono" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        required={required}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
