import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Clock,
  FileUp,
  Repeat2,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { DEFAULT_SETTINGS, formatCutoff, money } from "@/lib/admin/pricing";

export const Route = createFileRoute("/for-shops")({
  head: () => ({
    meta: [
      { title: "OEM BMW Parts for Repair & Body Shops — Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Wholesale OEM BMW parts sourcing for collision and mechanical shops: VIN-verified fitment, fast quotes from your estimate, repeat ordering, and same-day local delivery where eligible.",
      },
      { property: "og:title", content: "OEM BMW Parts for Repair & Body Shops" },
      {
        property: "og:description",
        content:
          "Upload your estimate and VIN — we build the OEM parts quote and deliver locally same-day where eligible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForShops,
});

const benefits = [
  {
    icon: BadgeCheck,
    title: "Genuine BMW parts",
    text: "Every line is quoted as genuine OEM with the BMW part number on the quote — no aftermarket substitutions slipped in.",
  },
  {
    icon: ShieldCheck,
    title: "VIN-verified fitment",
    text: "We check production date, options, and build codes against the VIN before we quote, so panels and sensors fit the first time.",
  },
  {
    icon: Clock,
    title: "Fast quoting",
    text: "Send the estimate and VIN; we return an itemized OEM quote with part numbers, quantities, and pricing you can hand to the insurer.",
  },
  {
    icon: Repeat2,
    title: "Repeat ordering",
    text: "Your order history stays in the portal. Duplicate a past request in one click for the jobs you run every week.",
  },
  {
    icon: Truck,
    title: "Same-day local delivery",
    text: "Local same-day courier runs for eligible orders inside our delivery zone, with oversize and priority options for panels.",
  },
  {
    icon: ClipboardList,
    title: "Job-level tracking",
    text: "Tag every request with your RO number and internal vehicle reference — no need to share end-customer details.",
  },
] as const;

const steps = [
  {
    title: "Upload estimate + VIN",
    text: "Drop your PDF or photo estimate into the portal with the VIN. Collision shops can stop there — we read the parts lines.",
  },
  {
    title: "We build the OEM quote",
    text: "Our team verifies fitment, sources the parts, and returns an itemized quote with expiration and delivery options.",
  },
  {
    title: "Approve and receive",
    text: "Approve the quote and choose standard shipping, local same-day, or priority/oversize courier delivery.",
  },
] as const;

function ForShops() {
  const s = DEFAULT_SETTINGS;

  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <p className="heading-kicker text-primary-glow">For Repair &amp; Body Shops</p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black uppercase leading-[1.05] sm:text-5xl">
            OEM BMW parts, quoted fast and delivered local.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-carbon-muted">
            A wholesale sourcing desk built for collision and mechanical shops.{" "}
            <strong className="text-carbon-foreground">
              Upload your estimate and VIN and we&apos;ll build the OEM parts quote.
            </strong>{" "}
            Same-day local delivery available on eligible orders.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/portal/request"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
            >
              Submit a shop request <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/portal"
              className="inline-flex items-center rounded-md border border-carbon-muted/40 px-6 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors hover:border-primary-glow hover:text-primary-glow"
            >
              Open shop portal
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-carbon-muted transition-colors hover:text-primary-glow"
            >
              Talk to our wholesale desk
            </Link>
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-carbon-muted/80">
            Same-day cutoff {formatCutoff(s.sameDayCutoff)} local · {money(s.sameDayFee)} local
            same-day · Free at {money(s.freeSameDayThreshold)}+ merchandise
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="heading-kicker">Why Shops Work With Us</p>
        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Built around your repair order, not a catalog
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <b.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">Collision-Friendly Workflow</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Upload estimate + VIN. We do the rest.
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-lg border border-border bg-card p-7 shadow-card">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-md bg-gradient-blue text-sm font-black text-primary-foreground"
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
            <FileUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            PDF and image estimates accepted. Add photos of the damage and we&apos;ll cross-check the
            parts lines before quoting.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 shadow-card lg:grid-cols-2">
          <div>
            <p className="heading-kicker">Delivery Options</p>
            <h2 className="mt-3 text-2xl font-black uppercase">
              Standard, local same-day, or priority courier
            </h2>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <p className="font-bold">Standard shipping</p>
                <p className="text-muted-foreground">
                  Freight or parcel to your shop, quoted per order on the parts you approve.
                </p>
              </li>
              <li>
                <p className="font-bold">Local same-day — {money(s.sameDayFee)}</p>
                <p className="text-muted-foreground">
                  Free on eligible orders with a merchandise subtotal of{" "}
                  {money(s.freeSameDayThreshold)} or more. Order by{" "}
                  {formatCutoff(s.sameDayCutoff)} local time,{" "}
                  {s.deliveryDays.join(" · ")}.
                </p>
              </li>
              <li>
                <p className="font-bold">Priority / oversize courier</p>
                <p className="text-muted-foreground">
                  For bumpers, hoods, doors, and glass that need a dedicated vehicle.
                </p>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider">Eligibility, stated plainly</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We don&apos;t promise a delivery until eligibility is confirmed. Every same-day request
              is reviewed for parts availability, our {s.deliveryRadiusMiles}-mile delivery radius,
              package size and weight, and courier capacity. Your request shows a live status of{" "}
              <strong>Eligible</strong>, <strong>Needs Review</strong>, or{" "}
              <strong>Outside Zone</strong> in the portal.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Precision Bimmer Parts is an independent parts sourcing service and is not affiliated
              with, endorsed by, or sponsored by BMW AG.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-carbon text-carbon-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase sm:text-3xl">
              Open a commercial account
            </h2>
            <p className="mt-2 max-w-xl text-sm text-carbon-muted">
              Set up your shop profile, submit your first request, and track quotes, orders, and
              deliveries in one place.
            </p>
          </div>
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
          >
            Enter the shop portal <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
