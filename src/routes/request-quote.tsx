import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/request-quote")({
  head: () => ({
    meta: [
      { title: "Request a BMW Parts Quote | BavarianParts" },
      {
        name: "description",
        content:
          "Submit your BMW model, year, VIN and parts list with photos. Get an exact-fit, itemized parts quote by email within one business day.",
      },
      { property: "og:title", content: "Request a BMW Parts Quote | BavarianParts" },
      {
        property: "og:description",
        content: "Submit your VIN and parts list — exact-fit quote by email within one business day.",
      },
      { property: "og:url", content: "/request-quote" },
    ],
    links: [{ rel: "canonical", href: "/request-quote" }],
  }),
  component: RequestQuotePage,
});

const CURRENT_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, i) => String(CURRENT_YEAR - i));

const BMW_MODELS = [
  "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
  "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z3", "Z4",
  "M2", "M3", "M4", "M5", "M8",
  "i3", "i4", "i5", "i7", "i8", "iX",
  "Other / Classic",
] as const;

const quoteSchema = z.object({
  name: z.string().trim().nonempty("Name is required").max(100, "Max 100 characters"),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5, "Enter a valid phone number").max(30),
  vin: z
    .string()
    .trim()
    .max(20, "VIN is too long")
    .optional()
    .or(z.literal("")),
  bmw_model: z.string().nonempty("Select your model"),
  model_year: z.string().nonempty("Select the year"),
  parts_requested: z
    .string()
    .trim()
    .nonempty("Tell us which parts you need")
    .max(2000, "Max 2000 characters"),
  notes: z.string().trim().max(2000, "Max 2000 characters").optional().or(z.literal("")),
});

type QuoteForm = z.infer<typeof quoteSchema>;

const MAX_PHOTOS = 6;
const MAX_PHOTO_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const inputClass =
  "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25";
const labelClass = "mb-1.5 block text-sm font-semibold";
const errorClass = "mt-1 text-xs font-medium text-destructive";

function RequestQuotePage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { bmw_model: "", model_year: "" },
  });

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next: File[] = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WEBP or HEIC images`);
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
      const requestId = crypto.randomUUID();
      const photoPaths: string[] = [];

      for (const file of photos) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${requestId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("quote-photos")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
        photoPaths.push(path);
      }

      const { error } = await supabase.from("quote_requests").insert({
        name: values.name,
        email: values.email,
        phone: values.phone,
        vin: values.vin || null,
        bmw_model: values.bmw_model,
        model_year: values.model_year,
        parts_requested: values.parts_requested,
        notes: values.notes || null,
        photo_paths: photoPaths,
      });
      if (error) throw new Error(error.message);

      setSubmitted(true);
      reset();
      setPhotos([]);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-black uppercase">Request Received!</h1>
        <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
          Thanks — our parts specialists are on it. You'll receive an itemized quote by email,
          usually within one business day. Keep an eye on your inbox (and spam folder, just in
          case).
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 rounded-md border border-input px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-accent"
        >
          Submit Another Request
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="heading-kicker text-primary-glow">Free · No Obligation</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Request a Quote</h1>
          <p className="mt-4 max-w-xl text-carbon-muted">
            Fill in your details and parts list below. The more info you give us (VIN and photos
            help a lot), the faster and more accurate your quote.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* Contact */}
          <fieldset>
            <legend className="mb-4 text-lg font-black uppercase">Your Details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className={labelClass}>Full Name *</label>
                <input id="name" className={inputClass} placeholder="Jane Driver" {...register("name")} />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email *</label>
                <input id="email" type="email" className={inputClass} placeholder="you@email.com" {...register("email")} />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone *</label>
                <input id="phone" type="tel" className={inputClass} placeholder="(555) 000-0000" {...register("phone")} />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Vehicle */}
          <fieldset>
            <legend className="mb-4 text-lg font-black uppercase">Your BMW</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="bmw_model" className={labelClass}>Model *</label>
                <select id="bmw_model" className={inputClass} {...register("bmw_model")}>
                  <option value="">Select model…</option>
                  {BMW_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.bmw_model && <p className={errorClass}>{errors.bmw_model.message}</p>}
              </div>
              <div>
                <label htmlFor="model_year" className={labelClass}>Year *</label>
                <select id="model_year" className={inputClass} {...register("model_year")}>
                  <option value="">Select year…</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.model_year && <p className={errorClass}>{errors.model_year.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="vin" className={labelClass}>
                  VIN <span className="font-normal text-muted-foreground">(recommended for exact fitment)</span>
                </label>
                <input id="vin" className={inputClass} placeholder="17-character VIN" maxLength={20} {...register("vin")} />
                {errors.vin && <p className={errorClass}>{errors.vin.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Parts */}
          <fieldset>
            <legend className="mb-4 text-lg font-black uppercase">Parts Needed</legend>
            <div className="space-y-5">
              <div>
                <label htmlFor="parts_requested" className={labelClass}>Requested Parts *</label>
                <textarea
                  id="parts_requested"
                  rows={5}
                  className={inputClass}
                  placeholder={"e.g.\n– Front brake pads + rotors\n– Oil filter kit\n– Driver-side mirror cap (Alpine White)"}
                  {...register("parts_requested")}
                />
                {errors.parts_requested && <p className={errorClass}>{errors.parts_requested.message}</p>}
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>
                  Additional Notes <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className={inputClass}
                  placeholder="Anything else we should know — urgency, budget, genuine vs OEM preference…"
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
                    JPG, PNG, WEBP or HEIC — max {MAX_PHOTO_MB}MB each
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
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-blue px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Submitting…" : "Submit Quote Request"}
          </button>
          <p className="text-xs text-muted-foreground">
            By submitting, you agree to be contacted about your request. We never share your
            details with third parties.
          </p>
        </form>
      </section>
    </>
  );
}
