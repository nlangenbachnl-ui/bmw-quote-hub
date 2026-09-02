import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  ClipboardList,
  FileCheck2,
  Percent,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/wholesale/")({
  head: () => ({
    meta: [
      { title: "BMW Wholesale Parts Accounts for Shops | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Apply for a Precision Bimmer Parts wholesale account: tiered shop pricing, VIN-verified OEM BMW parts sourcing, saved vehicles, PO-based ordering, and order tracking.",
      },
      {
        property: "og:title",
        content: "BMW Wholesale Parts Accounts for Shops | Precision Bimmer Parts",
      },
      {
        property: "og:description",
        content:
          "Wholesale accounts for repair shops, body shops, dealers, fleets and tuners. Apply online in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WholesaleLanding,
});

const benefits = [
  {
    icon: Percent,
    title: "Tiered wholesale pricing",
    body: "Approved accounts are assigned a Standard, Plus, or Preferred tier. Your tier is applied to eligible quoted parts — no per-job haggling.",
  },
  {
    icon: BadgeCheck,
    title: "VIN-verified fitment",
    body: "Send the VIN and the parts you need. We confirm the correct genuine OEM part numbers before you commit to a job.",
  },
  {
    icon: ClipboardList,
    title: "PO-based requests",
    body: "Reference your own PO or repair order on every request so your service writers can reconcile parts to jobs.",
  },
  {
    icon: Truck,
    title: "Shipping and local delivery",
    body: "Choose nationwide shipping, local delivery where eligible, or will-pick-up on each request.",
  },
  {
    icon: FileCheck2,
    title: "Tax-exempt purchasing",
    body: "Upload your resale certificate with your application and we'll review it for tax-exempt purchasing.",
  },
  {
    icon: ShieldCheck,
    title: "Documents kept private",
    body: "Your tax ID and uploaded certificates are stored in private storage and are never shown publicly.",
  },
];

const steps = [
  {
    title: "1. Apply",
    body: "Complete the wholesale application with your business details, tax ID, and resale certificate if you're requesting tax-exempt purchasing.",
  },
  {
    title: "2. We review",
    body: "Our team reviews your application, verifies the details, and may request more information. You'll receive a reference number immediately.",
  },
  {
    title: "3. Get approved and register",
    body: "Once approved, create an account with the same business email and link your application with your reference number.",
  },
  {
    title: "4. Start ordering",
    body: "Save your fleet VINs, submit parts requests with PO numbers, and follow quotes, orders, invoices and tracking in your dashboard.",
  },
];

function WholesaleLanding() {
  return (
    <div>
      <section className="bg-carbon text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">
            Wholesale program
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Wholesale OEM BMW parts for shops that can't afford a wrong part
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-carbon-muted">
            Precision Bimmer Parts sources genuine OEM BMW and MINI parts for independent
            repair shops, collision centers, dealers, fleets and performance builders. Apply
            once, get a wholesale tier, and order against your own PO numbers.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/wholesale/apply"
              className="rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.02]"
            >
              Apply for a wholesale account
            </Link>
            <Link
              to="/auth"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wide text-carbon-foreground transition-colors hover:bg-white/5"
            >
              Wholesale sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-extrabold uppercase tracking-tight">
          What a wholesale account gets you
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-border p-6">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold uppercase tracking-tight">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">
            How the application works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.title} className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Discount percentages are set per account by our team. Until your tier discount is
            configured, quotes are priced at our standard concierge rate — we'll never show you
            a made-up number.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-carbon p-8 text-carbon-foreground sm:p-12">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/20 text-primary-glow">
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold uppercase tracking-tight">
            Already applied?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-carbon-muted">
            Create an account with the same business email you applied with, then link your
            application using the reference number from your confirmation. You'll see your
            review status right away — and your dashboard the moment you're approved.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
            >
              Sign in or register
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wide text-carbon-foreground hover:bg-white/5"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
