import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Search, Mail } from "lucide-react";

import heroImage from "@/assets/hero-parts.jpg";
import partsGrid from "@/assets/parts-grid.jpg";
import { TrustBadges } from "@/components/site/TrustBadges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BMW Parts Quotes Fast | BavarianParts" },
      {
        name: "description",
        content:
          "Get a fast quote on genuine & OEM BMW parts. Submit your VIN, model and parts list — quotes back within one business day.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const steps = [
  {
    icon: ClipboardList,
    title: "1. Submit Your Request",
    text: "Tell us your BMW model, year, VIN and the parts you need. Attach photos for anything hard to describe.",
  },
  {
    icon: Search,
    title: "2. We Source & Verify",
    text: "Our specialists match every part number to your exact VIN — genuine or OEM, guaranteed to fit.",
  },
  {
    icon: Mail,
    title: "3. Receive Your Quote",
    text: "You get a detailed, itemized quote by email — usually within one business day. No obligation.",
  },
] as const;

const categories = [
  "Brakes & Rotors",
  "Engine & Cooling",
  "Suspension & Steering",
  "Lighting & Electrical",
  "Body & Trim",
  "Filters & Service Kits",
  "Transmission & Drivetrain",
  "M Performance",
] as const;

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-carbon-foreground">
        <img
          src={heroImage}
          alt="BMW engine bay and precision performance parts under blue studio lighting"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-36">
          <p className="heading-kicker text-primary-glow">Genuine &amp; OEM BMW Parts</p>
          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black uppercase leading-tight sm:text-5xl md:text-6xl">
            The Right Part. <span className="text-primary-glow">The Right Price.</span> First Time.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-carbon-muted">
            Skip the dealership markup and guesswork. Send us your VIN and parts list — we reply
            with an exact-fit quote, usually within 24 hours.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/request-quote"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center rounded-md border border-carbon-muted/40 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-carbon-foreground transition-colors hover:border-primary-glow hover:text-primary-glow"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <TrustBadges />
      </section>

      {/* How it works */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">Simple Process</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">How It Works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-lg border border-border bg-card p-7 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-gradient-blue text-primary-foreground">
                  <s.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="heading-kicker">Full Catalog Coverage</p>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
              Every Part, Every Model
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From the E30 to the latest G-series and i models — if BMW made it, we can source it.
              Popular categories include:
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
            <Link
              to="/request-quote"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Start your request <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img
            src={partsGrid}
            alt="Assortment of genuine BMW parts including brakes, filters, spark plugs and headlights"
            width={1200}
            height={800}
            loading="lazy"
            className="rounded-lg border border-border shadow-card"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-carbon text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-black uppercase sm:text-4xl">
            Ready for your <span className="text-primary-glow">exact-fit</span> quote?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-carbon-muted">
            Takes about two minutes. No account needed, no obligation to buy.
          </p>
          <Link
            to="/request-quote"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-blue px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
