import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  Search,
  Mail,
  Star,
  ShieldCheck,
  Wrench,
  Timer,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-parts.jpg";
import partsGrid from "@/assets/parts-grid.jpg";
import { TrustBadges } from "@/components/site/TrustBadges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OEM BMW Parts Without the Guesswork | Bavarian Parts Co." },
      {
        name: "description",
        content:
          "Concierge sourcing for genuine OEM BMW parts. Submit your VIN and parts list — we verify fitment and email a personalized quote, usually within one business day.",
      },
      {
        property: "og:title",
        content: "OEM BMW Parts Without the Guesswork | Bavarian Parts Co.",
      },
      {
        property: "og:description",
        content:
          "Submit your VIN, we verify fitment, you get a personalized quote for genuine OEM BMW parts.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How does the quote process work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Submit your VIN, BMW model and the parts you need. We verify exact-fit part numbers against your VIN and email an itemized quote, typically within one business day.",
              },
            },
            {
              "@type": "Question",
              name: "Do you sell genuine OEM parts?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We source genuine OEM BMW parts and OEM-supplier equivalents from authorized channels. No mystery aftermarket parts.",
              },
            },
            {
              "@type": "Question",
              name: "Is there any obligation to buy?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "None. Requesting a quote is free and non-binding. You decide only after you have seen the itemized pricing.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: ClipboardList,
    title: "1. Send Your Request",
    text: "Share your VIN, BMW model and the parts you're after. Photos help for anything hard to describe.",
  },
  {
    icon: Search,
    title: "2. We Verify Fitment",
    text: "Our specialists cross-check every part number against your VIN — no wrong-part surprises.",
  },
  {
    icon: Mail,
    title: "3. Get Your Quote",
    text: "You receive a clear, itemized quote by email — usually within one business day, no obligation.",
  },
] as const;

const whyPoints = [
  {
    icon: ShieldCheck,
    title: "Genuine OEM Only",
    text: "We source from OEM manufacturers and authorized suppliers. If it isn't right for your car, we won't quote it.",
  },
  {
    icon: Wrench,
    title: "Enthusiast-Run",
    text: "Our team drives, wrenches on, and races BMWs. You're talking to people who actually know the platform.",
  },
  {
    icon: Timer,
    title: "One Business Day",
    text: "Most quotes go out within 24 hours on business days — often the same afternoon you submit.",
  },
  {
    icon: Users,
    title: "Real Humans",
    text: "No chatbot, no ticket queue. A specialist reads your request and personally builds your quote.",
  },
] as const;

const commonParts = [
  "Brakes, rotors & pads",
  "Cooling: water pumps, thermostats, expansion tanks",
  "Suspension: control arms, bushings, struts",
  "Ignition: coils, plugs, injectors",
  "Filters & full service kits",
  "Timing components (VANOS, chain guides)",
  "Sensors: O2, MAF, camshaft, ABS",
  "Body, trim, badges & interior",
  "M Performance & aftermarket upgrades",
] as const;

const testimonials = [
  {
    quote:
      "Sent them the VIN of my E90 M3 on a Sunday night. Detailed quote in my inbox before lunch Monday. Parts were correct first try — that's a rarity.",
    name: "Marcus R.",
    car: "2011 E90 M3",
  },
  {
    quote:
      "I've been burned by wrong parts twice this year. These guys actually confirmed the production week against my VIN before quoting. Night and day.",
    name: "Priya S.",
    car: "2018 F30 340i",
  },
  {
    quote:
      "Needed obscure trim for a classic E30 restoration. They found it, quoted honestly, and shipped it packed like it was going to space.",
    name: "Dan T.",
    car: "1989 E30 325i",
  },
] as const;

const homeFaqs = [
  {
    q: "Is Bavarian Parts Co. affiliated with BMW?",
    a: "No. We are an independent parts sourcing service and are not affiliated with, endorsed by, or sponsored by BMW AG.",
  },
  {
    q: "Do I pay anything to get a quote?",
    a: "No. Requesting a quote is free and non-binding. You only pay if you decide to move forward with an order.",
  },
  {
    q: "What if you can't find my part?",
    a: "We'll tell you honestly and, where possible, point you to a trustworthy alternative. No fake availability, no filler quotes.",
  },
] as const;

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-carbon-foreground">
        <img
          src={heroImage}
          alt="BMW engine bay and precision performance parts under studio lighting"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-36">
          <p className="heading-kicker text-primary-glow">
            Concierge BMW Parts Sourcing
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black uppercase leading-[1.05] sm:text-5xl md:text-6xl">
            OEM BMW Parts <span className="text-primary-glow">Without the Guesswork.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-carbon-muted">
            Send us your VIN and the parts you need. Our specialists verify exact fitment
            against your specific car and email back a personalized, itemized quote —
            usually within one business day.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/request-quote"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
            >
              Request a Free Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-carbon-muted/40 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-carbon-foreground transition-colors hover:border-primary-glow hover:text-primary-glow"
            >
              Contact Us
            </Link>
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-carbon-muted/80">
            Free · No obligation · Reply within one business day
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section
        aria-label="Why customers trust us"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
      >
        <TrustBadges />
      </section>

      {/* How it works */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">Simple Process</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">How It Works</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            No account, no catalog to dig through. Three steps between you and the right
            part number at a fair price.
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.title}
                className="rounded-lg border border-border bg-card p-7 shadow-card"
              >
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 place-items-center rounded-md bg-gradient-blue text-primary-foreground"
                >
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="heading-kicker">Why Choose Us</p>
        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Built for BMW owners who are done guessing
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyPoints.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <p.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Common parts */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <p className="heading-kicker">Common Parts We Source</p>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
              From daily maintenance to full restorations
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From E30 to the latest G-series and i models — if BMW made it, we can
              usually source it. A few of the categories we quote most often:
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {commonParts.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm font-semibold">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {c}
                </li>
              ))}
            </ul>
            <Link
              to="/request-quote"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Start your request <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <img
            src={partsGrid}
            alt="Assortment of BMW service parts including brakes, filters, spark plugs and headlights"
            width={1200}
            height={800}
            loading="lazy"
            className="rounded-lg border border-border shadow-card"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="heading-kicker">What Customers Say</p>
        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Quotes people actually trust
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-7 shadow-card"
            >
              <div className="flex gap-0.5 text-primary" aria-label="Five out of five stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-wide text-muted-foreground">
                <span className="font-bold text-foreground">{t.name}</span> · {t.car}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Testimonials shown are illustrative placeholders and will be replaced with
          verified customer quotes as we collect them.
        </p>
      </section>

      {/* FAQ preview */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">Frequently Asked</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">Good to know</h2>
          <div className="mt-8 space-y-4">
            {homeFaqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-border bg-card p-5 shadow-card open:shadow-md"
              >
                <summary className="cursor-pointer list-none text-sm font-bold">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="text-primary transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Read the full FAQ <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-carbon text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-black uppercase sm:text-4xl">
            Ready for a <span className="text-primary-glow">personalized</span> quote?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-carbon-muted">
            Takes about two minutes to submit. No account, no obligation — just a real
            answer from a real specialist.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/request-quote"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-blue px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
            >
              Request a Free Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-carbon-muted/40 px-8 py-4 text-sm font-bold uppercase tracking-wide text-carbon-foreground transition-colors hover:border-primary-glow hover:text-primary-glow"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
