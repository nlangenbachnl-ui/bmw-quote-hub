import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Mail,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

import partsGrid from "@/assets/parts-grid.jpg";
import { TrustBadges } from "@/components/site/TrustBadges";

export const Route = createFileRoute("/individual-customers")({
  head: () => ({
    meta: [
      { title: "OEM BMW Parts for BMW Owners | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "BMW owners: send your VIN and the parts you need. We verify exact fitment, source genuine OEM parts, and email a transparent quote with shipping included.",
      },
      { property: "og:title", content: "OEM BMW Parts for BMW Owners" },
      {
        property: "og:description",
        content:
          "VIN-verified fitment, genuine OEM sourcing, and a transparent quote — so you never order the wrong part.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndividualCustomers,
});

const reasons = [
  {
    icon: Search,
    title: "Your VIN decides, not a guess",
    body: "Options, build date, and chassis variations change which part actually fits. We check your VIN before quoting so the box that arrives is the right one.",
  },
  {
    icon: BadgeCheck,
    title: "Genuine OEM sourcing",
    body: "We source genuine and OEM-supplier parts through established channels. If only an aftermarket option exists, we say so plainly instead of substituting quietly.",
  },
  {
    icon: ClipboardList,
    title: "Transparent quotes",
    body: "Every quote lists the part, quantity, price, shipping, and total, with your savings against BMW MSRP shown. No mystery fees and no obligation to buy.",
  },
  {
    icon: Truck,
    title: "Shipping handled",
    body: "Nationwide shipping is quoted up front. Local same-day delivery is available in our service area when the part and courier capacity allow.",
  },
];

const steps = [
  {
    step: "01",
    title: "Tell us what you need",
    body: "Name, contact details, VIN, year and model, and the parts or symptoms you are dealing with. Photos help — add them if you have them.",
  },
  {
    step: "02",
    title: "We verify fitment",
    body: "We decode your VIN, confirm the correct part for your exact build, and check availability with our sourcing channels.",
  },
  {
    step: "03",
    title: "You get a quote by email",
    body: "A clear quote with line items, shipping, total, and an expiration date. Reply to approve, ask questions, or walk away — it is free either way.",
  },
];

function IndividualCustomers() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-hero text-carbon-foreground">
        <img
          src={partsGrid}
          alt="Genuine BMW replacement components arranged on a workbench"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="heading-kicker text-primary-glow">For BMW Owners</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[1.05] sm:text-5xl">
            Stop guessing which <span className="text-primary-glow">BMW part</span> fits your car
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-carbon-muted">
            Send us your VIN and what you need. We verify the exact fitment for your build, source
            genuine OEM parts, and email you a straightforward quote — so the wrong part never ends
            up in your driveway.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-blue px-7 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.02]"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-carbon-muted/40 px-7 py-4 text-sm font-bold uppercase tracking-wide text-carbon-foreground hover:border-primary-glow"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <TrustBadges />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="heading-kicker">Why Owners Use Us</p>
        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Built around <span className="text-primary">getting it right</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {reasons.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold uppercase tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">How It Works</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">Three steps, no pressure</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.step} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-3xl font-black text-primary">{s.step}</p>
                <h3 className="mt-3 text-lg font-extrabold uppercase tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">Ready for a quote?</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Quotes are free and non-binding. You only pay once you decide to move forward, and we
          confirm fitment before anything ships.
        </p>
        <Link
          to="/request-quote"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-gradient-blue px-7 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
        >
          Request a Quote
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Precision Bimmer Parts is an independent parts sourcing service and is not affiliated with,
          endorsed by, or sponsored by BMW AG.
        </p>
      </section>
    </>
  );
}
