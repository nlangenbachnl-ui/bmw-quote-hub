import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";

import { submitQuote } from "@/lib/quotes";

export const Route = createFileRoute("/request-quote")({
  head: () => ({
    meta: [
      { title: "Request a Free BMW Parts Quote | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Submit your VIN, BMW model and parts list. Our specialists verify fitment and email a personalized OEM parts quote — free and no obligation.",
      },
      {
        property: "og:title",
        content: "Request a Free BMW Parts Quote | Precision Bimmer Parts",
      },
      {
        property: "og:description",
        content:
          "Submit your VIN and parts list — personalized OEM quote by email, usually within one business day.",
      },
      { property: "og:url", content: "/request-quote" },
    ],
    links: [{ rel: "canonical", href: "/request-quote" }],
  }),
  component: RequestQuotePage,
});

// ---- Reference data ----
const CURRENT_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, i) => String(CURRENT_YEAR - i));

const BMW_MODELS = [
  "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
  "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z3", "Z4",
  "M2", "M3", "M4", "M5", "M8",
  "i3", "i4", "i5", "i7", "i8", "iX",
  "Other / Classic",
] as const;

// ---- Validation ----
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

const quoteSchema = z.object({
  first_name: z.string().trim().nonempty("First name is required").max(60),
  last_name: z.string().trim().nonempty("Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30)
    .regex(/^[0-9+()\-.\s]+$/, "Phone can only contain numbers and + ( ) - ."),
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(VIN_REGEX, "VIN must be exactly 17 letters/numbers (no I, O, or Q)"),
  model_year: z.string().nonempty("Select the year"),
  bmw_model: z.string().nonempty("Select your model"),
  mileage: z
    .string()
    .trim()
    .max(10)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[0-9,]+$/.test(v),
      "Mileage should be a number",
    ),
  parts_requested: z
    .string()
    .trim()
    .nonempty("Tell us which parts you need")
    .min(5, "A little more detail helps us quote accurately")
    .max(2000),
  shipping_zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept to be contacted about your request" }),
  }),
});

type QuoteForm = z.infer<typeof quoteSchema>;

const MAX_PHOTOS = 6;
const MAX_PHOTO_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ---- Style helpers ----
const inputClass =
  "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25";
const labelClass = "mb-1.5 block text-sm font-semibold";
const errorClass = "mt-1 text-xs font-medium text-destructive";

// Fields validated in each step, so users can't skip past errors.
const STEP_FIELDS: Array<Array<keyof QuoteForm>> = [
  ["first_name", "last_name", "email", "phone"],
  ["vin", "model_year", "bmw_model", "mileage"],
  ["parts_requested", "shipping_zip", "notes", "consent"],
];

const STEP_LABELS = ["Your Details", "Your BMW", "Parts & Delivery"] as const;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function RequestQuotePage() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      vin: "",
      model_year: "",
      bmw_model: "",
      mileage: "",
      parts_requested: "",
      shipping_zip: "",
      notes: "",
      consent: false as unknown as true,
    },
  });

  const goNext = async () => {
    const ok = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next: File[] = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG or WEBP images`);
        continue;
      }
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
        toast.error(`${file.name}: max ${MAX_PHOTO_MB}MB per photo`);
        continue;
      }
      next.push(file);
    }
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: QuoteForm) => {
    setSubmitting(true);
    try {
      const encodedPhotos = await Promise.all(
        photos.map(async (file) => ({
          name: file.name,
          type: file.type,
          dataUrl: await readAsDataUrl(file),
        })),
      );

      const record = await submitQuote({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        vin: values.vin.toUpperCase(),
        model_year: values.model_year,
        bmw_model: values.bmw_model,
        mileage: values.mileage || undefined,
        parts_requested: values.parts_requested,
        shipping_zip: values.shipping_zip,
        notes: values.notes || undefined,
        photos: encodedPhotos,
      });

      setSubmittedId(record.id);
      reset();
      setPhotos([]);
      setStep(0);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-black uppercase">Request received</h1>
        <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
          Thanks — a specialist is already on it. You'll get an itemized, VIN-verified
          quote by email, usually within one business day. Keep an eye on your inbox
          (and spam folder, just in case).
        </p>
        <p className="mt-4 rounded-md bg-secondary px-4 py-2 text-xs font-mono text-muted-foreground">
          Reference: {submittedId.slice(0, 8).toUpperCase()}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setSubmittedId(null)}
            className="rounded-md border border-input px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-accent"
          >
            Submit another request
          </button>
          <Link
            to="/"
            className="rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="heading-kicker text-primary-glow">Free · No Obligation</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Request a Free Quote
          </h1>
          <p className="mt-4 max-w-xl text-carbon-muted">
            Three quick steps. Share your VIN and parts list — we'll verify fitment and
            email a personalized quote, usually within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {/* Step indicator */}
        <ol
          className="mb-10 grid grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wide"
          aria-label="Form progress"
        >
          {STEP_LABELS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <li key={label} className="flex flex-col gap-2">
                <span
                  aria-current={state === "active" ? "step" : undefined}
                  className={
                    "h-1.5 rounded-full transition-colors " +
                    (state === "todo" ? "bg-border" : "bg-primary")
                  }
                />
                <span
                  className={
                    "flex items-center gap-2 " +
                    (state === "todo" ? "text-muted-foreground" : "text-foreground")
                  }
                >
                  <span
                    className={
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] " +
                      (state === "todo"
                        ? "bg-secondary text-muted-foreground"
                        : "bg-primary text-primary-foreground")
                    }
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* Step 1 — Details */}
          <fieldset className={step === 0 ? "space-y-5" : "hidden"} aria-hidden={step !== 0}>
            <legend className="sr-only">Your details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className={labelClass}>First name</label>
                <input id="first_name" autoComplete="given-name" className={inputClass} {...register("first_name")} />
                {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className={labelClass}>Last name</label>
                <input id="last_name" autoComplete="family-name" className={inputClass} {...register("last_name")} />
                {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input id="email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input id="phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" className={inputClass} {...register("phone")} />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Step 2 — Vehicle */}
          <fieldset className={step === 1 ? "space-y-5" : "hidden"} aria-hidden={step !== 1}>
            <legend className="sr-only">Your BMW</legend>
            <div>
              <label htmlFor="vin" className={labelClass}>
                VIN <span className="font-normal text-muted-foreground">(17 characters)</span>
              </label>
              <input
                id="vin"
                maxLength={17}
                spellCheck={false}
                autoCapitalize="characters"
                placeholder="WBAJB1C50J..."
                className={inputClass + " uppercase font-mono tracking-wider"}
                {...register("vin")}
              />
              {errors.vin && <p className={errorClass}>{errors.vin.message}</p>}
              <p className="mt-1.5 text-xs text-muted-foreground">
                Find it on your driver-door jamb, dashboard through the windshield, or
                registration.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="model_year" className={labelClass}>Year</label>
                <select id="model_year" className={inputClass} defaultValue="" {...register("model_year")}>
                  <option value="" disabled>Select year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.model_year && <p className={errorClass}>{errors.model_year.message}</p>}
              </div>
              <div>
                <label htmlFor="bmw_model" className={labelClass}>Model</label>
                <select id="bmw_model" className={inputClass} defaultValue="" {...register("bmw_model")}>
                  <option value="" disabled>Select model</option>
                  {BMW_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.bmw_model && <p className={errorClass}>{errors.bmw_model.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="mileage" className={labelClass}>
                Mileage <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input id="mileage" inputMode="numeric" placeholder="e.g. 82,000" className={inputClass} {...register("mileage")} />
              {errors.mileage && <p className={errorClass}>{errors.mileage.message}</p>}
            </div>
          </fieldset>

          {/* Step 3 — Parts */}
          <fieldset className={step === 2 ? "space-y-5" : "hidden"} aria-hidden={step !== 2}>
            <legend className="sr-only">Parts and delivery</legend>
            <div>
              <label htmlFor="parts_requested" className={labelClass}>Parts needed</label>
              <textarea
                id="parts_requested"
                rows={5}
                placeholder="e.g. Front brake pads and rotors, cabin air filter, and a replacement passenger-side headlight assembly."
                className={inputClass}
                {...register("parts_requested")}
              />
              {errors.parts_requested && <p className={errorClass}>{errors.parts_requested.message}</p>}
            </div>
            <div>
              <label htmlFor="shipping_zip" className={labelClass}>Shipping ZIP</label>
              <input
                id="shipping_zip"
                autoComplete="postal-code"
                placeholder="90210"
                maxLength={10}
                className={inputClass + " sm:max-w-[12rem]"}
                {...register("shipping_zip")}
              />
              {errors.shipping_zip && <p className={errorClass}>{errors.shipping_zip.message}</p>}
            </div>
            <div>
              <label htmlFor="notes" className={labelClass}>
                Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Deadlines, previous part numbers, preferred brands, etc."
                className={inputClass}
                {...register("notes")}
              />
              {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
            </div>

            {/* Photos */}
            <div>
              <span className={labelClass}>
                Photos <span className="font-normal text-muted-foreground">(optional, up to {MAX_PHOTOS})</span>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                multiple
                className="sr-only"
                id="photo-input"
                onChange={(e) => addPhotos(e.target.files)}
              />
              <label
                htmlFor="photo-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input px-4 py-8 text-center transition-colors hover:border-primary hover:bg-accent/50"
              >
                <ImagePlus className="h-7 w-7 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">Click to add photos</span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP — max {MAX_PHOTO_MB}MB each
                </span>
              </label>
              {photos.length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {photos.map((file, i) => (
                    <li key={`${file.name}-${i}`} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload preview ${i + 1}`}
                        className="aspect-square w-full rounded-md border border-border object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Consent */}
            <div className="rounded-md border border-border bg-secondary/40 p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  {...register("consent")}
                />
                <span>
                  I agree to be contacted about my quote request by Precision Bimmer Parts
                  and have read the{" "}
                  <Link to="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  . My details will not be sold or shared with third parties.
                </span>
              </label>
              {errors.consent && <p className={errorClass}>{errors.consent.message as string}</p>}
            </div>
          </fieldset>

          {/* Step controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-md border border-input px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>

            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.02]"
              >
                Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Free · No obligation · Your details are used only to prepare and send your
            quote. See our{" "}
            <Link to="/privacy" className="font-semibold text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </section>
    </>
  );
}
