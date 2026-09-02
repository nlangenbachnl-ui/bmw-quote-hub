import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BUSINESS_TYPE_LABELS,
  PREFERRED_CONTACT_OPTIONS,
  type BusinessType,
} from "@/lib/wholesale/constants";
import { submitApplication, uploadApplicationDocument } from "@/lib/wholesale/api";

export const Route = createFileRoute("/wholesale/apply")({
  head: () => ({
    meta: [
      { title: "Wholesale Account Application | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Apply for a Precision Bimmer Parts wholesale account. Submit your business details, tax ID and resale certificate for tax-exempt purchasing review.",
      },
      {
        property: "og:title",
        content: "Wholesale Account Application | Precision Bimmer Parts",
      },
      {
        property: "og:description",
        content: "Open a wholesale OEM BMW parts account for your shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WholesaleApplyPage,
});

const MAX_DOC_BYTES = 10 * 1024 * 1024;

const schema = z
  .object({
    legal_business_name: z.string().trim().min(2, "Enter the legal business name").max(160),
    dba_name: z.string().trim().max(160).optional(),
    contact_name: z.string().trim().min(2, "Enter the contact name").max(120),
    job_title: z.string().trim().max(120).optional(),
    business_email: z.string().trim().email("Enter a valid business email").max(255),
    business_phone: z.string().trim().min(7, "Enter a reachable phone number").max(40),
    billing_address_line1: z.string().trim().min(3, "Enter the billing street address").max(160),
    billing_address_line2: z.string().trim().max(160).optional(),
    billing_city: z.string().trim().min(2, "Enter the billing city").max(80),
    billing_state: z.string().trim().min(2, "Enter the state").max(40),
    billing_postal_code: z.string().trim().min(4, "Enter the ZIP / postal code").max(12),
    shipping_same_as_billing: z.boolean(),
    shipping_address_line1: z.string().trim().max(160).optional(),
    shipping_address_line2: z.string().trim().max(160).optional(),
    shipping_city: z.string().trim().max(80).optional(),
    shipping_state: z.string().trim().max(40).optional(),
    shipping_postal_code: z.string().trim().max(12).optional(),
    business_type: z.string().min(1, "Select your business type"),
    tax_id: z.string().trim().min(5, "Enter your EIN / tax ID").max(40),
    website: z.string().trim().max(200).optional(),
    monthly_spend_estimate: z.string().trim().max(60).optional(),
    years_in_business: z.string().trim().max(40).optional(),
    brands_serviced: z.string().trim().max(400).optional(),
    bmw_mini_specialist: z.boolean(),
    preferred_contact_method: z.string().min(1),
    tax_exempt_requested: z.boolean(),
    additional_notes: z.string().trim().max(1500).optional(),
    certified_accurate: z.literal(true, {
      message: "Please certify that the information is accurate",
    }),
    agreed_to_terms: z.literal(true, {
      message: "Please agree to the wholesale terms and privacy policy",
    }),
  })
  .superRefine((values, ctx) => {
    if (!values.shipping_same_as_billing) {
      for (const key of [
        "shipping_address_line1",
        "shipping_city",
        "shipping_state",
        "shipping_postal_code",
      ] as const) {
        if (!values[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Required when the shipping address differs",
          });
        }
      }
    }
  });

type FormValues = {
  [K in keyof z.input<typeof schema>]: z.input<typeof schema>[K];
};

const initialValues = {
  legal_business_name: "",
  dba_name: "",
  contact_name: "",
  job_title: "",
  business_email: "",
  business_phone: "",
  billing_address_line1: "",
  billing_address_line2: "",
  billing_city: "",
  billing_state: "",
  billing_postal_code: "",
  shipping_same_as_billing: true,
  shipping_address_line1: "",
  shipping_address_line2: "",
  shipping_city: "",
  shipping_state: "",
  shipping_postal_code: "",
  business_type: "",
  tax_id: "",
  website: "",
  monthly_spend_estimate: "",
  years_in_business: "",
  brands_serviced: "",
  bmw_mini_specialist: false,
  preferred_contact_method: "email",
  tax_exempt_requested: false,
  additional_notes: "",
  certified_accurate: false,
  agreed_to_terms: false,
} as unknown as FormValues;

function WholesaleApplyPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doc, setDoc] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    const nextErrors: Record<string, string> = {};

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (values.tax_exempt_requested && !doc) {
      nextErrors.document = "Upload your resale certificate or tax-exemption document";
    }
    if (doc && doc.size > MAX_DOC_BYTES) {
      nextErrors.document = "Document must be 10 MB or smaller";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setBusy(true);
    try {
      let documentPath: string | null = null;
      if (doc) documentPath = await uploadApplicationDocument(doc);

      const data = parsed.data!;
      const result = await submitApplication({
        legal_business_name: data.legal_business_name,
        dba_name: data.dba_name || null,
        contact_name: data.contact_name,
        job_title: data.job_title || null,
        business_email: data.business_email,
        business_phone: data.business_phone,
        billing_address_line1: data.billing_address_line1,
        billing_address_line2: data.billing_address_line2 || null,
        billing_city: data.billing_city,
        billing_state: data.billing_state,
        billing_postal_code: data.billing_postal_code,
        shipping_same_as_billing: data.shipping_same_as_billing,
        shipping_address_line1: data.shipping_same_as_billing
          ? null
          : data.shipping_address_line1 || null,
        shipping_address_line2: data.shipping_same_as_billing
          ? null
          : data.shipping_address_line2 || null,
        shipping_city: data.shipping_same_as_billing ? null : data.shipping_city || null,
        shipping_state: data.shipping_same_as_billing ? null : data.shipping_state || null,
        shipping_postal_code: data.shipping_same_as_billing
          ? null
          : data.shipping_postal_code || null,
        business_type: data.business_type as BusinessType,
        tax_id: data.tax_id,
        website: data.website || null,
        monthly_spend_estimate: data.monthly_spend_estimate || null,
        years_in_business: data.years_in_business || null,
        brands_serviced: data.brands_serviced || null,
        bmw_mini_specialist: data.bmw_mini_specialist,
        preferred_contact_method: data.preferred_contact_method,
        tax_exempt_requested: data.tax_exempt_requested,
        resale_certificate_path: documentPath,
        additional_notes: data.additional_notes || null,
        certified_accurate: true,
        agreed_to_terms: true,
      });
      setReference(result.reference_code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "We couldn't submit the application. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold uppercase tracking-tight">
          Application received
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Thanks — our wholesale team will review your application and follow up by your
          preferred contact method. Keep this reference number; you'll use it to link your
          application to your account.
        </p>
        <p className="mt-6 rounded-xl border border-border bg-muted/40 p-6">
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Reference number
          </span>
          <span className="mt-2 block font-mono text-xl font-bold">{reference}</span>
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-md bg-gradient-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
          >
            Create your account
          </Link>
          <Link
            to="/wholesale"
            className="rounded-md border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide"
          >
            Back to wholesale
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Wholesale account application
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Tell us about your business. Everything marked required helps us verify the account and
        set your wholesale tier. Your tax ID and uploaded documents are stored privately and are
        never displayed publicly.
      </p>

      <form className="mt-10 space-y-12" onSubmit={handleSubmit} noValidate>
        <Section title="Business">
          <Field label="Legal business name" required error={errors.legal_business_name} id="legal">
            <Input
              id="legal"
              value={values.legal_business_name}
              onChange={(e) => set("legal_business_name", e.target.value)}
            />
          </Field>
          <Field label="DBA / trading name" error={errors.dba_name} id="dba">
            <Input
              id="dba"
              value={values.dba_name ?? ""}
              onChange={(e) => set("dba_name", e.target.value)}
            />
          </Field>
          <Field label="Business type" required error={errors.business_type} id="btype">
            <select
              id="btype"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={values.business_type}
              onChange={(e) => set("business_type", e.target.value)}
            >
              <option value="">Select…</option>
              {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="EIN / tax ID" required error={errors.tax_id} id="taxid">
            <Input
              id="taxid"
              value={values.tax_id}
              onChange={(e) => set("tax_id", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Website" error={errors.website} id="website">
            <Input
              id="website"
              placeholder="https://"
              value={values.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
          <Field label="Years in business" error={errors.years_in_business} id="years">
            <Input
              id="years"
              value={values.years_in_business ?? ""}
              onChange={(e) => set("years_in_business", e.target.value)}
            />
          </Field>
          <Field
            label="Estimated monthly BMW parts spend"
            error={errors.monthly_spend_estimate}
            id="spend"
          >
            <Input
              id="spend"
              placeholder="e.g. $2,000–$5,000"
              value={values.monthly_spend_estimate ?? ""}
              onChange={(e) => set("monthly_spend_estimate", e.target.value)}
            />
          </Field>
          <Field label="Brands serviced" error={errors.brands_serviced} id="brands" full>
            <Input
              id="brands"
              placeholder="BMW, MINI, Audi…"
              value={values.brands_serviced ?? ""}
              onChange={(e) => set("brands_serviced", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2 flex items-start gap-3">
            <Checkbox
              id="specialist"
              checked={values.bmw_mini_specialist}
              onCheckedChange={(v) => set("bmw_mini_specialist", v === true)}
            />
            <Label htmlFor="specialist" className="text-sm font-normal leading-relaxed">
              We are a BMW / MINI specialist shop
            </Label>
          </div>
        </Section>

        <Section title="Contact">
          <Field label="Applicant name" required error={errors.contact_name} id="cname">
            <Input
              id="cname"
              value={values.contact_name}
              onChange={(e) => set("contact_name", e.target.value)}
            />
          </Field>
          <Field label="Job title" error={errors.job_title} id="title">
            <Input
              id="title"
              value={values.job_title ?? ""}
              onChange={(e) => set("job_title", e.target.value)}
            />
          </Field>
          <Field label="Business email" required error={errors.business_email} id="bemail">
            <Input
              id="bemail"
              type="email"
              value={values.business_email}
              onChange={(e) => set("business_email", e.target.value)}
            />
          </Field>
          <Field label="Business phone" required error={errors.business_phone} id="bphone">
            <Input
              id="bphone"
              type="tel"
              value={values.business_phone}
              onChange={(e) => set("business_phone", e.target.value)}
            />
          </Field>
          <Field label="Preferred contact method" id="pcontact">
            <select
              id="pcontact"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={values.preferred_contact_method}
              onChange={(e) => set("preferred_contact_method", e.target.value)}
            >
              {PREFERRED_CONTACT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Billing address">
          <Field label="Street address" required error={errors.billing_address_line1} id="b1" full>
            <Input
              id="b1"
              value={values.billing_address_line1}
              onChange={(e) => set("billing_address_line1", e.target.value)}
            />
          </Field>
          <Field label="Suite / unit" error={errors.billing_address_line2} id="b2" full>
            <Input
              id="b2"
              value={values.billing_address_line2 ?? ""}
              onChange={(e) => set("billing_address_line2", e.target.value)}
            />
          </Field>
          <Field label="City" required error={errors.billing_city} id="bcity">
            <Input
              id="bcity"
              value={values.billing_city}
              onChange={(e) => set("billing_city", e.target.value)}
            />
          </Field>
          <Field label="State" required error={errors.billing_state} id="bstate">
            <Input
              id="bstate"
              value={values.billing_state}
              onChange={(e) => set("billing_state", e.target.value)}
            />
          </Field>
          <Field label="ZIP / postal code" required error={errors.billing_postal_code} id="bzip">
            <Input
              id="bzip"
              value={values.billing_postal_code}
              onChange={(e) => set("billing_postal_code", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Shipping address">
          <div className="sm:col-span-2 flex items-start gap-3">
            <Checkbox
              id="same"
              checked={values.shipping_same_as_billing}
              onCheckedChange={(v) => set("shipping_same_as_billing", v === true)}
            />
            <Label htmlFor="same" className="text-sm font-normal leading-relaxed">
              Shipping address is the same as billing
            </Label>
          </div>

          {!values.shipping_same_as_billing ? (
            <>
              <Field
                label="Street address"
                required
                error={errors.shipping_address_line1}
                id="s1"
                full
              >
                <Input
                  id="s1"
                  value={values.shipping_address_line1 ?? ""}
                  onChange={(e) => set("shipping_address_line1", e.target.value)}
                />
              </Field>
              <Field label="Suite / unit" error={errors.shipping_address_line2} id="s2" full>
                <Input
                  id="s2"
                  value={values.shipping_address_line2 ?? ""}
                  onChange={(e) => set("shipping_address_line2", e.target.value)}
                />
              </Field>
              <Field label="City" required error={errors.shipping_city} id="scity">
                <Input
                  id="scity"
                  value={values.shipping_city ?? ""}
                  onChange={(e) => set("shipping_city", e.target.value)}
                />
              </Field>
              <Field label="State" required error={errors.shipping_state} id="sstate">
                <Input
                  id="sstate"
                  value={values.shipping_state ?? ""}
                  onChange={(e) => set("shipping_state", e.target.value)}
                />
              </Field>
              <Field
                label="ZIP / postal code"
                required
                error={errors.shipping_postal_code}
                id="szip"
              >
                <Input
                  id="szip"
                  value={values.shipping_postal_code ?? ""}
                  onChange={(e) => set("shipping_postal_code", e.target.value)}
                />
              </Field>
            </>
          ) : null}
        </Section>

        <Section title="Tax exemption">
          <div className="sm:col-span-2 flex items-start gap-3">
            <Checkbox
              id="taxexempt"
              checked={values.tax_exempt_requested}
              onCheckedChange={(v) => set("tax_exempt_requested", v === true)}
            />
            <Label htmlFor="taxexempt" className="text-sm font-normal leading-relaxed">
              I am requesting tax-exempt purchasing (resale)
            </Label>
          </div>

          {values.tax_exempt_requested ? (
            <div className="sm:col-span-2">
              <Label htmlFor="doc">Resale certificate / tax-exemption document</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <Input
                  id="doc"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => {
                    setDoc(e.target.files?.[0] ?? null);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.document;
                      return next;
                    });
                  }}
                  aria-describedby="doc-help"
                />
                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
              <p id="doc-help" className="mt-1.5 text-xs text-muted-foreground">
                PDF, PNG or JPG up to 10 MB. Uploaded to private storage — only our review team
                can open it.
              </p>
              {errors.document ? (
                <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">
                  {errors.document}
                </p>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section title="Anything else">
          <Field label="Additional notes" error={errors.additional_notes} id="notes" full>
            <Textarea
              id="notes"
              rows={4}
              value={values.additional_notes ?? ""}
              onChange={(e) => set("additional_notes", e.target.value)}
            />
          </Field>
        </Section>

        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="certify"
              checked={values.certified_accurate === true}
              onCheckedChange={(v) => set("certified_accurate", (v === true) as true)}
            />
            <Label htmlFor="certify" className="text-sm font-normal leading-relaxed">
              I certify that the information in this application is accurate and that I am
              authorized to open an account on behalf of this business.
            </Label>
          </div>
          {errors.certified_accurate ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.certified_accurate}
            </p>
          ) : null}

          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={values.agreed_to_terms === true}
              onCheckedChange={(v) => set("agreed_to_terms", (v === true) as true)}
            />
            <Label htmlFor="agree" className="text-sm font-normal leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="font-semibold text-primary hover:underline">
                wholesale terms
              </Link>{" "}
              and the{" "}
              <Link to="/privacy" className="font-semibold text-primary hover:underline">
                privacy policy
              </Link>
              .
            </Label>
          </div>
          {errors.agreed_to_terms ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.agreed_to_terms}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Submit application
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </legend>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  id,
  required,
  error,
  full,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
