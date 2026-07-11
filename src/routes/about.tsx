import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Target, HandshakeIcon } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | BavarianParts" },
      {
        name: "description",
        content:
          "BMW parts specialists with decades of combined experience. Learn how BavarianParts sources genuine and OEM parts matched to your VIN.",
      },
      { property: "og:title", content: "About Us | BavarianParts" },
      {
        property: "og:description",
        content: "BMW parts specialists sourcing genuine and OEM parts matched to your VIN.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Target,
    title: "Precision Fitment",
    text: "Every quote is built from your VIN, so the part numbers we quote are the part numbers that fit — no returns, no guesswork.",
  },
  {
    icon: Wrench,
    title: "Enthusiast-Run",
    text: "Our team drives, wrenches on, and races BMWs. We know the difference between a part that works and the part you actually want.",
  },
  {
    icon: HandshakeIcon,
    title: "Honest Pricing",
    text: "Transparent, itemized quotes with genuine and OEM options side by side. You choose what fits your budget.",
  },
] as const;

function AboutPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker text-primary-glow">About BavarianParts</p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black uppercase sm:text-5xl">
            Built by BMW people, for BMW people
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-5 leading-relaxed text-muted-foreground">
          <p>
            BavarianParts started the way most good garage ideas do — with a frustrating parts
            counter experience. Wrong part numbers, dealership markups, and week-long waits for a
            simple answer. We knew there was a better way to get BMW owners the parts they need.
          </p>
          <p>
            Today, we operate a quote-first parts service focused exclusively on BMW. Instead of
            forcing you to decode diagrams and cross-reference part numbers, you simply tell us
            your car and what you need. Our specialists do the lookup against your VIN and reply
            with an exact-fit, itemized quote — typically within one business day.
          </p>
          <p>
            We source genuine BMW parts and trusted OEM-supplier equivalents (the same companies
            that build parts for the factory line), so you can choose the right balance of price
            and provenance for every job.
          </p>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-black uppercase">What We Stand For</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border border-border bg-card p-7 shadow-card">
                <v.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Put us to the test</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Send us your toughest parts request — we love a challenge.
        </p>
        <Link
          to="/request-quote"
          className="mt-6 inline-flex items-center rounded-md bg-gradient-blue px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
        >
          Request a Quote
        </Link>
      </section>
    </>
  );
}
